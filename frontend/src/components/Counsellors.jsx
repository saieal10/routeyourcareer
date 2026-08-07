import React from 'react';
import { counsellors } from '../mock';
import { MapPin } from 'lucide-react';

export default function Counsellors() {
  const items = [...counsellors, ...counsellors];
  return (
    <section id="counsellors" className="py-24 bg-sand overflow-hidden grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 09 — Real doctors, real desks</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">50+ MBBS doctor<br/><em className="font-light">counsellors on staff.</em></h2>
          </div>
          <p className="lg:col-span-5 text-ink/70 text-[15px] leading-relaxed">
            Every RYC counsellor holds an MBBS — most are alumni of the very universities they now recommend. Hover to pause the reel.
          </p>
        </div>
      </div>

      <div className="mt-12 hover-pause">
        <div className="marquee-track flex gap-5 px-4" style={{width: 'max-content'}}>
          {items.map((c, i) => (
            <div key={i} className="w-[220px] shrink-0">
              <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-ink relative card-lift">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-cream">
                  <div className="font-semibold text-[14px]">{c.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-cream/70"><MapPin className="h-3 w-3 text-coral" /> {c.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
