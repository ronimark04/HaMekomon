import { useEffect, useState } from 'react';
import MapFullScreen from './MapFullScreen.jsx';
//import MapMobile from './MapMobile.jsx';
import MapMobileCanvas from './MapMobileCanvas.jsx';

export default function InteractiveMap() {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleChange = (e) => setIsMobile(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isMobile ? <MapMobileCanvas /> : <MapFullScreen />;
} 