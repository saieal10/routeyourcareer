import React from 'react';
import { programs, brand } from '../mock';
import { ArrowUpRight, Check } from 'lucide-react';

export default function Programs() {
  return (
    <section id="programs" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 02 — Two tracks</div>
          <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Pick your <em className="font-light">route.</em></h2>
          <p className="mt-5 text-ink/70 text-[15px] leading-relaxed">One pathway platform, two full career tracks — traditional MBBS abroad, or an international UG / PG in business, tech and management. Tell us where you want to land; we’ll route the rest.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {programs.map((p, i) => (
            <div key={p.key} className="group relative rounded-3xl overflow-hidden bg-ink text-cream card-lift">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={p.img} alt={p.label} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 transition"/>
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent"/>
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-coral text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1">{p.tag}</div>
                <div className="absolute top-4 right-4 text-[10px] mono uppercase tracking-widest text-cream/60">{String(i+1).padStart(2,'0')} / 02</div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-[10px] mono uppercase tracking-widest text-coral">{p.intent}</div>
                  <div className="serif text-4xl sm:text-5xl font-light leading-none mt-1">{p.label}</div>
                </div>
              </div>
              <div className="p-6 lg:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] mono uppercase tracking-widest text-cream/50">Duration</span>
                  <span className="serif text-[18px] font-medium">{p.duration}</span>
                  <span className="h-4 w-px bg-cream/15"/>
                  <span className="text-[10px] mono uppercase tracking-widest text-cream/50">Range</span>
                  <span className="serif text-[18px] font-medium text-coral">{p.priceRange}</span>
                </div>
                <ul className="mt-5 grid grid-cols-1 gap-2">
                  {p.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2 text-[13px] text-cream/80"><Check className="h-4 w-4 text-coral shrink-0 mt-0.5"/> {b}</li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center flex-wrap gap-2">
                  <span className="text-[10px] mono uppercase tracking-widest text-cream/50 w-full">Priority</span>
                  {p.priority.map(x => (
                    <span key={x} className="inline-flex items-center rounded-full bg-white/5 border border-cream/15 text-cream text-[12px] px-3 py-1">{x}</span>
                  ))}
                </div>
                <div className="mt-6 flex items-center flex-wrap gap-2">
                  <span className="text-[10px] mono uppercase tracking-widest text-cream/50 w-full">Countries</span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.countries.map(x => (
                      <span key={x} className="inline-flex items-center rounded-full bg-white/5 text-cream/80 text-[11px] px-2.5 py-1">{x}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href={p.key === 'mbbs' ? '#featured' : '#management'} className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-5 py-3 text-[13px] font-bold">
                    Explore {p.label} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45"/>
                  </a>
                  <a href={brand.applyLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/25 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/10">
                    Apply online
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
