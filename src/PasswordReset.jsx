import React, { useState, useEffect } from 'react';
import { confirmPasswordReset } from 'firebase/auth';

export default function PasswordReset({ auth }) {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [oobCode, setOobCode] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('oobCode');
    if (code) {
      setOobCode(code);
    } else {
      setError('Invalid password reset link.');
    }
  }, []);

  const handlePasswordReset = async () => {
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('Your password has been reset successfully! You can now sign in.');
      setError('');
      // Redirect to the login page after a successful password reset.
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
      setMessage('');
    }
  };

  if (error) {
    return (
      <div className="antialiased font-sans bg-[#121212] text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-[#1e1e1e] p-8 sm:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-700">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="antialiased font-sans bg-[#121212] text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-[#1e1e1e] p-8 sm:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center">
          <p className="text-green-200 text-lg">{message}</p>
        </div>
      </div>
    );
    }

    return (
        <div className="antialiased font-sans bg-[#121212] text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="bg-[#1e1e1e] p-8 sm:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-700">
                <div className="flex justify-center mb-6">
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
                <h2 className="text-3xl font-bold text-gray-100 mb-2">Reset Password</h2>
                <p className="text-sm text-gray-400 mb-6">Enter your new password below.</p>
                <div className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 rounded-lg text-gray-200 bg-[#2b2b2b] border border-gray-600 shadow-sm focus:border-violet-400 focus:ring focus:ring-violet-200 focus:ring-opacity-50 transition-colors"
                            placeholder="Enter your new password"
                        />
                    </div>
                </div>
                <button
                    onClick={handlePasswordReset}
                    className="w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.01] shadow-lg"
                >
                    Reset Password
                </button>
            </div>
        </div>
    );
}
