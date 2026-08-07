import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { exchangeSession } from '../lib/api';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const location = useLocation();
  const nav = useNavigate();
  const processedRef = React.useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    const hash = location.hash || window.location.hash || '';
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) { nav('/admin/login?e=nohash'); return; }
    const sid = decodeURIComponent(m[1]);
    (async () => {
      try {
        const user = await exchangeSession(sid);
        // clear the hash and go to /admin
        window.history.replaceState({}, document.title, '/admin');
        nav('/admin', { state: { user }, replace: true });
      } catch (e) {
        const msg = e?.response?.data?.detail || 'Sign-in failed';
        nav(`/admin/login?e=${encodeURIComponent(msg)}`, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-cream grid place-items-center">
      <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center">
        <div className="text-[11px] mono uppercase tracking-widest text-coral">Signing you in…</div>
        <div className="serif text-2xl mt-2 text-ink">One moment.</div>
      </div>
    </div>
  );
}
