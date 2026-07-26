import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ReservationsProps {
  mode: 'beats' | 'bites';
  prefilledEventName: string;
  prefilledType: 'vip' | 'restaurant' | null;
  onClearPrefill: () => void;
}

export default function Reservations({
  mode,
  prefilledEventName,
  prefilledType,
  onClearPrefill
}: ReservationsProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '20:30',
    guests: '4',
    type: 'restaurant', // 'restaurant' | 'vip'
    section: 'Main Dining Hall',
    specialRequests: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync mode and prefilled values
  useEffect(() => {
    const defaultType = prefilledType || (mode === 'beats' ? 'vip' : 'restaurant');
    const defaultSection = defaultType === 'vip' ? 'VIP Lounge Booth' : 'Main Dining Hall';
    
    let defaultRequests = '';
    if (prefilledEventName) {
      defaultRequests = `Booking request linked to event: "${prefilledEventName}".`;
    }

    setFormData((prev) => ({
      ...prev,
      type: defaultType,
      section: defaultSection,
      specialRequests: defaultRequests || prev.specialRequests
    }));
  }, [mode, prefilledEventName, prefilledType]);

  const handleTypeChange = (newType: string) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      section: newType === 'vip' ? 'VIP Lounge Booth' : 'Main Dining Hall'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const payload = await res.json();
      if (res.ok) {
        setSuccessMessage(payload.message || "Your booking has been submitted successfully!");
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '20:30',
          guests: '4',
          type: mode === 'beats' ? 'vip' : 'restaurant',
          section: mode === 'beats' ? 'VIP Lounge Booth' : 'Main Dining Hall',
          specialRequests: ''
        });
        onClearPrefill();
      } else {
        setErrorMessage(payload.error || "Failed to submit booking request. Please check fields.");
      }
    } catch (err) {
      setErrorMessage("Network synchronization failed. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const sectionsList = formData.type === 'vip' 
    ? ['VIP Lounge Booth', 'Backstage VIP Area', 'DJ Booth Side Table', 'Skyline Balcony Box']
    : ['Main Dining Hall', 'Chef\'s Garden Patio', 'Intimate Wine Vault', 'Window View Table'];

  return (
    <section id="reservations" className="py-24 relative overflow-hidden z-10 px-6 bg-zinc-950/20">
      
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute bottom-[10%] left-[15%] w-[350px] h-[350px] rounded-full blur-[130px] ${
          mode === 'beats' ? 'bg-pink-600/5' : 'bg-amber-600/5'
        }`} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold ${
            mode === 'beats' ? 'text-pink-500' : 'text-amber-500'
          }`}>
            Secured Slots
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white ${
            mode === 'beats' ? 'font-syne' : 'font-serif'
          }`}>
            {mode === 'beats' ? 'Request VIP Host' : 'Table Reservation'}
          </h2>
          <div className={`h-[1px] w-12 mx-auto ${mode === 'beats' ? 'bg-pink-500' : 'bg-amber-500'}`} />
        </div>

        {/* Success Card or Form layout */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-md shadow-2xl relative">
          
          <AnimatePresence mode="wait">
            {successMessage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 space-y-6"
              >
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border ${
                  mode === 'beats' ? 'border-pink-500/20 text-pink-400 bg-pink-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                }`}>
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xl text-white">Booking Inquiry Submitted</h3>
                  <p className="font-sans text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    {successMessage}
                  </p>
                </div>

                <button
                  onClick={() => setSuccessMessage(null)}
                  className={`px-6 py-3 rounded-xl font-mono text-[9px] tracking-widest uppercase font-extrabold cursor-pointer transition-colors ${
                    mode === 'beats' ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  Make Another Request
                </button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="flex flex-col space-y-3">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                    Experience Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('restaurant')}
                      className={`py-3.5 rounded-xl border font-mono text-[10px] tracking-widest uppercase font-extrabold cursor-pointer transition-all ${
                        formData.type === 'restaurant'
                          ? 'border-amber-500/40 bg-amber-500/5 text-amber-400 shadow-inner'
                          : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Dining Room
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleTypeChange('vip')}
                      className={`py-3.5 rounded-xl border font-mono text-[10px] tracking-widest uppercase font-extrabold cursor-pointer transition-all ${
                        formData.type === 'vip'
                          ? 'border-pink-500/40 bg-pink-500/5 text-pink-400 shadow-inner'
                          : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      VIP Sound Lounge
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Christian Bale"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-zinc-950/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. christian@bale.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-zinc-950/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 (310) 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-zinc-955/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="flex flex-col space-y-2 md:col-span-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-zinc-955/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Time</label>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="bg-zinc-955/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                    >
                      <option value="17:00">5:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                      <option value="22:00">10:00 PM</option>
                      <option value="23:00">11:00 PM</option>
                      <option value="00:00">12:00 AM</option>
                      <option value="01:00">1:00 AM</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Guests</label>
                    <select
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="bg-zinc-955/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="6">6 Guests</option>
                      <option value="8">8 Guests</option>
                      <option value="10">10+ Guests</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Table Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="bg-zinc-955/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                    >
                      {sectionsList.map((sec, i) => (
                        <option key={i} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-2 md:col-span-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Special Requests</label>
                    <input
                      type="text"
                      placeholder="Window view, birthday cake, specific bottle..."
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className="bg-zinc-955/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 font-sans text-xs">
                    {errorMessage}
                  </div>
                )}

                {prefilledEventName && (
                  <div className={`px-4 py-3 rounded-xl border flex items-center justify-between font-mono text-[10px] tracking-wider uppercase font-bold ${
                    mode === 'beats' ? 'border-pink-500/20 bg-pink-500/10 text-pink-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                  }`}>
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Linked Event: {prefilledEventName}
                    </span>
                    <button
                      type="button"
                      onClick={onClearPrefill}
                      className="underline text-[9px] hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-mono text-xs tracking-widest uppercase font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    loading ? 'opacity-85 pointer-events-none' : ''
                  } ${
                    mode === 'beats'
                      ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing slots...
                    </>
                  ) : (
                    mode === 'beats' ? 'Request VIP Guestlist Booking' : 'Confirm Dinner Booking Request'
                  )}
                </button>

              </motion.form>
            )}
          </AnimatePresence>

        </div>

      </div>

    </section>
  );
}
