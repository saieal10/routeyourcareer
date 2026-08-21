import React from 'react';
import { Link } from 'react-router-dom';
import {
  spotlightGeorgia,
  spotlightUzbekistan,
  brand
} from '../mock';

import {
  ArrowUpRight,
  Check,
  Star
} from 'lucide-react';


function SpotlightCard({
  data,
  side = 'left',
  deepLink
}) {

  const isLeft = side === 'left';

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center">

      {/* IMAGE */}
      <div
        className={`lg:col-span-6 ${
          !isLeft ? 'lg:order-2' : ''
        }`}
      >
        <div className="relative">

          <div
            className={`absolute -inset-4 ${
              isLeft
                ? 'bg-coral/10'
                : 'bg-forest/10'
            } blob`}
          />

          <img
            src={data.hero}
            alt={data.name}
            className="relative w-full aspect-[5/6] object-cover rounded-3xl"
          />

          {/* PRIORITY BADGE */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur text-ink text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5">

            <Star className="h-3 w-3 fill-coral text-coral" />

            Priority destination

          </div>


          {/* SMALL GALLERY */}
          <div className="absolute -bottom-4 -right-4 grid grid-cols-3 gap-2">

            {data.gallery
              .slice(0, 3)
              .map((g, i) => (

                <img
                  key={i}
                  src={g}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover ring-4 ring-cream"
                />

              ))}

          </div>

        </div>
      </div>


      {/* CONTENT */}
      <div className="lg:col-span-6">

        {/* COUNTRY */}
        <div className="flex items-center gap-3">

          <img
            src={data.flag}
            alt=""
            className="h-6 w-9 rounded-sm ring-1 ring-black/10"
          />

          <div className="text-[11px] mono uppercase tracking-widest text-coral">
            MBBS in {data.name}
          </div>

        </div>


        {/* HEADLINE */}
        <h3 className="mt-4 serif text-4xl sm:text-5xl font-normal leading-[0.98] text-ink">
          {data.headline}
        </h3>


        {/* INTRO */}
        <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-xl">
          {data.intro}
        </p>


        {/* QUICK FACTS */}
        <div className="mt-6 grid grid-cols-3 gap-3">

          {[
            {
              k: data.fee,
              v: 'Total fee'
            },
            {
              k: data.duration,
              v: 'Duration'
            },
            {
              k: data.medium,
              v: 'Medium'
            }
          ].map((x) => (

            <div
              key={x.v}
              className="rounded-2xl border border-ink/10 bg-white p-3"
            >

              <div className="serif text-[20px] font-medium text-ink leading-tight">
                {x.k}
              </div>

              <div className="text-[10px] mono uppercase tracking-widest text-ink/60 mt-1">
                {x.v}
              </div>

            </div>

          ))}

        </div>


        {/* HIGHLIGHTS */}
        <ul className="mt-6 space-y-2">

          {data.highlights.map((h) => (

            <li
              key={h}
              className="flex items-start gap-2 text-[14px] text-ink/80"
            >

              <div className="h-5 w-5 rounded-full bg-forest text-cream grid place-items-center shrink-0 mt-0.5">

                <Check className="h-3 w-3" />

              </div>

              {h}

            </li>

          ))}

        </ul>


        {/* UNIVERSITIES */}
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-4">

          <div className="text-[10px] mono uppercase tracking-widest text-ink/50 mb-2">
            Partner universities we shortlist
          </div>

          <div className="flex flex-wrap gap-2">

            {data.universities.map((u) => (

              <span
                key={u}
                className="inline-flex items-center rounded-full bg-cream border border-ink/10 text-ink text-[12px] px-3 py-1"
              >
                {u}
              </span>

            ))}

          </div>

        </div>


        {/* BUTTONS */}
        <div className="mt-6 flex flex-wrap gap-3">

          {/* APPLY */}
          <a
            href={brand.applyLink}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[13px] font-semibold hover:bg-forest"
          >

            Apply for {data.name}

            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

          </a>


          {/* EXPLORE DEEP PAGE */}
          {deepLink && (

            <Link
              to={deepLink}
              className="inline-flex items-center gap-2 rounded-full border border-ink/20 text-ink px-5 py-3 text-[13px] font-semibold hover:bg-ink hover:text-cream"
            >

              Explore MBBS in {data.name}

              <ArrowUpRight className="h-4 w-4" />

            </Link>

          )}


          {/* CALLBACK */}
          <a
            href={brand.callbackLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 text-ink px-5 py-3 text-[13px] font-semibold hover:bg-coral hover:text-white hover:border-coral"
          >

            Request callback

          </a>

        </div>

      </div>

    </div>
  );
}



export default function FeaturedCountries() {

  return (

    <section
      id="featured"
      className="py-24 bg-cream"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6">


        {/* SECTION HEADING */}
        <div className="max-w-3xl">

          <div className="text-[11px] mono uppercase tracking-widest text-coral">

            / 03 — Our priority destinations

          </div>


          <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">

            Two countries

            <br />

            <em className="font-light">
              we know inside-out.
            </em>

          </h2>


          <p className="mt-5 text-ink/70 text-[15px] leading-relaxed">

            While we help students apply to nine countries,
            we’ve built our deepest on-ground network in{' '}

            <b>Georgia</b>

            {' '}and{' '}

            <b>Uzbekistan</b>

            {' '}— the best mix of quality, cost and
            English-medium teaching for Indian students today.

          </p>

        </div>



        {/* ==========================================
            GEORGIA
        ========================================== */}

        <div className="mt-16">

          <SpotlightCard
            data={spotlightGeorgia}
            side="left"
            deepLink="/countries/georgia"
          />

        </div>



        {/* ==========================================
            UZBEKISTAN
        ========================================== */}

        <div className="mt-20">

          <SpotlightCard
            data={spotlightUzbekistan}
            side="right"
            deepLink="/countries/uzbekistan"
          />

        </div>


      </div>

    </section>

  );

}
