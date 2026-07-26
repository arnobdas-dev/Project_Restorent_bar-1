import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem } from '../types';
import { Wine, Utensils, IceCream, Star } from 'lucide-react';

interface MenuProps {
  menuItems: MenuItem[];
  mode: 'beats' | 'bites';
}

type TabType = 'food' | 'drink' | 'dessert';

export default function Menu({ menuItems, mode }: MenuProps) {
  const [activeTab, setActiveTab] = useState<TabType>('food');

  useEffect(() => {
    setActiveTab(mode === 'beats' ? 'drink' : 'food');
  }, [mode]);

  const filteredItems = menuItems.filter((item) => item.category === activeTab);

  const tabs: { type: TabType; label: string; icon: React.ComponentType<any> }[] = [
    { type: 'food', label: 'Signature Bites', icon: Utensils },
    { type: 'drink', label: 'Mixology & Drinks', icon: Wine },
    { type: 'dessert', label: 'Sweet Finales', icon: IceCream },
  ];

  return (
    <section id="menu" className="py-24 relative overflow-hidden z-10 px-6 bg-zinc-950/20">
      
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full blur-[120px] ${
          mode === 'beats' ? 'bg-purple-600/5' : 'bg-amber-600/5'
        }`} />
        <div className={`absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full blur-[120px] ${
          mode === 'beats' ? 'bg-pink-600/5' : 'bg-yellow-600/5'
        }`} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold ${
            mode === 'beats' ? 'text-pink-500' : 'text-amber-500'
          }`}>
            Menu Selection
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-white ${
            mode === 'beats' ? 'font-syne' : 'font-serif'
          }`}>
            The Alchemist Table
          </h2>
          <div className={`h-[1px] w-12 mx-auto ${mode === 'beats' ? 'bg-pink-500' : 'bg-amber-500'}`} />
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-12">
          <div className="flex gap-1.5 p-1.5 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.type;
              return (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-[10px] tracking-widest uppercase font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? mode === 'beats'
                        ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                        : 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Cards List */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                layout
                key={item.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative flex flex-col h-full bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors shadow-2xl"
              >
                
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none p-[1px] rounded-2xl ${
                  mode === 'beats'
                    ? 'bg-gradient-to-tr from-pink-500/20 to-purple-500/20'
                    : 'bg-gradient-to-tr from-amber-500/20 to-yellow-500/20'
                }`} />

                {/* Card Image */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />

                  {item.isSpecial && (
                    <span className={`absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[8px] font-mono tracking-widest font-black uppercase ${
                      mode === 'beats'
                        ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Specialty
                    </span>
                  )}

                  <span className={`absolute bottom-4 right-4 font-mono text-lg font-black tracking-tight ${
                    mode === 'beats' ? 'text-pink-400' : 'text-amber-400'
                  }`}>
                    ${item.price}
                  </span>
                </div>

                {/* Card Info details */}
                <div className="p-5 flex-1 flex flex-col space-y-3 relative z-10 bg-zinc-900/10">
                  <h3 className="font-sans font-bold text-sm text-white tracking-wide leading-snug">
                    {item.title}
                  </h3>
                  
                  <p className="font-sans text-xs text-zinc-400 leading-relaxed font-light flex-1">
                    {item.description}
                  </p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-zinc-950/80 border border-white/5 font-mono text-[8px] tracking-wide text-zinc-500 uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/20 border border-white/5 rounded-2xl">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              No menu items registered in this category.
            </span>
          </div>
        )}

      </div>

    </section>
  );
}
