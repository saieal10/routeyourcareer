import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowUpRight
} from 'lucide-react';

import { brand } from '../mock';

const nav = [
  {
    label: 'MBBS',
    to: '/mbbs'
  },
  {
    label: 'Management',
    to: '/management'
  },
  {
    label: 'Build My Route',
    to: '/build-my-route'
  },
  {
    label: 'Quiz',
    to: '/quiz'
  },
  {
    label: 'Calculator',
    href: '/#calculator'
  },
  {
    label: 'Blog',
    href: '/#blog'
  },
  {
    label: 'States',
    href: '/#offices'
  },
  {
    label: 'Track Application',
    to: '/track-application'
  }
];

export default function Navbar() {
  const [open, setOpen] =
    useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-ink/10">

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between py-4">

          {/* BRAND */}
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() =>
              setOpen(false)
            }
          >

            <div className="relative">

              <div className="h-10 w-10 rounded-full bg-ink text-cream grid place-items-center serif italic text-lg font-medium">
                r
              </div>

              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-coral ring-2 ring-cream" />

            </div>

            <div className="leading-tight">

              <div className="serif text-[19px] font-medium text-ink tracking-tight">
                Route Your Career
              </div>

              <div className="text-[10px] mono uppercase tracking-[0.22em] text-ink/50">
                Your pathway · MBBS + Management
              </div>

            </div>

          </Link>


          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">

            {nav.map(item => {

              if (item.to) {
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="px-3 py-2 text-[13px] font-medium text-ink/70 hover:text-ink link-uline"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2 text-[13px] font-medium text-ink/70 hover:text-ink link-uline"
                >
                  {item.label}
                </a>
              );

            })}

          </nav>


          {/* RIGHT CTA */}
          <div className="hidden md:flex items-center gap-3">

            <a
              href={`tel:${brand.phone}`}
              className="text-[13px] font-medium text-ink/70 hover:text-ink hidden xl:inline"
            >
              {brand.phoneDisplay}
            </a>

            <Link
              to="/start-application"
              className="group inline-flex items-center gap-1.5 rounded-full bg-ink text-cream px-4 py-2.5 text-[13px] font-semibold hover:bg-forest"
            >
              Start Application

              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
            </Link>

          </div>


          {/* MOBILE BUTTON */}
          <button
            onClick={() =>
              setOpen(!open)
            }
            className="lg:hidden p-2 rounded-md hover:bg-ink/5"
            aria-label="menu"
          >
            {open
              ? (
                <X className="h-5 w-5" />
              )
              : (
                <Menu className="h-5 w-5" />
              )}
          </button>

        </div>


        {/* MOBILE MENU */}
        {open && (

          <div className="lg:hidden pb-4 border-t border-ink/10 pt-2">

            {nav.map(item => {

              if (item.to) {
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() =>
                      setOpen(false)
                    }
                    className="block px-2 py-2 text-[14px] font-medium text-ink/80"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() =>
                    setOpen(false)
                  }
                  className="block px-2 py-2 text-[14px] font-medium text-ink/80"
                >
                  {item.label}
                </a>
              );

            })}


            <Link
              to="/start-application"
              onClick={() =>
                setOpen(false)
              }
              className="mt-3 block text-center rounded-full bg-ink text-cream px-4 py-3 text-[13px] font-semibold"
            >
              Start Application
            </Link>

          </div>

        )}

      </div>

    </header>
  );
}
