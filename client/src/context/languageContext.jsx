import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState("heb"); // default to Hebrew

    const toggleLanguage = () => {
        setLanguage(prev => (prev === "heb" ? "eng" : "heb"));
        console.log("Current language:", language);
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
