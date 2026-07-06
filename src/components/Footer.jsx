import React from 'react';
import { VENUE_INFO } from '../lib/constants';
import { MapPin, Phone, Mail, Globe, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-slate-950/70 py-8 px-4 md:px-8 text-slate-400">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About Venue */}
        <div className="flex flex-col gap-3 text-left">
          <span className="font-display font-extrabold tracking-wider text-white">
            GOJO'S <span className="text-primary font-semibold">BISTRO</span>
          </span>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {VENUE_INFO.tagline}. A premium coffee and pickleball spot located in Balamban, Cebu.
          </p>
        </div>

        {/* Location & Directions */}
        <div className="flex flex-col gap-3 text-left">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Find Us</span>
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex gap-2 items-start">
              <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
              <span>{VENUE_INFO.address}</span>
            </div>
            <div className="flex gap-4 mt-1">
              <a 
                href={VENUE_INFO.contact.googleMapsLink} 
                target="_blank" 
                rel="noreferrer" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="flex flex-col gap-3 text-left">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Contact Staff</span>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex gap-2 items-center">
              <Phone size={14} className="text-primary" />
              <span>{VENUE_INFO.contact.phone}</span>
            </div>
            <div className="flex gap-2 items-center">
              <Mail size={14} className="text-primary" />
              <span>{VENUE_INFO.contact.email}</span>
            </div>
            <div className="flex gap-2 items-center">
              <Globe size={14} className="text-primary" />
              <a 
                href={VENUE_INFO.contact.facebook} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:underline hover:text-white"
              >
                Facebook Page
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-white/5 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} Gojo's Bistro. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          <Shield size={12} className="text-primary/50" /> Built for Coffee & Pickleball Lovers
        </p>
      </div>
    </footer>
  );
}
