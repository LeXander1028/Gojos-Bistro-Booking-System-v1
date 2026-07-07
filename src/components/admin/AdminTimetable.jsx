import React from 'react';
import { VENUE_INFO } from '../../lib/constants';
import { parseBookingNotes } from '../../utils/parseBookingNotes';
import { Maximize2, Minimize2 } from 'lucide-react';

const START_HOUR = 6; // 6 AM
const END_HOUR = 24; // 12 MN
const TOTAL_HOURS = END_HOUR - START_HOUR;

export default function AdminTimetable({ selectedDay, bookings, blockedSlots = [], onBookingClick }) {
  const [isWholeView, setIsWholeView] = React.useState(false);

  // Dynamic hour height based on view mode
  const HOUR_HEIGHT = isWholeView ? 30 : 72;

  // Generate hour labels
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  const formatHourLabel = (hour) => {
    if (hour === 24 || hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return `${h} ${ampm}`;
  };

  // Filter bookings for the selected day and that are not cancelled
  const dayBookings = bookings.filter(b => b.date === selectedDay && b.status !== 'cancelled');
  const dayBlocks = blockedSlots.filter(b => b.date === selectedDay);

  // Compute capacity
  const totalCapacity = VENUE_INFO.courts.length * TOTAL_HOURS;
  const bookedCapacity = 
    dayBookings.reduce((sum, b) => sum + b.duration_hours, 0) + 
    dayBlocks.reduce((sum, b) => sum + b.duration_hours, 0);
  const remainingHours = Math.max(0, totalCapacity - bookedCapacity);
  const capacityPercent = Math.round((bookedCapacity / totalCapacity) * 100);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30';
      case 'processing': return 'bg-amber-500/20 border-amber-500 text-amber-300 hover:bg-amber-500/30';
      case 'completed': return 'bg-slate-500/20 border-slate-500 text-slate-300 hover:bg-slate-500/30';
      default: return 'bg-blue-500/20 border-blue-500 text-blue-300 hover:bg-blue-500/30';
    }
  };

  const calculateTop = (startHour) => {
    // If start hour is 0 (Midnight), it corresponds to the end of the day.
    const effectiveHour = startHour === 0 ? 24 : startHour;
    return (effectiveHour - START_HOUR) * HOUR_HEIGHT;
  };

  const calculateHeight = (duration) => {
    return duration * HOUR_HEIGHT;
  };

  return (
    <div className="w-full flex flex-col glass border border-white/5 rounded-2xl p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[#a67c00] font-serif italic text-sm">Timetable</span>
          <h2 className="font-display font-black text-2xl text-white uppercase tracking-tighter">
            {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className={`font-bold ${capacityPercent >= 90 ? 'text-rose-400' : capacityPercent >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {capacityPercent}% Capacity
            </span>
            <span className="text-slate-500 font-medium">
              {remainingHours} hour{remainingHours !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsWholeView(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${!isWholeView ? 'bg-primary text-[#111111]' : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'}`}
            >
              <Maximize2 size={12} /> Normal View
            </button>
            <button 
              onClick={() => setIsWholeView(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${isWholeView ? 'bg-primary text-[#111111]' : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'}`}
            >
              <Minimize2 size={12} /> Whole View
            </button>
          </div>
          <div className="flex gap-3 text-[10px] uppercase font-bold text-slate-400">
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500" /> Confirmed</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500" /> Processing</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar rounded-xl border border-white/10 bg-slate-950 max-h-[600px] relative">
        <div className="flex w-full min-w-[600px]">
          {/* Time Column */}
          <div className="w-20 shrink-0 border-r border-white/10 bg-slate-900/50 sticky left-0 z-20">
            <div className="h-12 border-b border-white/10 flex items-center justify-center text-[10px] uppercase font-bold text-slate-500 tracking-widest bg-slate-950">
              Time
            </div>
            <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
              {hours.map((hour) => (
                <div 
                  key={hour} 
                  className="absolute w-full border-b border-white/5 flex items-start justify-center pt-2"
                  style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                >
                  <span className="text-xs font-semibold text-slate-400">{formatHourLabel(hour)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Courts Columns */}
          {VENUE_INFO.courts.map((court, index) => {
            const courtBookings = dayBookings.filter(b => b.court_id === court.id);

            return (
              <div key={court.id} className={`flex-1 min-w-[150px] relative ${index !== VENUE_INFO.courts.length - 1 ? 'border-r border-white/10' : ''}`}>
                <div className="h-12 border-b border-white/10 flex flex-col items-center justify-center bg-slate-950 sticky top-0 z-10">
                  <span className="text-sm font-bold text-white uppercase">{court.name}</span>
                </div>

                <div className="relative w-full" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
                  {/* Grid Lines */}
                  {hours.map((hour) => (
                    <div 
                      key={`grid-${hour}`} 
                      className="absolute w-full border-b border-white/5 border-dashed"
                      style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Bookings */}
                  {courtBookings.map((booking) => {
                    const top = calculateTop(booking.start_hour);
                    const height = calculateHeight(booking.duration_hours);
                    const parsedNotes = parseBookingNotes(booking.notes);
                    
                    return (
                      <div
                        key={booking.id}
                        onClick={() => onBookingClick(booking)}
                        className={`absolute left-1 right-1 rounded-lg border-l-4 p-2 cursor-pointer transition-all shadow-md overflow-hidden ${getStatusColor(booking.status)} z-10 flex flex-col justify-start`}
                        style={{ top: top + 2, height: height - 4 }} // Slight margin
                      >
                        {isWholeView ? (
                          // Minimal view for zoomed out mode
                          <div className="flex items-center justify-between w-full h-full text-xs font-bold truncate">
                            <span className="truncate">{parsedNotes.bookerName || 'Guest'}</span>
                          </div>
                        ) : (
                          // Full details for normal view
                          <React.Fragment>
                            <span className="text-xs font-bold truncate">{parsedNotes.bookerName || 'Guest'}</span>
                            <span className="text-[10px] opacity-80 truncate">{booking.contact_phone}</span>
                            {booking.payment_reference === 'ADMIN' && (
                              <span className="text-[9px] uppercase tracking-widest font-bold mt-auto pt-1 border-t border-current/20 opacity-90 truncate">Admin Desk</span>
                            )}
                          </React.Fragment>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
