import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowUpRight, Star, PlayCircle } from 'lucide-react';
import { brand } from '../mock';
import { toast } from '../hooks/use-toast';

const rotatingCountries = ['Ireland', 'Egypt', 'Moldova', 'Russia'];

export default function Hero() {
  const [form, setForm] = useState({ name: '', phone: '', country: '' });
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % rotatingCountries.length), 2200);
    return () => clearInterval(t);
  }, []);
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast({ title: 'Please fill name and phone.' }); return; }
    toast({ title: 'Doctor-counsellor will call in 30 min.', description: `Thanks, ${form.name.split(' ')[0]}!` });
    setForm({ name: '', phone: '', country: '' });
  };
  return (
    <section id="top" className="relative overflow-hidden bg-cream grain-bg">
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#e85d3a]/15 blur-3xl" />
      <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-[#1a4d3a]/15 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 grid lg:grid-cols-12 gap-8 items-start relative">
        <div className="lg:col-span-7 fade-up">
          <div className="flex items-center gap-3 text-[11px] mono uppercase tracking-widest text-ink/70">
            <span className="h-2 w-2 rounded-full bg-[#e85d3a]"></span>
            Est. 2018 · Bengaluru · India
            <span className="h-px w-6 bg-ink/20"></span>
            Sep 2026 Intake / Open
          </div>

          <h1 className="mt-6 serif text-[52px] sm:text-[74px] lg:text-[92px] font-normal leading-[0.95] text-ink">
            Your <em className="font-light">route</em> to a<br/>
            global MBBS
            <span className="block mt-2">
              in <span className="relative inline-block text-coral">
                <span className="ticker-viewport text-coral italic font-medium">
                  <span className="block leading-[1.1]">{rotatingCountries[wordIdx]}</span>
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 200 14" fill="none"><path d="M2 8 Q 50 -2 100 8 T 198 8" stroke="#e85d3a" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>
              </span>.
            </span>
          </h1>

          <p className="mt-8 text-ink/70 text-[16px] sm:text-[17px] max-w-xl leading-relaxed">
            Route Your Career is a doctor-led MBBS-abroad consultancy from South India. 9 NMC-recognised countries, 30+ partner universities, one written fee-letter promise — <em className="text-ink/80">no commission agents, ever</em>.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#book" className="group inline-flex items-center gap-2 rounded-full bg-ink text-cream px-6 py-3.5 text-[14px] font-semibold hover:bg-[#1a4d3a]">
              Get my free country shortlist
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </a>
            <a href="#stories" className="inline-flex items-center gap-2 rounded-full border border-ink/20 text-ink px-6 py-3.5 text-[14px] font-semibold hover:bg-ink hover:text-cream">
              <PlayCircle className="h-4 w-4" /> Watch student stories
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-ink/70">
            {[{k:'2,400+', v:'Doctors placed'}, {k:'₹15–45L', v:'Total fee (locked)'}, {k:'6 yr', v:'FMGE hand-holding'}, {k:'5', v:'South India offices'}].map((s) => (
              <div key={s.v} className="flex items-baseline gap-2">
                <span className="serif text-[24px] font-medium text-ink">{s.k}</span>
                <span className="uppercase mono tracking-widest text-[10px]">{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-4 rot-hover">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-ink">
                <img src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=900&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-cream">
                  <div className="text-[10px] mono uppercase tracking-widest text-coral">Featured student</div>
                  <div className="serif text-[22px] leading-tight mt-1">Dr. Arjun, now at RCSI Ireland</div>
                </div>
                <div className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-cream/95 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                  <Star className="h-3 w-3 fill-current text-coral" /> Batch 2024
                </div>
              </div>
            </div>
            <div className="col-span-2 flex flex-col gap-3">
              <div className="rounded-3xl overflow-hidden aspect-square bg-sand">
                <img src="https://images.unsplash.com/photo-1591106863172-9be62dda17c4?w=500&q=80" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-3xl overflow-hidden flex-1 bg-forest text-cream p-4">
                <div className="text-[10px] mono uppercase tracking-widest text-coral">Live</div>
                <div className="mt-1 text-[13px] leading-snug">9 students inquired in the last 60 min</div>
                <div className="mt-3 flex -space-x-2">
                  {[11,12,13,14,15].map(i => <img key={i} src={`https://i.pravatar.cc/40?img=${i}`} className="h-7 w-7 rounded-full ring-2 ring-forest" alt=""/>)}
                </div>
              </div>
            </div>
            <div className="col-span-6" id="book">
              <form onSubmit={submit} className="rounded-3xl bg-white border border-ink/10 p-5 shadow-[0_20px_40px_-20px_rgba(13,21,32,0.15)]">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] mono uppercase tracking-widest text-coral">Free counselling / 30 min</div>
                  <div className="flex items-center gap-1 text-[11px] text-ink/60"><Star className="h-3 w-3 fill-coral text-coral"/> 4.9/5</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full name" className="rounded-lg border border-ink/15 bg-cream/60 px-3 py-2.5 text-[13px] focus:border-forest"/>
                  <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="WhatsApp" className="rounded-lg border border-ink/15 bg-cream/60 px-3 py-2.5 text-[13px] focus:border-forest"/>
                  <select value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} className="col-span-2 rounded-lg border border-ink/15 bg-cream/60 px-3 py-2.5 text-[13px] focus:border-forest">
                    <option value="">Preferred country — or “not sure yet”</option>
                    {['Ireland','Egypt','Moldova','Russia','Kazakhstan','Georgia','Uzbekistan','Kyrgyzstan','Nepal','Not sure'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="mt-3 w-full rounded-lg bg-coral hover:bg-[#d94a26] text-white font-semibold py-2.5 text-[13px] inline-flex items-center justify-center gap-2">
                  Book counselling →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
