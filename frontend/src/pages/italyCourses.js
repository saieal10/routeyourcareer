import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  GraduationCap,
  Building2,
  ArrowUpRight,
  Filter
} from 'lucide-react';

import {
  italyCourses
} from '../data/italyCourses';

import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';
import { brand } from '../mock';


export default function ItalyCourses() {

  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [university, setUniversity] = useState('All');


  /* ======================================================
     UNIVERSITY OPTIONS
  ====================================================== */

  const universities = useMemo(() => {

    const unique =
      [...new Set(
        italyCourses
          .map(item => item.university)
          .filter(Boolean)
      )]
      .sort((a, b) =>
        a.localeCompare(b)
      );

    return [
      'All',
      ...unique
    ];

  }, []);


  /* ======================================================
     FILTER COURSES
  ====================================================== */

  const filteredCourses = useMemo(() => {

    const query =
      search
        .trim()
        .toLowerCase();


    return italyCourses.filter(
      (item) => {

        const matchesSearch =
          !query ||
          item.course
            ?.toLowerCase()
            .includes(query) ||
          item.university
            ?.toLowerCase()
            .includes(query);


        const matchesLevel =
          level === 'All' ||
          item.level === level;


        const matchesUniversity =
          university === 'All' ||
          item.university === university;


        return (
          matchesSearch &&
          matchesLevel &&
          matchesUniversity
        );

      }
    );

  }, [
    search,
    level,
    university
  ]);


  /* ======================================================
     PAGE
  ====================================================== */

  return (

    <div className="min-h-screen bg-cream text-ink">

      <AnnouncementBar />

      <Navbar />


      {/* ==================================================
          HERO
      ================================================== */}

      <section className="bg-ink text-cream py-20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">


          <Link
            to="/countries/italy"
            className="inline-flex items-center gap-1 text-[12px] mono uppercase tracking-widest text-cream/60 hover:text-cream"
          >

            <ArrowLeft className="h-4 w-4" />

            Back to Italy

          </Link>


          <div className="mt-8 max-w-4xl">


            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

              <GraduationCap className="h-4 w-4" />

              Italy Course Finder

            </div>


            <h1 className="serif mt-4 text-5xl sm:text-7xl font-normal leading-[0.95]">

              Find your course

              <br />

              <em className="font-light text-coral">

                in Italy.

              </em>

            </h1>


            <p className="mt-6 text-[16px] text-cream/70 leading-relaxed max-w-2xl">

              Search Bachelor’s and Master’s programmes
              across Italian universities by course name,
              university or study level.

            </p>

          </div>


          {/* STATS */}

          <div className="mt-10 flex flex-wrap gap-3">


            <div className="rounded-2xl border border-cream/15 bg-white/5 px-5 py-4">

              <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                Total programmes

              </div>

              <div className="serif mt-1 text-2xl">

                {italyCourses.length}

              </div>

            </div>


            <div className="rounded-2xl border border-cream/15 bg-white/5 px-5 py-4">

              <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                Bachelor’s

              </div>

              <div className="serif mt-1 text-2xl">

                {
                  italyCourses.filter(
                    item =>
                      item.level === 'Bachelor'
                  ).length
                }

              </div>

            </div>


            <div className="rounded-2xl border border-cream/15 bg-white/5 px-5 py-4">

              <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                Master’s

              </div>

              <div className="serif mt-1 text-2xl">

                {
                  italyCourses.filter(
                    item =>
                      item.level === 'Master'
                  ).length
                }

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          SEARCH + FILTERS
      ================================================== */}

      <section className="py-10 bg-sand border-b border-ink/10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">


          <div className="grid lg:grid-cols-12 gap-3">


            {/* SEARCH */}

            <div className="lg:col-span-6 relative">

              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search course or university..."
                className="w-full rounded-2xl border border-ink/10 bg-white pl-11 pr-4 py-3.5 text-[14px] outline-none focus:border-coral"
              />

            </div>


            {/* LEVEL */}

            <div className="lg:col-span-2">

              <select
                value={level}
                onChange={(e) =>
                  setLevel(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3.5 text-[14px] outline-none"
              >

                <option value="All">
                  All levels
                </option>

                <option value="Bachelor">
                  Bachelor’s
                </option>

                <option value="Master">
                  Master’s
                </option>

              </select>

            </div>


            {/* UNIVERSITY */}

            <div className="lg:col-span-4">

              <select
                value={university}
                onChange={(e) =>
                  setUniversity(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3.5 text-[14px] outline-none"
              >

                {universities.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >

                      {
                        item === 'All'
                          ? 'All universities'
                          : item
                      }

                    </option>

                  )
                )}

              </select>

            </div>

          </div>


          <div className="mt-4 flex items-center gap-2 text-[12px] text-ink/55">

            <Filter className="h-4 w-4" />

            {filteredCourses.length} programmes found

          </div>

        </div>

      </section>


      {/* ==================================================
          COURSE RESULTS
      ================================================== */}

      <section className="py-14 bg-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">


          {filteredCourses.length === 0 ? (

            <div className="rounded-3xl border border-ink/10 bg-white p-12 text-center">


              <Search className="h-8 w-8 mx-auto text-coral" />


              <h2 className="serif mt-4 text-3xl">

                No programmes found.

              </h2>


              <p className="mt-2 text-[14px] text-ink/60">

                Try a different course,
                university or study level.

              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">


              {filteredCourses.map(
                (item, index) => (

                  <div
                    key={`${item.university}-${item.course}-${index}`}
                    className="rounded-3xl border border-ink/10 bg-white p-6 card-lift flex flex-col"
                  >


                    <div className="flex items-center justify-between gap-3">


                      <span className="inline-flex rounded-full bg-coral/10 text-coral px-3 py-1 text-[10px] font-bold uppercase tracking-widest">

                        {item.level}

                      </span>


                      <span className="text-[10px] mono text-ink/30">

                        {String(index + 1).padStart(3, '0')}

                      </span>

                    </div>


                    <h2 className="serif mt-4 text-[23px] font-medium leading-tight">

                      {item.course}

                    </h2>


                    <div className="mt-4 flex items-start gap-2 text-[13px] text-ink/60">

                      <Building2 className="h-4 w-4 text-coral shrink-0 mt-0.5" />

                      <span>

                        {item.university}

                      </span>

                    </div>


                    <div className="mt-auto pt-6">


                      <a
                        href={`${brand.callbackLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-4 py-2.5 text-[12px] font-semibold hover:bg-forest"
                      >

                        Check eligibility

                        <ArrowUpRight className="h-3.5 w-3.5" />

                      </a>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </section>


      {/* ==================================================
          CTA
      ================================================== */}

      <section className="py-20 bg-sand grain-bg">

        <div className="max-w-5xl mx-auto px-4 sm:px-6">


          <div className="rounded-[36px] bg-ink text-cream p-9 sm:p-12">


            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              Can’t decide?

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl">

              Get a personalised

              <br />

              <em className="font-light">

                Italy shortlist.

              </em>

            </h2>


            <p className="mt-5 text-[15px] text-cream/70 max-w-xl leading-relaxed">

              Tell us your education,
              preferred subject, budget and
              career goal. We’ll help narrow
              the programme options.

            </p>


            <a
              href={brand.applyLink}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-coral text-white px-6 py-3.5 text-[14px] font-bold"
            >

              Get My Italy Shortlist

              <ArrowUpRight className="h-4 w-4" />

            </a>

          </div>

        </div>

      </section>


      <Footer />

      <AiChatWidget />

    </div>

  );

}
