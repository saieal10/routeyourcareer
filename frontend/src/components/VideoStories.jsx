import React, { useState } from 'react';
import { videos, parentQuotes } from '../mock';
import { Play, X, Quote } from 'lucide-react';

export default function VideoStories() {
  const [tab, setTab] = useState('videos');
  const [openVid, setOpenVid] = useState(null);
  return (
    <section id="stories" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 10 — Proof, not promises</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Real students.<br/><em className="font-light">Real campuses. Real families.</em></h2>
          </div>
          <div className="lg:col-span-5">
            <div className="inline-flex rounded-full bg-white border border-ink/10 p-1">
              {[{k:'videos', l:`Videos (${videos.length})`}, {k:'parents', l:`Parents (${parentQuotes.length})`}].map(t => (
                <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2 rounded-full text-[12px] font-semibold ${tab===t.k ? 'bg-ink text-cream' : 'text-ink/60 hover:text-ink'}`}>{t.l}</button>
              ))}
            </div>
          </div>
        </div>

        {tab === 'videos' && (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((v, i) => (
              <button key={v.yt} onClick={() => setOpenVid(v)} className="group text-left rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift">
                <div className="relative aspect-video overflow-hidden bg-ink">
                  <img src={`https://img.youtube.com/vi/${v.yt}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="h-14 w-14 rounded-full bg-coral text-white grid place-items-center group-hover:scale-110 transition"><Play className="h-6 w-6 fill-current" /></div>
                  </div>
                  <div className="absolute top-3 left-3 rounded-full bg-cream text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-1">{v.tag}</div>
                  <div className="absolute top-3 right-3 text-[10px] mono uppercase tracking-widest text-cream/70">{String(i+1).padStart(2,'0')}</div>
                </div>
                <div className="p-5">
                  <div className="serif text-[19px] font-medium text-ink leading-tight">{v.title}</div>
                  <div className="mt-1 text-[12px] mono uppercase tracking-widest text-ink/50">{v.author}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'parents' && (
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {parentQuotes.map((p) => (
              <figure key={p.name} className="rounded-3xl border border-ink/10 bg-white p-7 card-lift">
                <Quote className="h-7 w-7 text-coral" />
                <blockquote className="mt-4 serif text-[18px] text-ink leading-snug">“{p.text}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-ink/10">
                  <div className="h-10 w-10 rounded-full bg-coral text-white grid place-items-center serif italic font-medium">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>
                  <div>
                    <div className="font-semibold text-ink text-[14px]">{p.name}</div>
                    <div className="text-[11px] mono uppercase tracking-widest text-ink/60">{p.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {openVid && (
        <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm grid place-items-center p-4" onClick={() => setOpenVid(null)}>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpenVid(null)} className="absolute -top-10 right-0 text-cream/80 hover:text-cream"><X className="h-6 w-6" /></button>
            <iframe title={openVid.title} src={`https://www.youtube.com/embed/${openVid.yt}?autoplay=1`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
          </div>
        </div>
      )}
    </section>
  );
}
