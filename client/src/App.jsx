import { Routes, Route } from "react-router-dom";
import Map from './components/MapFullScreen'
import Home from './components/Home'
import SiteNavbar from "./components/SiteNavbar";
import AreaPage from "./components/AreaPage";
import Signup from "./components/Signup";
import ArtistPage from "./components/ArtistPage";
import ProfilePage from "./components/ProfilePage";
import AdminPanel from "./components/AdminPanel";
import { AuthProvider } from "./context/authContext";
import Contact from "./components/Contact";
import { useEffect, useState } from "react";
import samllScreenImg from "./assets/samll-screen.png";

function App() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // if (windowWidth < 480) {
  //   return (
  //     <div style={{ minHeight: '100vh', minWidth: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', zIndex: 99999 }}>
  //       <img src={samllScreenImg} alt="Small screen warning" style={{ width: 500, maxWidth: '90vw', height: 'auto' }} />
  //     </div>
  //   );
  // }

  return (
    <AuthProvider>
      <div className="min-h-screen">
        <SiteNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/area/:areaName" element={<AreaPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/artist/:artistId" element={<ArtistPage />} />
          <Route path="/user/:userId" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
