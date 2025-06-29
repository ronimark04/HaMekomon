import { Switch } from "@heroui/react";
import { useLanguage } from "../context/languageContext";
import enIcon from "../assets/en-icon.svg";
import heIcon from "../assets/he-icon.svg";

export default function LanguageSwitch() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <Switch
            isSelected={language === "eng"}
            onChange={toggleLanguage}
            aria-label="Toggle language"
            color="warning"
            size="lg"
            startContent={
                <img
                    src={enIcon}
                    alt="English"
                    style={{ width: "1.25em", height: "1.25em", objectFit: "contain" }}
                />
            }
            endContent={
                <img
                    src={heIcon}
                    alt="Hebrew"
                    style={{ width: "1.25em", height: "1.25em", objectFit: "contain" }}
                />
            }
        />

    );
}

