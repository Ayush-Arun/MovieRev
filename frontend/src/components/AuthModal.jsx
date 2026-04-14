import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' });
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
            } else {
                await register(form.email, form.username, form.password, form.displayName);
            }
            onClose();
        } catch (err) {
            let msg = "An error occurred";
            if (err.response?.data) {
                if (typeof err.response.data === 'string') msg = err.response.data;
                else if (err.response.data.message) msg = err.response.data.message;
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative p-8">
                <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors">✕</button>
                <h2 className="text-2xl font-headline font-bold mb-6 text-center text-white tracking-widest uppercase">{mode === 'login' ? 'WELCOME_BACK' : 'CREATE_ACCOUNT'}</h2>
                
                {error && <div className="p-4 mb-6 bg-error/10 border border-error text-error rounded-md text-sm font-bold uppercase tracking-wide text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input type="email" placeholder="Email" required className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-md p-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-body" 
                        onChange={e => setForm({...form, email: e.target.value})} />
                    
                    {mode === 'register' && (
                        <>
                            <input type="text" placeholder="Username" required minLength={3} maxLength={20} className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-md p-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-body"
                                onChange={e => setForm({...form, username: e.target.value})} />
                            <input type="text" placeholder="Display Name (Optional)" className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-md p-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-body"
                                onChange={e => setForm({...form, displayName: e.target.value})} />
                        </>
                    )}
                    
                    <input type="password" placeholder="Password" required minLength={8} className="bg-white/5 border border-white/10 text-white placeholder-white/40 rounded-md p-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-body"
                        onChange={e => setForm({...form, password: e.target.value})} />

                    <button type="submit" className="bg-primary hover:bg-primary/90 text-on-primary font-headline tracking-widest text-sm p-4 rounded-md mt-4 transition-all uppercase shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]">
                        {mode === 'login' ? 'COMMENCE_SESSION' : 'INITIALIZE_USER'}
                    </button>
                </form>

                <div className="mt-8 text-center text-white/50 text-sm font-headline tracking-wider uppercase flex flex-col gap-2">
                    {mode === 'login' ? (
                        <><span>UNREGISTERED_ENTITY?</span> <button onClick={() => setMode('register')} className="text-primary hover:text-white transition-colors">INITIALIZE_NOW</button></>
                    ) : (
                        <><span>EXISTING_ENTITY?</span> <button onClick={() => setMode('login')} className="text-primary hover:text-white transition-colors">RESUME_SESSION</button></>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
