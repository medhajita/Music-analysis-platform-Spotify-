import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Disc, 
  Music, 
  Tag, 
  Globe, 
  Search, 
  Menu, 
  X,
  Sun,
  Moon,
  BarChart3
} from 'lucide-react';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Accueil' },
    { to: '/artists', icon: <Users size={20} />, label: 'Artistes' },
    { to: '/albums', icon: <Disc size={20} />, label: 'Albums' },
    { to: '/songs', icon: <Music size={20} />, label: 'Chansons' },
    { to: '/genres', icon: <Tag size={20} />, label: 'Genres' },
    { to: '/countries', icon: <Globe size={20} />, label: 'Pays' },
    { to: '/search', icon: <Search size={20} />, label: 'Recherche' },
  ];

  return (
    <div className={`min-h-screen flex text-slate-800 dark:text-slate-100 bg-white dark:bg-[#121212] transition-colors duration-300`}>
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-50 dark:bg-black border-r border-slate-200 dark:border-white/10 flex flex-col transition-all duration-300 sticky top-0 h-screen z-40`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="bg-primary-light p-2 rounded-full">
              <BarChart3 size={24} className="text-black" />
            </div>
            {isSidebarOpen && <h1 className="font-bold text-xl tracking-tight">MusicStats</h1>}
          </div>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-light text-black font-semibold shadow-lg shadow-primary-light/20' 
                    : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <button 
            onClick={toggleDarkMode}
            className={`flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 w-full transition-all duration-200`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center px-6 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-30">
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
          >
            {isSidebarOpen ? <Menu size={20} /> : <X size={20} />}
          </button>
          
          <div className="ml-auto flex items-center gap-4">
             {/* Profile stub */}
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20"></div>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
