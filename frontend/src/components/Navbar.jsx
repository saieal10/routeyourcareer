import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { brand } from '../mock';

const nav = [
  { label: 'Countries', href: '#countries' },
  { label: 'Universities', href: '#universities' },
  { label: 'Journey', href: '#journey' },
  { label: 'AI Stack', href: '#ai-agents' },
  { label: 'Offices', href: '#offices' },
  { label: 'Founder', href: '#founder' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          <a href="#top" className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-ink text-cream grid place-items-center serif italic text-lg font-medium">r</div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-coral ring-2 ring-cream" />
            </div>
            <div className="leading-tight">
              <div className="serif text-[19px] font-medium text-ink tracking-tight">Route Your Career</div>
              <div className="text-[10px] mono uppercase tracking-[0.22em] text-ink/50">Doctor-led · MBBS Abroad</div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => (
              <a key={n.label} href={n.href} className="px-3 py-2 text-[13px] font-medium text-ink/70 hover:text-ink link-uline">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href={`tel:${brand.phone}`} className="text-[13px] font-medium text-ink/70 hover:text-ink hidden lg:inline">{brand.phoneDisplay}</a>
            <a href="#book" className="group inline-flex items-center gap-1.5 rounded-full bg-ink text-cream px-4 py-2.5 text-[13px] font-semibold hover:bg-forest">
              Book Free Call
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
            </a>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-md hover:bg-ink/5" aria-label="menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-ink/10 pt-2">
            {nav.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setOpen(false)} className="block px-2 py-2 text-[14px] font-medium text-ink/80">{n.label}</a>
            ))}
            <a href="#book" className="mt-2 block text-center rounded-full bg-ink text-cream px-4 py-2.5 text-[13px] font-semibold">Book Free Call</a>
          </div>
        )}
      </div>
    </header>
  );
}
