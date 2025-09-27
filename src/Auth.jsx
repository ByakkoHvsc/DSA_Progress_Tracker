import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from 'firebase/auth';

// --- Reusable UI Components ---

const Logo = () => (
    <div className="flex justify-center mb-6">
        {/* SVG code remains the same */}
        <svg className="w-24 h-24" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#8a2be2', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#5b17b2', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <path d="M60 0C26.863 0 0 26.863 0 60c0 33.137 26.863 60 60 60s60-26.863 60-60C120 26.863 93.137 0 60 0zm0 108c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48z" fill="url(#logo-gradient)" />
            <path d="M60 24c-19.882 0-36 16.118-36 36s16.118 36 36 36 36-16.118 36-36-16.118-36-36-36zm0 54c-9.941 0-18-8.059-18-18s8.059-18 18-18 18 8.059 18 18-8.059 18-18 18z" fill="white" />
        </svg>
    </div>
);

const Message = ({ text, type = 'error' }) => {
    if (!text) return null;
    const typeClasses = {
        error: "text-red-200 bg-red-900 border-red-700",
        success: "text-green-200 bg-green-900 border-green-700",
    };
    return <div className={`mt-4 text-sm font-medium p-3 rounded-lg border ${typeClasses[type]}`}>{text}</div>;
};

const AuthInput = ({ label, type, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input type={type} value={value} onChange={onChange} className="mt-1 block w-full px-4 py-3 rounded-lg text-gray-200 bg-[#2b2b2b] border border-gray-600 shadow-sm focus:border-violet-400 focus:ring focus:ring-violet-200 focus:ring-opacity-50 transition-colors" placeholder={placeholder} />
    </div>
);

const PasswordInput = ({ value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={value} onChange={onChange} className="mt-1 block w-full px-4 py-3 rounded-lg text-gray-200 bg-[#2b2b2b] border border-gray-600 shadow-sm focus:border-violet-400 focus:ring focus:ring-violet-200 focus:ring-opacity-50 transition-colors" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 015.001-5.175M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
};

const AuthButton = ({ onClick, isLoading, children }) => (
    <button onClick={onClick} disabled={isLoading} className="w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.01] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
        {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : children}
    </button>
);

const Footer = () => (
    <footer className="text-center p-4 mt-8 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} DSA Placement Tracker. All Rights Reserved.</p>
    </footer>
);

// --- Main Auth Component ---

export default function Auth({ auth }) {
    const [authMode, setAuthMode] = useState('signIn'); // 'signIn', 'signUp', 'forgotPassword'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');
    const [isLoading, setIsLoading] = useState(false);

    const resetFormState = () => {
        setEmail('');
        setPassword('');
        setResetEmail('');
        setMessage('');
    };

    const handleModeChange = (mode) => {
        resetFormState();
        setAuthMode(mode);
    };

    const handleAuthAction = async (action) => {
        setIsLoading(true);
        setMessage('');
        try {
            await action();
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = () => handleAuthAction(async () => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            await signOut(auth);
            throw new Error('Email not verified. Please check your inbox for the verification link.');
        }
    });

    const handleSignUp = () => handleAuthAction(async () => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setMessageType('success');
        setMessage('Account created! A verification link has been sent to your email. Please verify before signing in.');
        setEmail('');
        setPassword('');
    });

    const handlePasswordReset = () => handleAuthAction(async () => {
        await sendPasswordResetEmail(auth, resetEmail);
        setMessageType('success');
        setMessage('If an account with that email exists, a password reset link has been sent.');
    });

    const handleAuthError = (error) => {
        setMessageType('error');
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                setMessage('Invalid credentials. Please check your email and password.');
                break;
            case 'auth/wrong-password':
                setMessage('Incorrect password. Please try again.');
                break;
            case 'auth/email-already-in-use':
                setMessage('This email is already in use. Please sign in.');
                break;
            default:
                setMessage(error.message || 'An unexpected error occurred. Please try again.');
        }
    };
    
    const renderForm = () => {
        if (authMode === 'forgotPassword') {
            return (
                <>
                    <h2 className="text-3xl font-bold text-gray-100 mb-2">Reset Password</h2>
                    <p className="text-sm text-gray-400 mb-6">Enter your email to receive a reset link.</p>
                    <Message text={message} type={messageType} />
                    <div className="space-y-4 text-left mt-4">
                        <AuthInput label="Email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Enter your registered email" />
                    </div>
                    <AuthButton onClick={handlePasswordReset} isLoading={isLoading}>Send Reset Link</AuthButton>
                    <p className="mt-4 text-center text-sm text-gray-400">
                        Remembered your password?{' '}
                        <a onClick={() => handleModeChange('signIn')} className="cursor-pointer font-semibold text-violet-500 hover:underline">Sign In</a>
                    </p>
                </>
            );
        }

        const isSignIn = authMode === 'signIn';
        return (
            <>
                <h2 className="text-3xl font-bold text-gray-100 mb-2">{isSignIn ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-sm text-gray-400 mb-6">{isSignIn ? 'Sign in to access your progress.' : 'Start your journey with us.'}</p>
                <Message text={message} type={messageType} />
                <div className="space-y-4 text-left mt-4">
                    <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                    <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
                    {isSignIn && (
                        <div className="text-right">
                            <a onClick={() => handleModeChange('forgotPassword')} className="text-sm cursor-pointer font-semibold text-violet-500 hover:underline">
                                I forgot my password
                            </a>
                        </div>
                    )}
                </div>
                <AuthButton onClick={isSignIn ? handleSignIn : handleSignUp} isLoading={isLoading}>
                    {isSignIn ? 'Login' : 'Sign Up'}
                </AuthButton>
                <p className="mt-6 text-center text-sm text-gray-400">
                    {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <a onClick={() => handleModeChange(isSignIn ? 'signUp' : 'signIn')} className="cursor-pointer font-semibold text-violet-500 hover:underline">
                        {isSignIn ? 'Sign Up' : 'Sign In'}
                    </a>
                </p>
            </>
        );
    };

    return (
        <div className="antialiased font-sans bg-[#121212] text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center flex-col">
            <div className="bg-[#1e1e1e] p-8 sm:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-700">
                <Logo />
                {renderForm()}
            </div>
            <Footer />
        </div>
    );
}