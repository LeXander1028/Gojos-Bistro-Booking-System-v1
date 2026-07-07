import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, CircleDollarSign, CalendarDays, Layers, RefreshCw } from 'lucide-react';
import { getAdminBookingCategory } from '../../utils/bookingStatus';

const FILTERS = ['Today', 'Weekly', 'Monthly', 'Quarterly', 'Annual'];

export default function AdminDashboard() {
  const [allBookings, setAllBookings] = useState([]);
  const [allBlocks, setAllBlocks] = useState([]);
  const [dateFilter, setDateFilter] = useState('Annual');

  const [metrics, setMetrics] = useState({
    totalEarnings: 0,
    pendingPaymentsCount: 0,
    confirmedBookingsCount: 0,
    activeBlockCount: 0
  });
  const [chartData, setChartData] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: bookings, error: bookingsError } = await supabase.from('bookings').select('*');
      if (bookingsError) throw bookingsError;

      const { data: blocks, error: blocksError } = await supabase.from('blocked_slots').select('*');
      if (blocksError) throw blocksError;

      setAllBookings(bookings || []);
      setAllBlocks(blocks || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute metrics whenever data or filter changes
  useEffect(() => {
    if (allBookings.length === 0 && allBlocks.length === 0) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Filter logic
    const isDateInFilter = (dateStr) => {
      const d = new Date(dateStr);
      if (dateFilter === 'Today') return dateStr === todayStr;
      
      const diffTime = now - d;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If it's a future date, we still want to count it for bookings, 
      // but for "earnings/sales", accountants usually look at past/current. 
      // Let's include everything within the time horizon (past and future).
      // A simple way is to just check the absolute difference or just include if it falls in the range.
      // Wait, standard accounting is past/present. Let's just use absolute diff to include future bookings in the horizon.
      const absDiffDays = Math.abs(diffDays);

      if (dateFilter === 'Weekly') return absDiffDays <= 7;
      if (dateFilter === 'Monthly') return absDiffDays <= 30;
      if (dateFilter === 'Quarterly') return absDiffDays <= 90;
      if (dateFilter === 'Annual') return absDiffDays <= 365;
      return true;
    };

    const filteredBookings = allBookings.filter(b => isDateInFilter(b.date));
    const filteredBlocks = allBlocks.filter(b => isDateInFilter(b.date));

    let totalEarnings = 0;
    let pendingPaymentsCount = 0;
    let confirmedBookingsCount = 0;

    const buckets = {};

    filteredBookings.forEach(b => {
      const category = getAdminBookingCategory(b);
      
      if (category === 'confirmed' || category === 'completed') {
        totalEarnings += Number(b.total_price || 0);
        confirmedBookingsCount++;
      }
      if (category === 'paid_verify') {
        pendingPaymentsCount++;
      }

      // Build chart buckets
      if (b.status === 'confirmed' || b.status === 'completed') {
        let bucketKey = '';
        const d = new Date(b.date);
        
        if (dateFilter === 'Today') {
          // Group by hour
          const h = b.start_hour;
          bucketKey = h === 12 ? '12 PM' : h === 0 || h === 24 ? '12 AM' : h > 12 ? `${h-12} PM` : `${h} AM`;
        } else if (dateFilter === 'Weekly') {
          // Group by day of week
          bucketKey = d.toLocaleDateString('default', { weekday: 'short' });
        } else if (dateFilter === 'Monthly') {
          // Group by day of month (e.g. "Oct 12")
          bucketKey = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        } else {
          // Quarterly / Annual: Group by Month
          bucketKey = d.toLocaleDateString('default', { month: 'short' });
        }

        buckets[bucketKey] = (buckets[bucketKey] || 0) + Number(b.total_price || 0);
      }
    });

    setMetrics({
      totalEarnings,
      pendingPaymentsCount,
      confirmedBookingsCount,
      activeBlockCount: filteredBlocks.length
    });

    // Format chart data
    // For sorting, we should Ideally sort chronologically. 
    // Since this is a simple dashboard, we'll just sort by the keys naturally or leave as inserted.
    let formattedChart = Object.keys(buckets).map(key => ({
      name: key,
      earnings: buckets[key]
    }));

    if (formattedChart.length === 0) {
      formattedChart = [
        { name: 'No Data', earnings: 0 }
      ];
    }

    setChartData(formattedChart);

  }, [allBookings, allBlocks, dateFilter]);

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      await supabase.rpc('refresh_booking_statuses');
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-8 px-4 md:px-8 text-left max-w-6xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Operator Dashboard</h2>
          <p className="text-slate-400 text-sm">Real-time scheduling metrics and payment audit stats.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-slate-900 border border-white/5 rounded-xl p-1 flex overflow-x-auto no-scrollbar">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${dateFilter === f ? 'bg-primary text-[#111111]' : 'text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className="p-2.5 rounded-xl border border-white/5 bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center shrink-0"
            title="Sync Statuses"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <span className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* KPI grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total Earnings</span>
                <span className="font-display font-bold text-emerald-400 text-2xl">₱{metrics.totalEarnings.toLocaleString()}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <CircleDollarSign size={20} />
              </div>
            </div>

            <div className="glass border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Verification Queue</span>
                <span className={`font-display font-bold text-2xl ${metrics.pendingPaymentsCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                  {metrics.pendingPaymentsCount} holds
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${metrics.pendingPaymentsCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-900 text-slate-500'}`}>
                <ShieldAlert size={20} />
              </div>
            </div>

            <div className="glass border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Confirmed Sales</span>
                <span className="font-display font-bold text-white text-2xl">{metrics.confirmedBookingsCount} bookings</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <CalendarDays size={20} />
              </div>
            </div>

            <div className="glass border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Blocked Courts</span>
                <span className="font-display font-bold text-white text-2xl">{metrics.activeBlockCount} slots</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <Layers size={20} />
              </div>
            </div>
          </div>

          {/* Alert panel for pending payments */}
          {metrics.pendingPaymentsCount > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <p className="text-xs text-amber-400">
                You have <strong>{metrics.pendingPaymentsCount} court reservations</strong> awaiting e-wallet payment audit checks.
              </p>
              <a 
                href="/admin/bookings" 
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-all text-center"
              >
                Go to Verification Queue
              </a>
            </div>
          )}

          {/* Revenue Chart Visuals */}
          <div className="glass border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-display font-bold text-white text-lg flex items-center gap-1.5">
              Revenue Visualizer <span className="text-[10px] uppercase font-bold text-slate-500 font-sans tracking-widest bg-slate-900 px-2 py-0.5 rounded">{dateFilter} Breakdown</span>
            </h3>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10b981' }}
                    formatter={(value) => [`₱${value.toLocaleString()}`, 'Earnings']}
                  />
                  <Bar dataKey="earnings" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
