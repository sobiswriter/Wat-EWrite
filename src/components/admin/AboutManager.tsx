import React, { useState, useRef } from 'react';
import { useBlog } from '../../context/BlogContext';
import { AboutPrinciple } from '../../types';
import {
  User,
  MapPin,
  Feather,
  Plus,
  Trash2,
  CheckCircle2,
  Globe,
  Instagram,
  Github,
  Linkedin,
  Mail,
  Sliders,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Camera,
  RefreshCw
} from 'lucide-react';

export const AboutManager: React.FC = () => {
  const { settings, updateSettings } = useBlog();
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  const [authorName, setAuthorName] = useState(settings.authorName || 'Linus Lee & Julian Vance');
  const [authorRole, setAuthorRole] = useState(settings.authorRole || 'Editorial Collective');
  const [authorLocation, setAuthorLocation] = useState(settings.authorLocation || 'San Francisco, California');
  const [authorAvatar, setAuthorAvatar] = useState(settings.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
  const [authorBio, setAuthorBio] = useState(settings.authorBio || 'Writers, engineers, and researchers exploring human-computer interaction, spatial software, and digital typography.');
  
  const [aboutEditorialThesis, setAboutEditorialThesis] = useState(
    settings.aboutEditorialThesis ||
      `The modern digital landscape is overwhelmed with noise: ephemeral timelines, clickbait hype cycles, and superficial feature races. ${settings.blogName} exists as a publication for deliberate thought, lasting tools, and human-computer symbiosis.`
  );
  
  const [aboutEditorialSubtitle, setAboutEditorialSubtitle] = useState(
    settings.aboutEditorialSubtitle ||
      'We explore software engineering with the reverence of an artisanal craft. Exceptional software is quiet, durable, fast, and crafted with deep respect for typography and human attention.'
  );

  const [principles, setPrinciples] = useState<AboutPrinciple[]>(() => {
    return settings.aboutPrinciples && settings.aboutPrinciples.length > 0
      ? settings.aboutPrinciples
      : [
          {
            number: '01',
            title: 'Dignity of Subtraction',
            desc: 'We measure tool quality by how much unnecessary complexity we can safely remove without sacrificing capability.'
          },
          {
            number: '02',
            title: 'Optical Typography',
            desc: 'Typography is the interface. Mathematical step scales and baseline rhythm provide effortless reading comfort.'
          },
          {
            number: '03',
            title: 'Enduring Architecture',
            desc: 'We favor foundational primitives and clean architecture that will endure decades rather than ephemeral trend cycles.'
          }
        ];
  });

  const [aboutColophon, setAboutColophon] = useState(
    settings.aboutColophon ||
      'This publication is typeset in Plus Jakarta Sans for interface and headings and Fraunces for editorial accents and pull quotes. Monospace code blocks are rendered in JetBrains Mono.'
  );

  const [instagram, setInstagram] = useState(settings.socialLinks?.instagram || 'https://instagram.com/sobi');
  const [github, setGithub] = useState(settings.socialLinks?.github || 'https://github.com');
  const [linkedin, setLinkedin] = useState(settings.socialLinks?.linkedin || 'https://linkedin.com');
  const [website, setWebsite] = useState(settings.socialLinks?.website || 'https://sobi.codes');
  const [email, setEmail] = useState(settings.socialLinks?.email || 'editorial@watewrites.dev');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const AVATAR_PRESETS = [
    { label: 'Minimal Studio Portrait', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { label: 'Creative Architect', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
    { label: 'Design Engineer', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
    { label: 'Editorial Collective Monogram', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&auto=format&fit=crop&q=80' }
  ];

  const handleAvatarFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setAuthorAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePrincipleChange = (index: number, field: keyof AboutPrinciple, value: string) => {
    const updated = [...principles];
    updated[index][field] = value;
    setPrinciples(updated);
  };

  const handleAddPrinciple = () => {
    const nextNum = (principles.length + 1).toString().padStart(2, '0');
    setPrinciples([...principles, { number: nextNum, title: 'New Principle', desc: 'Describe this guiding value.' }]);
  };

  const handleRemovePrinciple = (index: number) => {
    setPrinciples(principles.filter((_, i) => i !== index));
  };

  const handleSaveAbout = () => {
    updateSettings({
      authorName,
      authorRole,
      authorLocation,
      authorAvatar,
      authorBio,
      aboutEditorialThesis,
      aboutEditorialSubtitle,
      aboutPrinciples: principles,
      aboutColophon,
      socialLinks: {
        instagram: instagram.trim() || undefined,
        github: github.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        website: website.trim() || undefined,
        email: email.trim() || undefined
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F3F1EC] text-[#D44D2E] text-xs font-mono font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Editorial Identity</span>
          </div>
          <h2 className="text-2xl font-bold font-sans text-[#111111] tracking-tight">
            About Section & Author Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Customize author credentials, editorial thesis, core guiding principles, colophon, and contact channels.
          </p>
        </div>

        <button
          onClick={handleSaveAbout}
          className="px-5 py-2.5 bg-[#D44D2E] hover:bg-[#B83C1F] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>About Section Saved!</span>
            </>
          ) : (
            <>
              <Sliders className="w-4 h-4" />
              <span>Save About Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Author & Collective Info */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-6">
        <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2 border-b border-[#E5E2DC] pb-3">
          <User className="w-4 h-4 text-[#D44D2E]" />
          <span>Author & Collective Details</span>
        </h3>

        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar Desktop Dropzone & Preview */}
          <div className="space-y-3 shrink-0 w-full sm:w-auto flex flex-col items-center sm:items-start">
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleAvatarFileUpload(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDraggingAvatar(true);
              }}
              onDragLeave={() => setIsDraggingAvatar(false)}
              onDrop={handleAvatarDrop}
              onClick={() => avatarFileInputRef.current?.click()}
              className={`relative group w-32 h-32 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                isDraggingAvatar
                  ? 'border-[#D44D2E] ring-4 ring-[#D44D2E]/20 scale-105'
                  : 'border-[#E5E2DC] hover:border-[#111111] shadow-xs'
              }`}
              title="Click or drag image from desktop to change profile picture"
            >
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[11px] font-bold">Change Photo</span>
                <span className="text-[9px] opacity-80">Drag file or click</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#111111] hover:bg-[#333333] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-[#D44D2E]" />
                <span>Upload Picture</span>
              </button>
            </div>

            <div className="text-[11px] text-[#777777] max-w-[220px]">
              <span className="font-semibold block mb-1">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAuthorAvatar(p.url)}
                    className="px-2 py-0.5 bg-[#F3F1EC] hover:bg-[#E5E2DC] text-[#111111] rounded text-[10px] cursor-pointer"
                  >
                    Preset {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                Author / Collective Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs font-semibold text-[#111111] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                Role / Title
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value)}
                placeholder="e.g. Editorial Collective"
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={authorLocation}
                onChange={e => setAuthorLocation(e.target.value)}
                placeholder="e.g. San Francisco, California"
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                Custom Avatar Image URL
              </label>
              <input
                type="text"
                value={authorAvatar}
                onChange={e => setAuthorAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/... or data:image/..."
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs font-mono text-[#111111] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                Author Short Bio
              </label>
              <textarea
                rows={2}
                value={authorBio}
                onChange={e => setAuthorBio(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] leading-relaxed focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Thesis & Mission */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2 border-b border-[#E5E2DC] pb-3">
          <Feather className="w-4 h-4 text-[#D44D2E]" />
          <span>The Editorial Thesis & Narrative</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-[#444444] mb-1.5">
            Primary Thesis Statement
          </label>
          <textarea
            rows={3}
            value={aboutEditorialThesis}
            onChange={e => setAboutEditorialThesis(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] leading-relaxed focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#444444] mb-1.5">
            Secondary Philosophy / Craft Manifesto
          </label>
          <textarea
            rows={2}
            value={aboutEditorialSubtitle}
            onChange={e => setAboutEditorialSubtitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] leading-relaxed focus:outline-hidden"
          />
        </div>
      </div>

      {/* Guiding Principles Cards Manager */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-3">
          <div>
            <h3 className="font-bold text-sm text-[#111111]">
              Guiding Principles (Cards in About Page)
            </h3>
            <p className="text-xs text-[#777777]">
              The numbered tenets explaining your editorial and engineering philosophy.
            </p>
          </div>
          <button
            onClick={handleAddPrinciple}
            className="px-3 py-1.5 bg-[#F3F1EC] hover:bg-[#E5E2DC] text-[#111111] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Principle</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {principles.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl space-y-2.5 relative group"
            >
              <button
                onClick={() => handleRemovePrinciple(idx)}
                className="absolute top-2.5 right-2.5 p-1 text-[#999999] hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove principle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.number}
                  onChange={e => handlePrincipleChange(idx, 'number', e.target.value)}
                  className="w-12 px-2 py-1 bg-white border border-[#E5E2DC] rounded font-mono text-xs font-bold text-[#111111] text-center"
                />
                <input
                  type="text"
                  value={item.title}
                  placeholder="Principle Title"
                  onChange={e => handlePrincipleChange(idx, 'title', e.target.value)}
                  className="flex-1 px-2.5 py-1 bg-white border border-[#E5E2DC] rounded text-xs font-bold text-[#111111]"
                />
              </div>

              <textarea
                rows={3}
                value={item.desc}
                placeholder="Description of principle..."
                onChange={e => handlePrincipleChange(idx, 'desc', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2DC] rounded text-xs text-[#555555] leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Colophon & Social Channels */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-2xs space-y-6">
        <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2 border-b border-[#E5E2DC] pb-3">
          <Globe className="w-4 h-4 text-[#D44D2E]" />
          <span>Colophon & Social Channels</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-[#444444] mb-1.5">
            Colophon / Typography Credit
          </label>
          <textarea
            rows={2}
            value={aboutColophon}
            onChange={e => setAboutColophon(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] leading-relaxed focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
              <span>Instagram</span>
            </label>
            <input
              type="text"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              placeholder="https://instagram.com/username"
              className="w-full px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-[#555555]" />
              <span>GitHub</span>
            </label>
            <input
              type="text"
              value={github}
              onChange={e => setGithub(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-[#555555]" />
              <span>LinkedIn</span>
            </label>
            <input
              type="text"
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#555555]" />
              <span>Website</span>
            </label>
            <input
              type="text"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://yourdomain.com"
              className="w-full px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#444444] mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#555555]" />
              <span>Editorial Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="editorial@domain.com"
              className="w-full px-3 py-1.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-lg text-xs text-[#111111] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
