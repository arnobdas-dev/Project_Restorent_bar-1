import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Play, Pause, ChevronDown } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface HeroProps {
  settings: WebsiteSettings;
  mode: 'beats' | 'bites';
  onNavigate: (section: string) => void;
}

export default function Hero({ settings, mode, onNavigate }: HeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(settings.worldSettings.soundVolume || 0.3);
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync settings when loaded
  useEffect(() => {
    if (settings.worldSettings.ambientAudioUrl) {
      audioRef.current = new Audio(settings.worldSettings.ambientAudioUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [settings.worldSettings.ambientAudioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
      if (isPlaying && !muted) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, muted, volume]);

  const togglePlayback = () => {
    if (muted) {
      setMuted(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden z-10 px-6"
    >
      {/* Immersive background overlay glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mode === 'beats' ? (
          <>
            <div className="absolute top-[25%] left-[20%] w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[25%] right-[20%] w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" />
          </>
        ) : (
          <>
            <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[130px]" />
            <div className="absolute bottom-[20%] right-[25%] w-[400px] h-[400px] bg-yellow-600/5 rounded-full blur-[130px]" />
          </>
        )}
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8 mt-16">
        
        {/* SMALL BADGE */}
        <motion.div
          key={`badge-${mode}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-zinc-900/60 backdrop-blur-md"
        >
          <span className={`w-2 h-2 rounded-full ${mode === 'beats' ? 'bg-pink-500 animate-ping' : 'bg-amber-500'}`} />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] font-extrabold text-zinc-400">
            {mode === 'beats' ? 'The Beats Theater' : 'The Culinary Room'}
          </span>
        </motion.div>

        {/* TITLE */}
        <motion.h1
          key={`title-${mode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white"
        >
          {mode === 'beats' ? (
            <span className="font-syne font-extrabold">
              SOUNDS TO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 text-glow-pink">
                AWAKEN
              </span> YOUR SOUL
            </span>
          ) : (
            <span className="font-serif italic font-normal tracking-wide">
              Flavors Crafted to <br />
              <span className="font-sans font-bold not-italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 text-glow-amber">
                Perfection
              </span>
            </span>
          )}
        </motion.h1>

        {/* TAGLINE */}
        <motion.p
          key={`tagline-${mode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-sans font-light text-zinc-300 text-sm md:text-lg max-w-xl mx-auto leading-relaxed tracking-wide"
        >
          {mode === 'beats' 
            ? 'Step into a world of pure audio frequencies. Outfitted with Funktion-One sound and kinetic laser rigs for elite nightlife seekers.'
            : 'Indulge in a premium gastronomic journey featuring wood-fired A5 cuts, artisanal plates, and tableside smoked cocktails.'
          }
        </motion.p>

        {/* DUAL ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button
            onClick={() => onNavigate('reservations')}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-mono text-xs tracking-widest uppercase font-extrabold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
              mode === 'beats'
                ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_25px_rgba(236,72,153,0.4)]'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_25px_rgba(217,119,6,0.3)]'
            }`}
          >
            {mode === 'beats' ? 'Book VIP Lounge' : 'Reserve Dinner Table'}
          </button>
          
          <button
            onClick={() => onNavigate(mode === 'beats' ? 'events' : 'menu')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono text-xs tracking-widest uppercase font-extrabold cursor-pointer transition-all duration-300 bg-zinc-950/40 hover:bg-zinc-900 border border-white/10 hover:border-white/20 text-white"
          >
            {mode === 'beats' ? 'View DJ Schedule' : 'Explore Menu'}
          </button>
        </motion.div>

        {/* AUDIO CONTROLLER IN NIGHT CLUB MODE */}
        {mode === 'beats' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-10 flex items-center justify-center gap-4"
          >
            <div className="bg-zinc-900/80 border border-white/5 px-4 py-2.5 rounded-full flex items-center gap-3.5 backdrop-blur-md shadow-2xl">
              <button
                onClick={togglePlayback}
                className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 hover:bg-pink-500 hover:text-black transition-all cursor-pointer"
              >
                {isPlaying && !muted ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>
              
              <div className="flex flex-col items-start">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 leading-none">
                  Elysium Radio Loop
                </span>
                <span className="font-sans text-[8px] text-zinc-500 leading-none mt-1">
                  {isPlaying && !muted ? 'Playing deep techno loop...' : 'Sound is muted'}
                </span>
              </div>

              {/* Audio Equalizer bars animation when playing */}
              <div className="flex items-end gap-0.5 h-4 w-8 px-1">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <span
                    key={bar}
                    className={`w-0.5 bg-pink-500 rounded-t-full transition-all duration-300 ${
                      isPlaying && !muted ? 'animate-bounce' : 'h-1'
                    }`}
                    style={{
                      height: isPlaying && !muted ? `${Math.random() * 100}%` : '4px',
                      animationDelay: `${bar * 0.15}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* FOOTER ANCHOR */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <button
          onClick={() => onNavigate('about')}
          className="pointer-events-auto flex flex-col items-center text-zinc-500 hover:text-zinc-300 transition-colors gap-1.5 cursor-pointer group"
        >
          <span className="font-mono text-[8px] tracking-[0.25em] uppercase font-bold">
            Explore Experience
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

    </section>
  );
}
