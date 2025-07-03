import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import baseMap from '../assets/map/israel-map.png';
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
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const { language } = useLanguage();
    const navigate = useNavigate();

    // Preload all images on component mount
    useEffect(() => {
        const imagesToPreload = [];

        // Collect all overlay and label images
        Object.values(regionData).forEach(region => {
            if (region.overlay) {
                imagesToPreload.push(region.overlay);
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

    const getAreaPath = (regionId) => {
        const pathName = regionToPathMap[regionId];
        if (pathName) {
            return `/area/${pathName}`;
        }
        return null;
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
            {!imagesLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-default-600">Loading map...</p>
                    </div>
                </div>
            )}
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', minWidth: '400px' }}>
                <img src={baseMap} alt="Map of Israel" style={{ width: '100%' }} />

                <AnimatePresence>
                    {hoveredRegion && regionData[hoveredRegion] && (
                        <motion.img
                            key={hoveredRegion}
                            src={regionData[hoveredRegion].overlay}
                            alt={`${hoveredRegion} overlay`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{
                                duration: 0.15,
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
                    {hoveredRegion && regionData[hoveredRegion]?.label?.heb && (
                        <motion.img
                            key={`label-${hoveredRegion}-${language}`}
                            src={regionData[hoveredRegion].label[language]}
                            alt={`${hoveredRegion} label`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{
                                duration: 0.25,
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
                            onMouseEnter={() => setHoveredRegion(id)}
                            onMouseLeave={() => setHoveredRegion(null)}
                            onClick={() => {
                                console.log('Clicked region ID:', id);
                                const path = getAreaPath(id);
                                console.log('Navigation path:', path);
                                if (path) {
                                    navigate(path);
                                }
                            }}
                            cursor="pointer"
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
