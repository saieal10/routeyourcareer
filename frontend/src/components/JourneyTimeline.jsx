import React from 'react';
import { CalendarCheck, FileSearch, Video, PlaneTakeoff, Home, GraduationCap } from 'lucide-react';

const steps = [
  { m: 'M0', title: 'The Free Consult', body: 'A 30-minute call with an MBBS doctor-counsellor. Get a personalised country shortlist, honest fee breakdown, and answers to your parents’ questions.', icon: CalendarCheck, tag: 'Day 1' },
  { m: 'M1', title: 'Written Fee Letter', body: 'You receive a locked, university-wise RYC fee letter. Zero hidden charges. This is our BHAROSA contract with your family.', icon: FileSearch, tag: 'Week 1' },
  { m: 'M2', title: 'Application & Documents', body: 'We prepare passports, marksheets, invitation letters. Nano Banana AI verifies photo-signature specs against embassy rules.', icon: FileSearch, tag: 'Month 1' },
  { m: 'M3', title: 'Mock Visa Interview', body: 'Gemini 2.5 Visa Bot runs a full mock interview — flagged by our team — before your embassy slot. 100% visa success rate.', icon: Video, tag: 'Month 2' },
  { m: 'M4', title: 'Group Flight & Arrival', body: 'Group flight with a RYC senior. Airport pickup at your destination, SIM activation, hostel check-in, orientation.', icon: PlaneTakeoff, tag: 'Month 3' },
  { m: 'M5', title: 'On-Ground Life', body: 'On-ground RYC coordinator at your campus. Indian vegetarian mess. Monthly family-update calls back home.', icon: Home, tag: 'Year 1' },
  { m: 'M6', title: 'FMGE / NExT Ready', body: 'DBMCI / Marrow / PrepLadder from year-1. Six-year hand-holding until you clear FMGE / NExT and register with the state medical council.', icon: GraduationCap, tag: 'Year 6' },
];

export default function JourneyTimeline() {
  return (
    <section id="journey" className="py-24 bg-ink text-cream relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #f6f2ea 1px, transparent 0)', backgroundSize: '32px 32px'}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">/ 02 — The Route</div>
            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95]">From your kitchen table<br/><em className="font-light text-coral">to the operating table.</em></h2>
          </div>
          <p className="lg:col-span-5 text-cream/70 text-[15px] leading-relaxed">
            Seven checkpoints from your first free consultation to the day you land on campus. One guidance team by your side, all the way.
          </p>
        </div>

        <div className="mt-16 relative">
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-cream/15" />
          <div className="space-y-10">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const right = i % 2 === 1;
              return (
                <div key={s.m} className={`relative grid sm:grid-cols-2 gap-6 items-center`}>
                  <div className={`sm:${right ? 'col-start-2' : 'col-start-1'}`}>
                    <div className="pl-14 sm:pl-0">
                      <div className={`rounded-3xl border border-cream/10 bg-white/[0.03] backdrop-blur p-6 hover:border-coral/60 transition-all card-lift ${right ? 'sm:ml-8' : 'sm:mr-8'}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-coral/20 text-coral grid place-items-center"><Icon className="h-5 w-5" /></div>
                          <div>
                            <div className="text-[10px] mono uppercase tracking-widest text-coral">{s.tag}</div>
                            <div className="text-[10px] mono uppercase tracking-widest text-cream/40">Step {s.m}</div>
                          </div>
                        </div>
                        <h3 className="mt-4 serif text-[26px] font-medium">{s.title}</h3>
                        <p className="mt-2 text-cream/70 text-[14px] leading-relaxed">{s.body}</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-6 sm:left-1/2 top-6 -translate-x-1/2">
                    <div className="relative h-4 w-4 rounded-full bg-coral text-coral"><span className="pulse-ring"/></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
