import Map from "./Map";
import logoHeb from "../assets/logo-heb.png";
import logoEng from "../assets/logo-eng.png";
import { useLanguage } from "../context/languageContext";
import { motion } from 'framer-motion';
import contact1Heb from '../assets/contact1-heb.png';
import contact2Heb from '../assets/contact2-heb.png';
import contact1Eng from '../assets/contact1-eng.png';
import contact2Eng from '../assets/contact2-eng.png';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Home() {
    const { language } = useLanguage();
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1200);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', minHeight: '100vh' }}>
                {/* Logo div */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px', height: '180px' }}>
                    {language === 'eng' && (
                        <img
                            src={logoEng}
                            alt="HaMekomon"
                            style={{
                                height: '100%',
                                width: 'auto',
                                position: 'relative',
                                top: '10px',
                                zIndex: 2,
                                pointerEvents: 'none'
                            }}
                        />
                    )}
                    {language === 'heb' && (
                        <img
                            src={logoHeb}
                            alt="המקומון"
                            style={{
                                height: '100%',
                                width: 'auto',
                                position: 'relative',
                                top: '10px',
                                left: '10px',
                                zIndex: 2,
                                pointerEvents: 'none'
                            }}
                        />
                    )}
                </div>
                {/* Map div (unchanged) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        width: '90%', maxWidth: '600px', minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'
                    }}>
                        <Map />
                    </div>
                </div>
                {/* Contact div */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', minHeight: '120px', position: 'relative' }}>
                    <div style={{ width: '300px', position: 'relative' }}>
                        <img
                            src={language === 'heb' ? contact1Heb : contact1Eng}
                            alt="Contact background"
                            style={{ width: '100%', height: 'auto' }}
                        />
                        <Link to="/contact" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, width: '100%' }}>
                            <motion.div
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                style={{ display: 'inline-block', width: '100%' }}
                            >
                                <img
                                    src={language === 'heb' ? contact2Heb : contact2Eng}
                                    alt="Contact overlay"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Tablet breakpoint: 769px - 1200px
    if (isTablet) {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', minHeight: '100vh' }}>
                {/* Left container */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: '230px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', bottom: '-210px', left: '0' }}>
                        <img
                            src={language === 'heb' ? contact1Heb : contact1Eng}
                            alt="Contact background"
                            style={{ width: '100%', height: 'auto' }}
                        />
                        <Link to="/contact" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, width: '100%' }}>
                            <motion.div
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                style={{ display: 'inline-block', width: '100%' }}
                            >
                                <img
                                    src={language === 'heb' ? contact2Heb : contact2Eng}
                                    alt="Contact overlay"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            </motion.div>
                        </Link>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        width: '90%', maxWidth: '600px', minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'
                    }}>
                        <Map />
                    </div>
                </div>
                <div style={{ boxSizing: 'border-box', minWidth: '700px' }}>
                    {/* Right container */}
                    {language === 'eng' && (
                        <img
                            src={logoEng}
                            alt="HaMekomon"
                            style={{
                                width: '500px',
                                position: 'relative',
                                top: '70px',
                                left: '15px',
                                zIndex: 2,
                                pointerEvents: 'none'
                            }}
                        />
                    )}
                    {language === 'heb' && (
                        <img
                            src={logoHeb}
                            alt="המקומון"
                            style={{
                                width: '400px',
                                position: 'relative',
                                top: '70px',
                                left: '10px',
                                zIndex: 2,
                                pointerEvents: 'none'
                            }}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', minHeight: '100vh' }}>
            {/* Left container */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'end', justifyContent: 'center', position: 'relative'
            }}>
                <div style={{
                    width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
                    bottom: '100px', left: '0'
                }}>
                    <img
                        src={language === 'heb' ? contact1Heb : contact1Eng}
                        alt="Contact background"
                        style={{ width: '100%', height: 'auto' }}
                    />
                    <Link to="/contact" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, width: '100%' }}>
                        <motion.div
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            style={{ display: 'inline-block', width: '100%' }}
                        >
                            <img
                                src={language === 'heb' ? contact2Heb : contact2Eng}
                                alt="Contact overlay"
                                style={{ width: '100%', height: 'auto' }}
                            />
                        </motion.div>
                    </Link>
                </div>
            </div>
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {/* Map container */}
                <div style={{
                    width: '90%', maxWidth: '600px', minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'
                }}>
                    <Map />
                </div>
            </div>
            <div style={{ boxSizing: 'border-box', minWidth: '700px' }}>
                {/* Right container */}
                {language === 'eng' && (
                    <img
                        src={logoEng}
                        alt="HaMekomon"
                        style={{
                            width: '700px',
                            position: 'relative',
                            top: '70px',
                            left: '-20px',
                            zIndex: 2,
                            pointerEvents: 'none'
                        }}
                    />
                )}
                {language === 'heb' && (
                    <img
                        src={logoHeb}
                        alt="המקומון"
                        style={{
                            width: '550px',
                            position: 'relative',
                            top: '70px',
                            left: '-50px',
                            zIndex: 2,
                            pointerEvents: 'none'
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default Home;