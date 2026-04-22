import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

const NAV_ITEMS = [
    { to: '/',          icon: 'lens_blur',      label: 'THE VOID'   },
    { to: '/browse',    icon: 'theaters',        label: 'CRITICISM'  },
    { to: '/showtimes', icon: 'new_releases',    label: 'RELEASES'   },
    { to: '/watchlist', icon: 'history',         label: 'ARCHIVE'    },
    { to: '/settings',  icon: 'settings',        label: 'SETTINGS'   },
];

const Navbar = ({ onOpenAuth }) => {
    const { user, logout, isAdmin } = useAuth();
    const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
    const location = useLocation();
    const [notifications, setNotifications] = React.useState([]);
    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const drawerRef = useRef(null);

    // Close sidebar on route change
    useEffect(() => { closeSidebar(); }, [location.pathname]);

    // Fetch notifications
    useEffect(() => {
        if (!user) return;
        import('../api/axios').then(({ default: api }) => {
            api.get('/notifications').then(res => setNotifications(res.data)).catch(() => {});
        });
    }, [user]);

    const markAsRead = async (id) => {
        try {
            const { default: api } = await import('../api/axios');
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) {}
    };

    const isActive = (path) => location.pathname === path;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <>
            {/* ── FIXED TOP HEADER ── */}
            <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-3
                bg-[#080808]/90 backdrop-blur-2xl border-b border-white/[0.06]">

                {/* Hamburger */}
                <button
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                    className={`flex flex-col justify-center items-center w-9 h-9 gap-[5px] shrink-0 transition-all ${isOpen ? 'text-[#f3ffca]' : 'text-white/50 hover:text-white'}`}
                >
                    <span className={`block w-5 h-px bg-current transition-all duration-300 origin-center ${isOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
                    <span className={`block w-5 h-px bg-current transition-all duration-300 ${isOpen ? 'opacity-0 scale-x-0' : ''}`} />
                    <span className={`block w-5 h-px bg-current transition-all duration-300 origin-center ${isOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
                </button>

                {/* Logo */}
                <Link to="/" className="font-headline font-black text-[#f3ffca] text-base tracking-tighter uppercase shrink-0 mr-1">
                    CV<span className="text-[#ff706f]">_</span>
                </Link>

                {/* Search — left side */}
                <div className="flex items-center bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 gap-2 flex-1 max-w-xs">
                    <span className="material-symbols-outlined text-white/30 text-[16px] shrink-0">search</span>
                    <input
                        className="bg-transparent border-none focus:outline-none text-[11px] font-headline uppercase tracking-widest text-white/60 placeholder-white/20 w-full"
                        placeholder="SEARCH_DATABASE..."
                        type="text"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                                window.location.href = `/browse?search=${encodeURIComponent(e.target.value.trim())}`;
                            }
                        }}
                    />
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Notification bell */}
                <div className="relative shrink-0">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="relative flex items-center justify-center w-9 h-9 text-white/50 hover:text-[#f3ffca] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1.5 w-[7px] h-[7px] bg-[#ff706f] rounded-full" />
                        )}
                    </button>

                    {isNotifOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                            <div className="absolute right-0 top-11 w-80 bg-[#0f0f0f] border border-white/10 shadow-2xl z-50">
                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
                                    <span className="font-headline text-[10px] uppercase tracking-widest text-[#f3ffca]/80">Broadcasts</span>
                                    {unreadCount > 0 && <span className="text-[9px] font-headline uppercase text-[#ff706f]">{unreadCount} new</span>}
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="py-8 text-center text-white/25 font-headline text-[10px] uppercase tracking-widest">NO_BROADCASTS_FOUND</div>
                                    ) : notifications.map(n => (
                                        <div key={n.id} onClick={() => !n.isRead && markAsRead(n.id)}
                                            className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/3 transition-colors text-xs
                                                ${!n.isRead ? 'border-l-2 border-l-[#f3ffca] bg-[#f3ffca]/[0.03]' : 'opacity-40'}`}>
                                            <p className="text-white/80 font-body">{n.message}</p>
                                            <span className="text-[9px] font-headline uppercase tracking-widest text-white/25 mt-1 block">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User avatar / login */}
                {user ? (
                    <div className="relative group/avatar shrink-0">
                        <button className="w-8 h-8 rounded-full bg-[#f3ffca]/10 border border-[#f3ffca]/20 flex items-center justify-center text-[#f3ffca] text-xs font-black font-headline hover:border-[#f3ffca]/50 transition-colors">
                            {(user.displayName || user.username || 'U')[0].toUpperCase()}
                        </button>
                        <div className="absolute right-0 top-10 w-44 bg-[#0f0f0f] border border-white/10 shadow-xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all duration-200 z-50">
                            <div className="px-3 py-2 border-b border-white/8 font-headline text-[9px] uppercase tracking-widest text-white/35 truncate">
                                {user.displayName || user.username}
                            </div>
                            <Link to="/profile" className="flex items-center gap-2 px-3 py-2 font-headline text-[10px] uppercase tracking-widest text-white/50 hover:text-[#f3ffca] hover:bg-white/4 transition-colors">
                                <span className="material-symbols-outlined text-[13px]">person</span> Profile
                            </Link>
                            <Link to="/settings" className="flex items-center gap-2 px-3 py-2 font-headline text-[10px] uppercase tracking-widest text-white/50 hover:text-[#f3ffca] hover:bg-white/4 transition-colors">
                                <span className="material-symbols-outlined text-[13px]">settings</span> Settings
                            </Link>
                            <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 font-headline text-[10px] uppercase tracking-widest text-[#ff706f]/60 hover:text-[#ff706f] hover:bg-[#ff706f]/5 transition-colors">
                                <span className="material-symbols-outlined text-[13px]">logout</span> Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={onOpenAuth} className="shrink-0 font-headline text-[10px] tracking-widest font-bold uppercase border border-[#f3ffca]/25 px-3 py-1.5 text-[#f3ffca]/70 hover:bg-[#f3ffca] hover:text-black hover:border-[#f3ffca] transition-all">
                        LOGIN
                    </button>
                )}
            </header>

            {/* ── SIDEBAR BACKDROP (blur overlay) ── */}
            <div
                className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeSidebar}
            />

            {/* ── SLIDE-OUT DRAWER ── */}
            <aside
                ref={drawerRef}
                className={`fixed left-0 top-0 h-full z-[70] w-64 bg-[#080808] border-r border-white/[0.06]
                    flex flex-col transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06] shrink-0">
                    <div>
                        <h2 className="font-headline font-black text-[#f3ffca] uppercase tracking-tighter text-base">CINEVAULT</h2>
                        <p className="font-headline text-[8px] uppercase tracking-[0.15em] text-white/25">BIOLOGICAL_TERMINAL</p>
                    </div>
                    <button onClick={closeSidebar} className="text-white/30 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 flex flex-col gap-0.5 py-4 px-2 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, icon, label }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={closeSidebar}
                            className={`relative flex items-center gap-3.5 h-11 px-4 rounded-none
                                font-headline uppercase tracking-widest text-[11px] transition-all duration-100
                                ${isActive(to)
                                    ? 'text-[#f3ffca] bg-[#f3ffca]/[0.07]'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'}`}
                        >
                            {isActive(to) && <span className="absolute left-0 top-0 h-full w-[2px] bg-[#f3ffca]" />}
                            <span className="material-symbols-outlined text-[18px]">{icon}</span>
                            <span>{label}</span>
                        </Link>
                    ))}

                    {isAdmin && (
                        <Link to="/admin" onClick={closeSidebar}
                            className={`relative flex items-center gap-3.5 h-11 px-4 font-headline uppercase tracking-widest text-[11px] transition-all
                                ${isActive('/admin') ? 'text-[#ff706f] bg-[#ff706f]/8' : 'text-[#ff706f]/50 hover:text-[#ff706f] hover:bg-[#ff706f]/5'}`}>
                            {isActive('/admin') && <span className="absolute left-0 top-0 h-full w-[2px] bg-[#ff706f]" />}
                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                            <span>ADMIN</span>
                        </Link>
                    )}
                </nav>

                {/* User area at bottom */}
                {user ? (
                    <div className="border-t border-white/[0.06] px-4 py-4 shrink-0">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#f3ffca]/10 border border-[#f3ffca]/20 flex items-center justify-center text-[#f3ffca] text-xs font-black font-headline shrink-0">
                                {(user.displayName || user.username || 'U')[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-headline text-[10px] uppercase tracking-widest text-white/60 truncate">{user.displayName || user.username}</p>
                                <p className="font-body text-[9px] text-white/25 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button onClick={() => { logout(); closeSidebar(); }}
                            className="flex items-center gap-2 text-[#ff706f]/60 hover:text-[#ff706f] transition-colors font-headline text-[10px] uppercase tracking-widest">
                            <span className="material-symbols-outlined text-[14px]">logout</span> LOGOUT
                        </button>
                    </div>
                ) : (
                    <div className="border-t border-white/[0.06] px-4 py-4 shrink-0">
                        <button onClick={() => { onOpenAuth(); closeSidebar(); }}
                            className="w-full bg-[#f3ffca] text-black font-headline font-black uppercase tracking-widest text-[11px] py-2.5 hover:bg-[#f3ffca]/90 transition-colors active:scale-95">
                            IDENTIFY / LOGIN
                        </button>
                    </div>
                )}
            </aside>

            {/* ── MOBILE BOTTOM NAV ── */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#080808]/95 backdrop-blur-xl flex items-center justify-around py-2.5 z-50 border-t border-white/[0.06]">
                {NAV_ITEMS.slice(0, 4).map(({ to, icon, label }) => (
                    <Link key={to} to={to}
                        className={`flex flex-col items-center gap-0.5 transition-colors ${isActive(to) ? 'text-[#f3ffca]' : 'text-white/30'}`}>
                        <span className="material-symbols-outlined text-[22px]">{icon}</span>
                        <span className="text-[7px] font-headline font-bold tracking-widest">{label.split(' ')[0]}</span>
                    </Link>
                ))}
                <button onClick={onOpenAuth}
                    className={`flex flex-col items-center gap-0.5 ${user ? 'text-[#f3ffca]/60' : 'text-[#f3ffca]/40'} transition-colors`}>
                    <span className="material-symbols-outlined text-[22px]">{user ? 'account_circle' : 'login'}</span>
                    <span className="text-[7px] font-headline font-bold tracking-widest">{user ? 'YOU' : 'LOGIN'}</span>
                </button>
            </nav>
        </>
    );
};

export default Navbar;
