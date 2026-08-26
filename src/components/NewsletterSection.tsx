import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const { settings, subscribers, addSubscriber } = useBlog();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Notion HQ',
    'For Teams',
    'Design Philosophy',
    'Tech'
  ]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topicsList = [
    'Notion HQ',
    'For Teams',
    'Design Philosophy',
    'Tech',
    'Inspiration',
    'Pioneers',
    'Typography'
  ];

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const result = addSubscriber(email, name, 'newsletter_page', selectedTopics);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({ text: result.message, isError: false });
      setEmail('');
      setName('');
    } else {
      setStatusMessage({ text: result.message, isError: true });
    }
  };

  const totalCount = 5200 + subscribers.length;

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F3F1EC] border border-[#E5E2DC] text-[#111111] text-xs font-semibold mb-4">
          <Mail className="w-3.5 h-3.5 text-[#D44D2E]" />
          <span>Sunday Dispatch</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
          {settings.newsletterTitle}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#666666] leading-relaxed font-sans">
          {settings.newsletterSubtitle}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-[#E5E2DC] shadow-2xs p-6 sm:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form & Topic Selectors */}
          <div className="md:col-span-7">
            <h2 className="font-sans text-xl font-bold text-[#111111] mb-1.5">
              Subscribe to the Dispatch
            </h2>
            <p className="text-xs text-[#666666] mb-6">
              Select the topics you are interested in. Sent every Sunday morning at 8:00 AM.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1.5">
                  First Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-sm text-[#111111] focus:outline-hidden focus:border-[#111111] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1.5">
                  Work or Personal Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. elena@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-sm text-[#111111] focus:outline-hidden focus:border-[#111111] transition-all"
                />
              </div>

              {/* Topics Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
                  Topic Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {topicsList.map(topic => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#111111] text-white shadow-2xs'
                            : 'bg-[#F3F1EC] text-[#555555] hover:bg-[#E5E2DC]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-semibold rounded-lg text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                <span>{isSubmitting ? 'Enrolling...' : 'Join 5,200+ Thinkers'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {statusMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${
                    statusMessage.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </form>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-[#777777]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zero spam, zero tracking pixels. Unsubscribe anytime with 1 click.</span>
            </div>
          </div>

          {/* Right Column: Dispatch Highlights & Expectations */}
          <div className="md:col-span-5 bg-[#F9F8F6] rounded-xl p-6 border border-[#E5E2DC] space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#D44D2E]">
                What to Expect
              </span>
              <h3 className="font-sans font-bold text-base text-[#111111] mt-1">
                Every Sunday at 8:00 AM
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-[#444444]">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-[#EFEFEF] text-[#111111] flex items-center justify-center shrink-0 font-mono font-bold text-[11px]">
                  1
                </div>
                <div>
                  <strong className="text-[#111111] block">One Deep Dive Essay</strong>
                  Uncompromising analysis on software architecture, spatial tools, or intentional design.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-[#EFEFEF] text-[#111111] flex items-center justify-center shrink-0 font-mono font-bold text-[11px]">
                  2
                </div>
                <div>
                  <strong className="text-[#111111] block">Three Curated Discoveries</strong>
                  Hidden gems across indie software tools, typography systems, and research papers.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-[#EFEFEF] text-[#111111] flex items-center justify-center shrink-0 font-mono font-bold text-[11px]">
                  3
                </div>
                <div>
                  <strong className="text-[#111111] block">Zero Clickbait</strong>
                  High signal-to-noise ratio crafted by working engineers and designers.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E2DC] flex items-center justify-between text-xs">
              <span className="text-[#777777]">Subscribed Readers</span>
              <span className="font-bold text-[#111111]">{totalCount.toLocaleString()} thinkers</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
