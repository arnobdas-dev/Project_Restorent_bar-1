import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface ContactProps {
  settings: WebsiteSettings;
  mode: 'beats' | 'bites';
}

export default function Contact({ settings, mode }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const payload = await res.json();
      if (res.ok) {
        setSuccess(payload.message || "Message sent successfully!");
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(payload.error || "Failed to submit. Please check parameters.");
      }
    } catch (err) {
      setError("Sync link failed. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden z-10 px-6 bg-zinc-950/20">
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold ${
            mode === 'beats' ? 'text-pink-500' : 'text-amber-500'
          }`}>
            Get in Touch
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white ${
            mode === 'beats' ? 'font-syne' : 'font-serif'
          }`}>
            Connect With Elysium
          </h2>
          <div className={`h-[1px] w-12 mx-auto ${mode === 'beats' ? 'bg-pink-500' : 'bg-amber-500'}`} />
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Column 1: Info & Details & Map */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h3 className={`text-xl font-bold text-white ${mode === 'beats' ? 'font-syne' : 'font-serif'}`}>
                Sanctuary Location
              </h3>
              <p className="font-sans font-light text-zinc-400 text-xs md:text-sm leading-relaxed">
                Connect with our hosts for private event inquiries, customized corporate buyouts, or table bookings.
              </p>
            </div>

            <div className="space-y-4">
              
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5 ${
                  mode === 'beats' ? 'border-pink-500/20 text-pink-400' : 'border-amber-500/20 text-amber-400'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Address</span>
                  <span className="font-sans text-xs text-zinc-300 font-light mt-1 block">{settings.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5 ${
                  mode === 'beats' ? 'border-pink-500/20 text-pink-400' : 'border-amber-500/20 text-amber-400'
                }`}>
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Hotline</span>
                  <span className="font-sans text-xs text-zinc-300 font-light mt-1 block">{settings.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5 ${
                  mode === 'beats' ? 'border-pink-500/20 text-pink-400' : 'border-amber-500/20 text-amber-400'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Email</span>
                  <span className="font-sans text-xs text-zinc-300 font-light mt-1 block">{settings.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5 ${
                  mode === 'beats' ? 'border-pink-500/20 text-pink-400' : 'border-amber-500/20 text-amber-400'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Dining Room</span>
                    <span className="font-sans text-[10px] text-zinc-300 font-light mt-1 block">{settings.hours.restaurant}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-bold block">Beats Lounge</span>
                    <span className="font-sans text-[10px] text-zinc-300 font-light mt-1 block">{settings.hours.club}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Google Map Embed */}
            <div className="rounded-2xl overflow-hidden border border-white/5 h-48 w-full shadow-2xl">
              <iframe
                title="Elysium Lounge Map"
                src={settings.googleMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-75 invert-[90%] contrast-[110%]"
              />
            </div>

          </div>

          {/* Column 2: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
              
              {success ? (
                <div className="text-center py-12 space-y-4">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center border ${
                    mode === 'beats' ? 'border-pink-500/20 text-pink-400 bg-pink-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                  }`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-sans font-bold text-white text-lg">Message Delivered</h4>
                  <p className="font-sans text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {success}
                  </p>
                  <button
                    onClick={() => setSuccess(null)}
                    className={`mt-4 px-5 py-2.5 rounded-xl font-mono text-[9px] tracking-widest uppercase font-extrabold cursor-pointer transition-colors ${
                      mode === 'beats' ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    Send Another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className={`text-xl font-bold text-white mb-6 ${mode === 'beats' ? 'font-syne' : 'font-serif'}`}>
                    Leave a Message
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Your Name</label>
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
                      <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Your Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. christian@bale.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-zinc-950/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Private corporate buyout inquiry..."
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-zinc-955/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Compose Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Share details about your request, dates, size of party, required amenities..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-zinc-955/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all font-sans resize-none"
                    />
                  </div>

                  {error && (
                    <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 font-sans text-xs">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      loading ? 'opacity-80 pointer-events-none' : ''
                    } ${
                      mode === 'beats'
                        ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Delivering message...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Message
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
