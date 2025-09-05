import { doc, getDoc, setDoc } from 'firebase/firestore';

export const loadTrackerData = async (db, userId, appId) => {
    try {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/dsa_tracker_progress`, userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().plan;
        } else {
            console.log("No existing progress found. A new document will be created on first save.");
            return null;
        }
    } catch (e) {
        console.error("Error loading document:", e);
        return null;
    }
};

export const saveTrackerData = async (db, userId, appId, updatedPlan) => {
    if (!db || !userId) {
        console.error("Firebase not initialized or user not authenticated. Skipping data save.");
        return;
    }
    try {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/dsa_tracker_progress`, userId);
        await setDoc(docRef, { plan: updatedPlan });
        console.log("Progress saved.");
    } catch (e) {
        console.error("Error saving document:", e);
    }
};
