import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Mail, Lock, User, Phone, MapPin, AlertCircle, Eye, EyeOff } from 'lucide-react';
const logo = 'https://placehold.co/400x400/111111/c19a6b?text=Gojo';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        if (!name || !phone) {
          throw new Error("Name and contact phone are required.");
        }
        await signup(email, password, name, phone, address);
        // After signup, user is logged in
        navigate('/home');
      } else {
        await login(email, password);
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An authentication error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <Card className="w-full max-w-md glass border-white/5 rounded-2xl relative z-10 shadow-2xl bg-slate-950/40">
        <CardHeader className="flex flex-col items-center gap-2 pb-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center drop-shadow-2xl mb-2">
            <img src={logo} alt="Gojo's Bistro Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <CardTitle className="font-display font-extrabold text-2xl text-white tracking-wider text-center">
            {isSignUp ? "CREATE PLAYER PROFILE" : "SIGN IN"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 uppercase tracking-widest text-center">
            {isSignUp ? "Join the Gojo's Bistro family" : "Reserve courts and view schedules"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="w-full p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start text-left mb-6">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-xs text-slate-400 font-semibold">Email Address</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="player@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-white/10 focus-visible:ring-primary text-white placeholder:text-slate-600 rounded-xl"
                />
              </div>
              {!isSignUp && (
                <span className="text-[10px] text-slate-500 mt-1">
                  Demo emails: <button type="button" onClick={() => { setEmail('player@hqpickle.ph'); setPassword('password'); }}
                    className="text-primary underline">player@hqpickle.ph</button> (User) or <button type="button"
                      onClick={() => { setEmail('admin@hqpickle.ph'); setPassword('password'); }}
                      className="text-primary underline">admin@hqpickle.ph</button> (Admin)
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-xs text-slate-400 font-semibold">Password</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-950/50 border-white/10 focus-visible:ring-primary text-white placeholder:text-slate-600 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-primary transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-xs text-slate-400 font-semibold">Full Name</Label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder="Juan Dela Cruz"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="pl-10 bg-slate-950/50 border-white/10 focus-visible:ring-primary text-white placeholder:text-slate-600 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="text-xs text-slate-400 font-semibold">Contact Phone</Label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+63 917 123 4567"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="pl-10 bg-slate-950/50 border-white/10 focus-visible:ring-primary text-white placeholder:text-slate-600 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="address" className="text-xs text-slate-400 font-semibold">Address (Optional)</Label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    <Input
                      id="address"
                      type="text"
                      placeholder="Tisa, Cebu"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="pl-10 bg-slate-950/50 border-white/10 focus-visible:ring-primary text-white placeholder:text-slate-600 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-6 bg-primary hover:bg-primary/90 text-[#111111] font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(193,154,107,0.2)]"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                "Complete Register"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="w-full flex items-center gap-3 my-6">
            <Separator className="flex-1 bg-white/10" />
            <span className="text-xs text-slate-500 font-semibold uppercase">Or continue with</span>
            <Separator className="flex-1 bg-white/10" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => alert('Google Sign-In will be implemented later!')}
            className="w-full py-6 bg-white hover:bg-slate-200 text-slate-900 border-transparent font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-white/5 pt-6 mt-2">
          <div className="w-full text-center text-xs text-slate-500">
            {isSignUp ? (
              <span>
                Already have a profile?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New player?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-primary hover:underline font-semibold"
                >
                  Register Here
                </button>
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
