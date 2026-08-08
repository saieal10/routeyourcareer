import React, { useState } from 'react';
import { blogs, brand } from '../mock';
import { Clock, ArrowUpRight, BookOpen } from 'lucide-react';

const CATS = ['All', 'MBBS', 'Management', 'Italy', 'Germany', 'Guidance'];

export default function Blogs() {
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? blogs : blogs.filter(b => b.cat === cat);
  return (
    <section id="blog" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2"><BookOpen className="h-3.5 w-3.5"/> / 10 — RYC Journal</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Read <em className="font-light">before you apply.</em></h2>
          </div>
          <p className="lg:col-span-5 text-ink/70 text-[15px] leading-relaxed">Written by our own counsellors — the same people who’ll pick up your call. Zero fluff, always fresh, always honest.</p>
        </div>

        <div className="mt-6 inline-flex rounded-full bg-white border border-ink/10 p-1 overflow-x-auto">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${cat===c ? 'bg-ink text-cream' : 'text-ink/60 hover:text-ink'}`}>{c}</button>
          ))}
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b, i) => (
            <a key={b.slug} href={brand.callbackLink} target="_blank" rel="noreferrer" className="group rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift block">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={b.img} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-cream border border-ink/10 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">{b.cat}</span>
                  <span className="text-[10px] mono uppercase tracking-widest text-ink/40 flex items-center gap-1"><Clock className="h-3 w-3"/> {b.mins} min</span>
                </div>
                <h3 className="mt-3 serif text-[22px] font-medium text-ink leading-snug">{b.title}</h3>
                <p className="mt-2 text-[13px] text-ink/70 leading-relaxed">{b.excerpt}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-ink group-hover:text-coral font-semibold text-[13px]">Read the story <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45"/></div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
