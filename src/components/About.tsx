import React from 'react';
import { motion } from 'motion/react';
import { UtensilsCrossed, Music, Award, ShieldCheck } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface AboutProps {
  settings: WebsiteSettings;
  mode: 'beats' | 'bites';
}

export default function About({ settings, mode }: AboutProps) {
  return (
    <section id="about" className="py-24 relative overflow-hidden z-10 px-6">
      
      {/* Background radial overlays */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute top-[40%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] ${
          mode === 'beats' ? 'bg-pink-600/5' : 'bg-amber-600/5'
        }`} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold ${
            mode === 'beats' ? 'text-pink-500' : 'text-amber-500'
          }`}>
            The Story
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white ${
            mode === 'beats' ? 'font-syne' : 'font-serif'
          }`}>
            Dual Spheres of Luxury
          </h2>
          <div className={`h-[1px] w-12 mx-auto ${mode === 'beats' ? 'bg-pink-500' : 'bg-amber-500'}`} />
        </div>

        {/* Two-Column Experience Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Column 1: Image Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
            <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-15 pointer-events-none ${
              mode === 'beats' ? 'bg-pink-500' : 'bg-amber-500'
            }`} />

            <div className="space-y-4">
              <div className="relative group overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
                  alt="Fine Dining Steak"
                  className="w-full h-48 md:h-64 object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-300 font-bold">The Kitchen room</span>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80"
                  alt="Cocktail Crafting"
                  className="w-full h-36 md:h-44 object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-300 font-bold">Mixology Lab</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="relative group overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80"
                  alt="DJ Deck"
                  className="w-full h-36 md:h-44 object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-300 font-bold">DJ Deck Station</span>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80"
                  alt="Crowd Dance Floor"
                  className="w-full h-48 md:h-64 object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-300 font-bold">Sound Theater</span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 2: Text Philosophy details */}
          <div className="lg:col-span-6 space-y-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  mode === 'beats' ? 'border-pink-500/20 text-pink-400 bg-pink-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                }`}>
                  {mode === 'beats' ? <Music className="w-4 h-4" /> : <UtensilsCrossed className="w-4 h-4" />}
                </div>
                <h3 className={`text-xl md:text-2xl font-bold text-white ${mode === 'beats' ? 'font-syne' : 'font-serif'}`}>
                  {mode === 'beats' ? 'The Beats Sanctuary' : 'The Bites Dining room'}
                </h3>
              </div>
              
              <p className="font-sans font-light text-zinc-300 text-sm md:text-base leading-relaxed">
                {mode === 'beats' ? settings.clubAbout : settings.restaurantAbout}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2">
                <Award className={`w-5 h-5 ${mode === 'beats' ? 'text-pink-500' : 'text-amber-500'}`} />
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
                  {mode === 'beats' ? 'Funktion-One System' : 'Michelin Standard'}
                </h4>
                <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
                  {mode === 'beats' 
                    ? 'A custom acoustics layout mapping clean frequencies for distortionless bass feel.'
                    : 'Gourmet plates curated with fresh regional elements and award-winning execution.'
                  }
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2">
                <ShieldCheck className={`w-5 h-5 ${mode === 'beats' ? 'text-pink-500' : 'text-amber-500'}`} />
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
                  {mode === 'beats' ? 'Bespoke VIP Booths' : 'Curated Wine Vault'}
                </h4>
                <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
                  {mode === 'beats'
                    ? 'Personalized premium host attendants, secure escorts, and customized drink bottles.'
                    : 'A hand-selected reserve of aged vintage champagnes and global award wines.'
                  }
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
