import React, { useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input
} from "@heroui/react";
import { useLanguage } from '../context/languageContext';
import { addToast } from "@heroui/react";

const DeleteUserModal = ({ user, isOpen, onClose, onSuccess }) => {
    const { language } = useLanguage();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!password.trim()) {
            addToast({
                description: language === 'heb' ? 'נדרשת סיסמה לאישור' : 'Password is required for confirmation',
                color: "danger",
                timeout: 3000
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/users/${user._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                addToast({
                    description: language === 'heb' ? 'המשתמש נמחק בהצלחה' : 'User deleted successfully',
                    color: "success",
                    timeout: 3000
                });
                onSuccess();
            } else {
                const error = await response.json();
                addToast({
                    description: error.message || (language === 'heb' ? 'שגיאה במחיקת המשתמש' : 'Error deleting user'),
                    color: "danger",
                    timeout: 3000
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            addToast({
                description: language === 'heb' ? 'שגיאה במחיקת המשתמש' : 'Error deleting user',
                color: "danger",
                timeout: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        onClose();
    };

    const translations = {
        deleteUser: { heb: 'מחק משתמש', eng: 'Delete User' },
        confirmDelete: { heb: 'האם אתה בטוח שברצונך למחוק את המשתמש', eng: 'Are you sure you want to delete the user' },
        passwordRequired: { heb: 'נדרשת סיסמה לאישור המחיקה', eng: 'Password is required to confirm deletion' },
        password: { heb: 'סיסמה', eng: 'Password' },
        cancel: { heb: 'ביטול', eng: 'Cancel' },
        delete: { heb: 'מחק', eng: 'Delete' }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>
                <ModalHeader style={{ textAlign: language === 'heb' ? 'right' : 'left' }}>
                    {translations.deleteUser[language]}
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4" style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>
                        <div className="text-base" style={{ textAlign: language === 'heb' ? 'right' : 'left' }}>
                            {translations.confirmDelete[language]} <strong>{user?.username}</strong>?
                        </div>
                        <div className="text-sm text-gray-600" style={{ textAlign: language === 'heb' ? 'right' : 'left' }}>
                            {translations.passwordRequired[language]}
                        </div>
                        <Input
                            type="password"
                            placeholder={translations.password[language]}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleDelete();
                                }
                            }}
                            style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}
                        />
                    </div>
                </ModalBody>
                <ModalFooter style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>
                    <Button variant="bordered" onPress={handleClose}>
                        {translations.cancel[language]}
                    </Button>
                    <Button color="danger" onPress={handleDelete} isLoading={loading}>
                        {translations.delete[language]}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DeleteUserModal; 