import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({ isOpen: false, toggleSidebar: () => {}, closeSidebar: () => {} });

export const SidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(prev => !prev);
    const closeSidebar = () => setIsOpen(false);
    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
