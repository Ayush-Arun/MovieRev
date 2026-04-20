import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'otp'
    const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' });
    const [otpEmail, setOtpEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    if (!isOpen) return null;

    const startResendCooldown = () => {
        setResendCooldown(60);
        const timer = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (mode === 'login') {
                const result = await login(form.email, form.password);
                // login() in AuthContext may return otp_required for unverified accounts
                if (result?.status === 'otp_required') {
                    setOtpEmail(result.email);
                    setMode('otp');
                    startResendCooldown();
                } else {
                    onClose();
                }
            } else {
                const result = await register(form.email, form.username, form.password, form.displayName);
                if (result?.status === 'otp_required') {
                    setOtpEmail(result.email);
                    setMode('otp');
                    startResendCooldown();
                } else {
                    onClose();
                }
            }
        } catch (err) {
            let msg = 'An error occurred';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') msg = err.response.data;
                else if (err.response.data.message) msg = err.response.data.message;
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email: otpEmail, code: otpCode });
            // Save tokens from successful OTP verification
            if (res.data.access_token) {
                localStorage.setItem('access_token', res.data.access_token);
                localStorage.setItem('refresh_token', res.data.refresh_token);
                // Trigger auth context reload
                window.dispatchEvent(new Event('auth_verified'));
            }
            onClose();
            window.location.reload(); // Refresh to load user state
        } catch (err) {
            const msg = err.response?.data || err.message || 'Invalid code';
            setError(typeof msg === 'string' ? msg : 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setError(null);
        try {
            await api.post('/auth/resend-otp', { email: otpEmail });
            startResendCooldown();
            setError(null);
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        }
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError(null);
        setOtpCode('');
    };

    // ── OTP VERIFICATION SCREEN ─────────────────────────────────────────────
    if (mode === 'otp') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative p-8">
                    <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors">✕</button>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-3xl">mark_email_unread</span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-headline font-bold mb-2 text-center text-white tracking-widest uppercase">
                        VERIFY_IDENTITY
                    </h2>
                    <p className="text-white/40 text-center text-xs font-headline uppercase tracking-widest mb-1">
                        Code sent to
                    </p>
                    <p className="text-primary text-center text-sm font-bold font-headline mb-6 break-all">
                        {otpEmail}
                    </p>

                    {error && (
                        <div className="p-4 mb-6 bg-red-500/10 border border-red-500 text-red-400 rounded-md text-sm font-bold uppercase tracking-wide text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
                        {/* OTP 6-digit input */}
                        <div>
                            <label className="block text-[10px] font-headline uppercase tracking-widest text-white/40 mb-3 text-center">
                                Enter 6-digit code
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                placeholder="● ● ● ● ● ●"
                                required
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="bg-white/5 border-2 border-primary/40 focus:border-primary text-white placeholder-white/20 rounded-md p-4 focus:outline-none transition-all font-headline text-center text-2xl tracking-[0.5em] w-full"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otpCode.length !== 6}
                            className="bg-primary hover:bg-primary/90 text-on-primary font-headline tracking-widest text-sm p-4 rounded-md transition-all uppercase shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'VERIFYING...' : 'CONFIRM_CODE'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-white/30 text-xs font-headline uppercase tracking-wider mb-2">
                            Didn't receive it?
                        </p>
                        <button
                            onClick={handleResendOtp}
                            disabled={resendCooldown > 0}
                            className="text-primary hover:text-white text-xs font-headline uppercase tracking-widest transition-colors disabled:text-white/20 disabled:cursor-not-allowed"
                        >
                            {resendCooldown > 0 ? `RESEND IN ${resendCooldown}s` : 'RESEND_CODE'}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => switchMode('register')}
                            className="text-white/30 hover:text-white/60 text-xs font-headline uppercase tracking-widest transition-colors"
                        >
                            ← Back to Register
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── LOGIN / REGISTER SCREEN ─────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative p-8">
                <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors">✕</button>
                <h2 className="text-2xl font-headline font-bold mb-6 text-center text-white tracking-widest uppercase">
                    {mode === 'login' ? 'WELCOME_BACK' : 'CREATE_ACCOUNT'}
                </h2>

                {error && (
                    <div className="p-4 mb-6 bg-red-500/10 border border-red-500 text-red-400 rounded-md text-sm font-bold uppercase tracking-wide text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-md p-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-body"
                        onChange={e => setForm({ ...form, email: e.target.value })}
                    />

                    {mode === 'register' && (
                        <>
                            <input
                                type="text"
                                placeholder="Username"
                                required
                                minLength={3}
                                maxLength={20}
                                className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-md p-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-body"
                                onChange={e => setForm({ ...form, username: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Display Name (Optional)"
                                className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-md p-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-body"
                                onChange={e => setForm({ ...form, displayName: e.target.value })}
                            />
                        </>
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        required
                        minLength={8}
                        className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-md p-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-body"
                        onChange={e => setForm({ ...form, password: e.target.value })}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-on-primary font-headline tracking-widest text-sm p-4 rounded-md mt-4 transition-all uppercase shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? (mode === 'login' ? 'AUTHENTICATING...' : 'SENDING OTP...')
                            : (mode === 'login' ? 'COMMENCE_SESSION' : 'INITIALIZE_USER')
                        }
                    </button>
                </form>

                <div className="mt-8 text-center text-white/50 text-sm font-headline tracking-wider uppercase flex flex-col gap-2">
                    {mode === 'login' ? (
                        <><span>UNREGISTERED_ENTITY?</span> <button onClick={() => switchMode('register')} className="text-primary hover:text-white transition-colors">INITIALIZE_NOW</button></>
                    ) : (
                        <><span>EXISTING_ENTITY?</span> <button onClick={() => switchMode('login')} className="text-primary hover:text-white transition-colors">RESUME_SESSION</button></>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
