import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { loadTrackerData, saveTrackerData } from './Firestore';
import { getAuth, signOut } from 'firebase/auth';

// Dummy data for the tracker plan
const dsaPlan = [
    { month: 1, week: 1, day: "1-2", topic: "Java Basics & OOP", hours: "2-3", concepts: ["Variables", "Loops", "Methods", "Classes", "Objects"], status: "todo" },
    { month: 1, week: 1, day: "3-4", topic: "Time & Space Complexity", hours: "2-3", concepts: ["Big O Notation", "Big Omega", "Big Theta"], status: "todo" },
    { month: 1, week: 1, day: "5-7", topic: "Arrays", hours: "3-4", concepts: ["Array Operations", "2D Arrays", "Rotation", "Searching"], status: "todo" },
    { month: 1, week: 2, day: "8-10", topic: "Two Pointers & Sliding Window", hours: "3-4", concepts: ["Two Pointers technique", "Sliding Window technique"], status: "todo" },
    { month: 1, week: 2, day: "11-14", topic: "Strings", hours: "3-4", concepts: ["Palindromes", "Anagrams", "String Builders"], status: "todo" },
    { month: 1, week: 3, day: "15-18", topic: "Linked Lists", hours: "3-4", concepts: ["Singly Linked List", "Doubly Linked List", "Circular Linked List"], status: "todo" },
    { month: 1, week: 3, day: "19-21", topic: "Stacks", hours: "2-3", concepts: ["LIFO", "Parenthesis Matching"], status: "todo" },
    { month: 1, week: 4, day: "22-24", topic: "Queues", hours: "2-3", concepts: ["FIFO", "Deque"], status: "todo" },
    { month: 1, week: 4, day: "25-30", topic: "Practice & Revision", hours: "4-5", concepts: ["Mixed problems"], status: "todo" },
    { month: 2, week: 5, day: "1-4", topic: "Trees", hours: "3-4", concepts: ["Tree Traversals (In-order, Pre-order, Post-order)"], status: "todo" },
    { month: 2, week: 5, day: "5-8", topic: "Binary Search Trees (BST)", hours: "3-4", concepts: ["BST Properties", "Insertion", "Deletion", "Searching"], status: "todo" },
    { month: 2, week: 6, day: "9-12", topic: "Heaps", hours: "3-4", concepts: ["Min-Heap", "Max-Heap", "Kth Smallest/Largest Element"], status: "todo" },
    { month: 2, week: 6, day: "13-16", topic: "Graphs (Basics)", hours: "3-4", concepts: ["Adjacency Matrix", "Adjacency List"], status: "todo" },
    { month: 2, week: 7, day: "17-20", topic: "Breadth-First Search (BFS)", hours: "4-5", concepts: ["Shortest Path", "Level-Order Traversal"], status: "todo" },
    { month: 2, week: 7, day: "21-24", topic: "Depth-First Search (DFS)", hours: "4-5", concepts: ["Cycle Detection", "Connected Components"], status: "todo" },
    { month: 2, week: 8, day: "25-30", topic: "Mixed Practice", hours: "4-5", concepts: ["Mixed problems"], status: "todo" },
    { month: 3, week: 9, day: "1-4", topic: "Hashing & HashMaps", hours: "3-4", concepts: ["Frequency Counting", "Hashing Collisions"], status: "todo" },
    { month: 3, week: 9, day: "5-8", topic: "Greedy Algorithms", hours: "3-4", concepts: ["Activity Selection", "Job Sequencing"], status: "todo" },
    { month: 3, week: 10, day: "9-16", topic: "Dynamic Programming (DP)", hours: "4-5", concepts: ["Fibonacci", "Knapsack Problem", "Longest Common Subsequence"], status: "todo" },
    { month: 3, week: 11, day: "17-21", topic: "Top Interview Questions", hours: "5-6", concepts: ["Company-specific problems"], status: "todo" },
    { month: 3, week: 11, day: "22-25", topic: "Mock Interviews", hours: "5-6", concepts: ["Verbalizing thought process"], status: "todo" },
    { month: 3, week: 12, day: "26-30", topic: "Final Revision", hours: "6+", concepts: ["Rework challenging problems"], status: "todo" }
];

const statuses = {
    'todo': { text: 'To Do', class: 'bg-gray-200 text-gray-600 border-gray-300' },
    'inprogress': { text: 'In Progress', class: 'bg-yellow-100 text-yellow-800 border-yellow-400' },
    'done': { text: 'Done', class: 'bg-green-100 text-green-800 border-green-400' }
};

const chartConfig = {
    type: 'bar',
    data: {
        labels: ['Fundamentals', 'Core DS (Lists/Stacks)', 'Trees & Heaps', 'Graphs', 'Advanced Algos', 'Interview Prep'],
        datasets: [{
            label: 'Approx. Hours',
            data: [16.5, 11.5, 10, 12.5, 11.5, 16.5],
            backgroundColor: [
                'rgba(139, 92, 246, 0.6)',
                'rgba(129, 140, 248, 0.6)',
                'rgba(96, 165, 250, 0.6)',
                'rgba(52, 211, 153, 0.6)',
                'rgba(251, 146, 60, 0.6)',
                'rgba(239, 68, 68, 0.6)'
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
                    text: 'Approximate Hours'
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (context) => ` ${context.dataset.label}: ${context.raw} hrs` } }
        }
    }
};

let link = "https://youtu.be/dQw4w9WgXcQ?feature=shared"

const resourceLinks = {
    "Java Basics & OOP": {
        "Study Notes": "https://www.geeksforgeeks.org/java/",
        "Practice Problems": "https://www.hackerrank.com/domains/java",
        "Video Tutorials": "https://www.youtube.com/watch?v=UqN7pn-uD3g"
    },
    "Time & Space Complexity": {
        "Study Notes": "https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/",
        "Practice Problems": "https://www.geeksforgeeks.org/practice-questions-time-complexity/",
        "Video Tutorials": "https://www.youtube.com/watch?v=V6mK-q4s-O4"
    },
    "Arrays": {
        "Study Notes": "https://www.geeksforgeeks.org/arrays-in-java/",
        "Practice Problems": "https://leetcode.com/tag/array/",
        "Video Tutorials": "https://www.youtube.com/watch?v=meq8w-q3tHw"
    },
    "Two Pointers & Sliding Window": {
        "Study Notes": "https://www.geeksforgeeks.org/two-pointers-technique/",
        "Practice Problems": "https://leetcode.com/tag/two-pointers/",
        "Video Tutorials": "https://www.youtube.com/watch?v=F_fW7B01sWc"
    },
    "Strings": {
        "Study Notes": "https://www.geeksfor geeks.org/strings-in-java/",
        "Practice Problems": "https://leetcode.com/tag/string/",
        "Video Tutorials": "https://www.youtube.com/watch?v=L2G3K11xK64"
    },
    "Linked Lists": {
        "Study Notes": "https://www.geeksforgeeks.org/data-structures/linked-list/",
        "Practice Problems": "https://leetcode.com/tag/linked-list/",
        "Video Tutorials": "https://www.youtube.com/watch?v=YpG1x0s-d0A"
    },
    "Stacks": {
        "Study Notes": "https://www.geeksforgeeks.org/stack-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/stack/",
        "Video Tutorials": "https://www.youtube.com/watch?v=r_C8t9W2gR4"
    },
    "Queues": {
        "Study Notes": "https://www.geeksforgeeks.org/queue-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/queue/",
        "Video Tutorials": "https://www.youtube.com/watch?v=okr-XE8yTOg"
    },
    "Trees": {
        "Study Notes": "https://www.geeksforgeeks.org/tree-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/tree/",
        "Video Tutorials": "https://www.youtube.com/watch?v=H7Kk2y-3Uqg"
    },
    "Binary Search Trees (BST)": {
        "Study Notes": "https://www.geeksforgeeks.org/binary-search-tree-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/binary-search-tree/",
        "Video Tutorials": "https://www.youtube.com/watch?v=Kz6Mfwq-c3Q"
    },
    "Heaps": {
        "Study Notes": "https://www.geeksforgeeks.org/heap-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/heap/",
        "Video Tutorials": "https://www.youtube.com/watch?v=t0Cq6tV-s-c"
    },
    "Graphs (Basics)": {
        "Study Notes": "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/",
        "Practice Problems": "https://leetcode.com/tag/graph/",
        "Video Tutorials": "https://www.youtube.com/watch?v=eP-aYw_6i7c"
    },
    "Breadth-First Search (BFS)": {
        "Study Notes": "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/",
        "Practice Problems": "https://leetcode.com/tag/breadth-first-search/",
        "Video Tutorials": "https://www.youtube.com/watch?v=oDqjPvD54Ss"
    },
    "Depth-First Search (DFS)": {
        "Study Notes": "https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/",
        "Practice Problems": "https://leetcode.com/tag/depth-first-search/",
        "Video Tutorials": "https://www.youtube.com/watch?v=7f-v9X_G65A"
    },
    "Hashing & HashMaps": {
        "Study Notes": "https://www.geeksforgeeks.org/hashing-data-structure/",
        "Practice Problems": "https://leetcode.com/tag/hash-table/",
        "Video Tutorials": "https://www.youtube.com/watch?v=7J3_23g_0I4"
    },
    "Greedy Algorithms": {
        "Study Notes": "https://www.geeksforgeeks.org/greedy-algorithms/",
        "Practice Problems": "https://leetcode.com/tag/greedy/",
        "Video Tutorials": "https://www.youtube.com/watch?v=F_fW7B01sWc"
    },
    "Dynamic Programming (DP)": {
        "Study Notes": "https://www.geeksforgeeks.org/dynamic-programming/",
        "Practice Problems": "https://leetcode.com/tag/dynamic-programming/",
        "Video Tutorials": "https://www.youtube.com/watch?v=oV0c-d4e5zM"
    },
    "Top Interview Questions": {
        "Study Notes": "https://www.geeksforgeeks.org/top-10-algorithms-for-coding-interviews/",
        "Practice Problems": "https://leetcode.com/problem-list/top-100-liked-questions/",
        "Video Tutorials": "https://www.youtube.com/watch?v=meq8w-q3tHw"
    },
    "Final Revision": {
        "Study Notes": "https://www.geeksforgeeks.org/how-to-prepare-for-placements-a-step-by-step-guide/",
        "Practice Problems": "https://www.interviewbit.com/coding-interview-questions/",
        "Video Tutorials": "https://www.youtube.com/watch?v=eP-aYw_6i7c"
    },
    "Mock Interviews": {
        "Study Notes": "https://www.geeksforgeeks.org/how-to-prepare-for-technical-interview-for-beginners/",
        "Practice Problems": "https://www.interviewbit.com/mock-interviews/",
        "Video Tutorials": "https://www.youtube.com/watch?v=2u7wN2n4u6E"
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');

    useEffect(() => {
        const initLoad = async () => {
            const loadedPlan = await loadTrackerData(db, user.uid, appId);
            if (loadedPlan) {
                setPlan(loadedPlan);
                setLoadingStatus('Progress loaded.');
            } else {
                setPlan(dsaPlan);
                setLoadingStatus('New user. Creating new plan.');
            }
        };
        initLoad();
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
                        <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="py-3 px-6 rounded-lg font-semibold text-white bg-violet-500 hover:bg-violet-600 transition-colors text-center">
                            {key}
                        </a>
                    ))}
                </div>
            );
        } else {
            setModalContent(<p>No resources found for this topic.</p>);
        }
        setIsModalOpen(true);
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
        <div className="antialiased font-sans bg-[#f8f7f4] text-[#4a4a4a] min-h-screen p-4 sm:p-6 lg:p-8">
            <style>
                {`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .loader { border: 4px solid #f3f3f3; border-top: 4px solid #a78bfa; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; }
                .month-button.active { background-color: #a78bfa; color: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
                .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }
                .modal-content { background-color: #fff; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05); max-width: 90%; max-height: 90%; overflow-y: auto; position: relative; }
                `}
            </style>
            <div className="container mx-auto max-w-7xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-violet-800 mb-2">DSA Placement Tracker</h1>
                    <p className="text-lg text-gray-600">Your 3-Month Roadmap to Success</p>
                    <button onClick={handleSignOut} className="mt-4 px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors">Sign Out</button>
                    <p id="loading-status" className="mt-4 text-sm font-medium text-gray-500">{loadingStatus}</p>
                    <p className="mt-2 text-sm font-medium text-gray-500">User ID: {user.uid}</p>
                </header>
                <section id="dashboard" className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Progress Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-violet-100 p-4 rounded-xl">
                            <p className="text-sm font-medium text-violet-700">Total Topics</p>
                            <p className="text-3xl font-bold text-violet-900">{totalTopics}</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-xl">
                            <p className="text-sm font-medium text-green-700">Topics Completed</p>
                            <p className="text-3xl font-bold text-green-900">{completedTopics}</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded-xl">
                            <p className="text-sm font-medium text-yellow-700">In Progress</p>
                            <p className="text-3xl font-bold text-yellow-900">{inProgressTopics}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <p className="text-center mt-2 font-medium text-gray-600">{progressPercentage.toFixed(0)}% Complete</p>
                    </div>
                </section>
                <nav className="flex justify-center gap-2 sm:gap-4 mb-8">
                    <button onClick={() => setCurrentMonth(1)} className={`month-button text-sm sm:text-base font-semibold py-2 px-4 sm:px-6 rounded-full bg-white shadow-md ${currentMonth === 1 ? 'active' : ''}`}>Month 1</button>
                    <button onClick={() => setCurrentMonth(2)} className={`month-button text-sm sm:text-base font-semibold py-2 px-4 sm:px-6 rounded-full bg-white shadow-md ${currentMonth === 2 ? 'active' : ''}`}>Month 2</button>
                    <button onClick={() => setCurrentMonth(3)} className={`month-button text-sm sm:text-base font-semibold py-2 px-4 sm:px-6 rounded-full bg-white shadow-md ${currentMonth === 3 ? 'active' : ''}`}>Month 3</button>
                </nav>
                <main>
                    {weeks.map(weekNum => (
                        <div key={weekNum} className="mb-8">
                            <h3 className="text-xl font-bold text-gray-700 mb-4 pl-2 border-l-4 border-violet-500">Week {weekNum}</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredPlan.filter(item => item.week === weekNum).map((item, index) => {
                                    const globalIndex = plan.findIndex(p => p === item);
                                    return (
                                        <div key={globalIndex} className="bg-white p-5 rounded-xl shadow-lg flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">Days {item.day}</p>
                                                    <p className="text-xs font-semibold text-gray-500">{item.hours} hrs</p>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-800">{item.topic}</h4>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {item.concepts.map(concept => (
                                                        <span key={concept} onClick={() => handleResourceClick(item.topic)} className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-300 transition-colors">{concept}</span>
                                                    ))}
                                                </div>
                                                <div className="flex flex-col gap-2 mt-4">
                                                    <button onClick={() => handleResourceClick(item.topic)} className="w-full py-2 px-4 rounded-lg font-semibold text-sm text-white bg-violet-500 hover:bg-violet-600 transition-colors">
                                                        ✨ View Resources
                                                    </button>
                                                </div>
                                            </div>
                                            <button onClick={() => handleStatusChange(globalIndex)} className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold text-sm ${statuses[item.status].class}`}>
                                                {statuses[item.status].text}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </main>
                <section className="mt-12 p-6 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">Effort Distribution</h2>
                    <p className="text-center text-gray-600 mb-6">This chart visualizes the approximate time commitment for major topic categories in your 3-month plan, helping you anticipate and manage your study efforts effectively.</p>
                    <div className="chart-container">
                        <ChartComponent />
                    </div>
                </section>
            </div>
            {isModalOpen && (
                <div className="modal" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{modalTitle}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl leading-none font-semibold">&times;</button>
                        </div>
                        <div>{modalContent}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
