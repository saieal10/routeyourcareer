import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Bot, ArrowUpRight, PhoneCall } from 'lucide-react';
import { brand } from '../mock';
import { sendChat, captureChatLead } from '../lib/api';

function newSessionId() {
  const existing = localStorage.getItem('ryc_chat_session');
  if (existing) return existing;
  const id = 'ryc_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem('ryc_chat_session', id);
  return id;
}

const STARTERS = [
  'MBBS in Georgia — how much and how long?',
  'Is UG in Italy really tuition-free?',
  'I have 78% in 12th — what management options do I have?',
  'MBA in Singapore vs UK — which is better ROI?',
  'What can I do with a low NEET score?',
];

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I’m the RYC AI Assistant — ask me anything about MBBS abroad. Or tap a suggestion below.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [lead, setLead] = useState({ name: '', phone: '', country: '', neet_score: '' });
  const sessionRef = useRef(newSessionId());
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, showLeadForm]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await sendChat(sessionRef.current, msg);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
      // Nudge lead capture after 3 exchanges
      if (!leadCaptured && !showLeadForm) {
        setMessages((m) => {
          const turns = m.filter(x => x.role === 'user').length;
          if (turns >= 2) setTimeout(() => setShowLeadForm(true), 400);
          return m;
        });
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry — I had a hiccup. Please try again, or WhatsApp us directly.' }]);
    } finally { setLoading(false); }
  };

  const submitLead = async (e) => {
    e.preventDefault();
    if (!lead.name || !lead.phone) return;
    try {
      await captureChatLead({ session_id: sessionRef.current, ...lead });
      setLeadCaptured(true); setShowLeadForm(false);
      setMessages((m) => [...m, { role: 'assistant', content: `Thanks, ${lead.name.split(' ')[0]}! A counsellor will call ${lead.phone} within one working day. You can keep chatting here in the meantime.` }]);
    } catch (err) { /* toast optional */ }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl bg-white border border-ink/10 shadow-2xl overflow-hidden flex flex-col" style={{maxHeight: '76vh'}}>
          {/* Header */}
          <div className="bg-ink text-cream p-4 flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-coral text-white grid place-items-center"><Bot className="h-5 w-5"/></div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink"></span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-[14px]">RYC Guidance Bot</div>
              <div className="text-[10px] mono uppercase tracking-widest text-coral">MBBS + Management · all courses</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-cream/80 hover:text-cream"><X className="h-4 w-4"/></button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-cream/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.role === 'user' ? 'bg-ink text-cream' : 'bg-white border border-ink/10 text-ink'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start"><div className="rounded-2xl px-3.5 py-2.5 text-[13px] bg-white border border-ink/10 text-ink/50">Typing…</div></div>
            )}

            {showLeadForm && !leadCaptured && (
              <form onSubmit={submitLead} className="mt-2 rounded-2xl bg-white border border-coral/50 p-3 space-y-2">
                <div className="text-[11px] mono uppercase tracking-widest text-coral">Want a counsellor to call?</div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={lead.name} onChange={(e)=>setLead({...lead, name:e.target.value})} placeholder="Name" className="rounded-lg border border-ink/15 bg-cream/60 px-2.5 py-2 text-[12px]"/>
                  <input value={lead.phone} onChange={(e)=>setLead({...lead, phone:e.target.value})} placeholder="WhatsApp" className="rounded-lg border border-ink/15 bg-cream/60 px-2.5 py-2 text-[12px]"/>
                  <input value={lead.country} onChange={(e)=>setLead({...lead, country:e.target.value})} placeholder="Preferred country" className="rounded-lg border border-ink/15 bg-cream/60 px-2.5 py-2 text-[12px] col-span-2"/>
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-coral hover:bg-[#d94a26] text-white text-[12px] font-bold py-2">Send to counsellor</button>
                  <button type="button" onClick={()=>setShowLeadForm(false)} className="text-[11px] text-ink/50 hover:text-ink">skip</button>
                </div>
              </form>
            )}

            {messages.length <= 1 && (
              <div className="pt-1 flex flex-wrap gap-1.5">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-[11px] rounded-full border border-ink/15 bg-white px-2.5 py-1 hover:bg-ink hover:text-cream">{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="p-3 border-t border-ink/10 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about MBBS abroad…" className="flex-1 rounded-full border border-ink/15 bg-cream/60 px-3 py-2 text-[13px] focus:border-forest"/>
              <button type="submit" disabled={loading || !input.trim()} className="h-9 w-9 rounded-full bg-coral hover:bg-[#d94a26] text-white grid place-items-center disabled:opacity-50"><Send className="h-4 w-4"/></button>
            </form>
            <div className="mt-2 flex items-center justify-between">
              <a href={`https://wa.me/${brand.whatsapp.replace('+','')}`} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"><MessageCircle className="h-3 w-3"/> Continue on WhatsApp</a>
              <a href={`tel:${brand.phone}`} className="text-[11px] font-semibold text-ink/60 hover:text-ink inline-flex items-center gap-1"><PhoneCall className="h-3 w-3"/> {brand.phoneDisplay}</a>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 sm:right-6 z-40 flex flex-col items-end gap-3">
        <a href={`https://wa.me/${brand.whatsapp.replace('+','')}`} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-3 text-[13px] font-bold shadow-xl float-y">
          <MessageCircle className="h-5 w-5" /> WhatsApp us
        </a>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-full bg-ink hover:bg-forest text-cream px-4 py-3 text-[13px] font-semibold shadow-xl">
          {open ? <><X className="h-4 w-4"/> Close guidance</> : <><Bot className="h-4 w-4"/> Guidance Bot · all courses</>}
        </button>
      </div>
    </>
  );
}
