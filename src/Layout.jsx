import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Package, Settings, Menu, X, Archive, Printer } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role === 'admin';

  const navItems = [
        { name: 'Home', icon: Package, label: 'Toner finden', show: true },
        { name: 'Admin', icon: Archive, label: 'Verwaltung', show: isAdmin }
      ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Bottom Navigation für Mobile */}
      {user && <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden">
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.filter(n => n.show).map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                  isActive 
                    ? "text-indigo-600 bg-indigo-50" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        </nav>}

        {/* Desktop Sidebar */}
        {user && <aside className="hidden md:fixed md:flex md:flex-col md:left-0 md:top-0 md:h-screen md:w-64 bg-white border-r border-slate-200 z-40">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFCB00' }}>
                    <Printer className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Toner-Lager</h1>
              <p className="text-xs text-slate-500">Lagerverwaltung</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.filter(n => n.show).map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.name;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive 
                      ? "bg-indigo-50 text-indigo-600" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">
                  {user.full_name || user.email}
                </div>
                <div className="text-xs text-slate-500">
                  {isAdmin ? 'Administrator' : 'Mitarbeiter'}
                </div>
              </div>
            </div>
          </div>
          )}
          </aside>}

          {/* Main Content */}
          <main className={user ? "md:ml-64 pb-20 md:pb-0" : ""}>
                    {children}
      </main>
    </div>
  );
}