import React from 'react';
import { aiAgents } from '../mock';
import * as Lucide from 'lucide-react';
import { Bot, Cpu } from 'lucide-react';

export default function AiAgents() {
  return (
    <section id="ai-agents" className="py-24 bg-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-forest/10 blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 06 — Inside the machine</div>
              <div className="h-px flex-1 bg-ink/10" />
            </div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">Every AI agent<br/>we <em className="font-light">actually</em> use.</h2>
          </div>
          <p className="lg:col-span-5 text-ink/70 text-[15px] leading-relaxed">
            Transparency by default. Below is our full stack — chat, LLM, vision, voice — plus how each one plugs into a real MBBS doctor before anything reaches you.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiAgents.map((a, i) => {
            const Icon = Lucide[a.icon] || Bot;
            return (
              <div key={a.name} className="group relative rounded-3xl border border-ink/10 bg-white p-6 card-lift">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] mono uppercase tracking-widest text-ink/40">{String(i+1).padStart(2,'0')} / {String(aiAgents.length).padStart(2,'0')}</div>
                  <span className="text-[10px] mono uppercase tracking-widest text-coral border border-coral/40 rounded-full px-2 py-0.5">{a.tag}</span>
                </div>
                <div className="mt-6 h-12 w-12 rounded-2xl bg-ink text-cream grid place-items-center group-hover:bg-coral transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 serif text-[22px] font-medium text-ink leading-tight">{a.name}</h3>
                <div className="text-[10px] mono uppercase tracking-widest text-forest mt-1">{a.role}</div>
                <p className="mt-3 text-[13px] text-ink/70 leading-relaxed">{a.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-[12px] font-semibold text-ink/60 group-hover:text-coral">
                  <div className="relative h-1.5 w-1.5 rounded-full bg-emerald-500 text-emerald-500"><span className="pulse-ring"/></div>
                  <span className="mono uppercase tracking-widest text-[10px]">Active in prod</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl bg-ink text-cream p-8 lg:p-10 grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 text-[11px] mono uppercase tracking-widest text-coral">
              <Cpu className="h-3.5 w-3.5" /> Human-in-the-loop
            </div>
            <div className="mt-2 serif text-[26px] sm:text-[32px] font-normal leading-tight">
              Every AI output is reviewed by an MBBS doctor-counsellor before it reaches your inbox.
            </div>
            <div className="mt-3 text-cream/70 text-[14px]">We ship AI to make our doctors faster — never to replace them. That’s ROUTE HAI TO BHAROSA HAI in code.</div>
          </div>
          <a href="#book" className="lg:col-span-4 justify-self-end inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-6 py-3.5 text-[14px] font-bold">
            Try the RYC AI stack →
          </a>
        </div>
      </div>
    </section>
  );
}
