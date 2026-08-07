import React from 'react';
import { whyPoints } from '../mock';
import * as Lucide from 'lucide-react';

export default function WhyChoose() {
  return (
    <section id="why" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 01 — Why RYC</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">
              Eight promises,<br/><em className="font-light">written down.</em>
            </h2>
            <p className="mt-6 text-ink/70 text-[15px] leading-relaxed max-w-md">
              Every counsellor is an MBBS doctor. Every university is NMC-recognised. Every fee letter is locked at admission — in writing, before you fly.
            </p>
            <a href="#book" className="mt-6 inline-flex items-center gap-1 text-ink font-semibold text-[14px] link-uline">
              Get the RYC promise document →
            </a>
          </div>

          <div className="lg:col-span-7">
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {whyPoints.map((p, i) => {
                const Icon = Lucide[p.icon] || Lucide.CheckCircle;
                return (
                  <div key={p.title} className="group py-6 flex items-start gap-6 hover:bg-white/50 -mx-3 px-3 rounded-2xl transition-colors">
                    <div className="edit-num text-4xl sm:text-5xl w-14 shrink-0">{String(i+1).padStart(2, '0')}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-forest" />
                        <div className="text-[10px] mono uppercase tracking-widest text-ink/50">{p.tag}</div>
                      </div>
                      <h3 className="mt-2 serif text-[24px] font-medium text-ink">{p.title}</h3>
                      <p className="mt-2 text-[14px] text-ink/70 leading-relaxed max-w-xl">{p.body}</p>
                    </div>
                    <Lucide.ArrowUpRight className="h-5 w-5 text-ink/30 group-hover:text-coral group-hover:rotate-12 transition" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
