import React, { useEffect, useState } from 'react';
import { ArrowUpRight, PhoneCall } from 'lucide-react';
import { brand } from '../mock';

const rotatingCountries = ['Georgia', 'Uzbekistan', 'Ireland', 'Russia', 'Egypt', 'Moldova'];

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % rotatingCountries.length), 1900);
    return () => clearInterval(t);
  }, []);
  return (
    <section id="top" className="relative overflow-hidden bg-cream grain-bg">
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-coral/15 blur-3xl" />
      <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-forest/15 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 grid lg:grid-cols-12 gap-10 items-start relative">
        <div className="lg:col-span-7 fade-up">
          <div className="flex items-center gap-3 text-[11px] mono uppercase tracking-widest text-ink/70">
            <span className="h-2 w-2 rounded-full bg-coral animate-pulse"></span>
            New startup / old experience
            <span className="h-px w-6 bg-ink/20"></span>
            Sep 2026 intake open
          </div>

          <h1 className="mt-6 serif text-[52px] sm:text-[74px] lg:text-[86px] font-normal leading-[0.95] text-ink">
            Find your <em className="font-light">dream</em><br/>
            MBBS university
            <span className="block mt-2">
              in <span className="relative inline-block text-coral">
                <span className="ticker-viewport italic font-medium">
                  <span key={wordIdx} className="block leading-[1.1] fade-up">{rotatingCountries[wordIdx]}</span>
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 200 14" fill="none"><path d="M2 8 Q 50 -2 100 8 T 198 8" stroke="#e85d3a" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>
              </span>.
            </span>
          </h1>

          <p className="mt-8 text-ink/70 text-[16px] sm:text-[17px] max-w-xl leading-relaxed">
            Route Your Career helps Indian students secure MBBS admission across all 9 partner countries — with the strongest expertise and priority focus on <b className="text-forest">Georgia</b> and <b className="text-forest">Uzbekistan</b>. Free consultation on request.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={brand.applyLink} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-ink text-cream px-6 py-3.5 text-[14px] font-semibold hover:bg-forest">
              Apply Online →
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </a>
            <a href={brand.callbackLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border-2 border-ink text-ink px-6 py-3.5 text-[14px] font-semibold hover:bg-coral hover:border-coral hover:text-white">
              <PhoneCall className="h-4 w-4" /> Request a Callback
            </a>
          </div>
          <div className="mt-3 text-[12px] mono uppercase tracking-widest text-ink/50">
            Both are quick Google Forms · we get back to you within 24 hrs
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {[{k:'9', v:'Countries covered'}, {k:'2', v:'Priority: Georgia / Uzbekistan'}, {k:'5', v:'Indian states we serve'}, {k:'₹15–45L', v:'Total MBBS fee range'}].map((s) => (
              <div key={s.v} className="flex items-baseline gap-2">
                <span className="serif text-[24px] font-medium text-ink">{s.k}</span>
                <span className="uppercase mono tracking-widest text-[10px] text-ink/60">{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="grid grid-cols-6 gap-3">
            <a href={brand.applyLink} target="_blank" rel="noreferrer" className="col-span-3 group rot-hover">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-forest">
                <img src="https://images.unsplash.com/photo-1603350576276-24747f7bbf40?crop=entropy&cs=srgb&fm=jpg&w=900&q=85" alt="Georgia" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-coral text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                  <img src="https://flagcdn.com/w20/ge.png" alt="" className="h-3 w-4 rounded-sm"/> Priority
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-cream">
                  <div className="text-[10px] mono uppercase tracking-widest text-coral">MBBS in</div>
                  <div className="serif text-4xl font-light leading-none mt-1">Georgia</div>
                  <div className="mt-2 text-[12px] text-cream/80">₹20–28L · English-medium</div>
                </div>
              </div>
            </a>
            <a href={brand.applyLink} target="_blank" rel="noreferrer" className="col-span-3 group rot-hover">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-ink">
                <img src="https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?crop=entropy&cs=srgb&fm=jpg&w=900&q=85" alt="Uzbekistan" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-coral text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                  <img src="https://flagcdn.com/w20/uz.png" alt="" className="h-3 w-4 rounded-sm"/> Priority
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-cream">
                  <div className="text-[10px] mono uppercase tracking-widest text-coral">MBBS in</div>
                  <div className="serif text-4xl font-light leading-none mt-1">Uzbekistan</div>
                  <div className="mt-2 text-[12px] text-cream/80">₹16–20L · English-medium</div>
                </div>
              </div>
            </a>
            <div className="col-span-6 rounded-3xl bg-ink text-cream p-5" id="book">
              <div className="flex items-center justify-between">
                <div className="text-[10px] mono uppercase tracking-widest text-coral">Free consultation · on request</div>
                <div className="flex -space-x-2">
                  {[11,12,13,14].map(i => <img key={i} src={`https://i.pravatar.cc/40?img=${i}`} className="h-6 w-6 rounded-full ring-2 ring-ink" alt=""/>)}
                </div>
              </div>
              <div className="mt-2 serif text-[22px] font-medium leading-tight">Two simple ways to start.</div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={brand.applyLink} target="_blank" rel="noreferrer" className="rounded-xl bg-coral hover:bg-[#d94a26] text-white font-bold py-3 text-[13px] inline-flex items-center justify-center gap-1">Apply Online →</a>
                <a href={brand.callbackLink} target="_blank" rel="noreferrer" className="rounded-xl bg-cream hover:bg-white text-ink font-bold py-3 text-[13px] inline-flex items-center justify-center gap-1"><PhoneCall className="h-3.5 w-3.5"/> Callback</a>
              </div>
              <div className="mt-3 text-[10px] text-cream/50 mono uppercase tracking-widest">Powered by Google Forms · 24-hr response</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
