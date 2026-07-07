import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getAdminBookingCategory, BOOKING_STATUSES } from '../../utils/bookingStatus';
import { buildFullNotes, parseBookingNotes } from '../../utils/parseBookingNotes';
import AdminBookingCardDetails from '../../components/admin/AdminBookingCardDetails';
import AdminCalendarGrid from '../../components/admin/AdminCalendarGrid';
import AdminTimetable from '../../components/admin/AdminTimetable';
import { Plus, X, Search, CheckCircle2, Minus, AlertCircle } from 'lucide-react';
import { VENUE_INFO } from '../../lib/constants';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar & Timetable state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBookingModal, setSelectedBookingModal] = useState(null); // the booking object to show in modal

  // Refund Modal states
  const [refundModalBooking, setRefundModalBooking] = useState(null);
  const [isRefundMinimized, setIsRefundMinimized] = useState(false);

  // Search bar
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  const formatHour = (hour) => {
    if (hour === 0 || hour === 24) return '12:00 MN';
    if (hour === 12) return '12:00 PM';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return `${h}:00 ${ampm}`;
  };

  // Admin reserve modal states
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [resCourt, setResCourt] = useState('court-1');
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resStart, setResStart] = useState(8);
  const [resDuration, setResDuration] = useState(2);
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resCollected, setResCollected] = useState(false);
  const [reserveError, setReserveError] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
      // Fetch roughly a wide range to allow scrolling months without constant refetching, or just fetch all active bookings
      
      const { data: bData, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false })
        .order('start_hour', { ascending: true });

      const { data: blockData, error: blockError } = await supabase
        .from('blocked_slots')
        .select('*');

      if (!bError && bData) setBookings(bData);
      if (!blockError && blockData) setBlockedSlots(blockData);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const handleVerify = async (id) => {
    try {
      const b = bookings.find(item => item.id === id);
      if (!b) return;

      const { error } = await supabase
        .from('bookings')
        .update({ status: BOOKING_STATUSES.CONFIRMED })
        .eq('id', id);

      if (error) throw error;

      if (b.user_id) {
        await supabase.from('notifications').insert({
          user_id: b.user_id,
          title: "Booking Confirmed!",
          message: `Your payment reference for Court ${b.court_id.replace('court-', '')} on ${b.date} has been confirmed. Enjoy your game!`,
          read: false
        });
      }

      setBookings(prev => prev.map(item => item.id === id ? { ...item, status: BOOKING_STATUSES.CONFIRMED } : item));
      
      // Update modal if open
      if (selectedBookingModal?.id === id) {
        setSelectedBookingModal(prev => ({ ...prev, status: BOOKING_STATUSES.CONFIRMED }));
      }
    } catch (err) {
      alert("Failed to confirm booking: " + err.message);
    }
  };

  const handleCollectCash = async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_collected: true })
        .eq('id', id);

      if (error) throw error;

      setBookings(prev => prev.map(item => item.id === id ? { ...item, payment_collected: true } : item));
      
      // Update modal if open
      if (selectedBookingModal?.id === id) {
        setSelectedBookingModal(prev => ({ ...prev, payment_collected: true }));
      }
    } catch (err) {
      alert("Failed to collect payment: " + err.message);
    }
  };

  const handleCancel = async (id, reason) => {
    try {
      const b = bookings.find(item => item.id === id);
      if (!b) return;

      const updateData = { status: BOOKING_STATUSES.CANCELLED };
      if (reason && reason.trim() !== "") {
        updateData.rejection_reason = reason.trim();
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      if (b.user_id) {
        let msg = `Your court booking on ${b.date} has been cancelled by the Gojo's Bistro Management Team.`;
        if (reason && reason.trim()) msg += `\nReason: ${reason.trim()}`;

        await supabase.from('notifications').insert({
          user_id: b.user_id,
          title: "Booking Cancelled",
          message: msg,
          read: false
        });
      }

      setBookings(prev => prev.map(item => item.id === id ? { ...item, ...updateData } : item));
      
      // Close modal on cancel
      if (selectedBookingModal?.id === id) {
        setSelectedBookingModal(null);
      }

      const parsedNotes = parseBookingNotes(b.notes);
      const bookerName = parsedNotes.bookerName || 'Guest';
      const endHour = b.start_hour + b.duration_hours;
      const courtNum = b.court_id ? b.court_id.replace('court-', '') : '';

      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const [year, month, day] = b.date.split('-');
      const formattedDate = `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;

      setSuccessMsg(
        <React.Fragment>
          Booking for Court {courtNum} on {formattedDate} from {formatHour(b.start_hour)} to {formatHour(endHour)} from {bookerName} was successfully cancelled.
          <br />
          GCASH Reference No. ({b.payment_reference || 'None'})
        </React.Fragment>
      );

      if (b.payment_reference || b.payment_collected) {
        setRefundModalBooking(b);
        setIsRefundMinimized(false);
      }
    } catch (err) {
      alert("Failed to cancel booking: " + err.message);
    }
  };

  const handleAdminReserve = async (e) => {
    e.preventDefault();
    setReserveError(null);

    if (!resName.trim() || !resPhone.trim()) {
      setReserveError("Booker name and phone are required.");
      return;
    }

    if (resStart + resDuration > 24) {
      setReserveError("Booking cannot exceed midnight.");
      return;
    }

    try {
      let total = 0;
      for (let i = 0; i < resDuration; i++) {
        const hr = (resStart + i) % 24;
        if (hr === 0 || (hr >= 1 && hr <= 6)) total += 500;
        else if (hr >= 7 && hr <= 11) total += 400;
        else if (hr >= 12 && hr <= 16) total += 450;
        else total += 500;
      }

      const overlaps = bookings.some(b =>
        b.court_id === resCourt &&
        b.date === resDate &&
        b.status !== 'cancelled' &&
        !((b.start_hour + b.duration_hours <= resStart) || (b.start_hour >= resStart + resDuration))
      );

      if (overlaps) {
        setReserveError("Collision Error: Court is already booked during this time range.");
        return;
      }

      const notes = buildFullNotes({
        bookerName: resName,
        userNotes: "Staff Desk Reservation"
      });

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: null,
          court_id: resCourt,
          date: resDate,
          start_hour: resStart,
          duration_hours: resDuration,
          total_price: total,
          status: 'confirmed',
          notes,
          contact_phone: resPhone,
          payment_reference: 'ADMIN',
          payment_collected: resCollected
        });

      if (error) throw error;

      setShowReserveModal(false);
      setResName('');
      setResPhone('');
      setResCollected(false);

      await loadData();
    } catch (err) {
      console.error(err);
      setReserveError(err.message || "Failed to save admin reservation.");
    }
  };

  // Filter & Search logic for list (if search query provided)
  const filteredSearchBookings = searchQuery.trim() !== '' 
    ? bookings.filter(b => {
        const term = searchQuery.toLowerCase();
        return b.contact_phone?.toLowerCase().includes(term) ||
               b.notes?.toLowerCase().includes(term) ||
               b.payment_reference?.toLowerCase().includes(term) ||
               b.payment_sender_name?.toLowerCase().includes(term);
      })
    : [];

  return (
    <div className="flex flex-col gap-6 py-8 px-4 md:px-8 text-left max-w-7xl mx-auto w-full">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Manage Court Bookings</h2>
          <p className="text-slate-400 text-sm">View schedules, confirm references, and collect payments.</p>
        </div>

        <button
          onClick={() => setShowReserveModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] flex items-center gap-1 cursor-pointer"
        >
          <Plus size={15} /> Desk Reservation
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-center relative animate-in fade-in duration-300">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="absolute right-4 text-emerald-500 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Global Search */}
      <div className="relative w-full max-w-md">
        <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search bookings by phone, sender name, or reference..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-white/5 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center w-full">
          <span className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <React.Fragment>
          {searchQuery.trim() !== '' ? (
            <div className="flex flex-col gap-4">
              <h3 className="font-display font-bold text-white text-lg">Search Results</h3>
              {filteredSearchBookings.length === 0 ? (
                <div className="glass border border-white/5 rounded-2xl p-12 text-center text-slate-500">
                  No bookings match "{searchQuery}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSearchBookings.map(b => (
                    <AdminBookingCardDetails
                      key={b.id}
                      booking={b}
                      onVerify={handleVerify}
                      onCancel={handleCancel}
                      onCollectCash={handleCollectCash}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 xl:gap-8 items-start">
              {/* Left Side: Calendar Grid */}
              <div className="w-full">
                <AdminCalendarGrid 
                  currentDate={currentMonth}
                  onMonthChange={setCurrentMonth}
                  selectedDay={selectedDay}
                  onDaySelect={setSelectedDay}
                  bookings={bookings}
                  blockedSlots={blockedSlots}
                />
              </div>

              {/* Right Side: Timetable */}
              <div className="w-full">
                {selectedDay ? (
                  <AdminTimetable 
                    selectedDay={selectedDay}
                    bookings={bookings}
                    blockedSlots={blockedSlots}
                    onBookingClick={setSelectedBookingModal}
                  />
                ) : (
                  <div className="glass border border-white/5 rounded-2xl p-12 text-center text-slate-500 h-full min-h-[400px] flex items-center justify-center">
                    Select a date on the calendar to view the timetable.
                  </div>
                )}
              </div>
            </div>
          )}
        </React.Fragment>
      )}

      {/* Booking Details Modal */}
      {selectedBookingModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedBookingModal(null)}>
          <div className="w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedBookingModal(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
            <AdminBookingCardDetails
              booking={selectedBookingModal}
              onVerify={handleVerify}
              onCancel={handleCancel}
              onCollectCash={handleCollectCash}
            />
          </div>
        </div>
      )}

      {/* ADMIN RESERVE MODAL */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleAdminReserve}
            className="glass border border-white/15 rounded-2xl w-full max-w-md p-6 relative text-left flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setShowReserveModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-display font-bold text-white text-lg flex items-center gap-1.5">
              Desk Reservation
            </h3>

            {reserveError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {reserveError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Select Court</label>
              <select
                value={resCourt}
                onChange={e => setResCourt(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white"
              >
                {VENUE_INFO.courts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Date</label>
              <input
                type="date"
                required
                value={resDate}
                onChange={e => setResDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Start Hour</label>
                <select
                  value={resStart}
                  onChange={e => setResStart(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map(h => (
                    <option key={h} value={h}>{h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Duration (Hours)</label>
                <select
                  value={resDuration}
                  onChange={e => setResDuration(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white"
                >
                  {[1, 2, 3, 4, 5, 6].map(d => (
                    <option key={d} value={d}>{d} Hr{d > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Booker Name</label>
              <input
                type="text"
                required
                value={resName}
                onChange={e => setResName(e.target.value)}
                placeholder="Name"
                className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Contact Phone</label>
              <input
                type="tel"
                required
                value={resPhone}
                onChange={e => setResPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full bg-slate-950 border border-white/5 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5 mt-2">
              <div>
                <span className="text-xs text-white font-semibold block">Collected Cash Payment</span>
                <span className="text-[10px] text-slate-500">Enable if user has paid at front desk</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={resCollected}
                  onChange={e => setResCollected(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950" />
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all mt-4 cursor-pointer"
            >
              Confirm Direct Booking
            </button>
          </form>
        </div>
      )}

      {/* REFUND MODAL */}
      {refundModalBooking && !isRefundMinimized && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass border border-amber-500/30 rounded-2xl w-full max-w-sm p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.15)] relative">
            <button
              onClick={() => setIsRefundMinimized(true)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
              title="Minimize to Tray"
            >
              <Minus size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-display font-bold text-white text-lg mb-2">Refund Booking Immediately</h3>
            <div className="bg-slate-950/50 rounded-xl border border-white/5 p-4 flex flex-col gap-3 text-sm text-left mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">GCash Sender No. / Contact</span>
                <span className="font-bold text-white">{refundModalBooking.contact_phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GCash Sender Name</span>
                <span className="font-bold text-white">{refundModalBooking.payment_sender_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="text-slate-400">Amount to Refund</span>
                <span className="font-bold text-amber-400 text-lg">₱{refundModalBooking.total_price?.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-6 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-amber-300">
              Only proceed once booking has been refunded.
            </p>
            <button
              onClick={() => setRefundModalBooking(null)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              Refunded
            </button>
          </div>
        </div>
      )}

      {/* IMMEDIATE ACTION TRAY */}
      {refundModalBooking && isRefundMinimized && (
        <div
          onClick={() => setIsRefundMinimized(false)}
          className="fixed bottom-6 right-6 z-[90] glass border border-amber-500/50 rounded-xl p-3 shadow-2xl cursor-pointer hover:bg-amber-500/10 transition-all flex items-center gap-3 max-w-xs animate-in slide-in-from-bottom-5"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shrink-0">
            <AlertCircle size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white">Immediate Action Needed</span>
            <span className="text-[10px] text-amber-400 font-medium">Pending Refund: ₱{refundModalBooking.total_price?.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
