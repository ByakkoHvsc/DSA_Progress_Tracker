import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export default function NotesModal({ topic, onClose, onSave, savedNotes }) {
    const [notes, setNotes] = useState('');
    const [saveStatus, setSaveStatus] = useState('Saved');
    const textareaRef = useRef(null);
    const saveTimeout = useRef(null);

    useEffect(() => {
        setNotes(savedNotes || '');
        setSaveStatus('Saved');
    }, [savedNotes]);

    useEffect(() => {
        if (saveStatus !== 'Unsaved') return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
            setSaveStatus('Saving...');
            onSave(notes);
            setTimeout(() => setSaveStatus('Saved'), 500);
        }, 1000);

        return () => clearTimeout(saveTimeout.current);
    }, [notes, saveStatus, onSave]);

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        if (saveStatus !== 'Unsaved') setSaveStatus('Unsaved');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const { selectionStart, selectionEnd } = e.currentTarget;
            
            const newNotes = notes.substring(0, selectionStart) + '  ' + notes.substring(selectionEnd);
            
            setNotes(newNotes);
            setSaveStatus('Unsaved');

            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 2;
                }
            }, 0);
        }
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear all notes for this topic?")) {
            setNotes('');
            onSave('');
            setSaveStatus('Saved');
        }
    };

    const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;

    const getStatusIndicator = () => {
        switch (saveStatus) {
            case 'Saved':
                return <span className="text-green-400">All changes saved</span>;
            case 'Saving...':
                return <span className="text-yellow-400">Saving...</span>;
            case 'Unsaved':
                return <span className="text-gray-400">Unsaved changes</span>;
            default:
                return null;
        }
    };

    const applyFormatting = (before, after = '') => {
        const textarea = textareaRef.current;
        const { selectionStart, selectionEnd } = textarea;
        const selectedText = notes.slice(selectionStart, selectionEnd);
        const newText =
            notes.slice(0, selectionStart) +
            before + selectedText + after +
            notes.slice(selectionEnd);
        setNotes(newText);
        setSaveStatus('Unsaved');

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(selectionStart + before.length, selectionEnd + before.length);
        }, 0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-4xl h-[80vh] bg-[#1e1e1e] p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-100">
                        Notes for <span className="text-violet-400">{topic}</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Editor & Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-0 overflow-hidden">
                    {/* Editor */}
                    <div className="flex flex-col h-full min-h-0 overflow-hidden">
                        <label className="text-sm font-semibold text-gray-300 mb-2">Markdown Editor</label>

                        <div className="flex flex-wrap gap-1 mb-2">
                            <button onClick={() => applyFormatting('**', '**')} className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">Bold</button>
                            <button onClick={() => applyFormatting('*', '*')} className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">Italic</button>
                            <button onClick={() => applyFormatting('`', '`')} className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">Code</button>
                            <button onClick={() => applyFormatting('### ', '')} className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">H3</button>
                            <button onClick={() => applyFormatting('- ', '')} className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">Bullet</button>
                            <button onClick={() => applyFormatting('1. ', '')} className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">Numbered</button>
                            <button onClick={() => applyFormatting('[', '](url)')} className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">Link</button>
                            <button onClick={() => applyFormatting('> ', '')} className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">Quote</button>
                        </div>

                        <textarea
                            ref={textareaRef}
                            className="w-full flex-grow min-h-0 resize-none overflow-auto p-4 rounded-lg bg-[#2b2b2b] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                            placeholder="Type your notes here... Use Markdown for formatting!"
                            value={notes}
                            onChange={handleNotesChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* Preview */}
                    <div className="flex flex-col h-full min-h-0 overflow-hidden">
                        <label className="text-sm font-semibold text-gray-300 mb-2">Live Preview</label>
                        <div className="w-full flex-grow min-h-0 p-4 rounded-lg bg-[#2b2b2b] border border-gray-700 overflow-auto">
                            <article className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    components={{
                                        code({ node, inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    className="whitespace-pre-wrap break-words"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={`${className || ''} whitespace-pre-wrap break-words`} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                    }}
                                >
                                    {notes || "Your formatted notes will appear here."}
                                </ReactMarkdown>
                            </article>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex justify-between items-center flex-shrink-0">
                    <div className="text-sm font-medium">
                        {getStatusIndicator()}
                        <span className="text-gray-500 ml-4">{wordCount} words</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleClear}
                            className="flex items-center py-2 px-4 rounded-lg font-semibold text-sm text-red-200 bg-red-800/50 hover:bg-red-800/80 transition-all duration-300 shadow-md"
                        >
                            <ClearIcon /> Clear
                        </button>
                        <button
                            onClick={onClose}
                            className="py-2 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.01] shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}