import React from 'react';
import { brand } from '../mock';
import { Phone, Mail, Facebook, Instagram, Youtube, Linkedin, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cream text-ink grid place-items-center serif italic text-lg font-medium">r</div>
              <div>
                <div className="serif text-[20px] font-medium text-cream">Route Your Career</div>
                <div className="text-[10px] mono uppercase tracking-[0.22em] text-coral">Is your pathway · MBBS Abroad</div>
              </div>
            </div>
            <p className="mt-6 text-[14px] leading-relaxed max-w-md text-cream/60">
              Route Your Career is your pathway — a young guidance & lead-generation platform helping Indian students find their dream MBBS university across nine countries, with a special focus on Georgia and Uzbekistan.
            </p>
            <div className="mt-8 space-y-3 text-[13px]">
              <a href={`tel:${brand.phone}`} className="flex items-center gap-3 hover:text-coral"><Phone className="h-4 w-4 text-coral" /> {brand.phoneDisplay}</a>
              <a href={`mailto:${brand.email}`} className="flex items-center gap-3 hover:text-coral"><Mail className="h-4 w-4 text-coral" /> {brand.email}</a>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-coral" /> Present across Karnataka · Maharashtra · Kerala · Tamil Nadu · Telangana</div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              {[Facebook, Instagram, Youtube, Linkedin].map((Ic, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-full border border-cream/15 grid place-items-center hover:bg-coral hover:border-coral hover:text-white"><Ic className="h-4 w-4" /></a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="text-cream font-semibold text-[12px] mono uppercase tracking-widest">Explore</div>
            <ul className="mt-5 space-y-2.5 text-[13px]">
              {['Georgia · Uzbekistan','All Countries','Journey','AI Stack','States','About','Comparison','FAQ'].map(l => (
                <li key={l}><a href="#" className="hover:text-coral">{l}</a></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="text-cream font-semibold text-[12px] mono uppercase tracking-widest">Countries</div>
            <ul className="mt-5 space-y-2.5 text-[13px]">
              {['Russia','Ireland','Egypt','Moldova','Kazakhstan','Georgia','Uzbekistan','Kyrgyzstan','Nepal'].map(l => (
                <li key={l}><a href="#" className="hover:text-coral">MBBS in {l}</a></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="text-cream font-semibold text-[12px] mono uppercase tracking-widest">Ready to route your career?</div>
            <a href={brand.applyLink} target="_blank" rel="noreferrer" className="mt-5 group inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold hover:bg-[#d94a26]">
              Apply Online <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45"/>
            </a>
            <a href={brand.callbackLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-full border border-cream/20 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/5">
              Request Callback
            </a>
            <div className="mt-6 text-[11px] mono uppercase tracking-widest text-cream/50">{brand.hours}</div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-cream/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-cream/50">
          <div>© {new Date().getFullYear()} Route Your Career. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-coral">Privacy</a>
            <a href="#" className="hover:text-coral">Terms</a>
            <a href="#" className="hover:text-coral">Refund</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
