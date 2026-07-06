import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Bell, Menu, X, LogOut, Shield, User, Calendar, Trophy, HelpCircle } from 'lucide-react';
import logo from '../assets/gojos-logo.png';

// Shadcn Components
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    async function loadNotifications() {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        let loadedNotifications = [];
        if (!error && data) {
          loadedNotifications = data;
        }

        if (loadedNotifications.length === 0) {
          loadedNotifications = [
            {
              id: 'mock-1',
              title: 'Booking Confirmed',
              message: 'Your booking for Court 1 tomorrow at 10 AM is confirmed.',
              created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              read: false
            },
            {
              id: 'mock-2',
              title: 'Welcome to Gojo\'s Bistro!',
              message: 'Book your first session today and get ready to play or relax with some coffee.',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              read: true
            }
          ];
        }

        setNotifications(loadedNotifications);
        setUnreadCount(loadedNotifications.filter(n => !n.read).length);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    }

    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);

      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Active styles helper
  const linkClass = (path) => 
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(193,154,107,0.1)]'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
    }`;

  const mobileLinkClass = "p-3 rounded-lg text-left text-sm font-medium text-slate-200 hover:bg-slate-800 block";

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Logo & Brand */}
      <Link to={user ? "/home" : "/"} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 group">
        <div className="relative w-14 h-14 flex items-center justify-center drop-shadow-md group-hover:drop-shadow-[0_0_12px_rgba(193,154,107,0.5)] transition-all duration-300">
          <img src={logo} alt="Gojo's Bistro Logo" className="w-full h-full object-contain rounded-full" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-display font-extrabold text-lg leading-tight tracking-wider text-white group-hover:text-primary transition-colors">
            GOJO'S <span className="text-primary group-hover:text-white">BISTRO</span>
          </span>
          <span className="text-[9px] tracking-widest text-slate-500 uppercase font-medium">Coffee & Pickleball</span>
        </div>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-2">
        {user ? (
          profile?.role === 'admin' ? (
            <>
              <Link to="/admin" className={linkClass('/admin')}>
                <div className="flex items-center gap-1.5">
                  <Shield size={15} /> Dashboard
                </div>
              </Link>
              <Link to="/admin/bookings" className={linkClass('/admin/bookings')}>Bookings</Link>
              <Link to="/admin/slots" className={linkClass('/admin/slots')}>Blocks</Link>
              <Link to="/admin/openplay" className={linkClass('/admin/openplay')}>Open Play</Link>
              <Link to="/admin/users" className={linkClass('/admin/users')}>Users</Link>
            </>
          ) : (
            <>
              <Link to="/home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={linkClass('/home')}>Home</Link>
              <Link to="/book" className={linkClass('/book')}>
                <div className="flex items-center gap-1.5">
                  <Calendar size={15} /> Book Court
                </div>
              </Link>
              <Link to="/bookings" className={linkClass('/bookings')}>My Bookings</Link>
              <Link to="/openplay" className={linkClass('/openplay')}>
                <div className="flex items-center gap-1.5">
                  <Trophy size={15} /> Open Play
                </div>
              </Link>
              <Link to="/profile" className={linkClass('/profile')}>
                <div className="flex items-center gap-1.5">
                  <User size={15} /> Profile
                </div>
              </Link>
              <Link to="/popup" className={linkClass('/popup')}>Pop-up Store</Link>
              <Link to="/menu" className={linkClass('/menu')}>Menu</Link>
            </>
          )
        ) : (
          <>
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={linkClass('/')}>Home</Link>
            <a href="/#features" className={linkClass('/#features')}>Features</a>
            <a href="/#rates" className={linkClass('/#rates')}>Rates</a>
            <a href="/#location" className={linkClass('/#location')}>Location</a>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Notification Bell using DropdownMenu */}
            <DropdownMenu 
              open={notificationsOpen} 
              onOpenChange={(open) => {
                setNotificationsOpen(open);
                if (!open) markAllAsRead();
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center text-[10px] rounded-full border border-slate-950">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto glass border-white/10 text-white rounded-xl shadow-2xl p-2">
                <div className="flex items-center justify-between px-1">
                  <span className="px-1.5 py-1 font-semibold text-sm text-slate-300">Notifications</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white rounded-full" onClick={() => setNotificationsOpen(false)}>
                    <X size={14} />
                  </Button>
                </div>
                <DropdownMenuSeparator className="bg-white/5 mt-1" />
                <div className="flex flex-col gap-1 mt-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <DropdownMenuItem 
                        key={n.id} 
                        className={`flex flex-col items-start gap-1 p-2.5 rounded-lg focus:bg-primary/10 focus:text-white cursor-default ${
                          n.read 
                            ? 'text-slate-400 opacity-80' 
                            : 'bg-primary/5 text-slate-200'
                        }`}
                      >
                        <p className="font-medium text-xs">{n.title}</p>
                        <p className="text-[11px] leading-relaxed mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-slate-500 block mt-1">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium"
            >
              <LogOut size={16} /> Logout
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" className="hidden md:flex text-slate-300 hover:text-white hover:bg-slate-800">
              <Link to="/popup">Pop-up Store</Link>
            </Button>
            <Button asChild variant="ghost" className="hidden md:flex text-slate-300 hover:text-white hover:bg-slate-800">
              <Link to="/menu">Menu</Link>
            </Button>
            <Button asChild className="hidden md:inline-flex bg-primary hover:bg-primary/90 text-slate-950 font-semibold shadow-[0_0_15px_rgba(193,154,107,0.3)] hover:shadow-[0_0_20px_rgba(193,154,107,0.5)] glow-primary">
              <Link to="/login">Sign In</Link>
            </Button>
          </>
        )}

        {/* Mobile Menu using Sheet */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="glass border-b border-white/10 p-4 pt-12 flex flex-col gap-2 text-white max-h-[85vh] overflow-y-auto">
              <SheetHeader className="hidden">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              
              {!user ? (
                <div className="flex flex-col gap-2">
                  <Link to="/" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={mobileLinkClass}>Home</Link>
                  <a href="/#features" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Features</a>
                  <a href="/#rates" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Rates</a>
                  <a href="/#location" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Location</a>
                  <Link to="/popup" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Pop-up Store</Link>
                  <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Menu</Link>
                  <Button asChild className="w-full mt-2 bg-primary hover:bg-primary/90 text-slate-950 font-semibold shadow-md" onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              ) : profile?.role === 'admin' ? (
                <div className="flex flex-col gap-2">
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Admin Dashboard</Link>
                  <Link to="/admin/bookings" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Manage Bookings</Link>
                  <Link to="/admin/slots" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Manage Slots</Link>
                  <Link to="/admin/openplay" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Manage Open Play</Link>
                  <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Manage Users</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/home" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={mobileLinkClass}>Player Dashboard</Link>
                  <Link to="/book" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Book Court</Link>
                  <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>My Bookings</Link>
                  <Link to="/openplay" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Open Play Feed</Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>My Profile</Link>
                  <Link to="/popup" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Pop-up Store</Link>
                  <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>Menu</Link>
                </div>
              )}

              {user && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-start gap-2 p-3 mt-2 rounded-lg text-left text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <LogOut size={16} /> Logout
                </Button>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
