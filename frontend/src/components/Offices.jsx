import React from 'react';
import { offices, brand } from '../mock';
import { MapPin, Phone, Star } from 'lucide-react';

export default function Offices() {
  return (
    <section id="offices" className="py-24 bg-sand grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 07 — South India, all of it</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Five offices.<br/><em className="font-light">One doctor promise.</em></h2>
          </div>
          <p className="lg:col-span-5 text-ink/70 text-[15px] leading-relaxed">
            Walk into any RYC partner office in Bengaluru, Mumbai, Kochi, Chennai or Hyderabad — and every counsellor across the table will be an MBBS doctor.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-5 gap-4">
          {offices.map((o, i) => (
            <a href="#" key={o.city} className="group relative rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={o.img} alt={o.city} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                {o.hq && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-coral text-white text-[10px] font-extrabold uppercase tracking-widest px-2 py-1">
                    <Star className="h-3 w-3 fill-current" /> HQ
                  </div>
                )}
                <div className="absolute top-3 left-3 text-[10px] mono uppercase tracking-widest text-cream/80">{String(i+1).padStart(2,'0')} / 05</div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-cream">
                  <div className="serif text-3xl font-medium leading-none">{o.city}</div>
                  <div className="text-[11px] mono uppercase tracking-widest text-cream/70 mt-1">{o.state}</div>
                  <div className="mt-3 flex items-center gap-1.5 text-[12px] text-cream/90">
                    <MapPin className="h-3.5 w-3.5 text-coral" /> {o.area}
                  </div>
                  <a href={`tel:${brand.phone}`} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-coral">
                    <Phone className="h-3 w-3" /> {brand.phoneDisplay}
                  </a>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-white/60 p-6">
          <div>
            <div className="text-[11px] mono uppercase tracking-widest text-coral">Not in South India?</div>
            <div className="mt-1 serif text-2xl text-ink">We still counsel you — over WhatsApp, video, or a home visit.</div>
          </div>
          <a href={`https://wa.me/${brand.whatsapp.replace('+','')}`} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-ink text-cream px-5 py-3 text-[13px] font-semibold hover:bg-forest">Message us on WhatsApp →</a>
        </div>
      </div>
    </section>
  );
}
