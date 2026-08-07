import React from 'react';
import { liveAdmissions } from '../mock';
import { GraduationCap } from 'lucide-react';

export default function LiveAdmissions() {
  const items = [...liveAdmissions, ...liveAdmissions];
  return (
    <section className="bg-amber-50/60 border-y border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
        <div className="shrink-0 hidden sm:flex items-center gap-2 pr-4 border-r border-amber-300">
          <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span></span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Live · Recent Admissions</span>
        </div>
        <div className="flex-1 overflow-hidden hover-pause">
          <div className="marquee-track flex whitespace-nowrap py-1">
            {items.map((a, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0 px-6 text-[13px] text-slate-700">
                <GraduationCap className="h-4 w-4 text-teal-700" />
                <b>{a.name}</b>, {a.from} · admitted to <b>{a.uni}</b> · <span className="text-slate-400">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
