import React from 'react';
import { bigStats } from '../mock';

export default function Stats() {
  return (
    <section className="bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '24px 24px'}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {bigStats.map((s) => (
            <div key={s.label} className="text-center border border-slate-800 rounded-xl py-6 bg-slate-800/40 backdrop-blur">
              <div className="serif text-4xl sm:text-5xl font-bold text-amber-400 leading-none">{s.value}</div>
              <div className="mt-2 text-[13px] font-semibold uppercase tracking-wide">{s.label}</div>
              <div className="text-[11px] text-slate-400 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
