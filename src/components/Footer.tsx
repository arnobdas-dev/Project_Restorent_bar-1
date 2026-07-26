import React from 'react';
import { WebsiteSettings } from '../types';
import { Instagram, Facebook, Twitter, Shield } from 'lucide-react';

interface FooterProps {
  settings: WebsiteSettings;
  mode: 'beats' | 'bites';
  onOpenAdmin: () => void;
}

export default function Footer({ settings, mode, onOpenAdmin }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const getSocialIcon = (key: string) => {
    switch (key) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <footer className="border-t border-white/5 bg-zinc-950/60 py-12 relative z-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col items-center md:items-start space-y-1">
          <span className={`font-sans font-black tracking-widest text-sm text-white ${
            mode === 'beats' ? 'text-glow-pink' : 'text-glow-amber'
          }`}>
            ELYSIUM
          </span>
          <span className="font-mono text-[8px] text-zinc-500 tracking-[0.25em] uppercase font-bold">
            sound & taste sanctuary
          </span>
        </div>

        <div className="text-center md:text-left space-y-1.5">
          <p className="font-sans text-[10px] text-zinc-500 font-light">
            © {currentYear} Elysium Lounge LLC. All rights reserved.
          </p>
          <p className="font-sans text-[9px] text-zinc-600 font-light flex items-center justify-center md:justify-start gap-1">
            Designed for premium sensory experiences.
            <button
              onClick={onOpenAdmin}
              className="text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5 ml-1 transition-colors cursor-pointer"
            >
              <Shield className="w-2.5 h-2.5" />
              Portal Access
            </button>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {Object.entries(settings.socialLinks || {}).map(([key, url]) => {
            const icon = getSocialIcon(key);
            if (!url || !icon) return null;
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer ${
                  mode === 'beats' ? 'hover:border-pink-500/20' : 'hover:border-amber-500/20'
                }`}
                title={key}
              >
                {icon}
              </a>
            );
          })}
        </div>

      </div>
    </footer>
  );
}
