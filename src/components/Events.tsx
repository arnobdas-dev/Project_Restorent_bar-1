import React from 'react';
import { motion } from 'motion/react';
import { ClubEvent } from '../types';
import { Calendar, Clock, Ticket, Music4 } from 'lucide-react';

interface EventsProps {
  events: ClubEvent[];
  mode: 'beats' | 'bites';
  onBookEvent: (eventTitle: string, isVip: boolean) => void;
}

export default function Events({ events, mode, onBookEvent }: EventsProps) {
  const filteredEvents = events.filter((e) => {
    if (mode === 'beats') return e.category === 'club' || e.category === 'special';
    return e.category === 'restaurant' || e.category === 'special';
  });

  return (
    <section id="events" className="py-24 relative overflow-hidden z-10 px-6">
      
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute top-[30%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[140px] ${
          mode === 'beats' ? 'bg-pink-600/5' : 'bg-amber-600/5'
        }`} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold ${
            mode === 'beats' ? 'text-pink-500' : 'text-amber-500'
          }`}>
            Live Lineup
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white ${
            mode === 'beats' ? 'font-syne' : 'font-serif'
          }`}>
            {mode === 'beats' ? 'Sounds & Residencies' : 'Exclusive Gatherings'}
          </h2>
          <div className={`h-[1px] w-12 mx-auto ${mode === 'beats' ? 'bg-pink-500' : 'bg-amber-500'}`} />
        </div>

        {/* Events Layout */}
        <div className="space-y-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-colors shadow-2xl flex flex-col lg:flex-row gap-6 p-4 lg:p-6"
            >
              <div className="lg:w-1/3 h-52 lg:h-auto min-h-[220px] rounded-2xl overflow-hidden relative">
                <img
                  src={event.image || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent lg:hidden" />
              </div>

              <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
                
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-extrabold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className={`w-3.5 h-3.5 ${mode === 'beats' ? 'text-pink-500' : 'text-amber-500'}`} />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 ${mode === 'beats' ? 'text-pink-500' : 'text-amber-500'}`} />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Ticket className={`w-3.5 h-3.5 ${mode === 'beats' ? 'text-pink-500' : 'text-amber-500'}`} />
                      {event.price === 0 ? 'Free Entry' : `$${event.price} Entry`}
                    </span>
                  </div>

                  <h3 className={`text-xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight ${
                    mode === 'beats' ? 'font-syne' : 'font-serif'
                  }`}>
                    {event.title}
                  </h3>

                  <p className="font-sans text-xs lg:text-sm text-zinc-400 leading-relaxed font-light">
                    {event.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4 border-t border-white/5">
                  {event.djLineup && event.djLineup.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 font-black block">
                        Lineup Selector
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {event.djLineup.map((dj, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-zinc-950/80 border border-white/5 font-mono text-[9px] text-zinc-300 font-bold"
                          >
                            <Music4 className="w-2.5 h-2.5 text-zinc-500" />
                            {dj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onBookEvent(event.title, mode === 'beats')}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-[10px] tracking-widest uppercase font-extrabold cursor-pointer transition-all duration-300 ${
                      mode === 'beats'
                        ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                    }`}
                  >
                    {mode === 'beats' ? 'Book VIP Guestlist' : 'Reserve Event Table'}
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              No events scheduled in this category. Check back soon.
            </span>
          </div>
        )}

      </div>

    </section>
  );
}
