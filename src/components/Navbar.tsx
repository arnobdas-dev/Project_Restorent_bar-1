import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Shield, Music, UtensilsCrossed } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  mode: 'beats' | 'bites';
  setMode: (mode: 'beats' | 'bites') => void;
}

export default function Navbar({
  activeSection,
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn,
  mode,
  setMode
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'The Concept', target: 'about' },
    { label: 'The Menu', target: 'menu' },
    { label: 'Events', target: 'events' },
    { label: 'Reservations', target: 'reservations' },
    { label: 'Testimonials', target: 'testimonials' },
    { label: 'Contact', target: 'contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-black/70 backdrop-blur-xl py-4 border-white/5 shadow-2xl'
          : 'bg-transparent py-6 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        {/* LOGO */}
        <button
          onClick={() => {
            const el = document.getElementById('hero');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex items-center gap-3 group cursor-pointer text-left"
        >
          {/* Animated logo shield */}
          <div
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center p-[1px] transition-all duration-500 ${
              mode === 'beats'
                ? 'bg-gradient-to-tr from-pink-500 to-purple-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                : 'bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
            }`}
          >
            <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center">
              {mode === 'beats' ? (
                <Music className="w-4 h-4 text-pink-500 animate-pulse" />
              ) : (
                <UtensilsCrossed className="w-4 h-4 text-amber-500" />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span
              className={`font-sans font-black tracking-wider text-base transition-all duration-300 leading-none ${
                mode === 'beats'
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-400 to-purple-400'
                  : 'font-serif text-white tracking-widest'
              }`}
            >
              ELYSIUM
            </span>
            <span className="font-mono text-[8px] text-zinc-500 tracking-[0.25em] uppercase font-bold mt-0.5">
              {mode === 'beats' ? 'beats & lounge' : 'bites & grill'}
            </span>
          </div>
        </button>

        {/* DUAL MODE SELECTOR BUTTON (ROCKER TOGGLE) */}
        <div className="hidden md:flex relative bg-zinc-900/90 border border-white/5 rounded-full p-1 max-w-[260px] shadow-2xl">
          {/* Sliding indicator */}
          <div
            className={`absolute top-1 bottom-1 rounded-full transition-all duration-500 ease-out ${
              mode === 'bites'
                ? 'left-1 w-[122px] bg-gradient-to-r from-amber-600 to-yellow-500'
                : 'left-[128px] w-[120px] bg-gradient-to-r from-pink-600 to-purple-600'
            }`}
            style={{ zIndex: 0 }}
          />

          <button
            onClick={() => setMode('bites')}
            className={`relative z-10 px-4 py-1.5 rounded-full font-mono text-[9px] tracking-widest uppercase transition-colors duration-300 font-black cursor-pointer flex items-center gap-1.5 ${
              mode === 'bites' ? 'text-black' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UtensilsCrossed className="w-3 h-3" />
            The Bites
          </button>

          <button
            onClick={() => setMode('beats')}
            className={`relative z-10 px-4 py-1.5 rounded-full font-mono text-[9px] tracking-widest uppercase transition-colors duration-300 font-black cursor-pointer flex items-center gap-1.5 ${
              mode === 'beats' ? 'text-white font-extrabold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music className="w-3 h-3" />
            The Beats
          </button>
        </div>

        {/* DESKTOP NAV ITEMS */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-zinc-950/40 border border-white/5 px-2 py-1.5 rounded-full backdrop-blur-md">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => onNavigate(item.target)}
              className={`px-3 py-1.5 rounded-full font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                activeSection === item.target
                  ? mode === 'beats'
                    ? 'text-white bg-pink-500/10 border border-pink-500/20 font-bold'
                    : 'text-white bg-amber-500/10 border border-amber-500/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 border border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* PORTAL ACTIONS */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className={`p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-100 transition-colors relative group cursor-pointer ${
              isAdminLoggedIn && (mode === 'beats' ? 'border-pink-500/30' : 'border-amber-500/30')
            }`}
            title="Admin Portal"
          >
            <Shield className={`w-4 h-4 ${isAdminLoggedIn ? (mode === 'beats' ? 'text-pink-500' : 'text-amber-500') : ''}`} />
            {isAdminLoggedIn && (
              <span className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full animate-ping ${mode === 'beats' ? 'bg-pink-500' : 'bg-amber-500'}`} />
            )}
          </button>

          <button
            onClick={() => onNavigate('reservations')}
            className={`px-4 py-2 rounded-xl font-mono text-[10px] tracking-widest uppercase font-bold transition-all duration-300 cursor-pointer ${
              mode === 'beats'
                ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]'
            }`}
          >
            Book Table
          </button>
        </div>

        {/* MOBILE TOGGLE BUTTONS */}
        <div className="lg:hidden flex items-center gap-2.5">
          {/* Quick mode toggle for mobile */}
          <button
            onClick={() => setMode(mode === 'beats' ? 'bites' : 'beats')}
            className={`w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white transition-colors cursor-pointer ${
              mode === 'beats' ? 'bg-pink-500/10 border-pink-500/20' : 'bg-amber-500/10 border-amber-500/20'
            }`}
          >
            {mode === 'beats' ? <UtensilsCrossed className="w-3.5 h-3.5 text-pink-500" /> : <Music className="w-3.5 h-3.5 text-amber-500" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-zinc-950/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-3.5">
              {navItems.map((item) => (
                <button
                  key={item.target}
                  onClick={() => {
                    onNavigate(item.target);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 text-left font-mono text-[11px] tracking-widest uppercase transition-colors ${
                    activeSection === item.target
                      ? mode === 'beats'
                        ? 'text-pink-500 font-bold'
                        : 'text-amber-500 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="h-[1px] bg-white/5 my-2" />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2 cursor-pointer flex-1 justify-center"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin portal
                </button>

                <button
                  onClick={() => {
                    onNavigate('reservations');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-mono text-[10px] tracking-widest uppercase font-bold cursor-pointer flex-1 text-center justify-center flex transition-all duration-300 ${
                    mode === 'beats' ? 'bg-pink-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  Book Table
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
