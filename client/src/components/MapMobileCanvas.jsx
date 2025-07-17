import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/languageContext';
import { mapPaths } from '../data/mapPaths';
import { regionData } from '../data/regionData';
import baseMapUnderlay from '../assets/map/israel-map-underlay.png';

// Helper: Preload an image and return a promise
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Helper: Convert mouse event to SVG coordinates
function getSvgCoords(e, canvas) {
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
    const [anim, setAnim] = useState({ overlay: 1, label: 1 });
    const { language } = useLanguage();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const animationRef = useRef();

    // Preload all images on mount
    useEffect(() => {
        let isMounted = true;
        async function loadAllImages() {
            const imgMap = {};
            // Base
            imgMap.base = await preloadImage(baseMapUnderlay);
            // Underlays, overlays, labels
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

    // Animation effect for overlay/label fade/slide
    useEffect(() => {
        if (!selectedRegion || isConfirmed) return;
        let start;
        function animate(ts) {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / 300, 1); // 300ms
            setAnim({ overlay: 1, label: progress });
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        }
        setAnim({ overlay: 1, label: 0 });
        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [selectedRegion, language, isConfirmed]);

    // Redraw canvas on state/image/language change
    useEffect(() => {
        if (!imagesLoaded) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw base
        ctx.drawImage(images.base, 0, 0, canvas.width, canvas.height);
        // Draw all underlays
        for (const regionId of Object.keys(regionData)) {
            ctx.drawImage(images[`${regionId}_underlay`], 0, 0, canvas.width, canvas.height);
        }
        // Draw selected overlay (with fade/slide out on confirm)
        if (selectedRegion && !isConfirmed) {
            ctx.save();
            ctx.globalAlpha = anim.overlay;
            ctx.drawImage(images[`${selectedRegion}_overlay`], 0, -5 * (1 - anim.overlay), canvas.width, canvas.height);
            ctx.restore();
        }
        // Draw selected label (with fade/slide in)
        if (selectedRegion && !isConfirmed) {
            ctx.save();
            ctx.globalAlpha = anim.label;
            const labelImg = images[`${selectedRegion}_label_${language}`];
            if (labelImg) {
                ctx.drawImage(labelImg, 0, -20 + (-10 * (1 - anim.label)), canvas.width, canvas.height);
            }
            ctx.restore();
        }
    }, [imagesLoaded, images, selectedRegion, isConfirmed, anim, language]);

    // Handle region click (hit-testing)
    function handleCanvasClick(e) {
        if (!imagesLoaded) return;
        const canvas = canvasRef.current;
        const { x, y } = getSvgCoords(e, canvas);
        // Use SVG path hit-testing
        for (const { id, d } of mapPaths) {
            const path = new window.Path2D(d);
            if (canvas.getContext('2d').isPointInPath(path, x, y)) {
                if (selectedRegion === id) {
                    setIsConfirmed(true);
                    setTimeout(() => {
                        // Navigate after animation
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
                    setSelectedRegion(id);
                    setIsConfirmed(false);
                }
                return;
            }
        }
        // Clicked outside any region
        setSelectedRegion(null);
        setIsConfirmed(false);
    }

    // Handle click outside canvas
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

    // Responsive canvas size
    const [canvasSize, setCanvasSize] = useState({ width: 400, height: 494 });
    useEffect(() => {
        function handleResize() {
            const w = Math.max(300, Math.min(window.innerWidth * 0.95, 600));
            setCanvasSize({ width: w, height: w * (3088 / 2502.6667) });
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {!imagesLoaded && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: 48, width: 48, borderBottom: '2px solid #0070f3', margin: '0 auto 16px' }}></div>
                        <p>Loading map...</p>
                    </div>
                </div>
            )}
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{ width: canvasSize.width, height: canvasSize.height, background: 'transparent', zIndex: 1, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                onClick={handleCanvasClick}
            />
        </div>
    );
} 