import React from 'react';
import { compare } from '../mock';
import { Plane, Check, X } from 'lucide-react';

export default function Comparison() {
  return (
    <section id="comparison" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 11 — The math parents ask about</div>
          <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Abroad, or <em className="font-light">₹1Cr</em> in Private?</h2>
          <p className="mt-6 text-ink/70 text-[15px] leading-relaxed">Same NMC-recognised degree. Same right to practice in India. 7 out of 10 NEET-qualified RYC students choose government universities abroad.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-ink text-cream p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-coral/25 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-coral text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">Recommended</div>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-cream/10 border border-cream/20 grid place-items-center"><Plane className="h-6 w-6 text-coral"/></div>
                <div>
                  <h3 className="serif text-3xl font-medium">MBBS Abroad</h3>
                  <p className="text-[13px] text-cream/60">Government universities worldwide</p>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-cream/10">
                {compare.abroad.map((c) => (
                  <li key={c.t} className="py-3 flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-coral text-white grid place-items-center shrink-0 mt-0.5"><Check className="h-3.5 w-3.5"/></div>
                    <div>
                      <div className="font-semibold text-cream text-[14px]">{c.t}</div>
                      <div className="text-[13px] text-cream/60">{c.s}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-ink/10 bg-white p-8 lg:p-10">
            <div className="flex items-center gap-3">
              <img src="https://flagcdn.com/w80/in.png" alt="IN" className="h-11 w-16 rounded-md object-cover" />
              <div>
                <h3 className="serif text-3xl font-medium text-ink">MBBS India (Private)</h3>
                <p className="text-[13px] text-ink/60">Private medical colleges</p>
              </div>
            </div>
            <ul className="mt-6 divide-y divide-ink/10">
              {compare.india.map((c) => (
                <li key={c.t} className="py-3 flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-ink/10 grid place-items-center text-ink/60 shrink-0 mt-0.5"><X className="h-3.5 w-3.5"/></div>
                  <div>
                    <div className="font-semibold text-ink text-[14px]">{c.t}</div>
                    <div className="text-[13px] text-ink/60">{c.s}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
