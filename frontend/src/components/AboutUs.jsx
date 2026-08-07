import React from 'react';
import { aboutBullets, brand } from '../mock';
import { ArrowUpRight, MapPin, MessageCircle } from 'lucide-react';

export default function AboutUs() {
  return (
    <section id="about" className="py-24 bg-sand grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 05 — About Route Your Career</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">A young team.<br/><em className="font-light">A decade of MBBS-abroad experience.</em></h2>
            <p className="mt-6 text-ink/70 text-[15px] leading-relaxed max-w-md">
              Route Your Career is a <b>new startup</b> — but our core team has spent the last decade quietly guiding Indian students to MBBS abroad. We saw one gap: an honest, one-stop platform that <em>only</em> does guidance & lead generation — no commission-agent games, no seat pushing.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={brand.applyLink} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[13px] font-semibold hover:bg-forest">
                Apply Online <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45"/>
              </a>
              <a href={`https://wa.me/${brand.whatsapp.replace('+','')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ink/20 text-ink px-5 py-3 text-[13px] font-semibold hover:bg-coral hover:text-white hover:border-coral">
                <MessageCircle className="h-4 w-4"/> WhatsApp us
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-4">
              {aboutBullets.map((b, i) => (
                <div key={b.k} className="rounded-3xl border border-ink/10 bg-white p-6 card-lift">
                  <div className="edit-num text-4xl">{String(i+1).padStart(2,'0')}</div>
                  <h3 className="mt-3 serif text-[24px] font-medium text-ink leading-tight">{b.k}</h3>
                  <p className="mt-2 text-[14px] text-ink/70 leading-relaxed">{b.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-ink text-cream p-6 lg:p-8">
              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2"><MapPin className="h-3.5 w-3.5"/> Present across five Indian states</div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['Karnataka','Maharashtra','Kerala','Tamil Nadu','Telangana'].map((s) => (
                  <div key={s} className="rounded-2xl bg-white/5 border border-cream/10 px-3 py-2.5 text-[13px] font-medium text-cream text-center">{s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
