import React from 'react';
import { useBlog } from '../context/BlogContext';
import { Mail, MapPin, Feather, Globe, Github, Linkedin, Instagram } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { settings } = useBlog();

  const principles = settings.aboutPrinciples || [
    {
      number: "01",
      title: "Dignity of Subtraction",
      desc: "We measure tool quality by how much unnecessary complexity we can safely remove without sacrificing capability."
    },
    {
      number: "02",
      title: "Optical Typography",
      desc: "Typography is the interface. Mathematical step scales and baseline rhythm provide effortless reading comfort."
    },
    {
      number: "03",
      title: "Enduring Architecture",
      desc: "We favor foundational primitives and clean architecture that will endure decades rather than ephemeral trend cycles."
    }
  ];

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 pb-12 border-b border-[#E5E2DC]">
        <img
          src={settings.authorAvatar}
          alt={settings.authorName}
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
          referrerPolicy="no-referrer"
        />

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F3F1EC] text-[#111111] text-xs font-semibold mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#D44D2E]" />
            <span>{settings.authorLocation || 'Church Street, Bengaluru, Karnataka'}</span>
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            {settings.authorName || `About ${settings.blogName}`}
          </h1>

          <p className="mt-2 text-base font-serif italic text-[#D44D2E]">
            {settings.authorRole ? `${settings.authorRole} — ${settings.tagline}` : settings.tagline}
          </p>

          <p className="mt-3 text-sm text-[#666666] leading-relaxed">
            {settings.authorBio || settings.description}
          </p>

          {/* Social Links */}
          <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            {settings.socialLinks.instagram && (
              <a
                href={settings.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E5E2DC] rounded-lg text-xs font-medium text-[#111111] hover:border-[#111111] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                <span>Instagram</span>
              </a>
            )}
            {settings.socialLinks.github && (
              <a
                href={settings.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E5E2DC] rounded-lg text-xs font-medium text-[#111111] hover:border-[#111111] transition-colors"
              >
                <Github className="w-3.5 h-3.5 text-[#666666]" />
                <span>GitHub</span>
              </a>
            )}
            {settings.socialLinks.linkedin && (
              <a
                href={settings.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E5E2DC] rounded-lg text-xs font-medium text-[#111111] hover:border-[#111111] transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#666666]" />
                <span>LinkedIn</span>
              </a>
            )}
            {settings.socialLinks.website && (
              <a
                href={settings.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E5E2DC] rounded-lg text-xs font-medium text-[#111111] hover:border-[#111111] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#666666]" />
                <span>Website</span>
              </a>
            )}
            {settings.socialLinks.email && (
              <a
                href={`mailto:${settings.socialLinks.email}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-medium hover:bg-[#333333] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Editorial</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Editorial Philosophy */}
      <div className="py-12 space-y-8">
        <div>
          <h2 className="font-sans text-2xl font-bold text-[#111111] mb-3">
            The Editorial Thesis
          </h2>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed mb-4">
            {settings.aboutEditorialThesis || `The modern digital landscape is overwhelmed with noise: ephemeral timelines, clickbait hype cycles, and superficial feature races. ${settings.blogName} exists as a publication for deliberate thought, lasting tools, and human-computer symbiosis.`}
          </p>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            {settings.aboutEditorialSubtitle || 'We explore software engineering with the reverence of an artisanal craft. Exceptional software is quiet, durable, fast, and crafted with deep respect for typography and human attention.'}
          </p>
        </div>

        {/* Guiding Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {principles.map((item, idx) => (
            <div key={idx} className="p-6 bg-white rounded-xl border border-[#E5E2DC] shadow-2xs">
              <span className="w-7 h-7 rounded-md bg-[#F3F1EC] text-[#111111] flex items-center justify-center font-bold text-xs mb-3 font-mono">
                {item.number}
              </span>
              <h3 className="font-sans font-bold text-base text-[#111111]">{item.title}</h3>
              <p className="text-xs text-[#666666] mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Colophon */}
        <div className="mt-10 p-6 bg-[#F3F1EC] rounded-xl border border-[#E5E2DC]">
          <h3 className="font-sans font-bold text-sm text-[#111111] mb-2 flex items-center gap-2">
            <Feather className="w-4 h-4 text-[#D44D2E]" />
            <span>Colophon & Typography</span>
          </h3>
          <p className="text-xs text-[#666666] leading-relaxed">
            {settings.aboutColophon || 'This publication is typeset in Plus Jakarta Sans for interface and headings and Fraunces for editorial accents and pull quotes. Monospace code blocks are rendered in JetBrains Mono.'}
          </p>
        </div>
      </div>

    </div>
  );
};
