import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const InputField = ({ label, name, type = 'text', value, onChange, placeholder, hint }) => (
    <div className="space-y-2">
        <label className="block text-[10px] uppercase font-headline tracking-[0.2em] text-white/50">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full bg-black/40 border border-white/10 focus:border-primary hover:border-white/30 text-white placeholder:text-white/20 p-4 outline-none transition-all font-body text-sm"
        />
        {hint && <p className="text-[10px] text-white/30 font-body">{hint}</p>}
    </div>
);

const Settings = () => {
    const { user } = useAuth();

    const [profileData, setProfileData] = useState({
        displayName: user?.displayName || '',
        avatarUrl: user?.avatarUrl || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
    const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileStatus({ type: '', message: '' });
        try {
            await api.put('/users/me/settings', profileData);
            setProfileStatus({ type: 'success', message: 'Profile updated successfully.' });
            setTimeout(() => window.location.reload(), 1200);
        } catch (error) {
            setProfileStatus({ type: 'error', message: error.response?.data || 'Update failed.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
            return;
        }
        setPasswordLoading(true);
        setPasswordStatus({ type: '', message: '' });
        try {
            await api.put('/users/me/settings', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordStatus({ type: 'success', message: 'Password changed successfully.' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordStatus({ type: 'error', message: error.response?.data || 'Password change failed.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!user) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <span className="font-headline uppercase tracking-widest text-primary animate-pulse">UNAUTHORIZED_</span>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Page Header */}
            <div className="border-b-2 border-primary pb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-headline uppercase tracking-[0.3em] text-primary font-bold">SYSTEM // CONFIGURATION</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black font-headline uppercase tracking-tighter text-white">
                    Account <span className="text-primary">Settings</span>
                </h1>
                <p className="text-white/40 mt-2 font-body text-sm">Manage your identity parameters and security credentials.</p>
            </div>

            {/* Current Identity Display */}
            <div className="flex items-center gap-6 p-6 bg-surface-container border border-white/10 relative overflow-hidden group">
                <div className="absolute right-0 top-0 text-[100px] font-bold font-headline text-white/[0.02] -translate-y-1/4 select-none">CONFIG</div>
                <div className="w-16 h-16 border-2 border-primary flex items-center justify-center bg-primary/10 flex-shrink-0 relative">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-headline font-black text-primary uppercase">
                            {user.displayName?.[0] || user.username?.[0] || 'X'}
                        </span>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-black"></div>
                </div>
                <div className="relative z-10">
                    <h2 className="text-xl font-headline font-black uppercase tracking-tight text-white">{user.displayName || user.username}</h2>
                    <p className="text-white/40 font-body text-xs mt-1">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-headline uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-2 py-0.5">{user.role?.toUpperCase() || 'USER'}</span>
                        <span className="text-[9px] font-headline uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5">VERIFIED</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Profile Panel */}
                <form onSubmit={handleProfileSubmit} className="bg-surface-container-low border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-primary/5 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">person</span>
                        <div>
                            <h3 className="font-headline uppercase tracking-widest font-bold text-sm text-white">Identity Parameters</h3>
                            <p className="text-[10px] text-white/40 font-body mt-0.5">Update your public profile information</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        {profileStatus.message && (
                            <div className={`p-3 border text-xs font-headline uppercase tracking-widest ${
                                profileStatus.type === 'success'
                                    ? 'border-primary/40 text-primary bg-primary/5'
                                    : 'border-red-500/40 text-red-400 bg-red-500/5'
                            }`}>
                                {profileStatus.message}
                            </div>
                        )}

                        <InputField
                            label="Display Name"
                            name="displayName"
                            value={profileData.displayName}
                            onChange={handleProfileChange}
                            placeholder="e.g. John Doe"
                            hint="This name appears on your reviews and profile."
                        />

                        <InputField
                            label="Avatar URL"
                            name="avatarUrl"
                            value={profileData.avatarUrl}
                            onChange={handleProfileChange}
                            placeholder="https://..."
                            hint="Direct link to an image (jpg, png, webp)."
                        />

                        {profileData.avatarUrl && (
                            <div className="flex items-center gap-3 p-3 bg-black/20 border border-white/5">
                                <img
                                    src={profileData.avatarUrl}
                                    alt="Preview"
                                    className="w-10 h-10 object-cover"
                                    onError={(e) => { e.target.style.opacity = '0.3'; }}
                                />
                                <span className="text-[10px] text-white/40 font-headline uppercase tracking-wider">Avatar Preview</span>
                            </div>
                        )}
                    </div>

                    <div className="px-6 pb-6">
                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="w-full py-3 bg-primary text-black font-headline font-black uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {profileLoading
                                ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> Saving...</>
                                : <><span className="material-symbols-outlined text-[16px]">save</span> Save Profile</>
                            }
                        </button>
                    </div>
                </form>

                {/* Password Panel */}
                <form onSubmit={handlePasswordSubmit} className="bg-surface-container-low border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-primary/5 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">lock</span>
                        <div>
                            <h3 className="font-headline uppercase tracking-widest font-bold text-sm text-white">Security Override</h3>
                            <p className="text-[10px] text-white/40 font-body mt-0.5">Change your account password</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        {passwordStatus.message && (
                            <div className={`p-3 border text-xs font-headline uppercase tracking-widest ${
                                passwordStatus.type === 'success'
                                    ? 'border-primary/40 text-primary bg-primary/5'
                                    : 'border-red-500/40 text-red-400 bg-red-500/5'
                            }`}>
                                {passwordStatus.message}
                            </div>
                        )}

                        <InputField
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Your current password"
                        />

                        <InputField
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Min 6 characters"
                            hint="Use a mix of letters, numbers, and symbols."
                        />

                        <InputField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Repeat new password"
                        />
                    </div>

                    <div className="px-6 pb-6">
                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="w-full py-3 bg-white/10 hover:bg-primary hover:text-black text-white border border-white/20 hover:border-primary font-headline font-black uppercase tracking-widest text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {passwordLoading
                                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Updating...</>
                                : <><span className="material-symbols-outlined text-[16px]">key</span> Change Password</>
                            }
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-500/20 bg-red-500/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-red-400">warning</span>
                    <h3 className="font-headline uppercase tracking-widest font-bold text-sm text-red-400">Danger Zone</h3>
                </div>
                <p className="text-white/40 font-body text-xs mb-4">Permanent actions that cannot be undone. Proceed with caution.</p>
                <button
                    type="button"
                    className="px-6 py-2.5 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-400 font-headline uppercase tracking-widest text-xs transition-all"
                    onClick={() => alert('Account deletion is not yet implemented. Contact support.')}
                >
                    <span className="material-symbols-outlined text-[14px] mr-1 align-middle">delete_forever</span>
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default Settings;
