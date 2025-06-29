import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    Checkbox,
    Divider,
    RadioGroup,
    Radio
} from "@heroui/react";
import { useLanguage } from '../context/languageContext';
import { addToast } from "@heroui/react";

const UpdateArtistModal = ({ artist, isOpen, onClose, onSuccess, areas }) => {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [bornElsewhereChecked, setBornElsewhereChecked] = useState(false);
    const [formData, setFormData] = useState({
        name: { heb: '', eng: '' },
        isBand: false,
        birthYear: '',
        yearRange: { first: '', last: '' },
        location: { heb: '', eng: '' },
        area: '',
        bornElsewhere: { eng: '', heb: '' },
        gender: '',
        image: { url: '', alt: '' },
        summary: { heb: '', eng: '' },
        wiki: { heb: '', eng: '' },
        spotifyId: '',
        rate: 3
    });

    // Populate form data when artist changes
    useEffect(() => {
        if (artist) {
            setFormData({
                name: {
                    heb: artist.name?.heb || '',
                    eng: artist.name?.eng || ''
                },
                isBand: artist.isBand || false,
                birthYear: artist.birthYear || '',
                yearRange: {
                    first: artist.yearRange?.first || '',
                    last: artist.yearRange?.last || ''
                },
                location: {
                    heb: artist.location?.heb || '',
                    eng: artist.location?.eng || ''
                },
                area: artist.area?._id || '',
                bornElsewhere: {
                    eng: artist.bornElsewhere?.eng || '',
                    heb: artist.bornElsewhere?.heb || ''
                },
                gender: artist.gender || '',
                image: {
                    url: artist.image?.url || '',
                    alt: artist.image?.alt || ''
                },
                summary: {
                    heb: artist.summary?.heb || '',
                    eng: artist.summary?.eng || ''
                },
                wiki: {
                    heb: artist.wiki?.heb || '',
                    eng: artist.wiki?.eng || ''
                },
                spotifyId: artist.spotifyId || '',
                rate: artist.rate || 3
            });
            setBornElsewhereChecked(!!(artist.bornElsewhere?.eng || artist.bornElsewhere?.heb));
        }
    }, [artist]);

    // Add effect to clear bornElsewhere and gender if isBand is checked
    useEffect(() => {
        if (formData.isBand) {
            if (bornElsewhereChecked) setBornElsewhereChecked(false);
            setFormData(prev => ({
                ...prev,
                bornElsewhere: { eng: '', heb: '' },
                gender: ''
            }));
        }
    }, [formData.isBand]);

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.name.heb || !formData.name.eng) {
            addToast({
                description: language === 'heb' ? 'נדרשים שמות בעברית ובאנגלית' : 'Hebrew and English names are required',
                color: "danger",
                timeout: 3000
            });
            return;
        }

        if (!formData.location.heb || !formData.location.eng) {
            addToast({
                description: language === 'heb' ? 'נדרשים מיקומים בעברית ובאנגלית' : 'Hebrew and English locations are required',
                color: "danger",
                timeout: 3000
            });
            return;
        }

        if (!formData.spotifyId) {
            addToast({
                description: language === 'heb' ? 'נדרש מזהה ספוטיפיי' : 'Spotify ID is required',
                color: "danger",
                timeout: 3000
            });
            return;
        }

        if (!formData.isBand && !formData.birthYear) {
            addToast({
                description: language === 'heb' ? 'נדרשת שנת לידה לאמן יחיד' : 'Birth year is required for solo artists',
                color: "danger",
                timeout: 3000
            });
            return;
        }

        if (formData.isBand && (!formData.yearRange.first || !formData.yearRange.last)) {
            addToast({
                description: language === 'heb' ? 'נדרשות שנות לידה לחברי הלהקה' : 'Birth years are required for band members',
                color: "danger",
                timeout: 3000
            });
            return;
        }

        // Check if gender is required when bornElsewhere is selected
        if ((formData.bornElsewhere.eng || formData.bornElsewhere.heb) && !formData.gender) {
            addToast({
                description: language === 'heb' ? 'נדרש מין כאשר נולד במקום אחר' : 'Gender is required when born elsewhere',
                color: "danger",
                timeout: 3000
            });
            return;
        }

        setLoading(true);
        try {
            // Debug: Check authentication
            const token = localStorage.getItem('token');
            console.log('Token exists:', !!token);
            console.log('Token length:', token ? token.length : 0);

            // Prepare data for submission
            const submitData = {
                ...formData,
                image: {
                    url: formData.image.url,
                    alt: formData.name.eng // Auto-populate alt with English name
                }
            };

            // Convert string values to numbers where needed
            if (!formData.isBand && formData.birthYear) {
                submitData.birthYear = parseInt(formData.birthYear);
                // Remove yearRange for solo artists
                delete submitData.yearRange;
            }
            if (formData.isBand) {
                submitData.yearRange.first = parseInt(formData.yearRange.first);
                submitData.yearRange.last = parseInt(formData.yearRange.last);
                // Remove birthYear for bands
                delete submitData.birthYear;
            }
            if (formData.rate) {
                submitData.rate = parseInt(formData.rate);
            }

            console.log('Sending request to:', `/artists/${artist._id}`);
            console.log('Request headers:', {
                'Content-Type': 'application/json',
                'x-auth-token': token
            });

            const response = await fetch(`/artists/${artist._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(submitData)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                addToast({
                    description: language === 'heb' ? 'האמן עודכן בהצלחה' : 'Artist updated successfully',
                    color: "success",
                    timeout: 3000
                });
                onSuccess();
            } else {
                const error = await response.json();
                console.log('Error response:', error);
                addToast({
                    description: error.message || (language === 'heb' ? 'שגיאה בעדכון האמן' : 'Error updating artist'),
                    color: "danger",
                    timeout: 3000
                });
            }
        } catch (error) {
            console.error('Error updating artist:', error);
            addToast({
                description: language === 'heb' ? 'שגיאה בעדכון האמן' : 'Error updating artist',
                color: "danger",
                timeout: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setBornElsewhereChecked(false);
        setFormData({
            name: { heb: '', eng: '' },
            isBand: false,
            birthYear: '',
            yearRange: { first: '', last: '' },
            location: { heb: '', eng: '' },
            area: '',
            bornElsewhere: { eng: '', heb: '' },
            gender: '',
            image: { url: '', alt: '' },
            summary: { heb: '', eng: '' },
            wiki: { heb: '', eng: '' },
            spotifyId: '',
            rate: 3
        });
        onClose();
    };

    const translations = {
        updateArtist: { heb: 'עדכן אמן', eng: 'Update Artist' },
        hebrewName: { heb: 'שם בעברית', eng: 'Hebrew Name' },
        englishName: { heb: 'שם באנגלית', eng: 'English Name' },
        isBand: { heb: 'להקה', eng: 'Is Band' },
        birthYear: { heb: 'שנת לידה', eng: 'Birth Year' },
        youngestMember: { heb: 'שנת לידה של החבר הצעיר ביותר', eng: 'Youngest Band Member Birth Year' },
        oldestMember: { heb: 'שנת לידה של החבר המבוגר ביותר', eng: 'Oldest Band Member Birth Year' },
        hebrewLocation: { heb: 'מיקום בעברית', eng: 'Hebrew Location' },
        englishLocation: { heb: 'מיקום באנגלית', eng: 'English Location' },
        area: { heb: 'אזור', eng: 'Area' },
        bornElsewhere: { heb: 'נולד במקום אחר', eng: 'Born Elsewhere' },
        bornElsewhereText: { heb: 'טקסט לנולד במקום אחר', eng: 'Born Elsewhere Text' },
        gender: { heb: 'מין', eng: 'Gender' },
        male: { heb: 'זכר', eng: 'Male' },
        female: { heb: 'נקבה', eng: 'Female' },
        imageUrl: { heb: 'כתובת תמונה', eng: 'Image URL' },
        hebrewSummary: { heb: 'סיכום בעברית', eng: 'Hebrew Summary' },
        englishSummary: { heb: 'סיכום באנגלית', eng: 'English Summary' },
        hebrewWikipedia: { heb: 'ויקיפדיה בעברית (אופציונלי)', eng: 'Hebrew Wikipedia (Optional)' },
        englishWikipedia: { heb: 'ויקיפדיה באנגלית (אופציונלי)', eng: 'English Wikipedia (Optional)' },
        spotifyId: { heb: 'מזהה ספוטיפיי', eng: 'Spotify ID' },
        rating: { heb: 'דירוג', eng: 'Rating' },
        cancel: { heb: 'ביטול', eng: 'Cancel' },
        update: { heb: 'עדכן', eng: 'Update' }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="4xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className={language === 'heb' ? 'justify-end' : 'justify-start'}>
                    {translations.updateArtist[language]}
                </ModalHeader>
                <ModalBody>
                    <div className={`space-y-6 ${language === 'heb' ? 'text-right' : 'text-left'}`}>
                        {/* Names */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={translations.hebrewName[language]}
                                value={formData.name.heb}
                                onChange={(e) => handleInputChange('name.heb', e.target.value)}
                                isRequired
                                dir={language === 'heb' ? 'rtl' : 'ltr'}
                                className={language === 'heb' ? 'text-right' : 'text-left'}
                            />
                            <Input
                                label={translations.englishName[language]}
                                value={formData.name.eng}
                                onChange={(e) => handleInputChange('name.eng', e.target.value)}
                                isRequired
                                dir="ltr"
                                className="text-left"
                            />
                        </div>

                        {/* Band checkbox */}
                        <div className={language === 'heb' ? 'text-right' : 'text-left'}>
                            <Checkbox
                                isSelected={formData.isBand}
                                onValueChange={(checked) => handleInputChange('isBand', checked)}
                                dir={language === 'heb' ? 'rtl' : 'ltr'}
                            >
                                {translations.isBand[language]}
                            </Checkbox>
                        </div>

                        {/* Birth Year / Year Range */}
                        {!formData.isBand ? (
                            <Input
                                label={translations.birthYear[language]}
                                type="number"
                                value={formData.birthYear}
                                onChange={(e) => handleInputChange('birthYear', e.target.value)}
                                isRequired
                                dir={language === 'heb' ? 'rtl' : 'ltr'}
                                className={language === 'heb' ? 'text-right' : 'text-left'}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label={translations.youngestMember[language]}
                                    type="number"
                                    value={formData.yearRange.first}
                                    onChange={(e) => handleInputChange('yearRange.first', e.target.value)}
                                    isRequired
                                    dir={language === 'heb' ? 'rtl' : 'ltr'}
                                    className={language === 'heb' ? 'text-right' : 'text-left'}
                                />
                                <Input
                                    label={translations.oldestMember[language]}
                                    type="number"
                                    value={formData.yearRange.last}
                                    onChange={(e) => handleInputChange('yearRange.last', e.target.value)}
                                    isRequired
                                    dir={language === 'heb' ? 'rtl' : 'ltr'}
                                    className={language === 'heb' ? 'text-right' : 'text-left'}
                                />
                            </div>
                        )}

                        {/* Locations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={translations.hebrewLocation[language]}
                                value={formData.location.heb}
                                onChange={(e) => handleInputChange('location.heb', e.target.value)}
                                isRequired
                                dir={language === 'heb' ? 'rtl' : 'ltr'}
                                className={language === 'heb' ? 'text-right' : 'text-left'}
                            />
                            <Input
                                label={translations.englishLocation[language]}
                                value={formData.location.eng}
                                onChange={(e) => handleInputChange('location.eng', e.target.value)}
                                isRequired
                                dir="ltr"
                                className="text-left"
                            />
                        </div>

                        {/* Area */}
                        <Select
                            label={translations.area[language]}
                            selectedKeys={formData.area ? [formData.area] : []}
                            onSelectionChange={(keys) => handleInputChange('area', Array.from(keys)[0])}
                            dir={language === 'heb' ? 'rtl' : 'ltr'}
                            className={language === 'heb' ? 'text-right' : 'text-left'}
                        >
                            {areas.map((area) => (
                                <SelectItem key={area._id} value={area._id}>
                                    {area.name}
                                </SelectItem>
                            ))}
                        </Select>

                        {/* Born Elsewhere */}
                        <div className={`space-y-4 ${language === 'heb' ? 'text-right' : 'text-left'}`}>
                            <Checkbox
                                isSelected={bornElsewhereChecked}
                                onValueChange={(checked) => {
                                    if (!formData.isBand) {
                                        setBornElsewhereChecked(checked);
                                        if (!checked) {
                                            handleInputChange('bornElsewhere', { eng: '', heb: '' });
                                            handleInputChange('gender', '');
                                        }
                                    }
                                }}
                                dir={language === 'heb' ? 'rtl' : 'ltr'}
                                disabled={formData.isBand}
                            >
                                {translations.bornElsewhere[language]}
                            </Checkbox>
                            {bornElsewhereChecked && !formData.isBand && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label={`${translations.bornElsewhereText[language]} (עברית)`}
                                            value={formData.bornElsewhere.heb}
                                            onChange={(e) => handleInputChange('bornElsewhere.heb', e.target.value)}
                                            dir="rtl"
                                            className="text-right"
                                            disabled={formData.isBand}
                                        />
                                        <Input
                                            label={`${translations.bornElsewhereText[language]} (English)`}
                                            value={formData.bornElsewhere.eng}
                                            onChange={(e) => handleInputChange('bornElsewhere.eng', e.target.value)}
                                            dir="ltr"
                                            className="text-left"
                                            disabled={formData.isBand}
                                        />
                                    </div>
                                    <RadioGroup
                                        label={translations.gender[language]}
                                        value={formData.gender}
                                        onValueChange={(value) => handleInputChange('gender', value)}
                                        orientation="horizontal"
                                        isRequired
                                        dir={language === 'heb' ? 'rtl' : 'ltr'}
                                        disabled={formData.isBand}
                                    >
                                        <Radio value="m">{translations.male[language]}</Radio>
                                        <Radio value="f">{translations.female[language]}</Radio>
                                    </RadioGroup>
                                </>
                            )}
                        </div>

                        {/* Image URL */}
                        <Input
                            label={translations.imageUrl[language]}
                            value={formData.image.url}
                            onChange={(e) => handleInputChange('image.url', e.target.value)}
                            isRequired
                            dir="ltr"
                            className="text-left"
                        />

                        {/* Summaries */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Textarea
                                label={translations.hebrewSummary[language]}
                                value={formData.summary.heb}
                                onChange={(e) => handleInputChange('summary.heb', e.target.value)}
                                minRows={3}
                                dir="rtl"
                                className="text-right"
                            />
                            <Textarea
                                label={translations.englishSummary[language]}
                                value={formData.summary.eng}
                                onChange={(e) => handleInputChange('summary.eng', e.target.value)}
                                minRows={3}
                                dir="ltr"
                                className="text-left"
                            />
                        </div>

                        {/* Wikipedia URLs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={translations.hebrewWikipedia[language]}
                                value={formData.wiki.heb}
                                onChange={(e) => handleInputChange('wiki.heb', e.target.value)}
                                dir="ltr"
                                className="text-left"
                            />
                            <Input
                                label={translations.englishWikipedia[language]}
                                value={formData.wiki.eng}
                                onChange={(e) => handleInputChange('wiki.eng', e.target.value)}
                                dir="ltr"
                                className="text-left"
                            />
                        </div>

                        {/* Spotify ID and Rating */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={translations.spotifyId[language]}
                                value={formData.spotifyId}
                                onChange={(e) => handleInputChange('spotifyId', e.target.value)}
                                isRequired
                                dir="ltr"
                                className="text-left"
                            />
                            <Select
                                label={translations.rating[language]}
                                selectedKeys={[formData.rate.toString()]}
                                onSelectionChange={(keys) => handleInputChange('rate', parseInt(Array.from(keys)[0]))}
                                dir={language === 'heb' ? 'rtl' : 'ltr'}
                                className={language === 'heb' ? 'text-right' : 'text-left'}
                            >
                                <SelectItem key="1" value="1">1</SelectItem>
                                <SelectItem key="2" value="2">2</SelectItem>
                                <SelectItem key="3" value="3">3</SelectItem>
                                <SelectItem key="4" value="4">4</SelectItem>
                            </Select>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className={language === 'heb' ? 'justify-end' : 'justify-start'}>
                    <Button variant="bordered" onPress={handleClose}>
                        {translations.cancel[language]}
                    </Button>
                    <Button color="primary" onPress={handleSubmit} isLoading={loading}>
                        {translations.update[language]}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UpdateArtistModal; 