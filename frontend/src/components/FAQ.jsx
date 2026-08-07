import React, { useState } from 'react';
import { faqs } from '../mock';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 09 — Straight answers</div>
          <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Real<br/><em className="font-light">questions.</em></h2>
          <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-sm">Everything students & parents ask us in the first call — answered up-front.</p>
        </div>
        <div className="lg:col-span-8">
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className="py-2">
                  <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full flex items-start gap-4 py-4 text-left">
                    <span className="edit-num text-2xl w-10 shrink-0">{String(i+1).padStart(2,'0')}</span>
                    <span className="flex-1 serif text-[22px] font-medium text-ink leading-snug">{f.q}</span>
                    <span className="h-8 w-8 rounded-full border border-ink/20 grid place-items-center shrink-0">
                      {isOpen ? <Minus className="h-4 w-4"/> : <Plus className="h-4 w-4"/>}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pl-14 pr-12 pb-5 text-ink/70 text-[15px] leading-relaxed fade-up">{f.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
