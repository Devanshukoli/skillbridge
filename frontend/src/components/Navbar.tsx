import React, { useState } from 'react';
import { User } from '../types';
import { 
  Server, 
  BookOpen, 
  Award, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Code, 
  ChevronRight,
  ClipboardList,
  ChevronLeft
} from 'lucide-react';
import { getAvatarPreset } from '../avatarPresets';

interface NavbarProps {
  user: User;
  activeSection: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

export default function Navbar({ user, activeSection, isSidebarCollapsed, onToggleSidebar, setActiveSection, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Server },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'submissions', label: 'Submissions', icon: ClipboardList },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Award });
  }

  const avatar = getAvatarPreset(user.profile.avatarId);

  return (
    <>
      {isOpen && <button type="button" className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} aria-label="Close navigation" />}

      {/* Mobile Top Bar */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Code className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">SkillBridge</span>
        </div>
        <button 
          id="mobile-nav-toggle"
          onClick={() => setIsOpen(!isOpen)} 
          className="text-slate-400 hover:text-white p-1"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar navigation */}
      <aside className={`
        fixed top-14 lg:top-0 bottom-0 left-0 z-40 bg-slate-900 border-r border-slate-800 p-4 lg:p-6 flex flex-col justify-between transition-all duration-300 lg:translate-x-0
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Logo / Toggle */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2.5">
                <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-600/10">
                  <Code className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight">SkillBridge</span>
              </div>
            )}
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* User Widget */}
          {!isSidebarCollapsed && (
            <div className="bg-slate-800/30 border border-slate-800/80 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/10">
                  <img src={avatar.src} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-white block text-sm truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono capitalize tracking-wider mt-0.5 bg-slate-800 px-1.5 py-0.5 rounded w-max">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <div className="bg-slate-900/40 p-2 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Points</span>
                  <span className="font-bold font-mono text-blue-400 text-sm mt-0.5 block">{user.pointsBalance} XP</span>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Rewards</span>
                  <span className="font-bold font-mono text-amber-400 text-sm mt-0.5 block">${user.claimableBalance}</span>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <nav className="space-y-1.5">
            {!isSidebarCollapsed && (
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block px-3 mb-2 font-semibold">
                Learning Portal
              </span>
            )}
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center rounded-xl transition-all group border-l-2
                    ${isSidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'}
                    ${isActive 
                      ? 'bg-blue-600/10 text-white border-blue-500 font-semibold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-transparent'
                    }
                  `}
                  title={item.label}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Bottom */}
        <div className="pt-6 border-t border-slate-800">
          <button
            id="nav-logout-btn"
            onClick={onLogout}
            className={`w-full flex items-center rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all ${isSidebarCollapsed ? 'justify-center px-0 py-2.5' : 'space-x-3 px-3 py-2.5'}`}
            title="Log out"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-400" />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
