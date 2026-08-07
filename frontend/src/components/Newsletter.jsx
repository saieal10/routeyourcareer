import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { toast } from '../hooks/use-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast({ title: 'Subscribed!', description: 'MBBS-abroad updates coming your way.' });
    setEmail('');
  };
  return (
    <section className="py-20 bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-ink/10 bg-white p-10 sm:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">The RYC Bulletin</div>
            <h3 className="serif mt-3 text-4xl font-normal text-ink leading-tight">Country guides, fee changes, FMGE tips — <em className="font-light">once a month</em>.</h3>
            <p className="mt-3 text-ink/60 text-[14px]">No spam. No agent handovers. Unsubscribe with one click.</p>
          </div>
          <form onSubmit={submit} className="w-full lg:w-auto flex items-center gap-2 rounded-full border border-ink/15 bg-cream/60 pl-5 pr-1.5 py-1.5 min-w-[320px]">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="flex-1 bg-transparent py-3 text-[14px] focus:outline-none" />
            <button type="submit" className="inline-flex items-center gap-1 rounded-full bg-ink hover:bg-forest text-cream px-4 py-2.5 text-[13px] font-semibold">Subscribe <ArrowUpRight className="h-4 w-4"/></button>
          </form>
        </div>
      </div>
    </section>
  );
}
