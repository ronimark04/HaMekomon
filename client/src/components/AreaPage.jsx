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
    const [isMobile, setIsMobile] = useState(false);
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

    // Effect for screen size detection
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // --- End dynamic line width logic ---

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/areas/area/${areaName}`);
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
    }, [areaName]);

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

    // Helper to get avatar size based on rate
    const getAvatarSize = (rate) => {
        if (isMobile) {
            // Mobile sizes (under 768px)
            switch (rate) {
                case 1: return 'w-32 h-32'; // 128px (was 208px)
                case 2: return 'w-28 h-28'; // 112px (was 160px)
                case 3: return 'w-24 h-24'; // 96px (was 144px)
                case 4: return 'w-20 h-20'; // 80px (was 112px)
                default: return 'w-32 h-32'; // Default to largest mobile size
            }
        } else {
            // Desktop sizes (768px and above)
            switch (rate) {
                case 1: return 'w-52 h-52'; // 208px
                case 2: return 'w-40 h-40'; // 160px
                case 3: return 'w-36 h-36'; // 144px
                case 4: return 'w-28 h-28'; // 112px
                default: return 'w-52 h-52'; // Default to largest size
            }
        }
    };

    // Helper to get avatar pixel size based on rate
    const getAvatarPixelSize = (rate) => {
        if (isMobile) {
            // Mobile sizes (under 768px)
            switch (rate) {
                case 1: return 128; // (was 208)
                case 2: return 112; // (was 160)
                case 3: return 96;  // (was 144)
                case 4: return 80;  // (was 112)
                default: return 128;
            }
        } else {
            // Desktop sizes (768px and above)
            switch (rate) {
                case 1: return 208;
                case 2: return 160;
                case 3: return 144;
                case 4: return 112;
                default: return 208;
            }
        }
    };

    // Helper to get font size for location/year/bornElsewhere text based on rate
    const getLocationFontSize = (rate) => {
        if (isMobile) {
            // Mobile font sizes (under 768px)
            switch (rate) {
                case 1: return "1.1rem"; // (was 1.5rem)
                case 2: return "1.0rem"; // (was 1.3rem)
                case 3: return "0.9rem"; // (was 1.1rem)
                case 4: return "0.8rem"; // (was 0.9rem)
                default: return "1.1rem";
            }
        } else {
            // Desktop font sizes (768px and above)
            switch (rate) {
                case 1: return "1.5rem"; // Largest for rate 1
                case 2: return "1.3rem"; // Slightly smaller for rate 2
                case 3: return "1.1rem"; // Smaller for rate 3
                case 4: return "0.9rem"; // Smallest for rate 4
                default: return "1.5rem";
            }
        }
    };

    // Helper to get font size for bornElsewhere text based on rate
    const getBornElsewhereFontSize = (rate) => {
        if (isMobile) {
            // Mobile font sizes (under 768px)
            switch (rate) {
                case 1: return "0.9rem"; // (was 1.1rem)
                case 2: return "0.8rem"; // (was 0.95rem)
                case 3: return "0.7rem"; // (was 0.8rem)
                case 4: return "0.6rem"; // (was 0.65rem)
                default: return "0.9rem";
            }
        } else {
            // Desktop font sizes (768px and above)
            switch (rate) {
                case 1: return "1.1rem"; // Largest for rate 1
                case 2: return "0.95rem"; // Slightly smaller for rate 2
                case 3: return "0.8rem"; // Smaller for rate 3
                case 4: return "0.65rem"; // Smallest for rate 4
                default: return "1.1rem";
            }
        }
    };

    // Helper to get font size for artist name
    const getArtistNameFontSize = () => {
        return isMobile ? "1.8rem" : "2.5rem";
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

    // Determine max height based on area
    const getAreaTitleMaxHeight = () => {
        const largerImageAreas = ['southern-negev-and-arava', 'haifa-area', 'jerusalem-area'];
        return largerImageAreas.includes(areaName) ? 'max-h-40' : 'max-h-24';
    };

    return (
        <div className="container mx-auto p-6 pt-16 pb-24">
            {/* Area Title Image */}
            {areaTitleImage && (
                <div className="flex justify-center mb-28">
                    <img
                        src={areaTitleImage}
                        alt={`${area?.name || 'Area'} Title`}
                        className={`max-w-full h-auto object-contain ${getAreaTitleMaxHeight()}`}
                        style={{ filter: 'drop-shadow(0 4px 4px rgba(250, 206, 124, 0.83))' }}
                    />
                </div>
            )}

            <div className={`flex justify-center items-start relative ${isMobile ? 'gap-48' : 'gap-96'}`}>
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
                        } else if (!artist.isBand && artist.birthYear) {
                            yearDisplay = artist.birthYear;
                        }
                        const showLocation = !isTelAvivArea(area?.name);
                        // Reverse: first avatar is right, second is left, etc.
                        const offset = isMobile ? 30 : 60; // px, smaller on mobile
                        const isLeft = idx % 2 !== 0;
                        return (
                            <div
                                key={artist._id}
                                className={`relative flex flex-col items-center ${isMobile ? 'mb-12' : 'mb-16'}`}
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
                                        const actionOffset = isMobile ? 35 : 55; // Smaller offset on mobile
                                        return (
                                            <div style={{
                                                position: 'absolute',
                                                left: `calc(50% - ${avatarPx / 2 + actionOffset}px)`,
                                                top: '50%',
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
                                                />
                                            </div>
                                        );
                                    })()}
                                    {/* Avatar centered */}
                                    <motion.div
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative flex flex-col items-center cursor-pointer group"
                                    >
                                        <span
                                            style={{
                                                color: "#FEF7D5",
                                                fontWeight: 400,
                                                fontSize: getArtistNameFontSize(),
                                                lineHeight: 1,
                                                position: "absolute",
                                                top: isMobile ? "-29px" : "-40px",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                textAlign: "center",
                                                zIndex: 10,
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
                                                {/* Data climbing from bottom of avatar */}
                                                <div
                                                    className="absolute inset-0 flex flex-col justify-end items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-full group-hover:translate-y-0 overflow-hidden rounded-2xl"
                                                >
                                                    <div
                                                        className="transition-transform duration-300 ease-out transform translate-y-full group-hover:translate-y-0"
                                                        style={{
                                                            color: "#FEEFB6",
                                                            fontWeight: 400,
                                                            fontSize: getLocationFontSize(artist.rate),
                                                            lineHeight: 1.1,
                                                            fontFamily: 'adobe-hebrew',
                                                            fontStyle: 'normal',
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
                                                        {artist.isBand ? (
                                                            bornElsewhere ? (
                                                                <>
                                                                    {showLocation && (
                                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location}</div>
                                                                    )}
                                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{yearDisplay}</div>
                                                                    <div style={{
                                                                        fontSize: getBornElsewhereFontSize(artist.rate),
                                                                        fontStyle: 'italic',
                                                                        direction: language === 'heb' ? 'rtl' : 'ltr'
                                                                    }}>
                                                                        {language === 'heb' ?
                                                                            (artist.gender === 'm' ? `נולד ב${bornElsewhere}` :
                                                                                artist.gender === 'f' ? `נולדה ב${bornElsewhere}` :
                                                                                    `נולד/ה ב${bornElsewhere}`)
                                                                            : `Born in ${bornElsewhere}`}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {showLocation && (
                                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location}</div>
                                                                    )}
                                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{yearDisplay}</div>
                                                                </>
                                                            )
                                                        ) : (
                                                            bornElsewhere ? (
                                                                <>
                                                                    {showLocation ? (
                                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location} — {yearDisplay}</div>
                                                                    ) : (
                                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{yearDisplay}</div>
                                                                    )}
                                                                    <div style={{
                                                                        fontSize: getBornElsewhereFontSize(artist.rate),
                                                                        fontStyle: 'italic',
                                                                        direction: language === 'heb' ? 'rtl' : 'ltr'
                                                                    }}>
                                                                        {language === 'heb' ?
                                                                            (artist.gender === 'm' ? `נולד ב${bornElsewhere}` :
                                                                                artist.gender === 'f' ? `נולדה ב${bornElsewhere}` :
                                                                                    `נולד/ה ב${bornElsewhere}`)
                                                                            : `Born in ${bornElsewhere}`}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                showLocation ? (
                                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location} — {yearDisplay}</div>
                                                                ) : (
                                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{yearDisplay}</div>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Right column */}
                <div className={`flex flex-col relative ${isMobile ? 'mt-16' : 'mt-28'}`}>
                    {rightColumnArtists.map((artist, idx) => {
                        const artistNameRaw = getLocalizedText(artist.name, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const artistName = stripParentheses(artistNameRaw);
                        const fallbackInitial = artistName.charAt(0) || (language === 'heb' ? 'ל' : 'U');
                        const location = getLocalizedText(artist.location, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const bornElsewhere = getLocalizedText(artist.bornElsewhere);
                        let yearDisplay = '';
                        if (artist.isBand && artist.yearRange && artist.yearRange.first && artist.yearRange.last) {
                            yearDisplay = `${artist.yearRange.first} - ${artist.yearRange.last}`;
                        } else if (!artist.isBand && artist.birthYear) {
                            yearDisplay = artist.birthYear;
                        }
                        const showLocation = !isTelAvivArea(area?.name);
                        // Reverse: first avatar is left, second is right, etc.
                        const offset = isMobile ? 30 : 60; // px, smaller on mobile
                        const isRight = idx % 2 !== 0;
                        return (
                            <div
                                key={artist._id}
                                className={`relative flex flex-col items-center ${isMobile ? 'mb-12' : 'mb-16'}`}
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
                                        const actionOffset = isMobile ? 35 : 55; // Smaller offset on mobile
                                        return (
                                            <div style={{
                                                position: 'absolute',
                                                right: `calc(50% - ${avatarPx / 2 + actionOffset}px)`,
                                                top: '50%',
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
                                                />
                                            </div>
                                        );
                                    })()}
                                    {/* Avatar centered */}
                                    <motion.div
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative flex flex-col items-center cursor-pointer group"
                                    >
                                        <span
                                            style={{
                                                color: "#FEEFB6",
                                                fontWeight: 400,
                                                fontSize: getArtistNameFontSize(),
                                                lineHeight: 1,
                                                position: "absolute",
                                                top: isMobile ? "-29px" : "-40px",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                textAlign: "center",
                                                zIndex: 10,
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
                                                {/* Data climbing from bottom of avatar */}
                                                <div
                                                    className="absolute inset-0 flex flex-col justify-end items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-full group-hover:translate-y-0 overflow-hidden rounded-2xl"
                                                >
                                                    <div
                                                        className="transition-transform duration-300 ease-out transform translate-y-full group-hover:translate-y-0"
                                                        style={{
                                                            color: "#FEEFB6",
                                                            fontWeight: 400,
                                                            fontSize: getLocationFontSize(artist.rate),
                                                            lineHeight: 1.1,
                                                            fontFamily: 'adobe-hebrew',
                                                            fontStyle: 'normal',
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
                                                        {artist.isBand ? (
                                                            bornElsewhere ? (
                                                                <>
                                                                    {showLocation && (
                                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location}</div>
                                                                    )}
                                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{yearDisplay}</div>
                                                                    <div style={{
                                                                        fontSize: getBornElsewhereFontSize(artist.rate),
                                                                        fontStyle: 'italic',
                                                                        direction: language === 'heb' ? 'rtl' : 'ltr'
                                                                    }}>
                                                                        {language === 'heb' ?
                                                                            (artist.gender === 'm' ? `נולד ב${bornElsewhere}` :
                                                                                artist.gender === 'f' ? `נולדה ב${bornElsewhere}` :
                                                                                    `נולד/ה ב${bornElsewhere}`)
                                                                            : `Born in ${bornElsewhere}`}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {showLocation && (
                                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location}</div>
                                                                    )}
                                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{yearDisplay}</div>
                                                                </>
                                                            )
                                                        ) : (
                                                            bornElsewhere ? (
                                                                <>
                                                                    {showLocation ? (
                                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location} — {yearDisplay}</div>
                                                                    ) : (
                                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{yearDisplay}</div>
                                                                    )}
                                                                    <div style={{
                                                                        fontSize: getBornElsewhereFontSize(artist.rate),
                                                                        fontStyle: 'italic',
                                                                        direction: language === 'heb' ? 'rtl' : 'ltr'
                                                                    }}>
                                                                        {language === 'heb' ?
                                                                            (artist.gender === 'm' ? `נולד ב${bornElsewhere}` :
                                                                                artist.gender === 'f' ? `נולדה ב${bornElsewhere}` :
                                                                                    `נולד/ה ב${bornElsewhere}`)
                                                                            : `Born in ${bornElsewhere}`}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                showLocation ? (
                                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location} — {yearDisplay}</div>
                                                                ) : (
                                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{yearDisplay}</div>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                </div>
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
                        top: '-60px',
                        bottom: '0px',
                        width: '16px',
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
                            width: '40px',
                            height: '40px',
                            background: '#a1130a',
                            borderRadius: '50%',
                            marginBottom: '-12px', // overlap with line
                        }}
                        className="shadow-[0_0_6px_0.5px_rgba(161,19,10,0.8)]"
                    />
                    {/* The vertical line */}
                    <div
                        style={{
                            flex: 1,
                            width: '16px',
                            background: '#a1130a',
                            minHeight: '200px', // ensures line is visible even with few avatars
                        }}
                        className="shadow-[0_0_4px_0.5px_rgba(161,19,10,0.8)]"
                    />
                    {/* Bottom circle */}
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            background: '#a1130a',
                            borderRadius: '50%',
                            marginTop: '-12px', // overlap with line
                        }}
                        className="shadow-[0_0_6px_0.5px_rgba(161,19,10,0.8)]"
                    />
                </div>
            </div>
        </div>
    );
};

export default AreaPage; 