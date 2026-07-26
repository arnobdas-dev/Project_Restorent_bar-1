import React from 'react';
import { motion } from 'motion/react';
import { Testimonial } from '../types';
import { Quote } from 'lucide-react';

interface TestimonialsProps {
  testimonials: Testimonial[];
  mode: 'beats' | 'bites';
}

export default function Testimonials({ testimonials, mode }: TestimonialsProps) {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden z-10 px-6">
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold ${
            mode === 'beats' ? 'text-pink-500' : 'text-amber-500'
          }`}>
            Vibe Check
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white ${
            mode === 'beats' ? 'font-syne' : 'font-serif'
          }`}>
            The Guest Journals
          </h2>
          <div className={`h-[1px] w-12 mx-auto ${mode === 'beats' ? 'bg-pink-500' : 'bg-amber-500'}`} />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md relative flex flex-col justify-between hover:border-white/10 transition-colors shadow-2xl space-y-6"
            >
              
              <div className="space-y-4">
                <Quote className={`w-8 h-8 opacity-25 ${mode === 'beats' ? 'text-pink-500' : 'text-amber-500'}`} />
                <p className="font-sans font-light text-zinc-300 text-sm md:text-base leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                <img
                  src={t.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div className="flex flex-col">
                  <span className="font-sans font-bold text-xs text-white">
                    {t.name}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-0.5">
                    {t.role}
                  </span>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              No guest reviews loaded.
            </span>
          </div>
        )}

      </div>

    </section>
  );
}
