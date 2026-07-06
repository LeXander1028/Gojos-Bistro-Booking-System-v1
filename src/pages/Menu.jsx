import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const menu1 = 'https://placehold.co/800x1200/111111/c19a6b?text=Menu+Page+1';
const menu2 = 'https://placehold.co/800x1200/111111/c19a6b?text=Menu+Page+2';

export default function MenuPage() {
  const [loadedImages, setLoadedImages] = useState(0);
  const totalImages = 2;
  const allLoaded = loadedImages >= totalImages;

  return (
    <div className="flex flex-col items-center justify-start min-h-[85vh] px-4 py-12 relative bg-[#111111]">
      
      <div className="w-full max-w-4xl text-center mb-12">
        <span className="text-primary font-serif italic text-sm mb-4 block">Gojo's Bistro</span>
        <h1 className="font-display font-black text-5xl md:text-6xl text-white uppercase leading-[0.9] tracking-tighter">
          OUR MENU
        </h1>
        <div className="w-12 h-1 bg-primary mx-auto mt-6"></div>
      </div>

      <div className="max-w-3xl w-full mx-auto flex flex-col gap-8 relative min-h-[50vh]">
        
        {!allLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-primary bg-[#111111] z-10">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-xs font-semibold tracking-widest uppercase">Loading Menu Images...</p>
          </div>
        )}

        <div className={`flex flex-col gap-12 transition-opacity duration-700 ${allLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-slate-900/20">
            <img 
              src={menu1} 
              alt="Gojo's Bistro Menu Page 1" 
              onLoad={() => setLoadedImages(prev => prev + 1)}
              onError={() => setLoadedImages(prev => prev + 1)}
              className="w-full h-auto object-contain" 
            />
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-slate-900/20">
            <img 
              src={menu2} 
              alt="Gojo's Bistro Menu Page 2" 
              onLoad={() => setLoadedImages(prev => prev + 1)}
              onError={() => setLoadedImages(prev => prev + 1)}
              className="w-full h-auto object-contain" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
