import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { ViewMode } from '../types';
import { Search, Bookmark, Shield, Menu, X, ChevronDown, Mail } from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenBookmarks,
  onOpenAdmin
}) => {
  const { settings, bookmarks, isAdminLoggedIn } = useBlog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [topicsDropdownOpen, setTopicsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E5E2DC] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        
        {/* Left: Brand Icon + Name */}
        <div className="flex items-center gap-8">
          <button
            id="nav-brand-logo"
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-[#111111] text-white flex items-center justify-center font-serif text-base font-bold shadow-xs group-hover:bg-[#D44D2E] transition-colors">
              {settings.blogName.charAt(0) || 'W'}
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-[#111111] group-hover:text-[#D44D2E] transition-colors">
              {settings.blogName}
            </span>
          </button>

          {/* Desktop Navigation Links (Notion Editorial Style) */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <button
              id="nav-link-essays"
              onClick={() => {
                if (currentView === 'home') {
                  const el = document.getElementById('essays-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                } else {
                  onNavigate('home');
                }
              }}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'home' || currentView === 'post'
                  ? 'text-[#111111] font-semibold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Essays
            </button>

            <button
              id="nav-link-archive"
              onClick={() => onNavigate('archive')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'archive'
                  ? 'text-[#111111] font-semibold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Topics & Archive
            </button>

            <button
              id="nav-link-newsletter"
              onClick={() => onNavigate('newsletter')}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'newsletter'
                  ? 'text-[#111111] font-semibold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#D44D2E]" />
              The Dispatch
            </button>

            <button
              id="nav-link-about"
              onClick={() => onNavigate('about')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'about'
                  ? 'text-[#111111] font-semibold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search */}
          <button
            id="nav-btn-search"
            onClick={onOpenSearch}
            className="p-2 text-[#666666] hover:text-[#111111] hover:bg-[#F3F1EC] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Search articles (⌘K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline text-[#888888] bg-[#EBE8E3] px-1.5 py-0.5 rounded text-[10px] font-mono">
              ⌘K
            </span>
          </button>

          {/* Bookmarks Counter */}
          <button
            id="nav-btn-bookmarks"
            onClick={onOpenBookmarks}
            className="relative p-2 text-[#666666] hover:text-[#111111] hover:bg-[#F3F1EC] rounded-lg transition-colors cursor-pointer"
            title="Reading List"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#111111] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </button>

          {/* Newsletter Subscribe Pill Button */}
          <button
            id="nav-btn-subscribe"
            onClick={() => onNavigate('newsletter')}
            className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            Subscribe Free
          </button>

          {/* Admin Studio Suite */}
          <button
            id="nav-btn-admin"
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              isAdminLoggedIn
                ? 'bg-[#EFEFEF] text-[#111111] font-semibold border border-[#D3CEC4]'
                : 'text-[#777777] hover:text-[#111111] hover:bg-[#F3F1EC]'
            }`}
            title={isAdminLoggedIn ? "Admin Dashboard Active" : "Admin Login"}
          >
            <Shield className="w-3.5 h-3.5 text-[#D44D2E]" />
            <span className="hidden sm:inline">
              {isAdminLoggedIn ? 'Studio' : 'Admin'}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="nav-btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#666666] hover:text-[#111111] rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E2DC] bg-[#FFFFFF] px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              currentView === 'home' ? 'bg-[#EFEFEF] text-[#111111] font-semibold' : 'text-[#666666]'
            }`}
          >
            Essays & Stories
          </button>
          <button
            onClick={() => {
              onNavigate('archive');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              currentView === 'archive' ? 'bg-[#EFEFEF] text-[#111111] font-semibold' : 'text-[#666666]'
            }`}
          >
            Topics & Archive
          </button>
          <button
            onClick={() => {
              onNavigate('newsletter');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between cursor-pointer ${
              currentView === 'newsletter' ? 'bg-[#F9EBE7] text-[#942C17] font-semibold' : 'text-[#666666]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#D44D2E]" />
              The Sunday Dispatch
            </span>
            <span className="text-[10px] bg-[#EFEFEF] text-[#111111] px-2 py-0.5 rounded font-medium">
              Weekly
            </span>
          </button>
          <button
            onClick={() => {
              onNavigate('about');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              currentView === 'about' ? 'bg-[#EFEFEF] text-[#111111] font-semibold' : 'text-[#666666]'
            }`}
          >
            About
          </button>
        </div>
      )}
    </header>
  );
};
