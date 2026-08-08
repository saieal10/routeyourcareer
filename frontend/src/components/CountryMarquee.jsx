import React from 'react';
import { countries, managementCountries } from '../mock';

export default function CountryMarquee() {
  const combined = [...countries.map(c => ({...c, k: 'MBBS'})), ...managementCountries.map(c => ({...c, k: 'MGMT'}))];
  const items = [...combined, ...combined];
  return (
    <section className="bg-ink text-cream overflow-hidden border-y border-ink">
      <div className="hover-pause">
        <div className="marquee-fast flex whitespace-nowrap py-5 items-center">
          {items.map((c, i) => (
            <div key={i} className="flex items-center gap-4 shrink-0 px-8">
              <img src={c.flag} alt="" className="h-5 w-8 rounded-sm ring-1 ring-white/20" />
              <span className="serif italic text-[28px] sm:text-[34px] font-light">{c.k} in {c.name}</span>
              <span className="text-coral text-2xl">✱</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
