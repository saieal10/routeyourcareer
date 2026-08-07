import React from 'react';
import { Quote, ArrowUpRight } from 'lucide-react';

export default function Founder() {
  return (
    <section id="founder" className="py-24 bg-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <div className="relative max-w-md">
            <div className="absolute -inset-6 bg-coral/10 blob" />
            <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&q=80" alt="Founder" className="relative w-full aspect-[4/5] object-cover rounded-2xl" />
            <div className="absolute -bottom-4 -right-4 bg-ink text-cream rounded-2xl p-4 max-w-[210px] shadow-xl">
              <div className="text-[10px] mono uppercase tracking-widest text-coral">The Founder</div>
              <div className="mt-1 serif text-[20px] font-medium leading-tight">Dr. Karthik Bhat</div>
              <div className="text-[11px] text-cream/60 mt-1">MBBS · MD · FMGE 1st attempt</div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 05 — Meet the founder</div>
          <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">A doctor built this<br/><em className="font-light">for other doctors’ kids.</em></h2>
          <div className="mt-8 relative pl-10">
            <Quote className="absolute top-0 left-0 h-7 w-7 text-coral" />
            <p className="serif italic text-[22px] leading-snug text-ink">“We don’t sell seats. We route careers. Every family gets the same fee letter my own family would want — in writing, before you fly.”</p>
          </div>
          <p className="mt-6 text-ink/70 text-[15px] leading-relaxed max-w-2xl">
            <b className="text-ink">Dr. Karthik Bhat</b> — MBBS Perm State Medical University, MD (Medicine), FMGE first attempt · Managing Director, RYC Multispeciality Hospital, Bengaluru.
            After watching too many families lose lakhs to commission agents, he built RYC on one rule: every counsellor must be an MBBS doctor first, a counsellor second.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[{k:'2018', v:'RYC founded'},{k:'50+', v:'MBBS counsellors'},{k:'5', v:'South India offices'}].map(x => (
              <div key={x.v} className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                <div className="serif text-3xl text-ink">{x.k}</div>
                <div className="text-[11px] mono uppercase tracking-widest text-ink/60 mt-1">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#book" className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[13px] font-semibold hover:bg-forest">
              Book a 1:1 with Dr. Karthik <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href="#" className="inline-flex items-center gap-2 rounded-full border border-ink/20 text-ink px-5 py-3 text-[13px] font-semibold hover:bg-ink hover:text-cream">
              Read the full RYC story
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
