import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Avatar, Tooltip, Card, Spinner, Button } from "@heroui/react";
import { useLanguage } from '@/context/languageContext';
import { useAuth } from '@/context/authContext';
import { motion } from "framer-motion";
import ArtistActions from './ArtistActions';
import { areaTitleImages } from '../data/regionData';

const areaTitleMap = {
    'upper-galilee': { heb: 'hebUpperGalileeAreaTitle', eng: 'engUpperGalileeAreaTitle' },
    'western-galilee': { heb: 'hebWesternGalileeAreaTitle', eng: 'engWesternGalileeAreaTitle' },
    'krayot': { heb: 'hebKrayotAreaTitle', eng: 'engKrayotAreaTitle' },
    'haifa-area': { heb: 'hebHaifaAreaTitle', eng: 'engHaifaAreaTitle' },
    'jordan-valley': { heb: 'hebJordanValleyAreaTitle', eng: 'engJordanValleyAreaTitle' },
    'lower-galilee': { heb: 'hebLowerGalileeAreaTitle', eng: 'engLowerGalileeAreaTitle' },
    'hefer-valley': { heb: 'hebHeferValleyAreaTitle', eng: 'engHeferValleyAreaTitle' },
    'judea-and-samaria': { heb: 'hebJudeaAndSamariaAreaTitle', eng: 'engJudeaAndSamariaAreaTitle' },
    'sharon': { heb: 'hebSharonAreaTitle', eng: 'engSharonAreaTitle' },
    'center': { heb: 'hebCenterAreaTitle', eng: 'engCenterAreaTitle' },
    'tel-aviv': { heb: 'hebTelAvivAreaTitle', eng: 'engTelAvivAreaTitle' },
    'shfela': { heb: 'hebShfelaAreaTitle', eng: 'engShfelaAreaTitle' },
    'coast': { heb: 'hebCoastAreaTitle', eng: 'engCoastAreaTitle' },
    'jerusalem-area': { heb: 'hebJerusalemAreaTitle', eng: 'engJerusalemAreaTitle' },
    'northern-negev': { heb: 'hebNorthernNegevAreaTitle', eng: 'engNorthernNegevAreaTitle' },
    'southern-negev-and-arava': { heb: 'hebAravaAreaTitle', eng: 'engAravaAreaTitle' }
};

const AreaPage = () => {
    const { areaName } = useParams();
    const navigate = useNavigate();
    const [artists, setArtists] = useState([]);
    const [area, setArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Responsivity: screenSize can be 'xl', 'lg', 'md', 'sm', 'xs'
    const [screenSize, setScreenSize] = useState('xl');
    const { language } = useLanguage();
    const { user } = useAuth();

    // --- Dynamic line width logic ---
    // Refs for timeline and avatars
    const timelineRef = useRef(null);
    const leftAvatarRefs = useRef([]);
    const rightAvatarRefs = useRef([]);
    const [leftLineWidths, setLeftLineWidths] = useState([]);
    const [rightLineWidths, setRightLineWidths] = useState([]);

    // Helper to measure and set line widths
    const measureLineWidths = () => {
        if (!timelineRef.current) return;
        const timelineRect = timelineRef.current.getBoundingClientRect();
        // Left column
        const newLeftWidths = leftAvatarRefs.current.map((ref) => {
            if (!ref) return 0;
            const avatarRect = ref.getBoundingClientRect();
            // Distance from avatar center (right edge) to timeline (left edge)
            return timelineRect.left - (avatarRect.left + avatarRect.width / 2);
        });
        setLeftLineWidths(newLeftWidths);
        // Right column
        const newRightWidths = rightAvatarRefs.current.map((ref) => {
            if (!ref) return 0;
            const avatarRect = ref.getBoundingClientRect();
            // Distance from avatar center (left edge) to timeline (right edge)
            return (avatarRect.left + avatarRect.width / 2) - timelineRect.right;
        });
        setRightLineWidths(newRightWidths);
    };

    // Effect for measuring lines after data is loaded
    useEffect(() => {
        if (!loading && artists.length > 0) {
            // Wait for images to load and DOM to be fully rendered
            const timer = setTimeout(() => {
                measureLineWidths();
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [loading, artists]);

    // Separate effect for resize handling
    useEffect(() => {
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                measureLineWidths();
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
        };
    }, []);

    // Effect for screen size detection (breakpoints: 1064, 768, 602)
    useEffect(() => {
        const getScreenSize = () => {
            const w = window.innerWidth;
            if (w < 602) return 'sm';
            if (w < 768) return 'md';
            if (w < 1064) return 'lg';
            return 'xl';
        };
        const checkScreenSize = () => {
            setScreenSize(getScreenSize());
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${backendUrl}/areas/area/${areaName}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Area not found. Please check the name and try again.`);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setArea(data.area);
                setArtists(data.artists);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [areaName, backendUrl]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-danger text-center">
                    <h2 className="text-xl font-bold mb-4">Error Loading Area</h2>
                    <p className="mb-4">{error}</p>
                    <Button
                        color="primary"
                        onClick={() => navigate('/')}
                    >
                        Return to Home
                    </Button>
                </div>
            </div>
        );
    }

    const getLocalizedText = (textObj, defaultValue) => {
        if (!textObj) return defaultValue || null;
        return textObj[language];
    };

    // Helper to get avatar size based on rate and screenSize
    const getAvatarSize = (rate) => {
        // Sizes for each breakpoint (w-h classes)
        const sizes = {
            xl: ['w-52 h-52', 'w-40 h-40', 'w-36 h-36', 'w-28 h-28'], // 208, 160, 144, 112
            lg: ['w-40 h-40', 'w-32 h-32', 'w-28 h-28', 'w-24 h-24'], // 160, 128, 112, 96
            md: ['w-32 h-32', 'w-28 h-28', 'w-24 h-24', 'w-20 h-20'], // 128, 112, 96, 80
            sm: ['w-28 h-28', 'w-24 h-24', 'w-20 h-20', 'w-16 h-16'], // 112, 96, 80, 64
        };
        const idx = Math.max(0, Math.min(3, (rate || 1) - 1));
        const arr = sizes[screenSize] || sizes.sm;
        return arr[idx];
    };
    // Helper to get avatar pixel size based on rate and screenSize
    const getAvatarPixelSize = (rate) => {
        const px = {
            xl: [208, 160, 144, 112],
            lg: [160, 128, 112, 96],
            md: [128, 112, 96, 80],
            sm: [112, 96, 80, 64],
        };
        const idx = Math.max(0, Math.min(3, (rate || 1) - 1));
        const arr = px[screenSize] || px.sm;
        return arr[idx];
    };
    // Helper to get font size for location/year/bornElsewhere text based on rate and screenSize
    const getLocationFontSize = (rate) => {
        const sizes = {
            xl: ["1.5rem", "1.3rem", "1.1rem", "0.9rem"],
            lg: ["1.3rem", "1.1rem", "1.0rem", "0.85rem"],
            md: ["1.1rem", "1.0rem", "0.9rem", "0.8rem"],
            sm: ["1.0rem", "0.9rem", "0.8rem", "0.7rem"],
        };
        const idx = Math.max(0, Math.min(3, (rate || 1) - 1));
        const arr = sizes[screenSize] || sizes.sm;
        return arr[idx];
    };
    // Helper to get font size for bornElsewhere text based on rate and screenSize
    const getBornElsewhereFontSize = (rate) => {
        const sizes = {
            xl: ["1.1rem", "0.95rem", "0.8rem", "0.65rem"],
            lg: ["0.95rem", "0.85rem", "0.75rem", "0.6rem"],
            md: ["0.9rem", "0.8rem", "0.7rem", "0.6rem"],
            sm: ["0.8rem", "0.7rem", "0.6rem", "0.5rem"],
        };
        const idx = Math.max(0, Math.min(3, (rate || 1) - 1));
        const arr = sizes[screenSize] || sizes.sm;
        return arr[idx];
    };
    // Helper to get font size for artist name
    const getArtistNameFontSize = () => {
        const sizes = {
            xl: "2.5rem",
            lg: "2.1rem",
            md: "1.8rem",
            sm: "1.5rem",
        };
        return sizes[screenSize] || sizes.sm;
    };
    // Helper to get artist name top position
    const getArtistNameTopPosition = () => {
        const sizes = {
            xl: "-40px",
            lg: "-36px",
            md: "-31px",
            sm: "-26px",
        };
        return sizes[screenSize] || sizes.sm;
    };
    // Helper to get location top position
    const getLocationTopPosition = () => {
        const sizes = {
            xl: "-62px",
            lg: "-54px",
            md: "-49px",
            sm: "-41px",
        };
        return sizes[screenSize] || sizes.sm;
    };
    // Helper to get gap between columns
    const getColumnGap = () => {
        const gaps = {
            xl: 'gap-96', // 24rem
            lg: 'gap-48', // 12rem
            md: 'gap-32', // 8rem
            sm: 'gap-16', // 4rem
        };
        return gaps[screenSize] || gaps.sm;
    };
    // Helper to get offset for avatars
    const getAvatarOffset = () => {
        const offsets = {
            xl: 60,
            lg: 40,
            md: 30,
            sm: 18,
        };
        return offsets[screenSize] || offsets.sm;
    };
    // Helper to get ArtistActions offset
    const getActionOffset = () => {
        // Adjusted: lg is less than before, sm is more than before
        const offsets = {
            xl: 55,
            lg: 48,
            md: 35,
            sm: 32,
        };
        return offsets[screenSize] || offsets.sm;
    };
    // Helper to get area title max height
    const getAreaTitleMaxHeight = () => {
        const largerImageAreas = ['southern-negev-and-arava', 'haifa-area', 'jerusalem-area'];
        const heights = {
            xl: 'max-h-40',
            lg: 'max-h-32',
            md: 'max-h-24',
            sm: 'max-h-20',
        };
        return largerImageAreas.includes(areaName) ? (heights[screenSize] || heights.sm) : (heights[screenSize] || heights.sm);
    };
    // Helper to get location font size for mobile (now for all breakpoints)
    const getLocationFontSizeForMobile = () => {
        return getLocationFontSize(1); // Use rate 1 as base
    };

    // Helper to normalize area name for comparison
    const normalizeAreaName = (name) => {
        if (!name) return '';
        return name.toLowerCase().trim();
    };

    // Helper to check if area is Tel Aviv
    const isTelAvivArea = (name) => {
        const normalized = normalizeAreaName(name);
        return normalized === 'tel aviv';
    };

    // Helper to remove parentheses and their contents from a string
    function stripParentheses(str) {
        if (!str) return str;
        return str.replace(/\s*\([^)]*\)/g, '').trim();
    }

    // Sort artists by birth year
    const sortedArtists = [...artists].sort((a, b) => {
        const yearA = a.isBand ? a.yearRange?.first : a.birthYear;
        const yearB = b.isBand ? b.yearRange?.first : b.birthYear;

        // Handle cases where year might be undefined
        if (!yearA && !yearB) return 0;
        if (!yearA) return 1;
        if (!yearB) return -1;

        return yearA - yearB;
    });

    // Split sorted artists into two columns
    const leftColumnArtists = sortedArtists.filter((_, i) => i % 2 === 0);
    const rightColumnArtists = sortedArtists.filter((_, i) => i % 2 === 1);

    console.log('Area data:', area);
    console.log('Area name:', area?.name);
    console.log('Normalized area name:', normalizeAreaName(area?.name));
    const showLocation = !isTelAvivArea(area?.name);
    console.log('Show location:', showLocation);

    // Get the area title image based on current URL and language
    const getAreaTitleImage = () => {
        if (!areaName) return null;

        // Find the matching area path in the map
        const titleImageVars = areaTitleMap[areaName];

        if (!titleImageVars) {
            console.warn(`No title image found for area: ${areaName}`);
            return null;
        }

        // Get the variable name based on language
        const imageVarName = titleImageVars[language] || titleImageVars.eng; // fallback to English

        // Access the actual image from areaTitleImages
        return areaTitleImages[imageVarName];
    };

    const areaTitleImage = getAreaTitleImage();

    // Helper to get logo margin (top and bottom) based on screenSize
    const getLogoMargin = () => {
        const margins = {
            xl: 'mb-28 mt-0',
            lg: 'mb-28 mt-[-15px]',
            md: 'mb-20 mt-[-20px]',
            sm: 'mb-16 mt-[-20px]',
        };
        return margins[screenSize] || margins.sm;
    };

    return (
        <div className="container mx-auto p-6 pt-16 pb-24">
            {/* Area Title Image */}
            {areaTitleImage && (
                <div className={`flex justify-center ${getLogoMargin()}`}>
                    <img
                        src={areaTitleImage}
                        alt={`${area?.name || 'Area'} Title`}
                        className={`max-w-full h-auto object-contain ${getAreaTitleMaxHeight()}`}
                        style={{ filter: 'drop-shadow(0 4px 4px rgba(250, 206, 124, 0.83))' }}
                    />
                </div>
            )}

            <div className={`flex justify-center items-start relative ${getColumnGap()}`}>
                {/* Left column */}
                <div className="flex flex-col relative">
                    {leftColumnArtists.map((artist, idx) => {
                        const artistNameRaw = getLocalizedText(artist.name, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const artistName = stripParentheses(artistNameRaw);
                        const fallbackInitial = artistName.charAt(0) || (language === 'heb' ? 'ל' : 'U');
                        const location = getLocalizedText(artist.location, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const bornElsewhere = getLocalizedText(artist.bornElsewhere);
                        let yearDisplay = '';
                        if (artist.isBand && artist.yearRange && artist.yearRange.first && artist.yearRange.last) {
                            yearDisplay = `${artist.yearRange.first} - ${artist.yearRange.last}`;
                        }
                        const showLocation = !isTelAvivArea(area?.name);
                        // Reverse: first avatar is right, second is left, etc.
                        const offset = getAvatarOffset();
                        const isLeft = idx % 2 !== 0;
                        return (
                            <div
                                key={artist._id}
                                className={`relative flex flex-col items-center ${screenSize === 'sm' ? 'mb-12' : screenSize === 'md' ? 'mb-20' : 'mb-24'}`}
                                style={{
                                    alignItems: isLeft ? 'flex-end' : 'flex-start',
                                    left: isLeft ? `-${offset}px` : `${offset}px`,
                                    transition: 'left 0.3s',
                                }}
                                ref={el => leftAvatarRefs.current[idx] = el}
                            >
                                {/* Dynamic connecting line to timeline */}
                                {leftLineWidths[idx] > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            width: `${leftLineWidths[idx]}px`,
                                            height: '4px',
                                            background: '#a1130a',
                                            transform: 'translateY(-50%)',
                                        }}
                                        className="shadow-[0_0_3px_0.5px_rgba(161,19,10,0.8)]"
                                    />
                                )}
                                <div className="relative flex items-center justify-center w-full h-full">
                                    {/* ArtistActions absolutely positioned to the left */}
                                    {(() => {
                                        const avatarPx = getAvatarPixelSize(artist.rate);
                                        const actionOffset = getActionOffset();
                                        // Lower ArtistActions for rate 4
                                        const extraTop = artist.rate === 4 ? 6 : 0;
                                        return (
                                            <div style={{
                                                position: 'absolute',
                                                left: `calc(50% - ${avatarPx / 2 + actionOffset}px)`,
                                                top: `calc(50% + ${extraTop}px)`,
                                                transform: 'translateY(-50%)',
                                                zIndex: 20,
                                            }}>
                                                <ArtistActions
                                                    artistId={artist._id}
                                                    initialComments={3}
                                                    isAuthenticated={!!user}
                                                    userId={user?._id}
                                                    column="left"
                                                    rate={artist.rate}
                                                    compact={artist.rate === 4}
                                                />
                                            </div>
                                        );
                                    })()}
                                    {/* Avatar centered */}
                                    <motion.div
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative flex flex-col items-center cursor-pointer group"
                                        style={{ zIndex: 20 }}
                                    >
                                        {/* Location above artist name */}
                                        {showLocation && location && (
                                            <span
                                                style={{
                                                    color: "#b71c1c",
                                                    fontWeight: 400,
                                                    fontSize: getLocationFontSizeForMobile(),
                                                    lineHeight: 1,
                                                    position: "absolute",
                                                    top: getLocationTopPosition(),
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    textAlign: "center",
                                                    zIndex: 30,
                                                    pointerEvents: "none",
                                                    fontFamily: 'adobe-hebrew',
                                                    fontStyle: 'normal',
                                                    textShadow: `
                                                        1px 0 #FECD90,
                                                        -1px 0 #FECD90,
                                                        0 1px #FECD90,
                                                        0 -1px #FECD90,
                                                        0.7px 0.7px #FECD90,
                                                        -0.7px -0.7px #FECD90,
                                                        0.7px -0.7px #FECD90,
                                                        -0.7px 0.7px #FECD90,
                                                        0 0 8px rgba(183,28,28,0.5)
                                                    `,
                                                    whiteSpace: 'nowrap',
                                                    direction: language === 'heb' ? 'rtl' : 'ltr'
                                                }}
                                            >
                                                {location}
                                            </span>
                                        )}
                                        <span
                                            style={{
                                                color: "#FEF7D5",
                                                fontWeight: 400,
                                                fontSize: getArtistNameFontSize(),
                                                lineHeight: 1,
                                                position: "absolute",
                                                top: getArtistNameTopPosition(),
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                textAlign: "center",
                                                zIndex: 30,
                                                pointerEvents: "none",
                                                fontFamily: 'adobe-hebrew',
                                                fontStyle: 'normal',
                                                textShadow: `
                                                    1.5px 0 #b71c1c,
                                                    -1.5px 0 #b71c1c,
                                                    0 1.5px #b71c1c,
                                                    0 -1.5px #b71c1c,
                                                    1px 1px #b71c1c,
                                                    -1px -1px #b71c1c,
                                                    1px -1px #b71c1c,
                                                    -1px 1px #b71c1c,
                                                    0 0 8px rgba(183,28,28,0.5)
                                                `,
                                                whiteSpace: 'nowrap',
                                                direction: language === 'heb' ? 'rtl' : 'ltr'
                                            }}
                                        >
                                            {artistName}
                                        </span>
                                        <Link to={`/artist/${artist._id}`}>
                                            <div className="shadow-[0_0_8px_0.5px_rgba(161,19,10,0.8)] rounded-2xl relative overflow-hidden">
                                                <div className="relative">
                                                    <Avatar
                                                        src={artist.image?.url}
                                                        className={`${getAvatarSize(artist.rate)} [&>img]:object-top`}
                                                        fallback={fallbackInitial}
                                                        radius="lg"
                                                        color="danger"
                                                    />
                                                    {/* Custom inset border */}
                                                    <div
                                                        className="absolute inset-0 rounded-2xl pointer-events-none"
                                                        style={{
                                                            boxShadow: 'inset 0 0 0 6px #A1130A'
                                                        }}
                                                    />
                                                </div>
                                                {/* Data climbing from bottom of avatar - only show if bornElsewhere exists */}
                                                {bornElsewhere && (
                                                    <div
                                                        className="absolute inset-0 flex flex-col justify-end items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-full group-hover:translate-y-0 overflow-hidden rounded-2xl"
                                                    >
                                                        <div
                                                            className="transition-transform duration-300 ease-out transform translate-y-full group-hover:translate-y-0"
                                                            style={{
                                                                color: "#FEEFB6",
                                                                fontWeight: 400,
                                                                fontSize: getBornElsewhereFontSize(artist.rate),
                                                                lineHeight: 1.1,
                                                                fontFamily: 'adobe-hebrew',
                                                                fontStyle: 'italic',
                                                                textShadow: `
                                                                    1px 0 #b71c1c,
                                                                    -1px 0 #b71c1c,
                                                                    0 1px #b71c1c,
                                                                    0 -1px #b71c1c,
                                                                    0.7px 0.7px #b71c1c,
                                                                    -0.7px -0.7px #b71c1c,
                                                                    0.7px -0.7px #b71c1c,
                                                                    -0.7px 0.7px #b71c1c,
                                                                    0 0 8px rgba(183,28,28,0.5),
                                                                    0 0 8px rgba(183,28,28,0.5)
                                                                `,
                                                                direction: language === 'heb' ? 'rtl' : 'ltr',
                                                                paddingBottom: '4px',
                                                                backgroundColor: '#fff3e0',
                                                                opacity: 0.85,
                                                                borderRadius: '0 0 8px 8px',
                                                                padding: '4px 12px',
                                                                marginBottom: '6px',
                                                                width: 'calc(100% - 12px)',
                                                                marginLeft: '6px',
                                                                marginRight: '6px',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {language === 'heb' ?
                                                                (artist.gender === 'm' ? `נולד ב${bornElsewhere}` :
                                                                    artist.gender === 'f' ? `נולדה ב${bornElsewhere}` :
                                                                        `נולד/ה ב${bornElsewhere}`)
                                                                : `Born in ${bornElsewhere}`}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Right column */}
                <div className={`flex flex-col relative ${screenSize === 'sm' ? 'mt-8' : screenSize === 'md' ? 'mt-16' : 'mt-28'}`}>
                    {rightColumnArtists.map((artist, idx) => {
                        const artistNameRaw = getLocalizedText(artist.name, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const artistName = stripParentheses(artistNameRaw);
                        const fallbackInitial = artistName.charAt(0) || (language === 'heb' ? 'ל' : 'U');
                        const location = getLocalizedText(artist.location, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const bornElsewhere = getLocalizedText(artist.bornElsewhere);
                        let yearDisplay = '';
                        if (artist.isBand && artist.yearRange && artist.yearRange.first && artist.yearRange.last) {
                            yearDisplay = `${artist.yearRange.first} - ${artist.yearRange.last}`;
                        }
                        const showLocation = !isTelAvivArea(area?.name);
                        // Reverse: first avatar is left, second is right, etc.
                        const offset = getAvatarOffset();
                        const isRight = idx % 2 !== 0;
                        return (
                            <div
                                key={artist._id}
                                className={`relative flex flex-col items-center ${screenSize === 'sm' ? 'mb-12' : screenSize === 'md' ? 'mb-20' : 'mb-24'}`}
                                style={{
                                    alignItems: isRight ? 'flex-start' : 'flex-end',
                                    left: isRight ? `${offset}px` : `-${offset}px`,
                                    transition: 'left 0.3s',
                                }}
                                ref={el => rightAvatarRefs.current[idx] = el}
                            >
                                {/* Dynamic connecting line to timeline */}
                                {rightLineWidths[idx] > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '50%',
                                            width: `${rightLineWidths[idx]}px`,
                                            height: '4px',
                                            background: '#a1130a',
                                            transform: 'translateY(-50%)',
                                        }}
                                        className="shadow-[0_0_3px_0.5px_rgba(161,19,10,0.8)]"
                                    />
                                )}
                                <div className="relative flex items-center justify-center w-full h-full">
                                    {/* ArtistActions absolutely positioned to the right */}
                                    {(() => {
                                        const avatarPx = getAvatarPixelSize(artist.rate);
                                        const actionOffset = getActionOffset();
                                        // Lower ArtistActions for rate 4
                                        const extraTop = artist.rate === 4 ? 8 : 0;
                                        return (
                                            <div style={{
                                                position: 'absolute',
                                                right: `calc(50% - ${avatarPx / 2 + actionOffset}px)`,
                                                top: `calc(50% + ${extraTop}px)`,
                                                transform: 'translateY(-50%)',
                                                zIndex: 20,
                                            }}>
                                                <ArtistActions
                                                    artistId={artist._id}
                                                    initialComments={3}
                                                    isAuthenticated={!!user}
                                                    userId={user?._id}
                                                    column="right"
                                                    rate={artist.rate}
                                                    compact={artist.rate === 4}
                                                />
                                            </div>
                                        );
                                    })()}
                                    {/* Avatar centered */}
                                    <motion.div
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative flex flex-col items-center cursor-pointer group"
                                        style={{ zIndex: 20 }}
                                    >
                                        {/* Location above artist name */}
                                        {showLocation && location && (
                                            <span
                                                style={{
                                                    color: "#b71c1c",
                                                    fontWeight: 400,
                                                    fontSize: getLocationFontSizeForMobile(),
                                                    lineHeight: 1,
                                                    position: "absolute",
                                                    top: getLocationTopPosition(),
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    textAlign: "center",
                                                    zIndex: 30,
                                                    pointerEvents: "none",
                                                    fontFamily: 'adobe-hebrew',
                                                    fontStyle: 'normal',
                                                    textShadow: `
                                                        1px 0 #FECD90,
                                                        -1px 0 #FECD90,
                                                        0 1px #FECD90,
                                                        0 -1px #FECD90,
                                                        0.7px 0.7px #FECD90,
                                                        -0.7px -0.7px #FECD90,
                                                        0.7px -0.7px #FECD90,
                                                        -0.7px 0.7px #FECD90,
                                                        0 0 8px rgba(183,28,28,0.5)
                                                    `,
                                                    whiteSpace: 'nowrap',
                                                    direction: language === 'heb' ? 'rtl' : 'ltr'
                                                }}
                                            >
                                                {location}
                                            </span>
                                        )}
                                        <span
                                            style={{
                                                color: "#FEEFB6",
                                                fontWeight: 400,
                                                fontSize: getArtistNameFontSize(),
                                                lineHeight: 1,
                                                position: "absolute",
                                                top: getArtistNameTopPosition(),
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                textAlign: "center",
                                                zIndex: 30,
                                                pointerEvents: "none",
                                                fontFamily: 'adobe-hebrew',
                                                fontStyle: 'normal',
                                                textShadow: `
                                                    1.5px 0 #b71c1c,
                                                    -1.5px 0 #b71c1c,
                                                    0 1.5px #b71c1c,
                                                    0 -1.5px #b71c1c,
                                                    1px 1px #b71c1c,
                                                    -1px -1px #b71c1c,
                                                    1px -1px #b71c1c,
                                                    -1px 1px #b71c1c,
                                                    0 0 8px rgba(183,28,28,0.5)
                                                `,
                                                whiteSpace: 'nowrap',
                                                direction: language === 'heb' ? 'rtl' : 'ltr'
                                            }}
                                        >
                                            {artistName}
                                        </span>
                                        <Link to={`/artist/${artist._id}`}>
                                            <div className="shadow-[0_0_8px_0.5px_rgba(161,19,10,0.8)] rounded-2xl relative overflow-hidden">
                                                <div className="relative">
                                                    <Avatar
                                                        src={artist.image?.url}
                                                        className={`${getAvatarSize(artist.rate)} [&>img]:object-top`}
                                                        fallback={fallbackInitial}
                                                        radius="lg"
                                                        color="danger"
                                                    />
                                                    {/* Custom inset border */}
                                                    <div
                                                        className="absolute inset-0 rounded-2xl pointer-events-none"
                                                        style={{
                                                            boxShadow: 'inset 0 0 0 6px #A1130A'
                                                        }}
                                                    />
                                                </div>
                                                {/* Data climbing from bottom of avatar - only show if bornElsewhere exists */}
                                                {bornElsewhere && (
                                                    <div
                                                        className="absolute inset-0 flex flex-col justify-end items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-full group-hover:translate-y-0 overflow-hidden rounded-2xl"
                                                    >
                                                        <div
                                                            className="transition-transform duration-300 ease-out transform translate-y-full group-hover:translate-y-0"
                                                            style={{
                                                                color: "#FEEFB6",
                                                                fontWeight: 400,
                                                                fontSize: getBornElsewhereFontSize(artist.rate),
                                                                lineHeight: 1.1,
                                                                fontFamily: 'adobe-hebrew',
                                                                fontStyle: 'italic',
                                                                textShadow: `
                                                                    1px 0 #b71c1c,
                                                                    -1px 0 #b71c1c,
                                                                    0 1px #b71c1c,
                                                                    0 -1px #b71c1c,
                                                                    0.7px 0.7px #b71c1c,
                                                                    -0.7px -0.7px #b71c1c,
                                                                    0.7px -0.7px #b71c1c,
                                                                    -0.7px 0.7px #b71c1c,
                                                                    0 0 8px rgba(183,28,28,0.5),
                                                                    0 0 8px rgba(183,28,28,0.5)
                                                                `,
                                                                direction: language === 'heb' ? 'rtl' : 'ltr',
                                                                paddingBottom: '4px',
                                                                backgroundColor: '#fff3e0',
                                                                opacity: 0.85,
                                                                borderRadius: '0 0 8px 8px',
                                                                padding: '4px 12px',
                                                                marginBottom: '6px',
                                                                width: 'calc(100% - 12px)',
                                                                marginLeft: '6px',
                                                                marginRight: '6px',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {language === 'heb' ?
                                                                (artist.gender === 'm' ? `נולד ב${bornElsewhere}` :
                                                                    artist.gender === 'f' ? `נולדה ב${bornElsewhere}` :
                                                                        `נולד/ה ב${bornElsewhere}`)
                                                                : `Born in ${bornElsewhere}`}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Center vertical line with circles */}
                <div
                    ref={timelineRef}
                    className="absolute left-1/2"
                    style={{
                        transform: 'translateX(-50%)',
                        top: screenSize === 'sm' ? '-30px' : screenSize === 'md' ? '-40px' : '-60px',
                        bottom: '0px',
                        width: screenSize === 'sm' ? '8px' : screenSize === 'md' ? '10px' : '16px',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    {/* Top circle */}
                    <div
                        style={{
                            width: screenSize === 'sm' ? '16px' : screenSize === 'md' ? '24px' : '40px',
                            height: screenSize === 'sm' ? '16px' : screenSize === 'md' ? '24px' : '40px',
                            background: '#a1130a',
                            borderRadius: '50%',
                            marginBottom: screenSize === 'sm' ? '-4px' : screenSize === 'md' ? '-6px' : '-12px',
                        }}
                        className="shadow-[0_0_6px_0.5px_rgba(161,19,10,0.8)]"
                    />
                    {/* The vertical line */}
                    <div
                        style={{
                            flex: 1,
                            width: screenSize === 'sm' ? '8px' : screenSize === 'md' ? '10px' : '16px',
                            background: '#a1130a',
                            minHeight: '80px', // ensures line is visible even with few avatars
                        }}
                        className="shadow-[0_0_4px_0.5px_rgba(161,19,10,0.8)]"
                    />
                    {/* Bottom circle */}
                    <div
                        style={{
                            width: screenSize === 'sm' ? '16px' : screenSize === 'md' ? '24px' : '40px',
                            height: screenSize === 'sm' ? '16px' : screenSize === 'md' ? '24px' : '40px',
                            background: '#a1130a',
                            borderRadius: '50%',
                            marginTop: screenSize === 'sm' ? '-4px' : screenSize === 'md' ? '-6px' : '-12px',
                        }}
                        className="shadow-[0_0_6px_0.5px_rgba(161,19,10,0.8)]"
                    />
                </div>
            </div>
        </div>
    );
};

export default AreaPage; 