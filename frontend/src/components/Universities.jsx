import React from 'react';
import { universities } from '../mock';
import { ArrowUpRight } from 'lucide-react';

export default function Universities() {
  return (
    <section id="universities" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="max-w-2xl">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 08 — Partner universities</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Thirty campuses.<br/><em className="font-light">All NMC-recognised.</em></h2>
          </div>
          <a href="#" className="text-ink font-semibold text-[14px] link-uline">All 30+ universities →</a>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {universities.map((u, i) => (
            <a key={u.name} href="#" className="group relative rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift">
              <div className="aspect-[16/11] overflow-hidden">
                <img src={u.img} alt={u.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] mono uppercase tracking-widest text-ink/60">
                    <img src={`https://flagcdn.com/w40/${u.code}.png`} alt="" className="h-3.5 w-5 rounded-sm ring-1 ring-black/10" /> {u.country}
                  </div>
                  <div className="text-[10px] mono uppercase tracking-widest text-ink/40">{String(i+1).padStart(2,'0')}</div>
                </div>
                <h3 className="mt-4 serif text-[22px] font-medium text-ink leading-snug">{u.name}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[12px] text-ink/50">{u.est}</span>
                  <span className="inline-flex items-center gap-1 text-ink group-hover:text-coral font-semibold text-[13px]">View details <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" /></span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
