import React, { createContext, useContext, useState, useEffect } from 'react';
import { addToast } from "@heroui/react";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if there's a token in localStorage on initial load
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorMessage = 'Login failed';

                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    errorMessage = error.message || 'Login failed';
                } else {
                    const text = await response.text();
                    errorMessage = text || 'Login failed';
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Show success toast
            addToast({
                description: "Successfully logged in!",
                color: "success",
                timeout: 3000
            });

            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log('Attempting registration with:', userData);
            const response = await fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('Registration response status:', response.status);
            const contentType = response.headers.get('content-type');
            console.log('Response content type:', contentType);

            if (!response.ok) {
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    throw new Error(error.message || 'Registration failed');
                } else {
                    const text = await response.text();
                    throw new Error(text || 'Registration failed');
                }
            }

            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { message: text };
            }

            console.log('Registration successful:', data);

            // Automatically log in the user after successful registration
            try {
                await login(userData.email, userData.password);
                console.log('Auto-login successful after registration');
            } catch (loginError) {
                console.error('Auto-login failed after registration:', loginError);
                // Don't throw the error - registration was successful even if auto-login failed
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Show success toast
        addToast({
            description: "Successfully logged out!",
            color: "success",
            timeout: 3000
        });
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 