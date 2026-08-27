import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { ViewMode } from '../types';
import { ArrowRight, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenAdmin
}) => {
  const { settings, addSubscriber, subscribers } = useBlog();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const res = addSubscriber(email, undefined, 'post_footer');
    setStatus(res.message);
    if (res.success) {
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#111111] text-[#F9F8F6] border-t border-[#222222] transition-colors mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#2A2A2A]">
          
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white text-[#111111] flex items-center justify-center font-serif font-bold text-sm">
                {settings.blogName ? settings.blogName.charAt(0) : 'W'}
              </div>
              <div className="flex items-baseline gap-1.5 font-sans font-bold text-lg text-white">
                <span>{settings.blogName || "Wat'EWrites"}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#999999] leading-relaxed max-w-sm">
              {settings.description || "Thoughts on the future of work, technology, and craft."}
            </p>
            <div className="pt-2 text-xs text-[#888888]">
              Published with care by <strong>{settings.authorName}</strong>.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D44D2E]">
              Publication
            </h4>
            <ul className="space-y-2 text-xs text-[#CCCCCC]">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Latest Essays
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('archive');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Topics & Archive
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('newsletter');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  The Sunday Dispatch
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About {settings.blogName}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#D44D2E] transition-colors flex items-center gap-1 cursor-pointer text-[#D44D2E]"
                >
                  <Shield className="w-3 h-3" />
                  <span>Studio & Manager</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Newsletter Subscribe */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D44D2E]">
              {settings.newsletterTitle || 'The Sunday Dispatch'}
            </h4>
            <p className="text-xs text-[#999999] leading-relaxed">
              Join {settings.newsletterReadersCount || `${5200 + subscribers.length}+`} founders, designers, and engineers receiving our weekly essay dispatch.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your email address..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-[#888888] text-xs focus:outline-hidden focus:border-[#D44D2E]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#D44D2E] hover:bg-[#B83C1F] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {status && (
                <p className="text-[11px] text-[#D44D2E]">
                  {status}
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <div>
            © {new Date().getFullYear()} {settings.blogName}. An independent publication.
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Crafted with intention, typography & minimal code.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
