import React from 'react';
import { brand } from '../mock';
import { MessageCircle, Phone, ArrowUpRight } from 'lucide-react';

export default function CTABanner() {
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-[36px] bg-ink text-cream p-10 sm:p-14 lg:p-20 overflow-hidden grain-bg">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-coral/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-forest/40 blur-3xl" />
          <div className="relative grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="text-[11px] mono uppercase tracking-widest text-coral">Ready when you are</div>
              <h2 className="serif mt-3 text-5xl sm:text-7xl font-normal leading-[0.95]">Route your <em className="font-light">career</em>,<br/>not just your admission.</h2>
              <p className="mt-6 text-cream/70 text-[15px] max-w-xl leading-relaxed">Two Google-Form clicks and we're on it. Apply online for a written university shortlist, or request a callback and we'll ring you back — free consultation on request.</p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3">
              <a href={brand.applyLink} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-between gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-6 py-4 text-[15px] font-bold">
                <span className="inline-flex items-center gap-2">Apply Online</span>
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" />
              </a>
              <a href={brand.callbackLink} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-between gap-2 rounded-full bg-cream text-ink px-6 py-4 text-[15px] font-bold hover:bg-white">
                <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> Request Callback</span>
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" />
              </a>
              <a href={`https://wa.me/${brand.whatsapp.replace('+','')}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between gap-2 rounded-full border border-cream/25 text-cream px-6 py-3 text-[13px] font-semibold hover:bg-cream/10">
                <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp {brand.phoneDisplay}</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <div className="text-[11px] mono uppercase tracking-widest text-cream/50 pt-1">Mon–Sat · 10am–7pm IST</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
