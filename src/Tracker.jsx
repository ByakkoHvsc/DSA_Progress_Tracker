// Tracker.jsx

import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { loadTrackerData, saveTrackerData } from './Firestore';
import { getAuth, signOut } from 'firebase/auth';
import Footer from './Footer';
import NotesModal from './NotesModal'; // Import the NotesModal

// Dummy data for the tracker plan
const dsaPlan = [
    { month: 1, week: 1, day: "1-2", topic: "Java Basics & OOP", hours: "2-3", concepts: ["Variables", "Loops", "Methods", "Classes", "Objects"], status: "todo", notes: "" }, // Added notes field
    { month: 1, week: 1, day: "3-4", topic: "Time & Space Complexity", hours: "2-3", concepts: ["Big O Notation", "Big Omega", "Big Theta"], status: "todo", notes: "" },
    { month: 1, week: 1, day: "5-7", topic: "Arrays", hours: "3-4", concepts: ["Array Operations", "2D Arrays", "Rotation", "Searching"], status: "todo", notes: "" },
    { month: 1, week: 2, day: "8-10", topic: "Two Pointers & Sliding Window", hours: "3-4", concepts: ["Two Pointers technique", "Sliding Window technique"], status: "todo", notes: "" },
    { month: 1, week: 2, day: "11-14", topic: "Strings", hours: "3-4", concepts: ["Palindromes", "Anagrams", "String Builders"], status: "todo", notes: "" },
    { month: 1, week: 3, day: "15-18", topic: "Linked Lists", hours: "3-4", concepts: ["Singly Linked List", "Doubly Linked List", "Circular Linked List"], status: "todo", notes: "" },
    { month: 1, week: 3, day: "19-21", topic: "Stacks", hours: "2-3", concepts: ["LIFO", "Parenthesis Matching"], status: "todo", notes: "" },
    { month: 1, week: 4, day: "22-24", topic: "Queues", hours: "2-3", concepts: ["FIFO", "Deque"], status: "todo", notes: "" },
    { month: 1, week: 4, day: "25-30", topic: "Practice & Revision", hours: "4-5", concepts: ["Mixed problems"], status: "todo", notes: "" },
    { month: 2, week: 5, day: "1-4", topic: "Trees", hours: "3-4", concepts: ["Tree Traversals (In-order, Pre-order, Post-order)"], status: "todo", notes: "" },
    { month: 2, week: 5, day: "5-8", topic: "Binary Search Trees (BST)", hours: "3-4", concepts: ["BST Properties", "Insertion", "Deletion", "Searching"], status: "todo", notes: "" },
    { month: 2, week: 6, day: "9-12", topic: "Heaps", hours: "3-4", concepts: ["Min-Heap", "Max-Heap", "Kth Smallest/Largest Element"], status: "todo", notes: "" },
    { month: 2, week: 6, day: "13-16", topic: "Graphs (Basics)", hours: "3-4", concepts: ["Adjacency Matrix", "Adjacency List"], status: "todo", notes: "" },
    { month: 2, week: 7, day: "17-20", topic: "Breadth-First Search (BFS)", hours: "4-5", concepts: ["Shortest Path", "Level-Order Traversal"], status: "todo", notes: "" },
    { month: 2, week: 7, day: "21-24", topic: "Depth-First Search (DFS)", hours: "4-5", concepts: ["Cycle Detection", "Connected Components"], status: "todo", notes: "" },
    { month: 2, week: 8, day: "25-30", topic: "Mixed Practice", hours: "4-5", concepts: ["Mixed problems"], status: "todo", notes: "" },
    { month: 3, week: 9, day: "1-4", topic: "Hashing & HashMaps", hours: "3-4", concepts: ["Frequency Counting", "Hashing Collisions"], status: "todo", notes: "" },
    { month: 3, week: 9, day: "5-8", topic: "Greedy Algorithms", hours: "3-4", concepts: ["Activity Selection", "Job Sequencing"], status: "todo", notes: "" },
    { month: 3, week: 10, day: "9-16", topic: "Dynamic Programming (DP)", hours: "4-5", concepts: ["Fibonacci", "Knapsack Problem", "Longest Common Subsequence"], status: "todo", notes: "" },
    { month: 3, week: 11, day: "17-21", topic: "Top Interview Questions", hours: "5-6", concepts: ["Company-specific problems"], status: "todo", notes: "" },
    { month: 3, week: 11, day: "22-25", topic: "Mock Interviews", hours: "5-6", concepts: ["Verbalizing thought process"], status: "todo", notes: "" },
    { month: 3, week: 12, day: "26-30", topic: "Final Revision", hours: "6+", concepts: ["Rework challenging problems"], status: "todo", notes: "" }
];

const statuses = {
    'todo': { text: 'To Do', class: 'bg-[#2b2b2b] text-gray-400 border border-gray-600' },
    'inprogress': { text: 'In Progress', class: 'bg-yellow-800 text-yellow-200 border border-yellow-700' },
    'done': { text: 'Done', class: 'bg-green-800 text-green-200 border border-green-700' }
};

const chartConfig = {
    type: 'bar',
    data: {
        labels: ['Fundamentals', 'Core DS (Lists/Stacks)', 'Trees & Heaps', 'Graphs', 'Advanced Algos', 'Interview Prep'],
        datasets: [{
            label: 'Approx. Hours',
            data: [16.5, 11.5, 10, 12.5, 11.5, 16.5],
            backgroundColor: [
                'rgba(139, 92, 246, 0.8)',
                'rgba(129, 140, 248, 0.8)',
                'rgba(96, 165, 250, 0.8)',
                'rgba(52, 211, 153, 0.8)',
                'rgba(251, 146, 60, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
                'rgba(139, 92, 246, 1)',
                'rgba(129, 140, 248, 1)',
                'rgba(96, 165, 250, 1)',
                'rgba(52, 211, 153, 1)',
                'rgba(251, 146, 60, 1)',
                'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Approximate Hours',
                    color: '#a0a0a0'
                },
                grid: { color: '#333' },
                ticks: { color: '#a0a0a0' }
            },
            x: {
                grid: { color: '#333' },
                ticks: { color: '#a0a0a0' }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (context) => ` ${context.dataset.label}: ${context.raw} hrs` } }
        }
    }
};

let link = "https://youtu.be/dQw4w9WgXcQ?feature=shared";

const resourceLinks = {
    "Java Basics & OOP": {
        "Study Notes": "https://www.geeksforgeeks.org/java/",
        "Practice Problems": "https://www.hackerrank.com/domains/java",
        "Video Tutorials": "https://youtu.be/pTB0EiLXUC8?si=WLVpSlD0MHDP87wo"
    },
    "Time & Space Complexity": {
        "Study Notes": "https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/",
        "Practice Problems": "https://www.geeksforgeeks.org/practice-questions-time-complexity/",
        "Video Tutorials": "https://youtu.be/PwKv8fOcriM?si=N2f0AnUM6aUVDiFE"
    },
    "Arrays": {
        "Study Notes": "https://www.geeksforgeeks.org/arrays-in-java/",
        "Practice Problems": "https://leetcode.com/tag/array/",
        "Video Tutorials": "https://youtu.be/NTHVTY6w2Co?si=9WjeV7suRr5N7rMp"
    },
    "Two Pointers & Sliding Window": {
        "Study Notes": "https://www.geeksforgeeks.org/two-pointers-technique/",
        "Practice Problems": "https://leetcode.com/tag/two-pointers/",
        "Video Tutorials": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    "Strings": {
        "Study Notes": "https://www.geeksfor geeks.org/strings-in-java/",
        "Practice Problems": "https://leetcode.com/tag/string/",
        "Video Tutorials": link
    },
    "Linked Lists": {
        "Study Notes": "https://www.geeksforgeeks.org/data-structures/linked-list/",
        "Practice Problems": "https://leetcode.com/tag/linked-list/",
        "Video Tutorials": link
    },
    "Stacks": {
        "Study Notes": "https://www.geeksforgeeks.org/stack-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/stack/",
        "Video Tutorials": link
    },
    "Queues": {
        "Study Notes": "https://www.geeksforgeeks.org/queue-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/queue/",
        "Video Tutorials": link
    },
    "Trees": {
        "Study Notes": "https://www.geeksforgeeks.org/tree-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/tree/",
        "Video Tutorials": link
    },
    "Binary Search Trees (BST)": {
        "Study Notes": "https://www.geeksforgeeks.org/binary-search-tree-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/binary-search-tree/",
        "Video Tutorials": link
    },
    "Heaps": {
        "Study Notes": "https://www.geeksforgeeks.org/heap-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/heap/",
        "Video Tutorials": link
    },
    "Graphs (Basics)": {
        "Study Notes": "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/",
        "Practice Problems": "https://leetcode.com/tag/graph/",
        "Video Tutorials": link
    },
    "Breadth-First Search (BFS)": {
        "Study Notes": "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/",
        "Practice Problems": "https://leetcode.com/tag/breadth-first-search/",
        "Video Tutorials": link
    },
    "Depth-First Search (DFS)": {
        "Study Notes": "https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/",
        "Practice Problems": "https://leetcode.com/tag/depth-first-search/",
        "Video Tutorials": link
    },
    "Hashing & HashMaps": {
        "Study Notes": "https://www.geeksforgeeks.org/hashing-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/hash-table/",
        "Video Tutorials": link
    },
    "Greedy Algorithms": {
        "Study Notes": "https://www.geeksforgeeks.org/greedy-algorithms/",
        "Practice Problems": "https://leetcode.com/tag/greedy/",
        "Video Tutorials": link
    },
    "Dynamic Programming (DP)": {
        "Study Notes": "https://www.geeksforgeeks.org/dynamic-programming/",
        "Practice Problems": "https://leetcode.com/tag/dynamic-programming/",
        "Video Tutorials": link
    },
    "Top Interview Questions": {
        "Study Notes": "https://www.geeksforgeeks.org/top-10-algorithms-for-coding-interviews/",
        "Practice Problems": "https://leetcode.com/problem-list/top-100-liked-questions/",
        "Video Tutorials": link
    },
    "Final Revision": {
        "Study Notes": "https://www.geeksforgeeks.org/how-to-prepare-for-placements-a-step-by-step-guide/",
        "Practice Problems": "https://www.interviewbit.com/coding-interview-questions/",
        "Video Tutorials": link
    },
    "Mock Interviews": {
        "Study Notes": "https://www.geeksforgeeks.org/how-to-prepare-for-technical-interview-for-beginners/",
        "Practice Problems": "https://www.interviewbit.com/mock-interviews/",
        "Video Tutorials": link
    },
};

const ChartComponent = () => {
    useEffect(() => {
        const ctx = document.getElementById('effortChart').getContext('2d');
        const chartInstance = new Chart(ctx, chartConfig);
        return () => { chartInstance.destroy(); };
    }, []);
    return <canvas id="effortChart"></canvas>;
};

export default function Tracker({ user, db, appId }) {
    const [plan, setPlan] = useState(dsaPlan);
    const [currentMonth, setCurrentMonth] = useState(1);
    const [loadingStatus, setLoadingStatus] = useState('Loading your progress...');
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false); // Renamed to avoid conflict
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');

    // New state for NotesModal
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [currentTopicForNotes, setCurrentTopicForNotes] = useState('');
    const [currentNotesContent, setCurrentNotesContent] = useState('');

    useEffect(() => {
        const initLoad = async () => {
            try {
                const loadedPlan = await loadTrackerData(db, user.uid, appId);
                if (loadedPlan) {
                    // Ensure loaded plan has 'notes' field for compatibility, initialize if missing
                    const sanitizedPlan = loadedPlan.map(item => ({ ...item, notes: item.notes || "" }));
                    setPlan(sanitizedPlan);
                    setLoadingStatus('Progress loaded.');
                } else {
                    setPlan(dsaPlan);
                    setLoadingStatus('New user. Creating new plan.');
                }
            } catch (error) {
                console.error("Failed to load tracker data:", error);
                setLoadingStatus('Failed to load progress. Using default plan.');
                setPlan(dsaPlan);
            }
        };
        if (user && db) {
            initLoad();
        }
    }, [user, db, appId]);

    const handleStatusChange = (index) => {
        const currentStatus = plan[index].status;
        let nextStatus;
        if (currentStatus === 'todo') nextStatus = 'inprogress';
        else if (currentStatus === 'inprogress') nextStatus = 'done';
        else nextStatus = 'todo';

        const updatedPlan = [...plan];
        updatedPlan[index].status = nextStatus;
        setPlan(updatedPlan);
        saveTrackerData(db, user.uid, appId, updatedPlan);
    };

    const handleResourceClick = (topic) => {
        setModalTitle(`Resources for ${topic}`);
        const links = resourceLinks[topic];
        if (links) {
            setModalContent(
                <div className="flex flex-col gap-4">
                    {Object.entries(links).map(([key, value]) => (
                        <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="py-3 px-6 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.01] text-center">
                            {key}
                        </a>
                    ))}
                </div>
            );
        } else {
            setModalContent(<p className="text-gray-400">No resources found for this topic.</p>);
        }
        setIsResourceModalOpen(true); // Changed to isResourceModalOpen
    };

    // Handler to open NotesModal
    const handleOpenNotesModal = (topic, notes) => {
        setCurrentTopicForNotes(topic);
        setCurrentNotesContent(notes);
        setIsNotesModalOpen(true);
    };

    // Handler to close NotesModal
    const handleCloseNotesModal = () => {
        setIsNotesModalOpen(false);
        setCurrentTopicForNotes('');
        setCurrentNotesContent('');
    };

    // Handler to save notes
    const handleSaveNotes = (newNotes) => {
        const updatedPlan = plan.map(item =>
            item.topic === currentTopicForNotes ? { ...item, notes: newNotes } : item
        );
        setPlan(updatedPlan);
        saveTrackerData(db, user.uid, appId, updatedPlan);
    };


    const filteredPlan = plan.filter(item => item.month === currentMonth);
    const weeks = [...new Set(filteredPlan.map(item => item.week))];
    const completedTopics = plan.filter(item => item.status === 'done').length;
    const inProgressTopics = plan.filter(item => item.status === 'inprogress').length;
    const totalTopics = plan.length;
    const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
    };

    return (
        <div className="antialiased font-sans bg-[#121212] text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8">
            <style>
                {`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .loader { border: 4px solid #333; border-top: 4px solid #a78bfa; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; }
                .month-button {
                    transition: all 0.3s ease-in-out;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06);
                    background-color: #1e1e1e;
                }
                .month-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -4px rgba(0,0,0,0.1);
                }
                .month-button.active {
                    background: linear-gradient(to right, #8a2be2, #5b17b2);
                    color: white;
                    transform: scale(1.05);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -4px rgba(0,0,0,0.1);
                }
                .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 100; }
                .modal-content { background-color: #1e1e1e; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 44px 6px -2px rgb(0 0 0 / 0.05); max-width: 90%; max-height: 90%; overflow-y: auto; position: relative; }
                `}
            </style>
            <div className="container mx-auto max-w-7xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600 mb-2">DSA Placement Tracker</h1>
                    <p className="text-lg text-gray-400">Your 3-Month Roadmap to Success</p>
                    <button onClick={handleSignOut} className="mt-4 px-4 py-2 rounded-full text-sm font-semibold bg-red-800 text-red-200 hover:bg-red-700 transition-colors shadow-md">Sign Out</button>
                    <p id="loading-status" className="mt-4 text-sm font-medium text-gray-500">{loadingStatus}</p>
                    <p className="mt-2 text-sm font-medium text-gray-500">User ID: {user.uid}</p>
                </header>
                <section id="dashboard" className="mb-8 p-6 bg-[#1e1e1e] rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-200 mb-4">Your Progress Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow-inner">
                            <p className="text-sm font-medium text-gray-400">Total Topics</p>
                            <p className="text-3xl font-bold text-violet-500">{totalTopics}</p>
                        </div>
                        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow-inner">
                            <p className="text-sm font-medium text-gray-400">Topics Completed</p>
                            <p className="text-3xl font-bold text-green-500">{completedTopics}</p>
                        </div>
                        <div className="bg-[#2a2a2a] p-4 rounded-xl shadow-inner">
                            <p className="text-sm font-medium text-gray-400">In Progress</p>
                            <p className="text-3xl font-bold text-yellow-500">{inProgressTopics}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="w-full bg-[#333] rounded-full h-4">
                            <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <p className="text-center mt-2 font-medium text-gray-400">{progressPercentage.toFixed(0)}% Complete</p>
                    </div>
                </section>
                <nav className="flex justify-center gap-2 sm:gap-4 mb-8">
                    <button onClick={() => setCurrentMonth(1)} className={`month-button text-sm sm:text-base font-semibold py-2 px-4 sm:px-6 rounded-full shadow-md ${currentMonth === 1 ? 'active' : ''}`}>Month 1</button>
                    <button onClick={() => setCurrentMonth(2)} className={`month-button text-sm sm:text-base font-semibold py-2 px-4 sm:px-6 rounded-full shadow-md ${currentMonth === 2 ? 'active' : ''}`}>Month 2</button>
                    <button onClick={() => setCurrentMonth(3)} className={`month-button text-sm sm:text-base font-semibold py-2 px-4 sm:px-6 rounded-full shadow-md ${currentMonth === 3 ? 'active' : ''}`}>Month 3</button>
                </nav>
                <main>
                    {weeks.map(weekNum => (
                        <div key={weekNum} className="mb-8">
                            <h3 className="text-xl font-bold text-gray-300 mb-4 pl-2 border-l-4 border-violet-500">Week {weekNum}</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredPlan.filter(item => item.week === weekNum).map((item, index) => {
                                    const globalIndex = plan.findIndex(p => p === item);
                                    return (
                                        <div key={globalIndex} className="bg-[#1e1e1e] p-5 rounded-xl shadow-lg flex flex-col justify-between border border-gray-700">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-xs font-semibold text-violet-300 bg-violet-900 px-2 py-1 rounded-full">Days {item.day}</p>
                                                    <p className="text-xs font-semibold text-gray-400">{item.hours} hrs</p>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-100">{item.topic}</h4>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {item.concepts.map(concept => (
                                                        <span key={concept} className="text-xs font-semibold text-gray-400 bg-gray-800 px-2 py-1 rounded-full">{concept}</span>
                                                    ))}
                                                </div>
                                                <div className="flex flex-col gap-2 mt-4">
                                                    <button onClick={() => handleResourceClick(item.topic)} className="w-full py-2 px-4 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-colors shadow-md mb-2">
                                                        ✨ View Resources
                                                    </button>
                                                    {/* New button to open NotesModal */}
                                                    <button onClick={() => handleOpenNotesModal(item.topic, item.notes)} className="w-full py-2 px-4 rounded-lg font-semibold text-sm text-white bg-gray-700 hover:bg-gray-600 transition-colors shadow-md">
                                                        📝 View/Edit Notes
                                                    </button>
                                                </div>
                                            </div>
                                            <button onClick={() => handleStatusChange(globalIndex)} className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold text-sm ${statuses[item.status].class} transition-colors shadow-md`}>
                                                {statuses[item.status].text}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </main>
                <section className="mt-12 p-6 bg-[#1e1e1e] rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-200 mb-1 text-center">Effort Distribution</h2>
                    <p className="text-center text-gray-400 mb-6">This chart visualizes the approximate time commitment for major topic categories in your 3-month plan.</p>
                    <div className="chart-container">
                        <ChartComponent />
                    </div>
                </section>
                <Footer />
            </div>
            {isResourceModalOpen && ( // Changed to isResourceModalOpen
                <div className="modal" onClick={() => setIsResourceModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-200">{modalTitle}</h3>
                            <button onClick={() => setIsResourceModalOpen(false)} className="text-gray-500 hover:text-gray-200 text-2xl leading-none font-semibold">&times;</button>
                        </div>
                        <div>{modalContent}</div>
                    </div>
                </div>
            )}

            {/* Render NotesModal conditionally */}
            {isNotesModalOpen && (
                <NotesModal
                    topic={currentTopicForNotes}
                    onClose={handleCloseNotesModal}
                    onSave={handleSaveNotes}
                    savedNotes={currentNotesContent}
                />
            )}
        </div>
    );
}