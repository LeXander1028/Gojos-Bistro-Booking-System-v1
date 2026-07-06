import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { hasBookingEnded, isBookingUpcoming } from '../utils/bookingLifecycle';
import { getUserBookingStatusLabel, getUserBookingStatusStyles } from '../utils/bookingStatus';
import { parseBookingNotes } from '../utils/parseBookingNotes';
import { Calendar, ShieldAlert, X, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import BookingPriceBreakdown from '../components/admin/BookingPriceBreakdown';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MyBookings() {
  const { user } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Modal detail State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [paymentInputId, setPaymentInputId] = useState(null);
  
  // Payment edit parameters
  const [senderName, setSenderName] = useState('');
  const [refNo, setRefNo] = useState('');
  const [wallet, setWallet] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Check state message
  useEffect(() => {
    if (location.state && location.state.successMsg) {
      setSuccessMsg(location.state.successMsg);
      // Clear location state history
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  async function loadBookings() {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (!error && data) {
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    
    // Fetch payment methods for references updates
    supabase.from('payment_methods').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setPaymentMethods(data);
    });
  }, [user]);

  const handleCancelBooking = async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      setCancellingId(null);
      setSelectedBooking(null);
      setSuccessMsg("Booking successfully cancelled.");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking: " + err.message);
    }
  };

  const handleUpdatePayment = async (id) => {
    if (!refNo.trim() || !senderName.trim()) {
      alert("Please fill in reference number and sender name.");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_sender_name: senderName.trim(),
          payment_reference: refNo.trim(),
          payment_sender_platform: wallet.trim() || null
        })
        .eq('id', id);

      if (error) throw error;
      
      setBookings(prev => prev.map(b => b.id === id ? { 
        ...b, 
        payment_sender_name: senderName,
        payment_reference: refNo,
        payment_sender_platform: wallet
      } : b));
      
      setPaymentInputId(null);
      setSelectedBooking(null);
      setSuccessMsg("Payment details successfully updated.");
    } catch (err) {
      console.error(err);
      alert("Failed to update payment: " + err.message);
    }
  };

  // 12h formatting helper
  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour >= 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  // Groupings
  const processingBookings = bookings.filter(b => b.status === 'processing');
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' && isBookingUpcoming(b));
  const pastBookings = bookings.filter(b => b.status === 'completed' || hasBookingEnded(b) || b.status === 'cancelled');

  const openPaymentEdit = (b) => {
    setSenderName(b.payment_sender_name || '');
    setRefNo(b.payment_reference || '');
    setWallet(b.payment_sender_platform || '');
    setPaymentInputId(b.id);
  };

  return (
    <div className="flex flex-col gap-6 py-8 px-4 md:px-8 text-left max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">My Bookings</h2>
        <p className="text-slate-400 text-sm">Monitor your current slots, update payments, or review historic logs.</p>
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

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <span className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <Card className="glass border-white/5 rounded-2xl p-12 text-center flex flex-col items-center gap-4 bg-slate-950/40">
          <Calendar size={48} className="text-slate-600" />
          <h3 className="font-display font-bold text-white text-lg">No reservations found</h3>
          <p className="text-sm text-slate-400 max-w-sm">You haven't reserved any court bookings at our venue yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* SECTION 1: PROCESSING HOLDS */}
          {processingBookings.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Active Holds (Pending payment verification)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processingBookings.map(b => (
                  <BookingItemCard 
                    key={b.id} 
                    booking={b} 
                    onViewDetails={setSelectedBooking} 
                    onOpenPayment={openPaymentEdit}
                    formatHour={formatHour}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: CONFIRMED UPCOMING */}
          {upcomingBookings.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display font-bold text-white text-lg">Upcoming Bookings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingBookings.map(b => (
                  <BookingItemCard 
                    key={b.id} 
                    booking={b} 
                    onViewDetails={setSelectedBooking} 
                    formatHour={formatHour}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: PAST AND CANCELLED */}
          {pastBookings.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display font-bold text-slate-400 text-lg">Past / Cancelled Bookings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
                {pastBookings.map(b => (
                  <BookingItemCard 
                    key={b.id} 
                    booking={b} 
                    onViewDetails={setSelectedBooking} 
                    formatHour={formatHour}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL using Shadcn Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(o) => { if (!o) setSelectedBooking(null) }}>
        <DialogContent className="glass border-white/15 bg-slate-950/80 rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-white text-xl text-left">
              Court Reservation Details
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="flex flex-col gap-5 text-left">
              <div className="grid grid-cols-2 gap-4 bg-slate-950/40 border border-white/5 rounded-xl p-4 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block">Assigned Court</span>
                  <span className="font-semibold text-white">Court {selectedBooking.court_id.replace('court-', '')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Duration</span>
                  <span className="font-semibold text-white">{selectedBooking.duration_hours} Hour{selectedBooking.duration_hours > 1 ? 's' : ''}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date</span>
                  <span className="font-semibold text-white">{selectedBooking.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Time Slot</span>
                  <span className="font-semibold text-emerald-400">
                    {formatHour(selectedBooking.start_hour)} - {formatHour(selectedBooking.start_hour + selectedBooking.duration_hours)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Contact phone for this booking</span>
                  <span className="font-medium text-white">{selectedBooking.contact_phone}</span>
                </div>
              </div>

              {/* Reference update cue for processing holds */}
              {selectedBooking.status === 'processing' && (
                <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3.5 text-xs text-slate-300 flex flex-col gap-2">
                  <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <Info size={14} /> E-Wallet Transaction Info
                  </p>
                  {selectedBooking.payment_reference ? (
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div>
                        <span>Sender Account:</span>
                        <p className="text-white font-medium">{selectedBooking.payment_sender_name}</p>
                      </div>
                      <div>
                        <span>Reference No:</span>
                        <p className="text-emerald-400 font-medium select-all">{selectedBooking.payment_reference}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-rose-400 italic">No payment reference entered yet. To prevent auto-cancellation, update payment reference details now.</p>
                      <Button
                        size="sm"
                        onClick={() => openPaymentEdit(selectedBooking)}
                        className="mt-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                      >
                        Update Payment Reference
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Price breakdown */}
              <BookingPriceBreakdown 
                notes={selectedBooking.notes}
                totalPrice={selectedBooking.total_price}
                courtCount={1}
              />

              {/* Cancel Trigger */}
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && !hasBookingEnded(selectedBooking) && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                  {cancellingId === selectedBooking.id ? (
                    <div className="flex flex-col gap-2 w-full text-xs">
                      <p className="text-rose-400 font-bold flex items-center gap-1">
                        <ShieldAlert size={14} /> Confirm Cancellation?
                      </p>
                      <p className="text-slate-400">Cancelling court holds is permanent and returns the slot back to the public pool.</p>
                      <div className="flex gap-2 justify-end mt-1">
                        <Button variant="outline" size="sm" onClick={() => setCancellingId(null)} className="border-white/5 text-slate-300 bg-slate-950">
                          Keep Booking
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(selectedBooking.id)}>
                          Yes, Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setCancellingId(selectedBooking.id)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* UPDATE PAYMENT MODAL */}
      <Dialog open={!!paymentInputId} onOpenChange={(o) => { if (!o) setPaymentInputId(null) }}>
        <DialogContent className="glass border-white/15 bg-slate-950/80 rounded-2xl sm:max-w-sm">
          <form onSubmit={e => { e.preventDefault(); handleUpdatePayment(paymentInputId); }} className="flex flex-col gap-4 text-left">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-white text-lg">
                Update Payment Details
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-slate-400 font-semibold" htmlFor="popSender">Sender Account Name</Label>
              <Input
                id="popSender"
                type="text"
                required
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="JUAN DELA CRUZ"
                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-slate-400 font-semibold" htmlFor="popRef">Transaction Reference Code</Label>
              <Input
                id="popRef"
                type="text"
                required
                value={refNo}
                onChange={e => setRefNo(e.target.value)}
                placeholder="Reference No."
                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-slate-400 font-semibold" htmlFor="popWallet">E-Wallet Used (Optional)</Label>
              <Input
                id="popWallet"
                type="text"
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                placeholder="GCash / GoTyme"
                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 rounded-xl"
              />
            </div>

            <DialogFooter className="mt-2 flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setPaymentInputId(null)} className="text-slate-400">
                Close
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
                Submit Payment Info
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Inner Component for single card item
function BookingItemCard({ booking, onViewDetails, onOpenPayment, formatHour }) {
  const parsed = parseBookingNotes(booking.notes);

  return (
    <Card className="glass border-white/5 rounded-2xl p-5 flex flex-col gap-4 text-left transition-all hover:border-white/10 bg-slate-950/40">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Location Slot</span>
          <h4 className="font-display font-extrabold text-white text-base">Court {booking.court_id.replace('court-', '')}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getUserBookingStatusStyles(booking.status, booking.payment_reference)}`}>
          {getUserBookingStatusLabel(booking.status, booking.payment_reference)}
        </span>
      </div>

      <div className="flex justify-between text-xs text-slate-300 border-b border-white/5 pb-3">
        <div>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Date</span>
          <span className="font-medium text-white">{booking.date}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Time Range</span>
          <span className="font-medium text-white">
            {formatHour(booking.start_hour)} - {formatHour(booking.start_hour + booking.duration_hours)}
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Total Stored</span>
          <span className="font-semibold text-emerald-400">₱{booking.total_price?.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-slate-400 italic">Booker: {parsed.bookerName || 'Guest'}</span>
        
        <div className="flex items-center gap-2">
          {booking.status === 'processing' && !booking.payment_reference && onOpenPayment && (
            <Button
              size="sm"
              onClick={() => onOpenPayment(booking)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
            >
              Add Receipt ID
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(booking)}
            className="bg-slate-900 border-white/5 text-slate-300 hover:text-white"
          >
            Review <ChevronRight size={12} className="ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
