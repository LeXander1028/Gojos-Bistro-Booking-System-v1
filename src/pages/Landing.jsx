import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { VENUE_INFO } from '../lib/constants';
import { MapPin, ArrowRight, Play } from 'lucide-react';
import ImageCarousel from '../components/ImageCarousel';
import CalendarAvailabilityGrid from '../components/CalendarAvailabilityGrid';
import photo4 from '../assets/photo-4.png';
import photo5 from '../assets/photo-5.png';
import photo7 from '../assets/photo-7.png';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen text-[#f3f4f6] font-sans bg-[#111111]">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center bg-[#111111] overflow-hidden">
        <ImageCarousel />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 pt-20">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm">DESTINATION REFRESH</span>
            <h1 className="font-display font-black text-6xl md:text-8xl text-white uppercase leading-[0.9] tracking-tighter">
              FLAVORS<br />AFTER PICKLEBALL
            </h1>
            <p className="text-slate-300 max-w-md text-lg mt-4 leading-relaxed font-medium">
              After a high-energy match on the court, treat yourself to our signature frappes and culinary delights. Experience the perfect blend of competitive sports and premium refreshments.
            </p>
            <div className="mt-8 flex items-start">
              <Button asChild size="lg" className="px-10 py-7 bg-primary text-[#111111] font-bold uppercase tracking-widest text-sm hover:bg-[#a67c00] hover:text-white transition-colors shadow-lg rounded-sm">
                <Link to="/menu">
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
            WHEN FOOD MEETS SPORT.
          </h2>
          <div className="w-12 h-1 bg-primary mb-16"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {/* Feature 1 */}
            <div className="flex flex-col gap-6">
              <div className="aspect-[4/3] overflow-hidden rounded">
                <img src={photo5} alt="Pickleball" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">PICKLEBALL</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Three premium indoor courts designed for casual rallies and competitive play. Perfect your game with our state-of-the-art facilities and dedicated coaching sessions.
              </p>
              <Link to="/gallery/pickleball" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs font-bold text-primary flex items-center gap-2 hover:text-white transition-colors uppercase tracking-widest mt-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-6">
              <div className="aspect-[4/3] overflow-hidden rounded">
                <img src={photo7} alt="Frappes" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">FRAPPES & BEVERAGES</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Cool down with our signature, hand-crafted frappes and artisanal beverages. From classic coffee blends to refreshing fruit infusions, every sip is a reward.
              </p>
              <Link to="/gallery/frappes" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs font-bold text-primary flex items-center gap-2 hover:text-white transition-colors uppercase tracking-widest mt-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-6">
              <div className="aspect-[4/3] overflow-hidden rounded">
                <img src={photo4} alt="Food" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">FOOD & PASTRY</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Indulge in our selection of freshly baked pastries and hearty meals. From savory quick bites to sweet treats, fuel your body with our premium culinary offerings.
              </p>
              <Link to="/gallery/food" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs font-bold text-primary flex items-center gap-2 hover:text-white transition-colors uppercase tracking-widest mt-2">
                Read More <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Split Section: Video & Shop */}
      <section className="bg-[#111111] grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Rates & Info */}
        <div className="p-16 lg:p-24 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
          <span className="text-primary font-serif italic text-sm mb-4">Book Your Game</span>
          <h2 className="font-display font-black text-4xl text-white uppercase leading-[0.9] tracking-tighter mb-10">
            RATES & HOURS
          </h2>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-white font-bold tracking-widest uppercase text-sm">Operating Hours</h3>
              <p className="text-slate-400 text-sm">Open Daily: 6:00 AM – 12:00 Midnight</p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-white font-bold tracking-widest uppercase text-sm">Regular Rates</h3>
              <p className="text-slate-400 text-sm">₱600.00 / Hour per Court</p>
              <p className="text-slate-500 text-xs italic">Maximum of 4 players per court.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-primary font-bold tracking-widest uppercase text-sm">Morning Promo</h3>
                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded uppercase font-bold">Mon - Thu</span>
              </div>
              <p className="text-slate-400 text-sm">₱300.00 / Person</p>
              <p className="text-slate-500 text-xs italic">Valid from 6:00 AM to 12:00 NN.</p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Button asChild size="lg" className="w-fit px-8 py-6 bg-primary text-[#111111] font-bold uppercase tracking-widest text-xs hover:bg-[#a67c00] hover:text-white transition-colors rounded-sm shadow-lg shadow-primary/20">
                <Link to={user ? "/book" : "/login"}>
                  BOOK A COURT NOW
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Schedules Calendar */}
        <div className="bg-white lg:p-12 flex flex-col items-center justify-center text-center">
          <CalendarAvailabilityGrid />
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
              Located in Prenza, Balamban. The perfect escape for signature frappes, culinary delights, and a great game of pickleball.
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
              src="https://maps.google.com/maps?q=10.5041294,123.7282914&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
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
