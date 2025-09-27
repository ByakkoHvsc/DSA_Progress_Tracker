import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';
import Tracker from './Tracker';
import Auth from './Auth';
import PasswordReset from './PasswordReset';
import Footer from './Footer';

// Firebase and App State Initialization (Top-level)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    setLogLevel('Debug');
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'resetPassword') {
            setIsResettingPassword(true);
            setLoading(false);
            return;
        }

        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#121212]">
                <div className="loader"></div>
            </div>
        );
    }

    if (isResettingPassword) {
        return <PasswordReset auth={auth} />;
    }

    return (
        <div className="antialiased font-sans text-gray-200 min-h-screen flex flex-col justify-between">
            <Helmet>
                <title>DSA Placement Tracker - Your 3-Month Roadmap</title>
                <meta name="description" content="Track your Data Structures and Algorithms progress with a personalized 3-month roadmap. Prepare for off-campus placements with a day-wise plan and curated resources." />
                <link rel="canonical" href="https://dsatrackerhvsc.netlify.app/" />
                <meta property="og:title" content="DSA Placement Tracker" />
                <meta property="og:description" content="A 3-month roadmap to success for off-campus placements. Track your progress with a day-wise plan and curated resources." />
                <meta property="og:url" content="https://dsatrackerhvsc.netlify.app/" />
                <meta property="og:type" content="website" />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content="DSA Placement Tracker" />
                <meta property="twitter:description" content="A 3-month roadmap to success for off-campus placements. Track your progress with a day-wise plan and curated resources." />
            </Helmet>
            {user ? <Tracker user={user} db={db} appId={appId} /> : <Auth auth={auth} />}
        </div>
    );
}
