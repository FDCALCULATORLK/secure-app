import React, { useState } from 'react';
import { loginUser, registerUser } from '../authService';

interface AuthScreenProps {
  onLogin: () => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      if (isCreatingAccount) {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }

      onLogin();
    } catch (error: any) {
      console.error(error);

      if (error.code === 'auth/invalid-credential') {
        setError('Email or password is incorrect.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email already has an account.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#021327] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>

          <h1 className="text-3xl font-bold">
            Private Notes
          </h1>

          <p className="text-slate-400 mt-2">
            Your private notes, stored securely in the cloud.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/70 border border-sky-500/20 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-semibold mb-6">
            {isCreatingAccount ? 'Create your account' : 'Welcome back'}
          </h2>

          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-sky-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-sky-500"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold py-3 transition"
          >
            {loading
              ? 'Please wait...'
              : isCreatingAccount
                ? 'Create Account'
                : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsCreatingAccount((previous) => !previous);
              setError('');
            }}
            className="w-full mt-4 text-sm text-sky-400 hover:text-sky-300"
          >
            {isCreatingAccount
              ? 'Already have an account? Login'
              : "Don't have an account? Create one"}
          </button>
        </form>
      </div>
    </div>
  );
}