import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import baseMapUnderlay from '../assets/map/israel-map-underlay.png';
import { mapPaths } from '../data/mapPaths';
import { regionData } from '../data/regionData';
import { useLanguage } from '@/context/languageContext';
import areasData from '../../../backend/seed_data/areas.json';

// Map paths to area names
const regionToPathMap = {
    'area_01_upperGalilee': 'upper-galilee',
    'area_02_westernGalilee': 'western-galilee',
    'area_03_krayot': 'krayot',
    'area_04_haifa': 'haifa-area',
    'area_05_jordanValley': 'jordan-valley',
    'area_06_lowerGalilee': 'lower-galilee',
    'area_07_heferValley': 'hefer-valley',
    'area_08_judeaAndSamaria': 'judea-and-samaria',
    'area_09_sharon': 'sharon',
    'area_10_center': 'center',
    'area_11_telAviv': 'tel-aviv',
    'area_12_shfela': 'shfela',
    'area_13_coast': 'coast',
    'area_14_jerusalem': 'jerusalem-area',
    'area_15_northernNegev': 'northern-negev',
    'area_16_arava': 'southern-negev-and-arava'
};

export default function Map() {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const { language } = useLanguage();
    const navigate = useNavigate();
    const mapRef = useRef(null);

    // Preload all images on component mount
    useEffect(() => {
        const imagesToPreload = [];

        // Collect all overlay, underlay and label images
        Object.values(regionData).forEach(region => {
            if (region.overlay) {
                imagesToPreload.push(region.overlay);
            }
            if (region.underlay) {
                imagesToPreload.push(region.underlay);
            }
            if (region.label) {
                if (region.label.heb) imagesToPreload.push(region.label.heb);
                if (region.label.eng) imagesToPreload.push(region.label.eng);
            }
        });

        // Preload all images
        let loadedCount = 0;
        const totalImages = imagesToPreload.length;

        imagesToPreload.forEach(src => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    setImagesLoaded(true);
                }
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    setImagesLoaded(true);
                }
            };
            img.src = src;
        });
    }, []);

    // Handle clicks outside the entire component
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mapRef.current && !mapRef.current.contains(event.target)) {
                setSelectedRegion(null);
                setIsConfirmed(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getAreaPath = (regionId) => {
        const pathName = regionToPathMap[regionId];
        if (pathName) {
            return `/area/${pathName}`;
        }
        return null;
    };

    const handleRegionClick = (regionId) => {
        if (selectedRegion === regionId) {
            // Second click on same region - confirm and navigate
            setIsConfirmed(true);
            const path = getAreaPath(regionId);
            if (path) {
                // timeout to allow the animation to complete
                setTimeout(() => {
                    navigate(path);
                }, 250);
            }
        } else {
            // First click on different region - select it
            setSelectedRegion(regionId);
            setIsConfirmed(false);
        }
    };

    const handleMapClick = (e) => {
        // Click outside regions - deselect
        if (e.target.tagName !== 'path') {
            setSelectedRegion(null);
            setIsConfirmed(false);
        }
    };

    return (
        <div
            ref={mapRef}
            className="flex" //removed this to stop homepage from centering vertically: justify-center items-center min-h-[calc(100vh-64px)]
            onClick={handleMapClick}
        >
            {!imagesLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-default-600">Loading map...</p>
                    </div>
                </div>
            )}
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', minWidth: '400px' }}>
                {/* Always-visible base map underlay */}
                <img src={baseMapUnderlay} alt="Map of Israel Underlay" style={{ width: '100%', zIndex: 1 }} />

                {/* All area underlays, stacked above baseMapUnderlay */}
                {Object.entries(regionData).map(([regionId, region]) => (
                    <motion.img
                        key={`underlay-${regionId}`}
                        src={region.underlay}
                        alt={`${regionId} underlay`}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{
                            opacity: 1,
                            y: selectedRegion === regionId
                                ? (isConfirmed ? 0 : -5)
                                : 0
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            pointerEvents: 'none',
                            zIndex: 2,
                            willChange: 'transform',
                        }}
                    />
                ))}

                <AnimatePresence>
                    {selectedRegion && regionData[selectedRegion] && (
                        <motion.img
                            key={selectedRegion}
                            src={regionData[selectedRegion].overlay}
                            alt={`${selectedRegion} overlay`}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{
                                opacity: isConfirmed ? 0 : 1,
                                y: isConfirmed ? 0 : -5
                            }}
                            exit={{ opacity: 0, y: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: "easeOut"
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                pointerEvents: 'none',
                                zIndex: 2,
                                willChange: 'transform, opacity',
                            }}
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {selectedRegion && !isConfirmed && regionData[selectedRegion]?.label?.heb && (
                        <motion.img
                            key={`label-${selectedRegion}-${language}`}
                            src={regionData[selectedRegion].label[language]}
                            alt={`${selectedRegion} label`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: -10 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{
                                duration: 0.3,
                                ease: "easeOut"
                            }}
                            style={{
                                position: 'absolute',
                                top: -20,
                                left: 0,
                                width: '100%',
                                pointerEvents: 'none',
                                zIndex: 4,
                                willChange: 'transform, opacity',
                            }}
                        />
                    )}
                </AnimatePresence>

                <svg
                    viewBox="0 0 2502.6667 3088"
                    xmlns="http://www.w3.org/2000/svg" // SVG namespace
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 3,
                    }}
                >
                    {mapPaths.map(({ id, d, fill }) => (
                        <path
                            key={id}
                            id={id}
                            d={d}
                            fill={fill}
                            onClick={() => handleRegionClick(id)}
                            cursor="pointer"
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
