import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AdminLogin() {
  const location = useLocation();
  const [err, setErr] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const e = p.get('e');
    if (e) setErr(e);
  }, [location.search]);

 const startLogin = () => {
  window.location.href =
    "https://routeyourcareer.onrender.com/api/auth/google";
};
    const redirectUrl = window.location.origin + '/admin/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-cream grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-ink text-cream grid place-items-center serif italic text-lg">r</div>
          <div>
            <div className="serif text-[18px] font-medium text-ink">Route Your Career</div>
            <div className="text-[10px] mono uppercase tracking-widest text-coral">Admin console</div>
          </div>
        </div>
        <div className="mt-8">
          <div className="text-[11px] mono uppercase tracking-widest text-ink/50">Private area</div>
          <h1 className="serif mt-2 text-3xl font-medium text-ink leading-tight">Sign in with Google.</h1>
          <p className="mt-3 text-[14px] text-ink/70">Only admin emails on the RYC allow-list can access leads.</p>
        </div>
        {err && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-800">{err}</div>
        )}
        <button onClick={startLogin} className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink hover:bg-forest text-cream px-5 py-3 text-[14px] font-semibold">
          <ShieldCheck className="h-4 w-4"/> Continue with Google <ArrowUpRight className="h-4 w-4"/>
        </button>
        <Link to="/" className="mt-4 block text-center text-[12px] mono uppercase tracking-widest text-ink/50 hover:text-ink">← back to site</Link>
      </div>
    </div>
  );
}
