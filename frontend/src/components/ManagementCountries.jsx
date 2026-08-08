import React from 'react';
import { managementCountries, brand } from '../mock';
import { ArrowUpRight, Star } from 'lucide-react';

export default function ManagementCountries() {
  return (
    <section id="management" className="py-24 bg-sand grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="max-w-2xl">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 05 — Management abroad</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Eight destinations,<br/><em className="font-light">one global career.</em></h2>
            <p className="mt-5 text-ink/70 text-[15px] leading-relaxed">UG (BBA / BSc), PG (MSc / MIM), and MBA programmes across USA, UK, Australia, Germany, Italy, Spain, UAE and Singapore. Italy is our zero-tuition star — pay only for living.</p>
          </div>
          <a href="#italy" className="text-ink font-semibold text-[14px] link-uline">See Italy zero-tuition →</a>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {managementCountries.map((c, i) => (
            <a key={c.code} href={c.code === 'it' ? '#italy' : '#'} className="group relative rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift block">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"/>
                {c.tag && (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-coral text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1">
                    {c.featured && <Star className="h-3 w-3 fill-current"/>} {c.tag}
                  </div>
                )}
                <div className="absolute top-3 right-3 text-[10px] mono uppercase tracking-widest text-cream/80">{String(i+1).padStart(2,'0')} / 08</div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-cream">
                  <img src={c.flag} alt="" className="h-4 w-6 rounded-sm ring-1 ring-white/20"/>
                  <div className="serif text-2xl font-light leading-none">{c.name}</div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] mono uppercase tracking-widest text-ink/50">Tuition</div>
                  <div className="serif text-[16px] font-medium text-ink">{c.fee}</div>
                </div>
                <p className="mt-2 text-[13px] text-ink/70 leading-relaxed">{c.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.programs?.map(p => (
                    <span key={p} className="inline-flex items-center rounded-full bg-cream border border-ink/10 text-ink text-[10px] px-2 py-0.5">{p}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
