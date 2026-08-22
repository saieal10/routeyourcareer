import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight, MapPin, Route } from 'lucide-react';
import { brand } from '../mock';

const nav = [
  { label: 'MBBS', to: '/mbbs' },
  { label: 'Management', to: '/management' },
  { label: 'Build My Route', to: '/build-my-route', highlight: true },
  { label: 'Quiz', to: '/quiz' },
  { label: 'Calculator', href: '/#calculator' },
  { label: 'Blog', href: '/#blog' },
  { label: 'States', href: '/#offices' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between py-4 gap-4">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-ink text-cream grid place-items-center serif italic text-lg font-medium">
                r
              </div>

              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-coral ring-2 ring-cream" />
            </div>

            <div className="leading-tight hidden sm:block">
              <div className="serif text-[19px] font-medium text-ink tracking-tight">
                Route Your Career
              </div>

              <div className="text-[10px] mono uppercase tracking-[0.22em] text-ink/50">
                Your pathway · MBBS + Management
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden xl:flex items-center gap-0.5">

            {nav.map((n) => {
              const normalClass =
                'px-2.5 py-2 text-[12px] font-medium text-ink/70 hover:text-ink transition';

              const highlightClass =
                'px-3 py-2 rounded-full bg-coral/10 text-coral text-[12px] font-bold hover:bg-coral hover:text-white transition inline-flex items-center gap-1.5';

              if (n.to) {
                return (
                  <Link
                    key={n.label}
                    to={n.to}
                    className={n.highlight ? highlightClass : normalClass}
                  >
                    {n.highlight && <Route className="h-3.5 w-3.5" />}
                    {n.label}
                  </Link>
                );
              }

              return (
                <a
                  key={n.label}
                  href={n.href}
                  className={normalClass}
                >
                  {n.label}
                </a>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">

            <Link
              to="/track-application"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 text-ink px-3.5 py-2.5 text-[12px] font-semibold hover:bg-ink hover:text-cream transition"
            >
              Track Application
            </Link>

            <a
              href={brand.applyLink}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full bg-ink text-cream px-4 py-2.5 text-[12px] font-semibold hover:bg-forest"
            >
              Apply Online
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
            </a>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="xl:hidden p-2 rounded-md hover:bg-ink/5"
            aria-label="menu"
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="xl:hidden pb-5 border-t border-ink/10 pt-3">

            {nav.map((n) => {
              const base =
                'flex items-center gap-2 px-3 py-3 text-[14px] font-medium rounded-xl';

              const normal =
                `${base} text-ink/80 hover:bg-ink/5`;

              const highlight =
                `${base} bg-coral/10 text-coral font-bold`;

              if (n.to) {
                return (
                  <Link
                    key={n.label}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={n.highlight ? highlight : normal}
                  >
                    {n.highlight && <Route className="h-4 w-4" />}
                    {n.label}
                  </Link>
                );
              }

              return (
                <a
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={normal}
                >
                  {n.label === 'States' && (
                    <MapPin className="h-4 w-4" />
                  )}

                  {n.label}
                </a>
              );
            })}

            <div className="mt-3 grid gap-2">

              <Link
                to="/track-application"
                onClick={() => setOpen(false)}
                className="block text-center rounded-full border border-ink/15 text-ink px-4 py-3 text-[13px] font-semibold"
              >
                Track Application
              </Link>

              <a
                href={brand.applyLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="block text-center rounded-full bg-ink text-cream px-4 py-3 text-[13px] font-semibold"
              >
                Apply Online
              </a>

            </div>
          </div>
        )}
      </div>
    </header>
  );
}
