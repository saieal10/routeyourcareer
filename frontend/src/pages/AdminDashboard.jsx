import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminLeads, adminStats, adminNewsletter, logout, me } from '../lib/api';
import { Copy, RefreshCw, LogOut, Users, MessageCircle, Phone, Mail, Filter, Send, Sparkles } from 'lucide-react';

const TABS = [
  { k: '', l: 'All' },
  { k: 'apply', l: 'Apply' },
  { k: 'callback', l: 'Callback' },
  { k: 'quick', l: 'Quick / Calculator' },
  { k: 'chat_lead', l: 'Chat leads' },
  { k: 'newsletter', l: 'Newsletter' },
];

function fmt(dt) {
  try {
    const d = new Date(dt);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return String(dt || ''); }
}

export default function AdminDashboard() {
  const location = useLocation();
  const nav = useNavigate();
  const [user, setUser] = useState(location.state?.user || null);
  const [checking, setChecking] = useState(!location.state?.user);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) return;
    (async () => {
      try { const u = await me(); setUser(u); } catch { nav('/admin/login', { replace: true }); }
      finally { setChecking(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ls, st] = await Promise.all([
        adminLeads(tab || undefined),
        adminStats(),
      ]);
      setLeads(ls);
      setStats(st);
    } catch (e) {
      if (e?.response?.status === 401 || e?.response?.status === 403) nav('/admin/login', { replace: true });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab, user]);

  const filtered = useMemo(() => {
    if (!q.trim()) return leads;
    const s = q.toLowerCase();
    return leads.filter(l => [l.name, l.phone, l.email, l.country, l.neet_score, l.source, l.message].some(v => (v || '').toLowerCase().includes(s)));
  }, [q, leads]);

  const copyAll = () => {
    const csv = ['id,name,phone,email,country,neet,type,source,message,created_at', ...filtered.map(l => [l.id, l.name, l.phone, l.email, l.country, l.neet_score, l.type, l.source, (l.message||'').replace(/,/g,';'), l.created_at].map(x => `"${(x??'').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
    navigator.clipboard.writeText(csv);
  };

  const signOut = async () => { try { await logout(); } finally { nav('/admin/login', { replace: true }); } };

  if (checking) return <div className="min-h-screen bg-cream grid place-items-center text-ink/60">Loading…</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-ink text-cream border-b border-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-cream text-ink grid place-items-center serif italic font-medium">r</div>
            <div className="hidden sm:block">
              <div className="serif text-[15px] font-medium">Route Your Career</div>
              <div className="text-[10px] mono uppercase tracking-widest text-coral">Admin console</div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {user.picture && <img src={user.picture} alt="" className="h-8 w-8 rounded-full"/>}
            <div className="hidden sm:block leading-tight">
              <div className="text-[13px] font-medium">{user.name}</div>
              <div className="text-[10px] mono uppercase tracking-widest text-coral">{user.is_admin ? 'admin' : 'guest'}</div>
            </div>
            <button onClick={signOut} className="inline-flex items-center gap-1 rounded-full border border-cream/25 px-3 py-1.5 text-[12px] font-semibold hover:bg-cream/10"><LogOut className="h-3.5 w-3.5"/> Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { k: 'Total leads', v: stats?.total_leads ?? '–', icon: Users, tint: 'bg-coral/10 text-coral' },
            { k: 'Last 7 days', v: stats?.last_7_days ?? '–', icon: Sparkles, tint: 'bg-emerald-100 text-emerald-700' },
            { k: 'Chat qualified', v: stats?.by_type?.chat_lead ?? '–', icon: MessageCircle, tint: 'bg-indigo-100 text-indigo-700' },
            { k: 'Newsletter', v: stats?.newsletter_subscribers ?? '–', icon: Mail, tint: 'bg-amber-100 text-amber-800' },
          ].map(s => (
            <div key={s.k} className="rounded-3xl border border-ink/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] mono uppercase tracking-widest text-ink/50">{s.k}</div>
                <div className={`h-8 w-8 rounded-xl grid place-items-center ${s.tint}`}><s.icon className="h-4 w-4"/></div>
              </div>
              <div className="mt-2 serif text-4xl font-medium text-ink">{s.v}</div>
            </div>
          ))}
        </div>

        {/* By-type mini bars */}
        {stats?.by_type && (
          <div className="mt-4 rounded-3xl border border-ink/10 bg-white p-5">
            <div className="text-[10px] mono uppercase tracking-widest text-ink/50 mb-3">Leads by type</div>
            <div className="grid sm:grid-cols-5 gap-2">
              {Object.entries(stats.by_type).map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-cream/60 p-3">
                  <div className="text-[10px] mono uppercase tracking-widest text-ink/50">{k}</div>
                  <div className="serif text-2xl text-ink mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-white border border-ink/10 p-1 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${tab===t.k ? 'bg-ink text-cream' : 'text-ink/60 hover:text-ink'}`}>{t.l}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-ink/50"/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search leads…" className="bg-transparent text-[13px] w-48 focus:outline-none"/>
            </div>
            <button onClick={copyAll} className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-[12px] font-semibold hover:border-ink"><Copy className="h-3.5 w-3.5"/> Copy CSV</button>
            <button onClick={load} className="inline-flex items-center gap-1 rounded-full bg-ink text-cream px-3 py-1.5 text-[12px] font-semibold hover:bg-forest"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}/> Refresh</button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 rounded-3xl border border-ink/10 bg-white overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 bg-cream/60 text-[10px] mono uppercase tracking-widest text-ink/60 border-b border-ink/10">
            <div className="col-span-3">Student</div>
            <div className="col-span-2">Phone / Email</div>
            <div className="col-span-2">Country / NEET</div>
            <div className="col-span-2">Type / Source</div>
            <div className="col-span-2">Message</div>
            <div className="col-span-1 text-right">When</div>
          </div>
          {loading && <div className="px-5 py-10 text-center text-ink/50 text-[13px]">Loading…</div>}
          {!loading && filtered.length === 0 && <div className="px-5 py-10 text-center text-ink/50 text-[13px]">No leads yet.</div>}
          <div className="divide-y divide-ink/5">
            {filtered.map(l => (
              <div key={l.id} className="grid grid-cols-12 px-5 py-4 items-start hover:bg-cream/30">
                <div className="col-span-3">
                  <div className="font-semibold text-ink text-[14px]">{l.name}</div>
                  <div className="text-[11px] mono uppercase tracking-widest text-ink/40">{l.id.slice(0, 8)}</div>
                </div>
                <div className="col-span-2 text-[13px] text-ink/80">
                  {l.phone && l.phone !== '-' && <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 hover:text-coral"><Phone className="h-3 w-3"/> {l.phone}</a>}
                  {l.email && <div className="mt-1"><a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-ink/70 hover:text-coral"><Mail className="h-3 w-3"/> {l.email}</a></div>}
                </div>
                <div className="col-span-2 text-[13px] text-ink/80">
                  <div>{l.country || '—'}</div>
                  <div className="text-[11px] mono uppercase tracking-widest text-ink/40">NEET: {l.neet_score || '—'}</div>
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center rounded-full bg-cream border border-ink/10 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">{l.type}</span>
                  <div className="text-[11px] text-ink/50 mt-1">{l.source || '—'}</div>
                </div>
                <div className="col-span-2 text-[12px] text-ink/70 line-clamp-3">{l.message || '—'}</div>
                <div className="col-span-1 text-right text-[11px] text-ink/50">{fmt(l.created_at)}
                  {l.phone && l.phone !== '-' && (
                    <div className="mt-1">
                      <a href={`https://wa.me/${(l.phone||'').replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"><Send className="h-3 w-3"/> WhatsApp</a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
