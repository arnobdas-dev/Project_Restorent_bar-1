import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AppData } from './types';
import defaultData from './db/data.json';

// Importing Custom Layout & Design Components
import ClubCanvas from './components/ClubCanvas';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Events from './components/Events';
import Reservations from './components/Reservations';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [data, setData] = useState<AppData | null>(defaultData as unknown as AppData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Beats & Bites Mode: 'beats' (Night Club) | 'bites' (Restaurant)
  const [mode, setMode] = useState<'beats' | 'bites'>('bites');

  // Event prefill booking states
  const [prefilledEventName, setPrefilledEventName] = useState<string>('');
  const [prefilledType, setPrefilledType] = useState<'vip' | 'restaurant' | null>(null);

  const loadWebsiteData = async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
        if (payload.settings?.clubName) {
          document.title = `${payload.settings.clubName} – ${mode === 'beats' ? 'Beats Lounge' : 'Culinary Bistro'}`;
        }
      }
    } catch (err) {
      // Quietly use default JSON fallback
    }
  };

  const verifySessionStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const payload = await res.json();
        setIsAdminLoggedIn(payload.authenticated);
      }
    } catch (err) {
      setIsAdminLoggedIn(false);
    }
  };

  const isSecretAdminRoute = (path: string) => {
    try {
      const decoded = decodeURIComponent(path);
      return decoded === "/Arnob's_admin" || path === "/Arnob's_admin";
    } catch {
      return path === "/Arnob's_admin" || path === "/Arnob%27s_admin";
    }
  };

  useEffect(() => {
    loadWebsiteData();
    verifySessionStatus();

    if (isSecretAdminRoute(window.location.pathname)) {
      setShowAdmin(true);
    }

    const handlePopState = () => {
      setShowAdmin(isSecretAdminRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    
    // Increment visit analytics on load
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'visit' })
    }).catch(() => {});

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (data?.settings?.clubName) {
      document.title = `${data.settings.clubName} – ${mode === 'beats' ? 'Beats Lounge' : 'Culinary Bistro'}`;
    }
  }, [mode, data]);

  // Section Observer for navbar highlighting
  useEffect(() => {
    const sections = ['about', 'menu', 'events', 'reservations', 'testimonials', 'contact'];
    
    const handleScrollObserver = () => {
      const scrollPos = window.scrollY + 200;
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const offsetTop = el.offsetTop;
          const offsetHeight = el.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollObserver);
    return () => window.removeEventListener('scroll', handleScrollObserver);
  }, []);

  const handleOpenAdminPortal = () => {
    setShowAdmin(true);
    window.history.pushState({}, '', "/Arnob's_admin");
  };

  const handleCloseAdminPortal = () => {
    setShowAdmin(false);
    window.history.pushState({}, '', '/');
    verifySessionStatus();
    loadWebsiteData();
  };

  const handleNavigate = (targetSection: string) => {
    const el = document.getElementById(targetSection);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(targetSection);
    }
  };

  const handleSetMode = (newMode: 'beats' | 'bites') => {
    setMode(newMode);
  };

  const handleBookEvent = (eventName: string, isVip: boolean) => {
    setPrefilledEventName(eventName);
    setPrefilledType(isVip ? 'vip' : 'restaurant');
    handleNavigate('reservations');
  };

  const handleClearPrefill = () => {
    setPrefilledEventName('');
    setPrefilledType(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0B0F] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 p-[1px] animate-spin mb-4">
          <div className="w-full h-full rounded-[15px] bg-[#0B0B0F] flex items-center justify-center">
            <span className="font-mono text-base font-bold text-white">E</span>
          </div>
        </div>
        <h1 className="font-sans text-lg font-light text-white tracking-widest animate-pulse">
          PREPARING SENSORY LAB
        </h1>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0B0F] flex items-center justify-center p-6">
        <div className="max-w-md bg-[#14141A] border border-red-500/10 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
          <h2 className="font-sans text-lg font-medium text-white">Sanctuary Link Interrupted</h2>
          <p className="font-sans text-xs text-zinc-400 leading-relaxed">
            {error || "An unexpected database synchronization failure has occurred."}
          </p>
          <button
            onClick={loadWebsiteData}
            className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl font-mono text-xs uppercase transition-colors cursor-pointer"
          >
            Re-Link Database
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#070709] text-zinc-300 selection:bg-pink-500/20 selection:text-white overflow-x-hidden font-sans">
      
      <CustomCursor mode={mode} />

      <ClubCanvas mode={mode} />

      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAdmin={handleOpenAdminPortal}
        isAdminLoggedIn={isAdminLoggedIn}
        mode={mode}
        setMode={handleSetMode}
      />

      <AnimatePresence>
        {showAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            <AdminDashboard
              onClose={handleCloseAdminPortal}
              onRefreshAllData={loadWebsiteData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`relative z-10 transition-all duration-700 ${showAdmin ? 'blur-lg scale-[0.99] pointer-events-none' : ''}`}>
        
        {data.settings.sectionsVisibility.hero && (
          <Hero
            settings={data.settings}
            mode={mode}
            onNavigate={handleNavigate}
          />
        )}

        {data.settings.sectionsVisibility.about && (
          <About
            settings={data.settings}
            mode={mode}
          />
        )}

        {data.settings.sectionsVisibility.menu && (
          <Menu
            menuItems={data.menu || []}
            mode={mode}
          />
        )}

        {data.settings.sectionsVisibility.events && (
          <Events
            events={data.events || []}
            mode={mode}
            onBookEvent={handleBookEvent}
          />
        )}

        {data.settings.sectionsVisibility.reservations && (
          <Reservations
            mode={mode}
            prefilledEventName={prefilledEventName}
            prefilledType={prefilledType}
            onClearPrefill={handleClearPrefill}
          />
        )}

        {data.settings.sectionsVisibility.testimonials && (
          <Testimonials
            testimonials={data.testimonials || []}
            mode={mode}
          />
        )}

        {data.settings.sectionsVisibility.contact && (
          <Contact
            settings={data.settings}
            mode={mode}
          />
        )}

        <Footer
          settings={data.settings}
          mode={mode}
          onOpenAdmin={handleOpenAdminPortal}
        />

      </main>

    </div>
  );
}
