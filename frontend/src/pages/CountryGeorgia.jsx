import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { georgiaData } from '../data/georgia';
import { brand } from '../mock';

import {
  ArrowUpRight,
  Check,
  ArrowLeft,
  MapPin,
  GraduationCap,
  Calendar,
  FileText,
  DollarSign,
  PhoneCall
} from 'lucide-react';

import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';


export default function CountryGeorgia() {

  const d = georgiaData;
  const nav = useNavigate();


  return (

    <div className="min-h-screen bg-cream text-ink">

      <AnnouncementBar />

      <Navbar />


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0">

          <img
            src={d.hero}
            alt={`Study medicine in ${d.name}`}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />

        </div>


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 text-cream">

          <button
            onClick={() => nav(-1)}
            className="inline-flex items-center gap-1 text-[12px] mono uppercase tracking-widest text-cream/70 hover:text-cream"
          >

            <ArrowLeft className="h-3.5 w-3.5" />

            Back

          </button>


          <div className="mt-6 flex items-center gap-2">

            <img
              src={d.flag}
              alt="Georgia flag"
              className="h-6 w-9 rounded-sm ring-1 ring-white/20"
            />

            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              MBBS in Georgia · Priority Destination

            </div>

          </div>


          <h1 className="mt-4 serif text-5xl sm:text-7xl lg:text-8xl font-normal leading-[0.9] max-w-5xl">

            {d.tagline}

          </h1>


          <p className="mt-6 text-cream/80 text-[16px] max-w-3xl leading-relaxed">

            {d.intro}

          </p>


          {/* QUICK FACTS */}

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl">

            {d.quickFacts.map((x) => (

              <div
                key={x.k}
                className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3"
              >

                <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                  {x.k}

                </div>

                <div className="mt-1 serif text-[18px] font-medium">

                  {x.v}

                </div>

              </div>

            ))}

          </div>


          {/* BUTTONS */}

          <div className="mt-8 flex flex-wrap gap-3">

            <a
              href={brand.applyLink}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-6 py-3.5 text-[14px] font-bold"
            >

              Apply for Georgia

              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

            </a>


            <a
              href={brand.callbackLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 text-cream px-6 py-3.5 text-[14px] font-semibold hover:bg-cream/10"
            >

              <PhoneCall className="h-4 w-4" />

              Request callback

            </a>


            <Link
              to="/#calculator"
              className="inline-flex items-center gap-2 rounded-full bg-cream text-ink px-6 py-3.5 text-[14px] font-semibold hover:bg-white"
            >

              Use fee calculator

            </Link>

          </div>

        </div>

      </section>



      {/* =====================================================
          GALLERY
      ===================================================== */}

      <section className="py-14 bg-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-3">

          {d.gallery.map((g, i) => (

            <img
              key={i}
              src={g}
              alt={`Georgia medical university ${i + 1}`}
              className={`rounded-3xl object-cover w-full ${
                i === 1
                  ? 'aspect-[3/4]'
                  : 'aspect-[4/3]'
              }`}
            />

          ))}

        </div>

      </section>



      {/* =====================================================
          ELIGIBILITY
      ===================================================== */}

      <section className="py-24 bg-sand grain-bg">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">

          <div className="lg:col-span-5">

            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              Eligibility

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95]">

              Who can apply.

            </h2>


            <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-md">

              Check your basic eligibility before choosing a medical
              university in Georgia.

            </p>

          </div>


          <div className="lg:col-span-7">

            <div className="divide-y divide-ink/10 border-y border-ink/10">

              {d.eligibility.map((e, i) => (

                <div
                  key={e.k}
                  className="py-5 flex items-start gap-4"
                >

                  <div className="edit-num text-3xl w-12 shrink-0">

                    {String(i + 1).padStart(2, '0')}

                  </div>


                  <div className="flex-1">

                    <div className="font-semibold text-[16px]">

                      {e.k}

                    </div>

                    <p className="text-[14px] text-ink/70 mt-1 leading-relaxed">

                      {e.v}

                    </p>

                  </div>


                  <Check className="h-5 w-5 text-forest shrink-0 mt-1" />

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          COST
      ===================================================== */}

      <section className="py-24 bg-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">

          <div className="lg:col-span-5">

            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

              <DollarSign className="h-3.5 w-3.5" />

              Cost planning

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95]">

              Plan the complete
              <br />

              <em className="font-light">
                six-year budget.
              </em>

            </h2>


            <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-md">

              Tuition is only one part of your budget. Accommodation,
              food, insurance, registration and personal expenses should
              also be considered.

            </p>

          </div>


          <div className="lg:col-span-7">

            <div className="rounded-3xl border border-ink/10 bg-white overflow-hidden">

              <div className="px-6 py-4 bg-ink text-cream">

                <div className="text-[10px] mono uppercase tracking-widest text-coral">

                  Estimated Cost Guide

                </div>

              </div>


              <div className="divide-y divide-ink/10">

                {d.feeBreakdown.map((r) => (

                  <div
                    key={r.head}
                    className="px-6 py-5 sm:flex sm:items-center sm:justify-between gap-6"
                  >

                    <div className="text-[14px] text-ink/70">

                      {r.head}

                    </div>


                    <div className="mt-1 sm:mt-0 serif text-[19px] font-medium text-ink sm:text-right">

                      {r.value}

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          UNIVERSITIES
      ===================================================== */}

      <section className="py-24 bg-sand grain-bg">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex flex-wrap justify-between items-end gap-4">

            <div className="max-w-3xl">

              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

                <GraduationCap className="h-3.5 w-3.5" />

                Medical Universities

              </div>


              <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95]">

                Explore medical universities
                <br />

                <em className="font-light">
                  across Georgia.
                </em>

              </h2>

            </div>


            <a
              href={brand.callbackLink}
              target="_blank"
              rel="noreferrer"
              className="text-ink font-semibold text-[14px] link-uline"
            >

              Help me choose a university →

            </a>

          </div>



          {/* UNIVERSITY GRID */}

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {d.universities.map((u, i) => (

              <div
                key={u.name}
                className="group relative rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift flex flex-col"
              >

                {/* REAL UNIVERSITY PHOTO */}

                <div className="aspect-[16/10] overflow-hidden bg-ink/5">

                  <img
                    src={u.img}
                    alt={u.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                </div>


                <div className="p-6 flex flex-col flex-1">

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-1.5 text-[11px] mono uppercase tracking-widest text-ink/60">

                      <MapPin className="h-3.5 w-3.5 text-coral" />

                      {u.city}

                    </div>


                    <div className="text-[10px] mono uppercase tracking-widest text-ink/40">

                      {String(i + 1).padStart(2, '0')}
                      {' / '}
                      {String(d.universities.length).padStart(2, '0')}

                    </div>

                  </div>


                  <h3 className="mt-3 serif text-[24px] font-medium text-ink leading-tight">

                    {u.name}

                  </h3>


                  <p className="mt-3 text-[13px] text-ink/70 leading-relaxed">

                    {u.notes}

                  </p>


                  {/* COURSE INFO */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-cream px-3 py-3">

                      <div className="text-[9px] mono uppercase tracking-widest text-ink/40">

                        Duration

                      </div>

                      <div className="mt-1 text-[13px] font-semibold">

                        {u.duration}

                      </div>

                    </div>


                    <div className="rounded-xl bg-cream px-3 py-3">

                      <div className="text-[9px] mono uppercase tracking-widest text-ink/40">

                        Medium

                      </div>

                      <div className="mt-1 text-[13px] font-semibold">

                        {u.medium}

                      </div>

                    </div>

                  </div>


                  {/* TUITION */}

                  <div className="mt-auto pt-5 flex items-end justify-between gap-3">

                    <div>

                      <div className="text-[10px] mono uppercase tracking-widest text-ink/40">

                        Tuition

                      </div>


                      <div className="serif text-[19px] font-medium text-ink">

                        {u.fee}

                      </div>

                    </div>


                    <a
                      href={brand.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-ink text-cream px-4 py-2 text-[12px] font-semibold hover:bg-forest"
                    >

                      Apply

                      <ArrowUpRight className="h-3.5 w-3.5" />

                    </a>

                  </div>

                </div>

              </div>

            ))}

          </div>



          <p className="mt-6 text-[11px] text-ink/50 leading-relaxed max-w-3xl">

            * Tuition figures shown are indicative and may change by
            university, academic year and intake. Confirm the current
            university fee before admission or payment.

          </p>

        </div>

      </section>



      {/* =====================================================
          TIMELINE + DOCUMENTS
      ===================================================== */}

      <section className="py-24 bg-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">

          <div className="lg:col-span-7">

            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

              <Calendar className="h-3.5 w-3.5" />

              Admission process

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95]">

              Your route from
              {' '}

              <em className="font-light">
                application to Georgia.
              </em>

            </h2>


            <div className="mt-8 relative pl-8">

              <div className="absolute left-3 top-2 bottom-2 w-px bg-ink/15" />


              {d.timeline.map((t) => (

                <div
                  key={t.title}
                  className="relative pb-8 last:pb-0"
                >

                  <div className="absolute -left-8 top-1.5 h-4 w-4 rounded-full bg-coral" />


                  <div className="text-[10px] mono uppercase tracking-widest text-coral">

                    {t.m}

                  </div>


                  <div className="serif text-[22px] font-medium text-ink mt-1">

                    {t.title}

                  </div>


                  <p className="text-[14px] text-ink/70 mt-1 leading-relaxed max-w-xl">

                    {t.body}

                  </p>

                </div>

              ))}

            </div>

          </div>



          {/* DOCUMENTS */}

          <div className="lg:col-span-5">

            <div className="rounded-3xl bg-ink text-cream p-6 lg:p-8 sticky top-28">

              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

                <FileText className="h-3.5 w-3.5" />

                Document checklist

              </div>


              <h3 className="serif mt-2 text-[26px] font-medium">

                What to keep ready.

              </h3>


              <ul className="mt-5 space-y-2">

                {d.documents.map((doc) => (

                  <li
                    key={doc}
                    className="flex items-start gap-2 text-[13px] text-cream/80"
                  >

                    <Check className="h-4 w-4 text-coral shrink-0 mt-0.5" />

                    {doc}

                  </li>

                ))}

              </ul>


              <a
                href={brand.applyLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-5 py-3 text-[13px] font-bold w-full justify-center"
              >

                Apply Online

                <ArrowUpRight className="h-4 w-4" />

              </a>

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="py-20 bg-sand grain-bg">

        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <div className="text-[11px] mono uppercase tracking-widest text-coral text-center">

            Frequently asked

          </div>


          <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95] text-center">

            Georgia —

            {' '}

            <em className="font-light">
              the questions.
            </em>

          </h2>


          <div className="mt-10 space-y-3">

            {d.faqs.map((f, i) => (

              <details
                key={f.q}
                open={i === 0}
                className="group rounded-2xl border border-ink/10 bg-white p-5"
              >

                <summary className="cursor-pointer list-none flex items-start gap-4">

                  <span className="edit-num text-xl w-8 shrink-0">

                    {String(i + 1).padStart(2, '0')}

                  </span>


                  <span className="flex-1 serif text-[20px] font-medium">

                    {f.q}

                  </span>

                </summary>


                <p className="mt-3 pl-12 text-[14px] text-ink/70 leading-relaxed">

                  {f.a}

                </p>

              </details>

            ))}

          </div>

        </div>

      </section>



      <Footer />

      <AiChatWidget />

    </div>

  );

}
