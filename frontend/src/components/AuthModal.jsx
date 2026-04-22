import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   Individual OTP digit boxes for the verify step
───────────────────────────────────────────────── */
const OtpInput = ({ value, onChange }) => {
    const inputs = useRef([]);
    const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

    const handleKey = (i, e) => {
        if (e.key === 'Backspace') {
            const next = value.slice(0, i) + value.slice(i + 1);
            onChange(next);
            if (i > 0) inputs.current[i - 1]?.focus();
        } else if (/^\d$/.test(e.key)) {
            const next = (value.slice(0, i) + e.key + value.slice(i + 1)).slice(0, 6);
            onChange(next);
            if (i < 5) inputs.current[i + 1]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={() => {}}
                    onKeyDown={(e) => handleKey(i, e)}
                    onFocus={e => e.target.select()}
                    className={`w-11 h-14 text-center text-xl font-black font-headline text-white
                        bg-white/[0.06] border-b-2 transition-colors outline-none
                        ${d ? 'border-[#f3ffca]' : 'border-white/20 focus:border-[#f3ffca]/60'}`}
                />
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Styled input wrapper
───────────────────────────────────────────────── */
const Field = ({ label, icon, ...props }) => (
    <div className="space-y-1">
        {label && (
            <label className="block text-[9px] font-headline uppercase tracking-[0.18em] text-white/35">{label}</label>
        )}
        <div className="relative">
            {icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-white/30 select-none pointer-events-none">{icon}</span>
            )}
            <input
                {...props}
                className={`w-full bg-white/[0.05] border border-white/[0.1] text-white text-sm font-body
                    placeholder-white/20 outline-none transition-all duration-200
                    focus:bg-white/[0.08] focus:border-[#f3ffca]/40
                    ${icon ? 'pl-9 pr-4 py-3' : 'px-4 py-3'}
                    ${props.className || ''}`}
            />
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   Main AuthModal
───────────────────────────────────────────────── */
const AuthModal = ({ isOpen, onClose }) => {
    const { login, register, verifyOtp, resendOtp, forgotPassword, resetPassword } = useAuth();

    // Modes: login | register | verify_otp | forgot_password | reset_password
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({
        email: '', password: '', username: '', displayName: '',
        otp: '', newPassword: '', confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const timerRef = useRef(null);

    // Start a 60s resend cooldown
    const startResendTimer = () => {
        setResendTimer(60);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer(t => {
                if (t <= 1) { clearInterval(timerRef.current); return 0; }
                return t - 1;
            });
        }, 1000);
    };

    // Cleanup timer
    useEffect(() => () => clearInterval(timerRef.current), []);

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setMode('login');
                setForm({ email: '', password: '', username: '', displayName: '', otp: '', newPassword: '', confirmPassword: '' });
                setError('');
                setSuccess('');
                setLoading(false);
            }, 300);
        }
    }, [isOpen]);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
    const clearMessages = () => { setError(''); setSuccess(''); };

    const goTo = (m) => { setMode(m); clearMessages(); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearMessages();

        // Client-side validation
        if (mode === 'register') {
            if (form.password.length < 8) return setError('Password must be at least 8 characters.');
            if (form.username.length < 3) return setError('Username must be at least 3 characters.');
        }
        if (mode === 'reset_password') {
            if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match.');
            if (form.newPassword.length < 8) return setError('Password must be at least 8 characters.');
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
                onClose();
            } else if (mode === 'register') {
                await register(form.email, form.username, form.password, form.displayName);
                setSuccess('Check your email for the 6-digit OTP to activate your account.');
                startResendTimer();
                goTo('verify_otp');
            } else if (mode === 'verify_otp') {
                await verifyOtp(form.email, form.otp);
                setSuccess('Account verified! You can now log in.');
                goTo('login');
            } else if (mode === 'forgot_password') {
                await forgotPassword(form.email);
                setSuccess('OTP sent — check your email.');
                startResendTimer();
                goTo('reset_password');
            } else if (mode === 'reset_password') {
                await resetPassword(form.email, form.otp, form.newPassword);
                setSuccess('Password updated! Log in with your new password.');
                goTo('login');
            }
        } catch (err) {
            const status = err.response?.status;
            const msg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || err.message || 'Something went wrong.';

            if (status === 403 && msg.toLowerCase().includes('not verified')) {
                setSuccess('Account exists but isn\'t verified yet. Enter the OTP sent to your email.');
                startResendTimer();
                goTo('verify_otp');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            await resendOtp(form.email);
            setSuccess('New OTP sent to your email.');
            startResendTimer();
        } catch (err) {
            setError('Failed to resend OTP. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const titles = {
        login:           { headline: 'Welcome Back', sub: 'Sign in to continue your cinematic journey.' },
        register:        { headline: 'Join CineVault', sub: 'Create your account in seconds.' },
        verify_otp:      { headline: 'Verify Identity', sub: `Enter the 6-digit code sent to ${form.email || 'your email'}.` },
        forgot_password: { headline: 'Account Recovery', sub: 'We\'ll email you a recovery code.' },
        reset_password:  { headline: 'Set New Password', sub: 'Enter the code and your new password.' },
    };

    const btnText = {
        login: 'Sign In',
        register: 'Create Account',
        verify_otp: 'Verify',
        forgot_password: 'Send Recovery Code',
        reset_password: 'Reset Password',
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ animation: 'fadeIn 0.2s ease' }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={onClose} />

            {/* Modal card */}
            <div
                className="relative w-full max-w-md bg-[#0c0c0c] border border-white/[0.1] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
                style={{ animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Top accent line */}
                <div className="h-[2px] w-full bg-gradient-to-r from-[#f3ffca] via-[#f3ffca]/60 to-transparent" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-white/30 hover:text-white transition-colors z-10"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>

                <div className="px-8 py-8">
                    {/* Header */}
                    <div className="mb-7">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#f3ffca] text-[18px]">movie_filter</span>
                            <span className="font-headline font-black text-[#f3ffca] text-[11px] uppercase tracking-[0.2em]">CINEVAULT</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{titles[mode].headline}</h2>
                        <p className="text-sm text-white/40 font-body mt-1">{titles[mode].sub}</p>
                    </div>

                    {/* Alert messages */}
                    {(error || success) && (
                        <div className={`flex items-start gap-2.5 px-4 py-3 mb-6 text-xs font-body border
                            ${error
                                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                : 'bg-[#f3ffca]/[0.08] border-[#f3ffca]/25 text-[#f3ffca]/90'}`}>
                            <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">
                                {error ? 'error' : 'check_circle'}
                            </span>
                            <span>{error || success}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email */}
                        {(mode === 'login' || mode === 'register' || mode === 'forgot_password') && (
                            <Field
                                label="Email address"
                                icon="mail"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={set('email')}
                                required
                                autoComplete="email"
                                autoFocus
                            />
                        )}

                        {/* Register extras */}
                        {mode === 'register' && (
                            <>
                                <Field
                                    label="Username"
                                    icon="alternate_email"
                                    type="text"
                                    placeholder="cooluser"
                                    value={form.username}
                                    onChange={set('username')}
                                    required
                                    minLength={3}
                                    maxLength={20}
                                />
                                <Field
                                    label="Display name (optional)"
                                    icon="badge"
                                    type="text"
                                    placeholder="Your Name"
                                    value={form.displayName}
                                    onChange={set('displayName')}
                                />
                            </>
                        )}

                        {/* Password */}
                        {(mode === 'login' || mode === 'register') && (
                            <div className="space-y-1">
                                <label className="block text-[9px] font-headline uppercase tracking-[0.18em] text-white/35">Password</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-white/30 select-none">lock</span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                                        value={form.password}
                                        onChange={set('password')}
                                        required
                                        minLength={mode === 'register' ? 8 : 1}
                                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                                        className="w-full bg-white/[0.05] border border-white/[0.1] text-white text-sm font-body
                                            placeholder-white/20 outline-none transition-all duration-200
                                            focus:bg-white/[0.08] focus:border-[#f3ffca]/40
                                            pl-9 pr-10 py-3"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">
                                            {showPass ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* OTP boxes */}
                        {(mode === 'verify_otp' || mode === 'reset_password') && (
                            <div className="space-y-2">
                                <label className="block text-[9px] font-headline uppercase tracking-[0.18em] text-white/35">6-Digit Code</label>
                                <OtpInput value={form.otp} onChange={v => setForm(f => ({ ...f, otp: v }))} />
                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendTimer > 0 || loading}
                                        className="text-[10px] font-headline uppercase tracking-widest text-[#f3ffca]/40 hover:text-[#f3ffca]/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* New password for reset */}
                        {mode === 'reset_password' && (
                            <>
                                <Field
                                    label="New Password"
                                    icon="lock_reset"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={form.newPassword}
                                    onChange={set('newPassword')}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                <Field
                                    label="Confirm Password"
                                    icon="lock"
                                    type="password"
                                    placeholder="Repeat new password"
                                    value={form.confirmPassword}
                                    onChange={set('confirmPassword')}
                                    required
                                    autoComplete="new-password"
                                />
                            </>
                        )}

                        {/* Forgot password link (login mode) */}
                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => goTo('forgot_password')}
                                    className="text-[10px] font-headline uppercase tracking-widest text-white/30 hover:text-[#f3ffca]/60 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || (mode === 'verify_otp' && form.otp.length < 6)}
                            className="w-full mt-2 bg-[#f3ffca] text-black font-headline font-black uppercase tracking-widest text-[12px] py-3.5
                                hover:bg-white transition-all active:scale-[0.98]
                                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                                flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : btnText[mode]}
                        </button>
                    </form>

                    {/* Mode switcher footer */}
                    <div className="mt-6 pt-5 border-t border-white/[0.07] flex items-center justify-center gap-2 text-[11px] font-body text-white/35">
                        {mode === 'login' && (
                            <>
                                <span>Don't have an account?</span>
                                <button onClick={() => goTo('register')} className="text-[#f3ffca]/80 font-headline font-bold uppercase tracking-wide hover:text-[#f3ffca] transition-colors">
                                    Sign Up
                                </button>
                            </>
                        )}
                        {(mode === 'register' || mode === 'forgot_password' || mode === 'reset_password' || mode === 'verify_otp') && (
                            <>
                                <span>Already have an account?</span>
                                <button onClick={() => goTo('login')} className="text-[#f3ffca]/80 font-headline font-bold uppercase tracking-wide hover:text-[#f3ffca] transition-colors">
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
        </div>
    );
};

export default AuthModal;
