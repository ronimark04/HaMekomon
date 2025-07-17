import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/languageContext';
import { mapPaths } from '../data/mapPaths';
import { regionData } from '../data/regionData';
import baseMapUnderlay from '../assets/map/israel-map-underlay.png';

function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function getSvgCoords(e, canvas, dpr) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2502.6667;
    const y = ((e.clientY - rect.top) / rect.height) * 3088;
    return { x, y };
}

export default function MapMobileCanvas() {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [images, setImages] = useState({});
    const { language } = useLanguage();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const animationRef = useRef();
    const animState = useRef({ overlay: 1, label: 1 });
    const verticalOffset = 10;
    const [canvasSize, setCanvasSize] = useState(() => {
        const dpr = window.devicePixelRatio || 1;
        const w = Math.max(300, Math.min(window.innerWidth * 0.95, 600));
        const h = w * (3088 / 2502.6667);
        return { width: w, height: h, dpr };
    });
    // Add refs for navigation logic
    const selectedRegionRef = useRef(null);
    const isConfirmedRef = useRef(false);
    useEffect(() => { selectedRegionRef.current = selectedRegion; }, [selectedRegion]);
    useEffect(() => { isConfirmedRef.current = isConfirmed; }, [isConfirmed]);

    useEffect(() => {
        function handleResize() {
            const dpr = window.devicePixelRatio || 1;
            const w = Math.max(300, Math.min(window.innerWidth * 0.95, 600));
            const h = w * (3088 / 2502.6667);
            setCanvasSize({ width: w, height: h, dpr });
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    // Preload all images on mount
    useEffect(() => {
        let isMounted = true;
        async function loadAllImages() {
            const imgMap = {};
            imgMap.base = await preloadImage(baseMapUnderlay);
            for (const [regionId, region] of Object.entries(regionData)) {
                imgMap[`${regionId}_underlay`] = await preloadImage(region.underlay);
                imgMap[`${regionId}_overlay`] = await preloadImage(region.overlay);
                if (region.label) {
                    if (region.label.heb) imgMap[`${regionId}_label_heb`] = await preloadImage(region.label.heb);
                    if (region.label.eng) imgMap[`${regionId}_label_eng`] = await preloadImage(region.label.eng);
                }
            }
            if (isMounted) {
                setImages(imgMap);
                setImagesLoaded(true);
            }
        }
        loadAllImages();
        return () => { isMounted = false; };
    }, []);

    // Animation and drawing loop with logging
    useEffect(() => {
        if (!imagesLoaded) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let running = true;
        let animationStart = null;
        let animating = false;
        let lastRegion = null;
        let lastLang = null;
        let lastConfirmed = null;

        function draw(overlayAlpha, labelAlpha) {
            // Set canvas size for high-DPI
            canvas.width = canvasSize.width * canvasSize.dpr;
            canvas.height = (canvasSize.height + verticalOffset) * canvasSize.dpr;
            canvas.style.width = `${canvasSize.width}px`;
            canvas.style.height = `${canvasSize.height + verticalOffset}px`;
            ctx.setTransform(canvasSize.dpr, 0, 0, canvasSize.dpr, 0, 0);
            ctx.clearRect(0, 0, canvasSize.width, canvasSize.height + verticalOffset);
            ctx.drawImage(images.base, 0, verticalOffset, canvasSize.width, canvasSize.height);
            for (const regionId of Object.keys(regionData)) {
                if (regionId === selectedRegion && !isConfirmed) {
                    // Selected underlay rises upward: y from 0 to -5
                    ctx.drawImage(images[`${regionId}_underlay`], 0, verticalOffset - 5 * overlayAlpha, canvasSize.width, canvasSize.height);
                } else {
                    // Other underlays remain static
                    ctx.drawImage(images[`${regionId}_underlay`], 0, verticalOffset, canvasSize.width, canvasSize.height);
                }
            }
            if (selectedRegion && !isConfirmed) {
                ctx.save();
                ctx.globalAlpha = overlayAlpha;
                // Overlay rises upward: y from 0 to -5
                ctx.drawImage(images[`${selectedRegion}_overlay`], 0, verticalOffset - 5 * overlayAlpha, canvasSize.width, canvasSize.height);
                ctx.restore();
                ctx.save();
                ctx.globalAlpha = labelAlpha;
                const labelImg = images[`${selectedRegion}_label_${language}`];
                if (labelImg) {
                    // Label rises upward: y from 30 to -10
                    ctx.drawImage(labelImg, 0, verticalOffset + 30 - 40 * labelAlpha, canvasSize.width, canvasSize.height);
                }
                ctx.restore();
            }
        }

        function animate(ts) {
            if (!running) return;
            // If region/language/confirmation changed, restart animation
            if (lastRegion !== selectedRegion || lastLang !== language || lastConfirmed !== isConfirmed) {
                animationStart = ts;
                animState.current = { overlay: 0, label: 0 };
                lastRegion = selectedRegion;
                lastLang = language;
                lastConfirmed = isConfirmed;
                animating = !!selectedRegion && !isConfirmed;
            }
            if (animating) {
                const progress = Math.min((ts - animationStart) / 300, 1);
                animState.current = { overlay: progress, label: progress };
                draw(progress, progress);
                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    animating = false;
                    animState.current = { overlay: 1, label: 1 };
                    draw(1, 1);
                }
            } else {
                draw(animState.current.overlay, animState.current.label);
            }
        }

        // Initial draw
        if (selectedRegion && !isConfirmed) {
            animating = true;
            animationRef.current = requestAnimationFrame(animate);
        } else {
            animState.current = { overlay: 1, label: 1 };
            draw(1, 1);
        }

        // Redraw on every relevant change
        return () => {
            running = false;
            cancelAnimationFrame(animationRef.current);
        };
    }, [imagesLoaded, images, selectedRegion, isConfirmed, language, canvasSize]);

    function handleCanvasClick(e) {
        if (!imagesLoaded) return;
        const canvas = canvasRef.current;
        const { x, y } = getSvgCoords(e, canvas, canvasSize.dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for hit-testing
        for (const { id, d } of mapPaths) {
            const path = new window.Path2D(d);
            if (ctx.isPointInPath(path, x, y)) {
                if (selectedRegionRef.current === id) {
                    setIsConfirmed(true);
                    setTimeout(() => {
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
                        const path = regionToPathMap[id];
                        if (path) navigate(`/area/${path}`);
                    }, 250);
                } else {
                    animState.current = { overlay: 0, label: 0 }; // Reset animation state
                    setSelectedRegion(id);
                    setIsConfirmed(false);
                }
                return;
            }
        }
        setSelectedRegion(null);
        setIsConfirmed(false);
    }

    // Native event listener for canvas clicks
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        function nativeClickHandler(e) {
            handleCanvasClick(e);
        }
        canvas.addEventListener('click', nativeClickHandler);
        return () => {
            canvas.removeEventListener('click', nativeClickHandler);
        };
    }, [imagesLoaded, canvasSize]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (canvasRef.current && !canvasRef.current.contains(e.target)) {
                setSelectedRegion(null);
                setIsConfirmed(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {!imagesLoaded && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: 48, width: 48, borderBottom: '2px solid #0070f3', margin: '0 auto 16px' }}></div>
                        <p>Loading map...</p>
                    </div>
                </div>
            )}
            <canvas
                ref={canvasRef}
                width={canvasSize.width * canvasSize.dpr}
                height={(canvasSize.height + verticalOffset) * canvasSize.dpr}
                style={{ width: canvasSize.width, height: canvasSize.height + verticalOffset, background: 'transparent', zIndex: 1 }}
            />
        </div>
    );
} 