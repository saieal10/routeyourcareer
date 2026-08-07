import React, { useState } from 'react';
import { MessageCircle, X, Phone, Calendar } from 'lucide-react';
import { brand } from '../mock';

export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[320px] rounded-3xl bg-white border border-ink/10 shadow-2xl overflow-hidden">
          <div className="bg-ink text-cream p-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-cream text-ink grid place-items-center serif italic font-medium">r</div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-coral ring-2 ring-ink"></span>
              </div>
              <div>
                <div className="font-bold text-[14px]">RYC AI Assistant</div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">Online · replies instantly</div>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-cream/80 hover:text-cream"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <div className="rounded-2xl bg-cream/60 border border-ink/5 p-3 text-[13px] text-ink/80">Hi 👋 I’m RYC AI. Ask me anything about MBBS abroad — countries, fees, or FMGE.</div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a href={`tel:${brand.phone}`} className="inline-flex items-center justify-center gap-1 rounded-full border border-ink/15 hover:border-ink px-2 py-2 text-[12px] font-semibold"><Phone className="h-3.5 w-3.5" /> Call</a>
              <a href={`https://wa.me/${brand.whatsapp.replace('+','')}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-full bg-coral hover:bg-[#d94a26] text-white px-2 py-2 text-[12px] font-bold"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
              <a href="#book" className="col-span-2 inline-flex items-center justify-center gap-1 rounded-full bg-ink hover:bg-forest text-cream px-2 py-2 text-[12px] font-bold"><Calendar className="h-3.5 w-3.5" /> Book a doctor-counsellor</a>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 sm:right-6 z-40 flex flex-col items-end gap-3">
        <a href={`https://wa.me/${brand.whatsapp.replace('+','')}`} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-4 py-3 text-[13px] font-bold shadow-xl float-y">
          <MessageCircle className="h-5 w-5" /> WhatsApp us
        </a>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-full bg-ink hover:bg-forest text-cream px-4 py-3 text-[13px] font-semibold shadow-xl">
          💬 Consult
        </button>
      </div>
    </>
  );
}
