import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VENUE_INFO } from '../lib/constants';
import UserBookingTimeGrid from './UserBookingTimeGrid';

export default function CalendarAvailabilityGrid() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Month data
  const [bookings, setBookings] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Day View state
  const [selectedDay, setSelectedDay] = useState(null); // 'YYYY-MM-DD'

  useEffect(() => {
    fetchMonthData(currentDate);
  }, [currentDate]);

  const fetchMonthData = async (date) => {
    setLoading(true);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    // Fetch roughly the whole month
    const startOfMonth = `${year}-${month}-01`;
    const nextMonthDate = new Date(year, date.getMonth() + 1, 1);
    const endOfMonth = new Date(nextMonthDate - 1).toISOString().split('T')[0];

    try {
      const [bookingsRes, blockedRes] = await Promise.all([
        supabase.from('bookings').select('*').gte('date', startOfMonth).lte('date', endOfMonth).neq('status', 'cancelled'),
        supabase.from('blocked_slots').select('*').gte('date', startOfMonth).lte('date', endOfMonth)
      ]);
      
      setBookings(bookingsRes.data || []);
      setBlockedSlots(blockedRes.data || []);
    } catch (e) {
      console.error('Error fetching calendar data', e);
    } finally {
      setLoading(false);
    }
  };

  // Calendar generation
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Determine day status
  const getDayStatus = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (dateStr < todayStr) return 'past';
    
    const dayBookings = bookings.filter(b => b.date === dateStr);
    const dayBlocks = blockedSlots.filter(b => b.date === dateStr);
    
    let bookedSlotCount = 0;
    dayBookings.forEach(b => {
      bookedSlotCount += b.duration_hours;
    });
    
    let blockedSlotCount = 0;
    dayBlocks.forEach(b => {
      blockedSlotCount += b.duration_hours;
    });

    const totalCourts = VENUE_INFO.courtCount;
    const totalOperatingHours = 24; // Assuming 24 hours based on constants
    const totalDailySlots = totalCourts * totalOperatingHours;
    
    if (blockedSlotCount >= totalDailySlots) return 'maintenance';
    if (bookedSlotCount + blockedSlotCount >= totalDailySlots) return 'full';
    if (bookedSlotCount > 0 || blockedSlotCount > 0) return 'partial';
    return 'available';
  };

  const handleDayClick = (day, status) => {
    if (status === 'past' || status === 'maintenance') return;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay(dateStr);
  };

  const handleSelectHour = (hour, availability) => {
    if (availability === 'none' || availability === 'past') return;
    // Navigate to book with pre-fill data
    navigate('/book', { state: { prefillDate: selectedDay, prefillHour: hour } });
  };

  return (
    <div className="bg-white p-8 lg:p-12 flex flex-col items-center justify-start text-center w-full min-h-[600px] rounded-2xl">
      {selectedDay ? (
        <div className="w-full flex flex-col gap-6 animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-[#a67c00] font-serif italic text-sm">Time Slots</span>
              <h2 className="font-display font-black text-3xl text-[#111111] uppercase tracking-tighter">
                {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
            </div>
            <button 
              onClick={() => setSelectedDay(null)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-[#111111]"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-slate-950 rounded-xl p-4 md:p-6 w-full text-white shadow-inner max-h-[500px] overflow-y-auto no-scrollbar">
             <UserBookingTimeGrid 
                date={selectedDay}
                duration={1}
                courtCount={1}
                bookings={bookings.filter(b => b.date === selectedDay)}
                blockedSlots={blockedSlots.filter(b => b.date === selectedDay)}
                selectedHour={null}
                onSelectHour={handleSelectHour}
             />
          </div>
          <p className="text-xs text-gray-500">Select an available time slot to start your booking.</p>
        </div>
      ) : (
        <div className="w-full flex flex-col animate-in fade-in duration-300">
          <span className="text-[#a67c00] font-serif italic text-sm mb-2">Plan Your Week</span>
          <h2 className="font-display font-black text-4xl text-[#111111] uppercase leading-[0.9] tracking-tighter mb-8">
            COURT AVAILABILITY
          </h2>
          
          <div className="flex items-center justify-between mb-6 w-full max-w-md mx-auto">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={24} className="text-[#111111]"/></button>
            <h3 className="font-bold text-xl uppercase tracking-wider text-[#111111]">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={24} className="text-[#111111]"/></button>
          </div>

          {loading ? (
            <div className="w-full h-64 flex items-center justify-center">
              <span className="w-8 h-8 border-4 border-[#a67c00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const status = getDayStatus(day);
                  
                  let bgClass = "bg-green-500 text-white hover:bg-green-600"; // available
                  if (status === 'past' || status === 'maintenance') bgClass = "bg-gray-800 text-gray-400 cursor-not-allowed opacity-50";
                  else if (status === 'full') bgClass = "bg-rose-500 text-white hover:bg-rose-600";
                  else if (status === 'partial') bgClass = "bg-blue-500 text-white hover:bg-blue-600";
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day, status)}
                      disabled={status === 'past' || status === 'maintenance'}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-transform hover:scale-105 active:scale-95 shadow-sm ${bgClass}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-8 text-[10px] uppercase font-bold text-gray-500">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500" /> Available</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500" /> Partially Booked</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-500" /> Fully Booked</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-800 opacity-50" /> Unavailable</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
