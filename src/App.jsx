import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import Tracker from './Tracker';
import Auth from './Auth';

// Global Firebase and App State
let db, auth;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
let firebaseInitialized = false;

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

function initFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        setLogLevel('Debug');
        firebaseInitialized = true;
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initFirebase();
        if (!firebaseInitialized) {
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
            <div className="flex justify-center items-center min-h-screen bg-[#f8f7f4]">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="antialiased font-sans text-[#4a4a4a] min-h-screen">
            {user ? <Tracker user={user} db={db} appId={appId} /> : <Auth />}
        </div>
    );
}
