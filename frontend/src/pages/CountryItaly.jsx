import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { italyData } from '../data/italy';
import { brand } from '../mock';

import {
  ArrowUpRight,
  Check,
  ArrowLeft,
  MapPin,
  GraduationCap,
  Calendar,
  FileText,
  IndianRupee,
  PhoneCall,
  Sparkles,
  Building2,
  BookOpen,
  Search,
  BriefcaseBusiness,
  Laptop,
  Landmark,
  Scale,
  Cpu,
  MessageCircle
} from 'lucide-react';

import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';


export default function CountryItaly() {

  const d = italyData;
  const nav = useNavigate();


  /* ======================================================
     SEO
  ====================================================== */

  useEffect(() => {

    const pageTitle =
      d?.seo?.title ||
      'Study in Italy for Indian Students 2026 | Bachelor’s & Master’s';

    const pageDescription =
      d?.seo?.description ||
      'Explore Bachelor’s and Master’s programmes in Italy for Indian students including universities, fees, scholarships, eligibility and visa guidance.';

    const pageUrl =
      'https://routeyourcareer.in/countries/italy';


    document.title = pageTitle;


    /* DESCRIPTION */

    let descriptionTag =
      document.querySelector(
        'meta[name="description"]'
      );

    if (!descriptionTag) {

      descriptionTag =
        document.createElement('meta');

      descriptionTag.setAttribute(
        'name',
        'description'
      );

      document.head.appendChild(
        descriptionTag
      );
    }

    descriptionTag.setAttribute(
      'content',
      pageDescription
    );


    /* ROBOTS */

    let robotsTag =
      document.querySelector(
        'meta[name="robots"]'
      );

    if (!robotsTag) {

      robotsTag =
        document.createElement('meta');

      robotsTag.setAttribute(
        'name',
        'robots'
      );

      document.head.appendChild(
        robotsTag
      );
    }

    robotsTag.setAttribute(
      'content',
      'index, follow'
    );


    /* CANONICAL */

    let canonicalTag =
      document.querySelector(
        'link[rel="canonical"]'
      );

    if (!canonicalTag) {

      canonicalTag =
        document.createElement('link');

      canonicalTag.setAttribute(
        'rel',
        'canonical'
      );

      document.head.appendChild(
        canonicalTag
      );
    }

    canonicalTag.setAttribute(
      'href',
      pageUrl
    );


    /* OPEN GRAPH */

    const setOgTag = (
      property,
      content
    ) => {

      let tag =
        document.querySelector(
          `meta[property="${property}"]`
        );

      if (!tag) {

        tag =
          document.createElement('meta');

        tag.setAttribute(
          'property',
          property
        );

        document.head.appendChild(
          tag
        );
      }

      tag.setAttribute(
        'content',
        content
      );

    };


    setOgTag(
      'og:type',
      'website'
    );

    setOgTag(
      'og:title',
      pageTitle
    );

    setOgTag(
      'og:description',
      pageDescription
    );

    setOgTag(
      'og:url',
      pageUrl
    );


    /* ======================================================
       FAQ STRUCTURED DATA
    ====================================================== */

    const oldSchema =
      document.getElementById(
        'ryc-italy-schema'
      );

    if (oldSchema) {
      oldSchema.remove();
    }


    const schema =
      document.createElement('script');

    schema.type =
      'application/ld+json';

    schema.id =
      'ryc-italy-schema';


    schema.textContent =
      JSON.stringify({

        '@context':
          'https://schema.org',

        '@type':
          'FAQPage',

        mainEntity:
          (d.faqs || []).map(
            (faq) => ({

              '@type':
                'Question',

              name:
                faq.q,

              acceptedAnswer: {

                '@type':
                  'Answer',

                text:
                  faq.a

              }

            })
          )

      });


    document.head.appendChild(
      schema
    );


    return () => {

      document.title =
        'Route Your Career | MBBS Abroad & Career Counselling';


      descriptionTag.setAttribute(
        'content',
        'Route Your Career provides guidance for MBBS abroad, medical university admissions, management courses and career counselling for Indian students.'
      );


      canonicalTag.setAttribute(
        'href',
        'https://routeyourcareer.in/'
      );


      const schemaTag =
        document.getElementById(
          'ryc-italy-schema'
        );

      if (schemaTag) {
        schemaTag.remove();
      }

    };

  }, [d]);


  /* ======================================================
     PROGRAMME ICON
  ====================================================== */

  const programmeIcon = (name) => {

    const n =
      name.toLowerCase();


    if (
      n.includes('business') ||
      n.includes('management')
    ) {
      return BriefcaseBusiness;
    }


    if (
      n.includes('computer') ||
      n.includes('artificial') ||
      n.includes('data')
    ) {
      return Laptop;
    }


    if (
      n.includes('engineering')
    ) {
      return Cpu;
    }


    if (
      n.includes('law')
    ) {
      return Scale;
    }


    if (
      n.includes('economics') ||
      n.includes('finance')
    ) {
      return Landmark;
    }


    return BookOpen;

  };


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

      <section className="relative overflow-hidden">


        <div className="absolute inset-0">

          <img
            src={d.hero}
            alt="Study in Italy for Indian students"
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
              alt="Italy flag"
              className="h-6 w-9 rounded-sm ring-1 ring-white/20"
            />


            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              Bachelor’s + Master’s in Italy

            </div>

          </div>


          <h1 className="mt-4 serif text-5xl sm:text-7xl lg:text-8xl font-normal leading-[0.9] max-w-5xl">

            Study in Italy for Indian Students

          </h1>


          <p className="mt-6 text-cream/85 text-[16px] max-w-3xl leading-relaxed">

            {d.intro}

          </p>


          {/* QUICK FACTS */}

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl">


            {d.quickFacts.map(
              (item) => (

                <div
                  key={item.k}
                  className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3"
                >

                  <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                    {item.k}

                  </div>


                  <div className="mt-1 serif text-[17px] font-medium leading-tight">

                    {item.v}

                  </div>

                </div>

              )
            )}

          </div>


          {/* CTA */}

          <div className="mt-8 flex flex-wrap gap-3">


            <a
              href={brand.applyLink}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-6 py-3.5 text-[14px] font-bold"
            >

              Find My Italy Course

              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

            </a>


            <a
              href={brand.callbackLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 text-cream px-6 py-3.5 text-[14px] font-semibold hover:bg-cream/10"
            >

              <PhoneCall className="h-4 w-4" />

              Request Italy callback

            </a>


            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-full bg-cream text-ink px-6 py-3.5 text-[14px] font-semibold hover:bg-white"
            >

              Take Course Finder

            </Link>

          </div>


        </div>

      </section>


      {/* ==================================================
          GALLERY
      ================================================== */}

      <section className="py-14 bg-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-3">


          {d.gallery.map(
            (image, index) => (

              <img
                key={index}
                src={image}
                alt={`Study in Italy ${index + 1}`}
                className={`rounded-3xl object-cover ${
                  index === 1
                    ? 'aspect-[3/4]'
                    : 'aspect-[4/3]'
                }`}
              />

            )
          )}

        </div>

      </section>


      {/* ==================================================
          WHY ITALY
      ================================================== */}

      <section className="py-20 bg-sand grain-bg">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">


          <div className="max-w-3xl">

            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              / Italy Study Hub

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95]">

              More than management.

              <br />

              <em className="font-light">

                Hundreds of course combinations.

              </em>

            </h2>


            <p className="mt-5 text-[15px] text-ink/70 leading-relaxed">

              Italy offers English-taught options across business,
              economics, artificial intelligence, data science,
              engineering, architecture, law, biotechnology and
              other academic fields.

            </p>

          </div>


          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">


            {(d.programmeAreas || []).map(
              (area) => {

                const Icon =
                  programmeIcon(
                    area.name
                  );

                return (

                  <div
                    key={area.name}
                    className="rounded-3xl bg-white border border-ink/10 p-6 card-lift"
                  >

                    <div className="h-11 w-11 rounded-2xl bg-coral/10 text-coral grid place-items-center">

                      <Icon className="h-5 w-5" />

                    </div>


                    <h3 className="serif mt-4 text-[23px]">

                      {area.name}

                    </h3>


                    <p className="mt-2 text-[13px] leading-relaxed text-ink/65">

                      {area.examples}

                    </p>

                  </div>

                );

              }
            )}

          </div>

        </div>

      </section>


      {/* ==================================================
          BACHELOR'S PROGRAMMES
      ================================================== */}

      <section className="py-24 bg-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">


          <div className="flex flex-wrap items-end justify-between gap-5">


            <div className="max-w-3xl">


              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

                <GraduationCap className="h-4 w-4" />

                Bachelor’s programmes

              </div>


              <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal">

                Featured Bachelor’s

                <br />

                <em className="font-light">

                  programmes in English.

                </em>

              </h2>

            </div>


            <a
              href={brand.callbackLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[14px] font-semibold link-uline"
            >

              Get a personalised shortlist

              <ArrowUpRight className="h-4 w-4" />

            </a>

          </div>


          <div className="mt-10 grid md:grid-cols-2 gap-4">


            {(d.featuredBachelors || []).map(
              (programme, index) => (

                <div
                  key={`${programme.university}-${programme.course}`}
                  className="rounded-3xl border border-ink/10 bg-white p-6"
                >

                  <div className="flex items-start justify-between gap-3">


                    <span className="inline-flex rounded-full bg-coral/10 text-coral px-3 py-1 text-[10px] font-bold uppercase tracking-widest">

                      {programme.field}

                    </span>


                    <span className="text-[10px] mono text-ink/30">

                      {String(index + 1).padStart(2, '0')}

                    </span>

                  </div>


                  <h3 className="serif mt-4 text-[23px] leading-tight">

                    {programme.course}

                  </h3>


                  <div className="mt-3 flex items-center gap-2 text-[13px] text-ink/60">

                    <Building2 className="h-4 w-4 text-coral" />

                    {programme.university}

                  </div>

                </div>

              )
            )}

          </div>


          <div className="mt-8 rounded-3xl bg-sand border border-ink/10 px-6 py-5 flex flex-wrap items-center justify-between gap-4">


            <div>

              <div className="text-[11px] mono uppercase tracking-widest text-coral">

                Need more options?

              </div>


              <p className="mt-1 text-[14px] text-ink/70">

                Route Your Career can shortlist programmes based on
                your Class XII background, preferred field and budget.

              </p>

            </div>


            <a
              href={brand.applyLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[13px] font-semibold"
            >

              Find Bachelor’s Courses

              <Search className="h-4 w-4" />

            </a>

          </div>

        </div>

      </section>


      {/* ==================================================
          MASTER'S PROGRAMMES
      ================================================== */}

      <section className="py-24 bg-ink text-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">


          <div className="max-w-3xl">


            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

              <BookOpen className="h-4 w-4" />

              Master’s programmes

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal">

              Build your Master’s shortlist

              <br />

              <em className="font-light text-coral">

                by career goal.

              </em>

            </h2>

          </div>


          <div className="mt-10 grid md:grid-cols-2 gap-4">


            {(d.featuredMasters || []).map(
              (programme, index) => (

                <div
                  key={`${programme.university}-${programme.course}`}
                  className="rounded-3xl border border-cream/15 bg-white/5 p-6"
                >

                  <div className="flex items-start justify-between gap-3">


                    <span className="inline-flex rounded-full border border-coral/40 text-coral px-3 py-1 text-[10px] font-bold uppercase tracking-widest">

                      {programme.field}

                    </span>


                    <span className="text-[10px] mono text-cream/30">

                      {String(index + 1).padStart(2, '0')}

                    </span>

                  </div>


                  <h3 className="serif mt-4 text-[23px] leading-tight">

                    {programme.course}

                  </h3>


                  <div className="mt-3 flex items-center gap-2 text-[13px] text-cream/60">

                    <Building2 className="h-4 w-4 text-coral" />

                    {programme.university}

                  </div>

                </div>

              )
            )}

          </div>


          <div className="mt-8 flex justify-start">


            <a
              href={brand.applyLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-6 py-3.5 text-[14px] font-bold"
            >

              Find Master’s Courses

              <ArrowUpRight className="h-4 w-4" />

            </a>

          </div>

        </div>

      </section>


      {/* ==================================================
          TUITION + LIVING COSTS
      ================================================== */}

      <section className="py-24 bg-sand grain-bg">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">


          <div className="grid lg:grid-cols-12 gap-8 items-end">


            <div className="lg:col-span-7">


              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

                <IndianRupee className="h-3.5 w-3.5" />

                Tuition & living cost

              </div>


              <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95]">

                Affordable public education.

                <br />

                <em className="font-light">

                  But not automatically free.

                </em>

              </h2>

            </div>


            <div className="lg:col-span-5">


              <p className="text-[15px] text-ink/70 leading-relaxed">

                {d.fees.tuition}

              </p>


              {d.fees.tuitionNote && (

                <p className="mt-3 text-[13px] text-ink/55 leading-relaxed">

                  {d.fees.tuitionNote}

                </p>

              )}

            </div>

          </div>


          {/* DESKTOP TABLE */}

          <div className="hidden md:block mt-10 rounded-3xl border border-ink/10 bg-white overflow-hidden">


            <div className="grid grid-cols-6 px-6 py-4 bg-ink text-cream text-[10px] mono uppercase tracking-widest">

              <div>
                City
              </div>

              <div className="text-right">
                Housing
              </div>

              <div className="text-right">
                Food
              </div>

              <div className="text-right">
                Transport
              </div>

              <div className="text-right">
                Misc
              </div>

              <div className="text-right text-coral">
                Estimated / year
              </div>

            </div>


            <div className="divide-y divide-ink/10">


              {d.fees.livingByCity.map(
                (row) => (

                  <div
                    key={row.city}
                    className="grid grid-cols-6 px-6 py-4 items-center hover:bg-cream/40"
                  >

                    <div className="serif text-[20px] font-medium">

                      {row.city}

                    </div>


                    <div className="text-right text-[13px] text-ink/70">

                      {row.housing}

                    </div>


                    <div className="text-right text-[13px] text-ink/70">

                      {row.food}

                    </div>


                    <div className="text-right text-[13px] text-ink/70">

                      {row.transport}

                    </div>


                    <div className="text-right text-[13px] text-ink/70">

                      {row.misc}

                    </div>


                    <div className="text-right serif text-[18px] font-medium text-coral">

                      {row.total}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* MOBILE COST CARDS */}

          <div className="md:hidden mt-8 space-y-3">


            {d.fees.livingByCity.map(
              (row) => (

                <div
                  key={row.city}
                  className="rounded-3xl bg-white border border-ink/10 p-5"
                >

                  <div className="serif text-[23px]">

                    {row.city}

                  </div>


                  <div className="mt-2 text-[14px] font-semibold text-coral">

                    {row.total}

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ==================================================
          SCHOLARSHIPS
      ================================================== */}

      <section className="py-24 bg-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">


          <div className="max-w-3xl">


            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

              <Sparkles className="h-3.5 w-3.5" />

              Scholarships & reductions

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95]">

              Reduce the cost

              <br />

              <em className="font-light">

                if you qualify.

              </em>

            </h2>


            <p className="mt-5 text-ink/65 text-[15px] leading-relaxed">

              Scholarship availability, award amounts and eligibility
              depend on the region, university, programme and academic year.

            </p>

          </div>


          <div className="mt-10 grid sm:grid-cols-2 gap-5">


            {d.scholarships.map(
              (scholarship) => (

                <div
                  key={scholarship.name}
                  className="rounded-3xl border border-ink/10 bg-white p-6"
                >

                  <span className="inline-flex text-[10px] mono uppercase tracking-widest text-coral border border-coral/30 rounded-full px-2 py-1">

                    {scholarship.tag}

                  </span>


                  <h3 className="mt-4 serif text-[24px] font-medium">

                    {scholarship.name}

                  </h3>


                  <p className="mt-2 text-[14px] text-ink/70 leading-relaxed">

                    {scholarship.body}

                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ==================================================
          ELIGIBILITY
      ================================================== */}

      <section className="py-24 bg-sand grain-bg">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">


          <div className="lg:col-span-5">


            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              Eligibility

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal">

              Who can apply?

            </h2>


            <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-md">

              Eligibility is programme-specific. These are the major
              areas we check before building a shortlist.

            </p>

          </div>


          <div className="lg:col-span-7">


            <div className="divide-y divide-ink/10 border-y border-ink/10">


              {d.eligibility.map(
                (item, index) => (

                  <div
                    key={item.k}
                    className="py-5 flex items-start gap-4"
                  >

                    <div className="edit-num text-3xl w-12 shrink-0">

                      {String(index + 1).padStart(2, '0')}

                    </div>


                    <div className="flex-1">


                      <div className="font-semibold text-[16px]">

                        {item.k}

                      </div>


                      <p className="text-[14px] text-ink/70 mt-1 leading-relaxed">

                        {item.v}

                      </p>

                    </div>


                    <Check className="h-5 w-5 text-forest shrink-0 mt-1" />

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          UNIVERSITIES
      ================================================== */}

      <section className="py-24 bg-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">


          <div className="flex flex-wrap justify-between items-end gap-4">


            <div className="max-w-3xl">


              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

                <Building2 className="h-3.5 w-3.5" />

                Universities

              </div>


              <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal">

                Universities worth

                <br />

                <em className="font-light">

                  exploring.

                </em>

              </h2>

            </div>


            <a
              href={brand.callbackLink}
              target="_blank"
              rel="noreferrer"
              className="text-[14px] font-semibold link-uline"
            >

              Which university fits me? →

            </a>

          </div>


          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">


            {d.universities.map(
              (university, index) => (

                <div
                  key={university.name}
                  className="group rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift"
                >


                  <div className="aspect-[16/10] overflow-hidden">


                    <img
                      src={university.img}
                      alt={university.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                  </div>


                  <div className="p-6">


                    <div className="flex items-center justify-between">


                      <div className="flex items-center gap-1.5 text-[11px] mono uppercase tracking-widest text-ink/60">

                        <MapPin className="h-3.5 w-3.5 text-coral" />

                        {university.city}

                      </div>


                      <span className="text-[10px] mono text-ink/35">

                        {String(index + 1).padStart(2, '0')}

                      </span>

                    </div>


                    <h3 className="mt-3 serif text-[22px] leading-tight">

                      {university.name}

                    </h3>


                    <p className="mt-2 text-[13px] text-ink/70 leading-relaxed">

                      {university.notes}

                    </p>


                    <div className="mt-5 flex items-center justify-between gap-3">


                      <div>


                        <div className="text-[10px] mono uppercase tracking-widest text-ink/40">

                          Tuition

                        </div>


                        <div className="serif text-[17px]">

                          {university.fee}

                        </div>

                      </div>


                      <a
                        href={brand.applyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-ink text-cream px-4 py-2 text-[12px] font-semibold hover:bg-forest"
                      >

                        Shortlist

                        <ArrowUpRight className="h-3.5 w-3.5" />

                      </a>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ==================================================
          APPLICATION + VISA
      ================================================== */}

      <section className="py-24 bg-sand grain-bg">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">


          <div className="lg:col-span-7">


            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

              <Calendar className="h-3.5 w-3.5" />

              Application & visa

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal">

              From shortlist

              <br />

              <em className="font-light">

                to Italy.

              </em>

            </h2>


            <div className="mt-8 relative pl-8">


              <div className="absolute left-3 top-2 bottom-2 w-px bg-ink/15" />


              {d.visaSteps.map(
                (step) => (

                  <div
                    key={step.title}
                    className="relative pb-8 last:pb-0"
                  >

                    <div className="absolute -left-8 top-1.5 h-4 w-4 rounded-full bg-coral" />


                    <div className="text-[10px] mono uppercase tracking-widest text-coral">

                      {step.m}

                    </div>


                    <div className="serif text-[22px] font-medium mt-1">

                      {step.title}

                    </div>


                    <p className="text-[14px] text-ink/70 mt-1 leading-relaxed max-w-xl">

                      {step.body}

                    </p>

                  </div>

                )
              )}

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


                {d.documents.map(
                  (doc) => (

                    <li
                      key={doc}
                      className="flex items-start gap-2 text-[13px] text-cream/80"
                    >

                      <Check className="h-4 w-4 text-coral shrink-0 mt-0.5" />

                      {doc}

                    </li>

                  )
                )}

              </ul>


              <a
                href={brand.applyLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 group inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold w-full justify-center"
              >

                Start Italy Application

                <ArrowUpRight className="h-4 w-4" />

              </a>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          FAQ
      ================================================== */}

      <section className="py-20 bg-cream">

        <div className="max-w-4xl mx-auto px-4 sm:px-6">


          <div className="text-[11px] mono uppercase tracking-widest text-coral text-center">

            Frequently asked

          </div>


          <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal text-center">

            Study in Italy —

            <br />

            <em className="font-light">

              the questions.

            </em>

          </h2>


          <div className="mt-10 space-y-3">


            {d.faqs.map(
              (faq, index) => (

                <details
                  key={faq.q}
                  open={index === 0}
                  className="group rounded-2xl border border-ink/10 bg-white p-5"
                >

                  <summary className="cursor-pointer list-none flex items-start gap-4">


                    <span className="edit-num text-xl w-8 shrink-0">

                      {String(index + 1).padStart(2, '0')}

                    </span>


                    <span className="flex-1 serif text-[20px] font-medium">

                      {faq.q}

                    </span>

                  </summary>


                  <p className="mt-3 pl-12 text-[14px] text-ink/70 leading-relaxed">

                    {faq.a}

                  </p>

                </details>

              )
            )}

          </div>

        </div>

      </section>


      {/* ==================================================
          FINAL CTA
      ================================================== */}

      <section className="py-24 bg-sand grain-bg">

        <div className="max-w-6xl mx-auto px-4 sm:px-6">


          <div className="rounded-[36px] bg-ink text-cream p-9 sm:p-14">


            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              Route Your Career · Italy

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-6xl font-normal leading-[0.95] max-w-4xl">

              Don’t choose Italy first.

              <br />

              <em className="font-light">

                Choose the right course first.

              </em>

            </h2>


            <p className="mt-5 text-[15px] text-cream/70 leading-relaxed max-w-2xl">

              Tell us your academic background, preferred subject,
              budget and career goal. We’ll help you build an Italy
              programme shortlist.

            </p>


            <div className="mt-7 flex flex-wrap gap-3">


              <a
                href={brand.applyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-6 py-3.5 text-[14px] font-bold"
              >

                Find My Italy Course

                <ArrowUpRight className="h-4 w-4" />

              </a>


              <a
                href={`https://wa.me/${brand.whatsapp.replace('+', '')}?text=Hi%2C%20I%20want%20help%20shortlisting%20courses%20in%20Italy`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cream text-ink px-6 py-3.5 text-[14px] font-bold"
              >

                <MessageCircle className="h-4 w-4" />

                WhatsApp Italy Counselling

              </a>

            </div>

          </div>

        </div>

      </section>


      <Footer />

      <AiChatWidget />

    </div>

  );

}
