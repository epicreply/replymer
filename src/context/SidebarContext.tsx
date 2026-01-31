import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  desktopSidebarOpen: boolean;
  setDesktopSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const closeSidebar = () => {
    setDesktopSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider value={{ desktopSidebarOpen, setDesktopSidebarOpen, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
