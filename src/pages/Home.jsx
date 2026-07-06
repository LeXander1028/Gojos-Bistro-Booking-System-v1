import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { isBookingUpcoming } from '../utils/bookingLifecycle';
import { getUserBookingStatusLabel, getUserBookingStatusStyles } from '../utils/bookingStatus';
import { Calendar, Trophy, HelpCircle, Activity, Compass, ArrowRight } from 'lucide-react';
import { VENUE_INFO } from '../lib/constants';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function Home() {
  const { user, profile } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBookings: 0, totalHours: 0 });
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadDashboardData() {
      try {
        // Fetch all bookings for this user
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id);

        if (!error && data) {
          // Calculate stats
          const confirmedOrCompleted = data.filter(b => b.status === 'confirmed' || b.status === 'completed');
          const totalHours = confirmedOrCompleted.reduce((acc, curr) => acc + curr.duration_hours, 0);

          setStats({
            totalBookings: confirmedOrCompleted.length,
            totalHours
          });

          // Filter upcoming bookings
          const upcoming = data.filter(b => b.status !== 'cancelled' && isBookingUpcoming(b));

          // Sort by date then start hour
          upcoming.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.start_hour - b.start_hour;
          });

          setUpcomingBookings(upcoming);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour >= 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <div className="flex flex-col gap-8 py-8 px-4 md:px-8 text-left max-w-6xl mx-auto w-full">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/10 rounded-2xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Welcome back, {profile?.name || 'Player'}!
          </h2>
          <p className="text-slate-400 text-sm mt-1">Ready for some pickleball action today?</p>
        </div>
        <Button asChild className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] h-12 px-6">
          <Link to="/book" className="flex flex-row items-center justify-center gap-2 whitespace-nowrap">
            <Calendar size={18} /> Book a Court
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="glass border-white/5 rounded-2xl flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Sessions</p>
            <p className="font-display font-bold text-white text-2xl text-center">{stats.totalBookings}</p>
          </div>
        </Card>

        <Card className="glass border-white/5 rounded-2xl flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Hours Played</p>
            <p className="font-display font-bold text-white text-2xl text-center">{stats.totalHours} hrs</p>
          </div>
        </Card>

        <Card className="glass border-white/5 rounded-2xl flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold text-center">Venue Rating</p>
            <p className="font-display font-bold text-white text-2xl text-center">Premium 24/7</p>
          </div>
        </Card>
      </div>

      {/* Quick shortcuts and Upcoming bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming bookings (2/3 width on large screens) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-display font-extrabold text-xl text-white">Upcoming Bookings</h3>

          {loading ? (
            <Card className="glass border-white/5 rounded-2xl p-8 flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </Card>
          ) : upcomingBookings.length === 0 ? (
            <Card className="glass border-white/5 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
              <Calendar size={36} className="text-slate-600" />
              <p className="text-sm text-slate-400">You don't have any upcoming reservations.</p>
              <Link to="/book" className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                Book your first court <ArrowRight size={12} />
              </Link>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingBookings.slice(0, 3).map(b => (
                <Card key={b.id} className="glass border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] tracking-wider uppercase text-slate-500 font-bold">Court Location</span>
                    <h4 className="font-display font-bold text-white text-base">Court {b.court_id.replace('court-', '')}</h4>
                    <p className="text-xs text-slate-400">
                      {b.date} · {formatHour(b.start_hour)} for {b.duration_hours} hr{b.duration_hours > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getUserBookingStatusStyles(b.status, b.payment_reference)}`}>
                      {getUserBookingStatusLabel(b.status, b.payment_reference)}
                    </span>
                    <Button asChild variant="secondary" size="sm" className="text-xs">
                      <Link to="/bookings">Details</Link>
                    </Button>
                  </div>
                </Card>
              ))}
              {upcomingBookings.length > 3 && (
                <Link to="/bookings" className="text-xs text-slate-400 hover:text-white underline text-right mt-2">
                  View all upcoming sessions ({upcomingBookings.length})
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Action Panel / Guide */}
        <div className="flex flex-col gap-4">
          <h3 className="font-display font-extrabold text-xl text-white">Resources</h3>

          <div className="flex flex-col gap-3">
            <Link
              to="/openplay"
              className="glass border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Trophy size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">Join Open Play</h4>
                  <p className="text-xs text-slate-500 mt-0.5">RSVP to community play sessions</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <button
              onClick={() => setShowGuide(true)}
              className="w-full text-left glass border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">How to Book Guide</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Learn about payment verification</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Guide Modal via Shadcn Dialog */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="glass border-white/15 bg-slate-950/80 rounded-2xl sm:max-w-lg text-left">
          <DialogHeader>
            <DialogTitle className="font-display font-extrabold text-xl text-white">
              Booking Guide & Verification
            </DialogTitle>
            <DialogDescription className="sr-only">Instructions on how to book a court.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 text-xs text-slate-300 leading-relaxed py-2">
            <div>
              <h4 className="font-semibold text-sm text-emerald-400 mb-1">1. Hold Slot</h4>
              <p>Choose date, start hour and duration. We block the assigned court for 30 minutes while you complete the offline payment transfer.</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-emerald-400 mb-1">2. Offline Payment</h4>
              <p>Transfer the total price to one of our e-wallet platforms (GCash or GoTyme Bank) displayed on checkout. Save your transaction receipt!</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-emerald-400 mb-1">3. Enter Reference Code</h4>
              <p>Paste the transaction reference number and sender name in the Booking Wizard. If you exit early, you can update this from "My Bookings" before the 30-minute hold expires.</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-emerald-400 mb-1">4. Admin Verification</h4>
              <p>Our venue operators will audit the reference code on our admin dashboard. Once verified, you will receive a notification and your status will mark "Confirmed"!</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowGuide(false)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
