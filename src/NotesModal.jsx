import React, { useState, useEffect } from 'react';

export default function NotesModal({ topic, onClose, onSave, savedNotes }) {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (savedNotes) {
            setNotes(savedNotes);
        }
    }, [savedNotes]);

    const handleSave = () => {
        onSave(notes);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
            <div className="w-full max-w-2xl bg-[#1e1e1e] p-6 rounded-2xl shadow-xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-100">Notes for {topic}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <textarea
                    className="w-full h-64 p-4 rounded-lg bg-[#2b2b2b] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                    placeholder="Write your notes here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <div className="mt-4 text-right">
                    <button onClick={handleSave} className="py-2 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.01] shadow-lg">
                        Save Notes
                    </button>
                </div>
            </div>
        </div>
    );
}
