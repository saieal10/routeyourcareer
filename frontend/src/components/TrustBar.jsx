import React from 'react';
import { recognitions, bigStats } from '../mock';

export default function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Universities recognised by</div>
        <div className="flex items-center gap-6 flex-wrap">
          {recognitions.map((r) => (
            <div key={r} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-teal-50 border border-teal-200 grid place-items-center text-teal-800 font-bold text-[11px]">{r.slice(0,2)}</div>
              <span className="font-semibold text-slate-800 tracking-wide">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsBlock() {
  return (
    <section className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 lg:grid-cols-5 gap-6">
        {bigStats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="serif text-4xl sm:text-5xl font-bold text-amber-400">{s.value}</div>
            <div className="mt-1 text-[13px] font-semibold">{s.label}</div>
            <div className="text-[11px] text-slate-400">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
