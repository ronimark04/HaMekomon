import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Input,
  useDisclosure,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import LanguageSwitch from "./LanguageSwitch";
import LoginModal from "./LoginModal";
import { useAuth } from "../context/authContext";
import { useLanguage } from "../context/languageContext";
import { useState, useRef, useEffect } from "react";
import homeIcon from "../assets/home-icon-text.png";
import burgerMenuIcon from "../assets/burger-menu.png";
import { motion } from 'framer-motion';

const SearchIcon = ({ size = 24, strokeWidth = 1.5, width, height, ...props }) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={height || size}
    role="presentation"
    viewBox="0 0 24 24"
    width={width || size}
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
  </svg>
);

// Helper function to detect if text is mainly Hebrew
function isMainlyHebrew(text) {
  if (!text) return false;
  const hebrewPattern = /[\u0590-\u05FF]/g;
  const hebrewChars = (text.match(hebrewPattern) || []).length;
  return hebrewChars > text.length * 0.5;
}

// Helper to remove parentheses and their contents from a string
function stripParentheses(str) {
  if (!str) return str;
  return str.replace(/\s*\([^)]*\)/g, '').trim();
}

export default function SiteNavbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const [searchValue, setSearchValue] = useState("");
  const [allArtists, setAllArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const burgerRef = useRef(null);

  const handleLogout = () => {
    logout();
  };

  const profileText = language === "heb" ? "הפרופיל שלי" : "My Profile";
  const adminPanelText = language === "heb" ? "פאנל מנהל" : "Admin Panel";
  const searchPlaceholder = language === "heb" ? "חפש אמן/ית..." : "Find Artists...";
  const logoutText = language === "heb" ? "התנתקות" : "Logout";
  const loginText = language === "heb" ? "התחברות" : "Login";
  const signupText = language === "heb" ? "הרשמה" : "Sign Up";

  // Fetch all artists on first focus
  const handleSearchFocus = async () => {
    if (allArtists.length === 0 && !loadingArtists) {
      setLoadingArtists(true);
      try {
        const response = await fetch('/artists');
        if (response.ok) {
          const artists = await response.json();
          setAllArtists(artists);
          setFilteredArtists(artists);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoadingArtists(false);
      }
    }
    // Don't show dropdown on focus - only when typing
  };

  // Filter artists as user types
  useEffect(() => {
    if (!searchValue) {
      setFilteredArtists(allArtists);
      setShowDropdown(false); // Hide dropdown when no input
      setSelectedIndex(-1); // Reset selected index
      return;
    }
    const query = searchValue.toLowerCase();
    const filtered = allArtists.filter(
      (artist) =>
        artist.name.heb.toLowerCase().includes(query) ||
        artist.name.eng.toLowerCase().includes(query)
    );
    setFilteredArtists(filtered);
    setShowDropdown(true); // Show dropdown when there's input
    setSelectedIndex(-1); // Reset selected index when filtering
  }, [searchValue, allArtists]);

  // Handle artist selection
  const handleSelectArtist = (artistId) => {
    setShowDropdown(false);
    setSearchValue("");
    setSelectedIndex(-1);
    navigate(`/artist/${artistId}`);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || filteredArtists.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredArtists.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredArtists.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredArtists.length) {
          handleSelectArtist(filteredArtists[selectedIndex]._id);
        } else if (filteredArtists.length > 0) {
          // If no item is selected, select the first one
          handleSelectArtist(filteredArtists[0]._id);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle search (Enter key or search icon click)
  const handleSearch = () => {
    if (!searchValue.trim()) return;

    const exact = allArtists.find(
      (artist) =>
        artist.name.heb === searchValue ||
        artist.name.eng.toLowerCase() === searchValue.toLowerCase()
    );

    if (exact) {
      handleSelectArtist(exact._id);
    } else if (filteredArtists.length > 0) {
      handleSelectArtist(filteredArtists[0]._id);
    }
  };

  // Hide dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide burger dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (burgerRef.current && !burgerRef.current.contains(event.target)) {
        setBurgerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add this function to handle random artist navigation
  const handleRandomArtist = async () => {
    let artists = allArtists;
    if (artists.length === 0 && !loadingArtists) {
      setLoadingArtists(true);
      try {
        const response = await fetch('/artists');
        if (response.ok) {
          artists = await response.json();
          setAllArtists(artists);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
        setLoadingArtists(false);
        return;
      }
      setLoadingArtists(false);
    }
    if (artists.length > 0) {
      const randomIndex = Math.floor(Math.random() * artists.length);
      const randomArtist = artists[randomIndex];
      navigate(`/artist/${randomArtist._id}`);
    }
  };

  useEffect(() => {
    const handleArtistListUpdated = async () => {
      setLoadingArtists(true);
      try {
        const response = await fetch('/artists');
        if (response.ok) {
          const artists = await response.json();
          setAllArtists(artists);
          setFilteredArtists(artists);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoadingArtists(false);
      }
    };
    window.addEventListener('artistListUpdated', handleArtistListUpdated);
    return () => window.removeEventListener('artistListUpdated', handleArtistListUpdated);
  }, []);

  return (
    <>
      <Navbar
        shouldHideOnScroll
        className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur shadow"
        isBordered
      >
        <div className="flex w-full items-center justify-between">
          {/* Left: Home logo and Profile */}
          <div className="flex items-center gap-4">
            {/* Burger icon for mobile */}
            <div className="md:hidden relative" ref={burgerRef}
              onMouseEnter={() => setBurgerOpen(true)}
              onMouseLeave={() => setBurgerOpen(false)}>
              <img
                src={burgerMenuIcon}
                alt="Menu"
                className="h-8 w-8 cursor-pointer"
              />
              {burgerOpen && (
                <div className="absolute -left-6 mt-1 w-44 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999] flex flex-col py-2" dir={language === 'heb' ? 'rtl' : 'ltr'}>
                  {isAuthenticated && user && (
                    <Link
                      href={`/user/${user._id}`}
                      className="px-4 py-2 font-normal text-red-700 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
                    >
                      {profileText}
                    </Link>
                  )}
                  {isAuthenticated && user && user.isAdmin && (
                    <Link
                      href="/admin"
                      className="px-4 py-2 font-normal text-red-700 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
                    >
                      {adminPanelText}
                    </Link>
                  )}
                  {isAuthenticated && (
                    <Link
                      href="/contact"
                      className="px-4 py-2 font-normal text-red-700 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
                    >
                      {language === "heb" ? "צור קשר" : "Contact"}
                    </Link>
                  )}
                  {!isAuthenticated && (
                    <>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => {
                          onOpen();
                        }}
                        className="w-full justify-start px-4 py-2 font-normal text-red-700 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded bg-transparent"
                      >
                        {loginText}
                      </Button>
                      <Button
                        as={Link}
                        color="primary"
                        href="/signup"
                        variant="flat"
                        className="w-full justify-start px-4 py-2 font-normal text-blue-700 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded bg-transparent"
                      >
                        {signupText}
                      </Button>
                    </>
                  )}
                  {isAuthenticated && (
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        handleLogout();
                      }}
                      className="w-full justify-start px-4 py-2 font-normal text-red-700 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded bg-transparent"
                    >
                      {logoutText}
                    </Button>
                  )}
                </div>
              )}
            </div>
            <Link href="/">
              <img src={homeIcon} alt="Home" style={{ width: 36 }} />
            </Link>
            {/* Desktop links (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user && (
                <Link href={`/user/${user._id}`}
                  className="font-normal text-red-700 hover:text-red-600"
                >
                  {profileText}
                </Link>
              )}
              {isAuthenticated && user && user.isAdmin && (
                <Link href="/admin" className="font-normal text-red-700 hover:text-red-600">
                  {adminPanelText}
                </Link>
              )}
              <Link href="/contact" className="font-normal text-red-700 hover:text-red-600">
                {language === "heb" ? "צור קשר" : "Contact"}
              </Link>
            </div>
          </div>

          {/* Right: Search, Language Switch, and Auth */}
          <div className="flex items-center gap-2">
            {/* Random Artist Button - always visible */}
            <motion.div
              initial={{ background: 'linear-gradient(to right,rgb(247, 240, 171),rgb(255, 228, 121))' }}
              whileHover={{ background: 'linear-gradient(to right, #FDE68A, #FDE047)' }}
              transition={{ duration: 0.3 }}
              style={{ borderRadius: '0.5rem', width: 'fit-content' }}
              className="mr-2 ml-2"
            >
              <Button
                variant="flat"
                className="text-yellow-900 font-normal shadow-sm focus:ring-2 focus:ring-yellow-300 focus:outline-none px-2 py-1 text-xs h-8 md:px-4 md:py-2 md:text-base md:h-10"
                onPress={handleRandomArtist}
                isLoading={loadingArtists}
                style={{ background: 'transparent' }}
              >
                {language === "heb" ? "אמן רנדומלי" : "Random Artist"}
              </Button>
            </motion.div>
            {/* Search Bar with Dropdown */}
            <div className="relative">
              <Input
                classNames={{
                  base: "max-w-full sm:max-w-[14rem] h-10",
                  mainWrapper: "h-full",
                  input: "text-small",
                  inputWrapper:
                    "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20 rounded-large",
                }}
                placeholder={searchPlaceholder}
                size="sm"
                startContent={<SearchIcon size={18} />}
                type="search"
                aria-label="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
                dir={language === 'heb' ? 'rtl' : 'ltr'}
              />

              {/* Dropdown */}
              {showDropdown && filteredArtists.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {filteredArtists.map((artist, index) => (
                    <div
                      key={artist._id}
                      onClick={() => handleSelectArtist(artist._id)}
                      className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${index === selectedIndex ? 'bg-gray-100 dark:bg-zinc-700' : ''
                        }`}
                    >
                      <div className="font-light">
                        {stripParentheses(artist.name.heb)} / {stripParentheses(artist.name.eng)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <LanguageSwitch />

            {/* Desktop Auth Buttons (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <Button color="danger" variant="flat" onPress={handleLogout}>
                  {logoutText}
                </Button>
              ) : (
                <>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onOpen}
                    className="!w-auto !min-w-0 !px-4"
                  >
                    {loginText}
                  </Button>
                  <Button as={Link} color="primary" href="/signup" variant="flat">
                    {signupText}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Navbar>

      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
