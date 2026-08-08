import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { countries } from '../mock';
import { ArrowUpRight } from 'lucide-react';

export default function Countries() {
  const [active, setActive] = useState(0);
  const featured = countries[active];
  return (
    <section id="countries" className="py-24 bg-sand relative overflow-hidden grain-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="max-w-2xl">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 03 — The Atlas</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Nine countries.<br/><em className="font-light">One doctor-led route.</em></h2>
            <p className="mt-4 text-ink/70 text-[15px] max-w-lg">Every country below is NMC-recognised, English-medium, and has an RYC on-ground coordinator for 24×7 student support.</p>
          </div>
          <a href="#" className="text-ink font-semibold text-[14px] link-uline">View all countries →</a>
        </div>

        <div className="mt-12 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden aspect-[16/11] bg-ink">
              <img src={featured.img} alt={featured.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/90 via-ink/40 to-transparent" />
              <div className="absolute top-5 left-5 flex items-center gap-2">
                <img src={featured.flag} alt="" className="h-6 w-9 rounded-sm ring-1 ring-white/30" />
                <span className="text-cream/80 text-[10px] mono uppercase tracking-widest">Featured destination</span>
              </div>
              {featured.tag && (
                <div className="absolute top-5 right-5 rounded-full bg-coral text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1">{featured.tag}</div>
              )}
              <div className="absolute bottom-6 left-6 right-6 text-cream">
                <div className="serif text-5xl sm:text-7xl font-light leading-none">{featured.name}</div>
                <p className="mt-3 max-w-lg text-cream/80 text-[14px]">{featured.desc}</p>
                <div className="mt-4 flex items-center gap-4">
                  <div>
                    <div className="text-[10px] mono uppercase tracking-widest text-cream/60">Total fee</div>
                    <div className="serif text-2xl">{featured.fee}</div>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div>
                    <div className="text-[10px] mono uppercase tracking-widest text-cream/60">Language</div>
                    <div className="serif text-2xl">English</div>
                  </div>
                  {featured.code === 'ge' ? (
                    <Link to="/countries/georgia" className="ml-auto inline-flex items-center gap-1 rounded-full bg-coral hover:bg-[#d94a26] text-white px-4 py-2 text-[13px] font-semibold">
                      Explore {featured.name} <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link to={`/country/${featured.code}`} className="ml-auto inline-flex items-center gap-1 rounded-full bg-coral hover:bg-[#d94a26] text-white px-4 py-2 text-[13px] font-semibold">
                      Explore {featured.name} <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              {countries.map((c, i) => (
                <button key={c.code} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => { if (c.code === 'ge') { window.location.href = '/countries/georgia'; } else { window.location.href = `/country/${c.code}`; } }} className={`group text-left rounded-2xl border p-4 transition-all ${active===i ? 'bg-ink text-cream border-ink' : 'bg-white/70 border-ink/10 hover:border-ink/30'}`}>
                  <div className="flex items-center justify-between">
                    <img src={c.flag} alt="" className="h-4 w-6 rounded-sm ring-1 ring-black/10" />
                    <span className={`text-[10px] mono uppercase tracking-widest ${active===i ? 'text-coral' : 'text-ink/40'}`}>{String(i+1).padStart(2,'0')}</span>
                  </div>
                  <div className={`mt-3 serif text-[22px] font-medium leading-tight ${active===i ? 'text-cream' : 'text-ink'}`}>{c.name}</div>
                  <div className={`text-[11px] mono uppercase tracking-widest mt-1 ${active===i ? 'text-cream/70' : 'text-ink/50'}`}>{c.fee}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
