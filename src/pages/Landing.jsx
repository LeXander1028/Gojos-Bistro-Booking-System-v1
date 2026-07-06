import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { VENUE_INFO } from '../lib/constants';
import { MapPin, ArrowRight, Play } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen text-[#f3f4f6] font-sans bg-[#111111]">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center bg-[#111111] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=2000" alt="Coffee and Bistro" className="w-full h-full object-cover opacity-40 object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 pt-20">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm">DESTINATION REFRESH</span>
            <h1 className="font-display font-black text-6xl md:text-8xl text-white uppercase leading-[0.9] tracking-tighter">
              COFFEE<br />AFTER PICKLEBALL
            </h1>
            <p className="text-slate-300 max-w-md text-lg mt-4 leading-relaxed font-medium">
              Vestibulum commodo sapien non elit porttitor, vitae volutpat nibh mollis. Experience the perfect blend of competitive sports and premium coffee.
            </p>
            <div className="mt-8 flex items-start">
              <Button asChild size="lg" className="px-10 py-7 bg-primary text-[#111111] font-bold uppercase tracking-widest text-sm hover:bg-[#a67c00] hover:text-white transition-colors shadow-lg rounded-sm">
                <Link to={user ? "/book" : "/login"}>
                  CHECK OUR MENU
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Happens Here Section */}
      <section id="features" className="bg-[#1a1a1a] py-24 px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <span className="text-primary font-serif italic text-sm mb-4">What Happens Here</span>
          <h2 className="font-display font-black text-4xl text-white uppercase leading-[0.9] tracking-tighter mb-4">
            WHEN COFFEE MEETS SPORT.
          </h2>
          <div className="w-12 h-1 bg-primary mb-16"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {/* Feature 1 */}
            <div className="flex flex-col gap-6">
              <div className="aspect-[4/3] overflow-hidden rounded">
                <img src="https://images.unsplash.com/photo-1622227432807-91eb59a23531?auto=format&fit=crop&q=80&w=800" alt="Pickleball" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">PICKLEBALL</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <Link to="/book" className="text-xs font-bold text-primary flex items-center gap-2 hover:text-white transition-colors uppercase tracking-widest mt-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-6">
              <div className="aspect-[4/3] overflow-hidden rounded">
                <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800" alt="Coffee" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">COFFEE & BEVERAGE</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <Link to="/menu" className="text-xs font-bold text-primary flex items-center gap-2 hover:text-white transition-colors uppercase tracking-widest mt-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-6">
              <div className="aspect-[4/3] overflow-hidden rounded">
                <img src="https://images.unsplash.com/photo-1550461716-c0353c7a0364?auto=format&fit=crop&q=80&w=800" alt="Food" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">FOOD & PASTRY</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <Link to="/menu" className="text-xs font-bold text-primary flex items-center gap-2 hover:text-white transition-colors uppercase tracking-widest mt-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Split Section: Video & Shop */}
      <section className="bg-[#111111] grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Video Promo */}
        <div className="p-16 lg:p-24 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
          <span className="text-primary font-serif italic text-sm mb-4">Watch</span>
          <h2 className="font-display font-black text-4xl text-white uppercase leading-[0.9] tracking-tighter mb-8">
            GOJO'S OPENING
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
          </p>
          <button className="flex items-center gap-4 group w-fit">
            <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-[#111111] transition-all">
              <Play size={16} fill="currentColor" className="ml-1" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-primary transition-colors">Play Video</span>
          </button>
        </div>

        {/* Right Side: Pro Shop */}
        <div className="bg-white p-16 lg:p-24 flex flex-col items-center justify-center text-center">
          <span className="text-[#a67c00] font-serif italic text-sm mb-4">Take A Look Our</span>
          <h2 className="font-display font-black text-4xl text-[#111111] uppercase leading-[0.9] tracking-tighter mb-12">
            PRO SHOP
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
            {/* Item 1 */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="bg-gray-100 w-full aspect-square mb-4 flex items-center justify-center p-4">
                <img src="https://placehold.co/200x200/e2e8f0/64748b?text=Paddle" alt="Paddle" className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="font-bold text-[#111111] text-[10px] uppercase tracking-wider mb-2">Pro Carbon Paddle</h4>
              <span className="text-xs text-gray-500">₱4,500.00</span>
            </div>
            {/* Item 2 */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="bg-gray-100 w-full aspect-square mb-4 flex items-center justify-center p-4">
                <img src="https://placehold.co/200x200/e2e8f0/64748b?text=Shirt" alt="Shirt" className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="font-bold text-[#111111] text-[10px] uppercase tracking-wider mb-2">Gojo's Active Shirt</h4>
              <span className="text-xs text-[#a67c00]">₱1,200.00</span>
            </div>
            {/* Item 3 */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="bg-gray-100 w-full aspect-square mb-4 flex items-center justify-center p-4">
                <img src="https://placehold.co/200x200/e2e8f0/64748b?text=Cap" alt="Cap" className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="font-bold text-[#111111] text-[10px] uppercase tracking-wider mb-2">Performance Cap</h4>
              <span className="text-xs text-gray-500">₱850.00</span>
            </div>
          </div>

          <Link to="/popup" className="text-[10px] font-bold text-[#111111] flex items-center gap-2 hover:text-[#a67c00] transition-colors uppercase tracking-widest mt-12">
            GO TO SHOP <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="bg-[#1a1a1a] py-24 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/2">
            <h2 className="font-display font-black text-5xl text-white uppercase leading-[0.9] tracking-tighter mb-8">
              VISIT OUR<br />BISTRO
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Located in Prenza, Balamban. The perfect escape for a good cup of coffee and a great game of pickleball.
            </p>
            <div className="flex items-center gap-4 text-primary font-medium mb-8">
              <MapPin size={24} />
              <span>{VENUE_INFO.address}</span>
            </div>
            <Button asChild className="px-8 py-6 bg-primary text-[#111111] font-bold uppercase tracking-widest text-sm hover:bg-[#a67c00] hover:text-white transition-colors rounded-sm">
              <a href={VENUE_INFO.contact.googleMapsLink} target="_blank" rel="noreferrer">
                OPEN GOOGLE MAPS
              </a>
            </Button>
          </div>
          <div className="md:w-1/2 aspect-video bg-black rounded overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3924.364230883389!2d123.71618331533036!3d10.490710292515433!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a9b1c7c9a6b3cb%3A0x8e8b8c8d8c8d8c8d!2sBalamban%2C%20Cebu!5e0!3m2!1sen!2sph!4v1622227432807!5m2!1sen!2sph" 
              width="100%" 
              height="100%" 
              style={{border:0}} 
              allowFullScreen="" 
              loading="lazy" 
              title="Gojo's Bistro Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
