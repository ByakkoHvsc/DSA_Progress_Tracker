import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full text-center text-sm p-4 sm:p-6 lg:p-8 text-gray-500">
            <p className="mt-4">
                &copy; {new Date().getFullYear()} DSA Progress Tracker. All rights reserved. <br/>
                <a href="https://github.com/ByakkoHvsc/DSA_Progress_Tracker" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                    github.com/ByakkoHvsc
                </a>
            </p>
        </footer>
    );
}
