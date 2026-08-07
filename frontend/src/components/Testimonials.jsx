import React from 'react';
import { testimonials } from '../mock';
import { Quote, Star } from 'lucide-react';

export default function Testimonials() {
  const items = [...testimonials, ...testimonials];
  return (
    <section id="testimonials" className="py-24 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 04 — In their own words</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Doctors who <em className="font-light">started</em> as students at RYC.</h2>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center gap-1 text-coral">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}<span className="ml-2 text-ink text-[14px] font-semibold">4.9 / 5</span></div>
            <p className="text-ink/70 text-[14px] max-w-md">2,400+ Indian families have trusted RYC with the biggest decision of their child’s life. These are just five of them.</p>
          </div>
        </div>
      </div>
      <div className="mt-14 hover-pause overflow-hidden">
        <div className="marquee-track flex gap-6 px-4" style={{width: 'max-content'}}>
          {items.map((t, i) => (
            <figure key={i} className="w-[380px] shrink-0 rounded-3xl border border-ink/10 bg-white p-7 card-lift">
              <Quote className="h-8 w-8 text-coral" />
              <blockquote className="mt-4 serif text-[19px] text-ink leading-snug">“{t.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-ink/10">
                <div className="h-11 w-11 rounded-full bg-forest text-cream grid place-items-center serif italic text-lg">{t.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>
                <div>
                  <div className="font-semibold text-ink text-[14px]">{t.name}</div>
                  <div className="text-[12px] text-ink/60">{t.uni}</div>
                  <div className="text-[10px] mono uppercase tracking-widest text-coral mt-0.5">{t.batch}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
