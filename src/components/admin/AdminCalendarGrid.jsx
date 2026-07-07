import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VENUE_INFO } from '../../lib/constants';

export default function AdminCalendarGrid({ 
  currentDate, 
  onMonthChange, 
  selectedDay, 
  onDaySelect, 
  bookings, 
  blockedSlots = [] 
}) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const prevMonth = () => onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Determine day status
  const getDayStatus = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // For admin, we don't disable past days, they can view past bookings.
    
    const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
    const dayBlocks = blockedSlots.filter(b => b.date === dateStr);
    
    let bookedSlotCount = 0;
    dayBookings.forEach(b => {
      bookedSlotCount += b.duration_hours;
    });
    
    let blockedSlotCount = 0;
    dayBlocks.forEach(b => {
      blockedSlotCount += b.duration_hours;
    });

    const totalCourts = VENUE_INFO.courtCount || 3;
    const totalOperatingHours = 18; // 6 AM to 12 Midnight = 18 hours
    const totalDailySlots = totalCourts * totalOperatingHours;
    
    if (blockedSlotCount >= totalDailySlots) return 'maintenance';
    if (bookedSlotCount + blockedSlotCount >= totalDailySlots) return 'full';
    if (bookedSlotCount > 0 || blockedSlotCount > 0) return 'partial';
    return 'available';
  };

  return (
    <div className="w-full flex flex-col glass border border-white/5 rounded-2xl p-6 sm:p-8">
      <span className="text-[#a67c00] font-serif italic text-sm mb-2">Select Date</span>
      <h2 className="font-display font-black text-3xl text-white uppercase leading-[0.9] tracking-tighter mb-6">
        CALENDAR
      </h2>
      
      <div className="flex items-center justify-between mb-6 w-full max-w-sm mx-auto">
        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={20} className="text-white"/></button>
        <h3 className="font-bold text-lg uppercase tracking-wider text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20} className="text-white"/></button>
      </div>

      <div className="w-full max-w-sm mx-auto">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-[10px] font-bold text-slate-500 uppercase text-center">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getDayStatus(day);
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDay === dateStr;
            
            let bgClass = "bg-slate-900/50 text-slate-300 hover:bg-slate-800 border-white/5"; // available
            if (status === 'full') bgClass = "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-rose-500/20";
            else if (status === 'partial') bgClass = "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/20";
            else if (status === 'maintenance') bgClass = "bg-slate-800 text-slate-500 opacity-50 border-transparent";
            
            if (isSelected) {
              bgClass = "bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500";
            }
            
            return (
              <button
                key={day}
                onClick={() => onDaySelect(dateStr)}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs sm:text-sm transition-transform hover:scale-105 active:scale-95 border ${bgClass}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 text-[9px] uppercase font-bold text-slate-500">
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-white/5" /> No Bookings</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500/40" /> Partially Booked</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40" /> Fully Booked</div>
        </div>
      </div>
    </div>
  );
}
