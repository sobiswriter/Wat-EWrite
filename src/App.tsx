import React, { useState, useEffect } from 'react';
import { BlogProvider, useBlog } from './context/BlogContext';
import { ViewMode, Post } from './types';
import { Navbar } from './components/Navbar';
import { EditorialLanding } from './components/EditorialLanding';
import { PostList } from './components/PostList';
import { PostView } from './components/PostView';
import { NewsletterSection } from './components/NewsletterSection';
import { AboutSection } from './components/AboutSection';
import { SearchModal } from './components/SearchModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';

function BlogAppContent() {
  const {
    posts,
    activePost,
    setActivePost,
    isAdminLoggedIn,
    logoutAdmin,
    logAnalyticsEvent
  } = useBlog();

  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Track initial page view analytics
  useEffect(() => {
    logAnalyticsEvent('pageview');
  }, []);

  // Handle direct navigation
  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    if (view !== 'post') {
      setActivePost(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = (post: Post) => {
    setActivePost(post);
    setCurrentView('post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Require passkey input every time user requests to enter the studio
  const handleOpenAdmin = () => {
    setIsAdminLoginOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#111111] transition-colors duration-200">
      
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Content Area based on current view */}
      <main className="flex-1">
        {currentView === 'home' && (
          <EditorialLanding onSelectPost={handleSelectPost} />
        )}

        {currentView === 'archive' && (
          <div className="pt-4">
            <PostList onSelectPost={handleSelectPost} />
          </div>
        )}

        {currentView === 'post' && activePost && (
          <PostView
            post={activePost}
            onBack={() => handleNavigate('home')}
            onSelectPost={handleSelectPost}
          />
        )}

        {currentView === 'newsletter' && (
          <NewsletterSection />
        )}

        {currentView === 'about' && (
          <AboutSection />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPost={handleSelectPost}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onSelectPost={handleSelectPost}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Admin Dashboard Suite */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          onClose={() => {
            setIsAdminDashboardOpen(false);
            logoutAdmin();
          }}
          onViewPostLive={(post) => {
            handleSelectPost(post);
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <BlogProvider>
      <BlogAppContent />
    </BlogProvider>
  );
}
