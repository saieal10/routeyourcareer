import React from 'react';
import { Link } from 'react-router-dom';
import { italySpotlight, brand } from '../mock';
import { ArrowUpRight, Check, Sparkles, GraduationCap, Building2 } from 'lucide-react';

export default function ItalySpotlight() {
  const d = italySpotlight;
  return (
    <section id="italy" className="relative py-24 bg-ink text-cream overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <img src={d.hero} alt="Italy" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent"/>
      </div>
      <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-coral/20 blur-3xl"/>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3">
            <img src={d.flag} alt="" className="h-6 w-9 rounded-sm ring-1 ring-white/20"/>
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 06 — The Italy secret</div>
          </div>
          <h2 className="serif mt-4 text-5xl sm:text-7xl font-normal leading-[0.95]">{d.headline}</h2>
          <p className="mt-6 text-cream/80 text-[16px] leading-relaxed max-w-2xl">{d.intro}</p>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
            {[{k: d.fee, v:'Tuition'}, {k: d.duration, v:'Duration'}, {k: d.medium, v:'Medium'}].map(x => (
              <div key={x.v} className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur p-4">
                <div className="serif text-[24px] font-medium leading-tight">{x.k}</div>
                <div className="text-[10px] mono uppercase tracking-widest text-cream/60 mt-1">{x.v}</div>
              </div>
            ))}
          </div>

          <ul className="mt-8 grid sm:grid-cols-2 gap-2 max-w-2xl">
            {d.highlights.map(h => (
              <li key={h} className="flex items-start gap-2 text-[14px] text-cream/85">
                <div className="h-5 w-5 rounded-full bg-coral text-white grid place-items-center shrink-0 mt-0.5"><Check className="h-3 w-3"/></div>{h}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/countries/italy" className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-6 py-3.5 text-[14px] font-bold">
              Explore Italy in detail <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45"/>
            </Link>
            <a href={brand.applyLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/30 text-cream px-6 py-3.5 text-[14px] font-semibold hover:bg-cream/10">
              Apply for Italy
            </a>
            <a href={brand.callbackLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/30 text-cream px-6 py-3.5 text-[14px] font-semibold hover:bg-cream/10">
              Request callback
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 grid gap-4">
          <div className="rounded-3xl bg-white/5 border border-cream/15 backdrop-blur p-6">
            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2"><GraduationCap className="h-3.5 w-3.5"/> Courses we shortlist</div>
            <ul className="mt-4 space-y-2">
              {d.courses.map(c => (
                <li key={c} className="flex items-start gap-2 text-[13px] text-cream/85"><Sparkles className="h-3.5 w-3.5 text-coral shrink-0 mt-1"/>{c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white/5 border border-cream/15 backdrop-blur p-6">
            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2"><Building2 className="h-3.5 w-3.5"/> Sample partner universities</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {d.universities.map(u => (
                <span key={u} className="inline-flex items-center rounded-full bg-cream/10 border border-cream/20 text-cream/90 text-[12px] px-3 py-1">{u}</span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-coral text-white p-6">
            <div className="text-[11px] mono uppercase tracking-widest text-white/80">Bottom-line</div>
            <div className="serif text-2xl mt-2">You pay only for living — not tuition.</div>
            <div className="text-[13px] text-white/90 mt-3">Living ₹6–8L/yr in Milan, Bologna, Padua, Rome. Compared to a UK MBA at ₹40L, an Italian PG at ₹6–8L is a genuinely different game.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
