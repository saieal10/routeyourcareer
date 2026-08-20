import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowUpRight,
  PhoneCall,
  Sparkles,
  Plane,
  Languages,
  UtensilsCrossed,
  Sun,
  Users,
  MessageCircle,
  Check,
  GraduationCap,
  BookOpen,
  FileText,
  WalletCards,
  ShieldCheck,
  Building2,
  ListChecks,
  HelpCircle
} from 'lucide-react';

import { countries, managementCountries, brand } from '../mock';
import { countryDetails } from '../data/countryDetails';

import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';


export default function CountryDetail() {

  const { code } = useParams();
  const nav = useNavigate();


  /* ======================================================
     FIND COUNTRY
  ====================================================== */

  const allCountries = [
    ...countries,
    ...managementCountries
  ];

  const c = allCountries.find(
    (country) => country.code === code
  );

  const d = countryDetails[code];

  const isMbbs =
    c?.track === 'mbbs';


  /* ======================================================
     SEO
  ====================================================== */

  useEffect(() => {

    if (!c) return;


    const pageTitle =
      d?.seo?.title ||
      (
        isMbbs
          ? `MBBS in ${c.name} for Indian Students 2026 | Fees & Admission`
          : `Study in ${c.name} for Indian Students | Courses & Fees`
      );


    const pageDescription =
      d?.seo?.description ||
      (
        isMbbs
          ? `Explore MBBS in ${c.name} for Indian students including fees, universities, eligibility, admission guidance, visa support and student life with Route Your Career.`
          : `Explore study options in ${c.name} for Indian students including courses, tuition fees, universities, visa guidance and admission support with Route Your Career.`
      );


    const pageUrl =
      `https://routeyourcareer.in/country/${c.code}`;


    document.title = pageTitle;


    /* META DESCRIPTION */

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

    const setPropertyMeta = (
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

      return tag;
    };


    setPropertyMeta(
      'og:type',
      'website'
    );

    setPropertyMeta(
      'og:title',
      pageTitle
    );

    setPropertyMeta(
      'og:description',
      pageDescription
    );

    setPropertyMeta(
      'og:url',
      pageUrl
    );


    /* ======================================================
       STRUCTURED DATA
    ====================================================== */

    const existingSchema =
      document.getElementById(
        'ryc-country-schema'
      );

    if (existingSchema) {
      existingSchema.remove();
    }


    const schema =
      document.createElement('script');

    schema.type =
      'application/ld+json';

    schema.id =
      'ryc-country-schema';


    const schemaData = {

      '@context':
        'https://schema.org',

      '@type':
        'WebPage',

      name:
        pageTitle,

      description:
        pageDescription,

      url:
        pageUrl,

      isPartOf: {
        '@type':
          'WebSite',

        name:
          'Route Your Career',

        url:
          'https://routeyourcareer.in/'
      },

      publisher: {
        '@type':
          'Organization',

        name:
          'Route Your Career',

        url:
          'https://routeyourcareer.in/'
      }

    };


    if (
      Array.isArray(d?.faqs) &&
      d.faqs.length > 0
    ) {

      schemaData.mainEntity = {

        '@type':
          'FAQPage',

        mainEntity:
          d.faqs.map(
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

      };

    }


    schema.textContent =
      JSON.stringify(
        schemaData
      );


    document.head.appendChild(
      schema
    );


    /* ======================================================
       RESET WHEN LEAVING PAGE
    ====================================================== */

    return () => {

      document.title =
        'Route Your Career — Your pathway to a global career';


      descriptionTag.setAttribute(
        'content',
        'Route Your Career helps Indian students explore MBBS abroad, management programmes and international education pathways.'
      );


      canonicalTag.setAttribute(
        'href',
        'https://routeyourcareer.in/'
      );


      const schemaTag =
        document.getElementById(
          'ryc-country-schema'
        );

      if (schemaTag) {
        schemaTag.remove();
      }

    };

  }, [
    code,
    c,
    d,
    isMbbs
  ]);


  /* ======================================================
     COUNTRY NOT FOUND
  ====================================================== */

  if (!c) {

    return (

      <div className="min-h-screen bg-cream text-ink">

        <AnnouncementBar />

        <Navbar />


        <div className="max-w-3xl mx-auto py-24 px-6 text-center">

          <h1 className="serif text-4xl">

            Country not found.

          </h1>


          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1 text-ink font-semibold link-uline"
          >

            Back home

          </Link>

        </div>


        <Footer />

      </div>

    );
  }


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
            src={c.img}
            alt={
              isMbbs
                ? `MBBS in ${c.name} for Indian students`
                : `Study in ${c.name} for Indian students`
            }
            className="w-full h-full object-cover"
          />


          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />

        </div>


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 text-cream">


          <button
            onClick={() => nav(-1)}
            className="inline-flex items-center gap-1 text-[12px] mono uppercase tracking-widest text-cream/70 hover:text-cream"
          >

            <ArrowLeft className="h-3.5 w-3.5" />

            Back

          </button>


          <div className="mt-6 flex items-center gap-2">

            <img
              src={c.flag}
              alt={`${c.name} flag`}
              className="h-6 w-9 rounded-sm ring-1 ring-white/20"
            />


            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              {isMbbs
                ? 'MBBS in'
                : 'Study in'
              }{' '}

              {c.name}

              {c.tag
                ? ' · ' + c.tag
                : ''
              }

            </div>

          </div>


          <h1 className="mt-4 serif text-5xl sm:text-7xl lg:text-8xl font-normal leading-[0.9] max-w-5xl">

            {d?.overview?.title ||
              (
                isMbbs
                  ? `MBBS in ${c.name}`
                  : `Study in ${c.name}`
              )
            }

          </h1>


          <p className="mt-6 text-cream/85 text-[16px] max-w-2xl leading-relaxed">

            {d?.overview?.intro ||
              c.desc
            }

          </p>


          {/* QUICK STATS */}

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl">


            <div className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3">

              <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                {isMbbs
                  ? 'Fees'
                  : 'Tuition'
                }

              </div>

              <div className="mt-1 serif text-[18px] font-medium">

                {d?.fees?.range ||
                  c.fee
                }

              </div>

            </div>


            <div className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3">

              <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                Duration

              </div>

              <div className="mt-1 serif text-[18px] font-medium">

                {d?.academics?.duration ||
                  (
                    isMbbs
                      ? 'Medical programme'
                      : 'Programme specific'
                  )
                }

              </div>

            </div>


            <div className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3">

              <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                Medium

              </div>

              <div className="mt-1 serif text-[18px] font-medium">

                {d?.academics?.medium ||
                  'English'
                }

              </div>

            </div>


            <div className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3">

              <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                Intake

              </div>

              <div className="mt-1 serif text-[18px] font-medium">

                {d?.academics?.intake ||
                  'Annual intake'
                }

              </div>

            </div>

          </div>


          <div className="mt-8 flex flex-wrap gap-3">


            <a
              href={brand.applyLink}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-6 py-3.5 text-[14px] font-bold"
            >

              Apply for {c.name}

              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

            </a>


            <a
              href={brand.callbackLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 text-cream px-6 py-3.5 text-[14px] font-semibold hover:bg-cream/10"
            >

              <PhoneCall className="h-4 w-4" />

              Speak to a coordinator

            </a>

          </div>


        </div>

      </section>


      {/* ==================================================
          OVERVIEW
      ================================================== */}

      {d?.overview && (

        <section className="py-20 bg-cream">

          <div className="max-w-5xl mx-auto px-4 sm:px-6">


            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              / Overview

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[1]">

              {d.overview.title}

            </h2>


            <div className="mt-7 max-w-3xl space-y-5 text-[16px] leading-[1.8] text-ink/75">

              <p>

                {d.overview.intro}

              </p>


              {d.overview.secondParagraph && (

                <p>

                  {d.overview.secondParagraph}

                </p>

              )}

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          WHY THIS COUNTRY / HIGHLIGHTS
      ================================================== */}

      {Array.isArray(d?.highlights) &&
        d.highlights.length > 0 && (

        <section className="py-20 bg-sand grain-bg">

          <div className="max-w-7xl mx-auto px-4 sm:px-6">


            <div className="max-w-2xl">

              <div className="text-[11px] mono uppercase tracking-widest text-coral">

                / Why {c.name}

              </div>


              <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal">

                Why students consider{' '}

                <em className="font-light">
                  {c.name}.
                </em>

              </h2>

            </div>


            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">


              {d.highlights.map(
                (item, index) => (

                  <div
                    key={index}
                    className="rounded-3xl bg-white border border-ink/10 p-6"
                  >

                    <div className="h-9 w-9 rounded-full bg-coral/10 text-coral grid place-items-center">

                      <Check className="h-4 w-4" />

                    </div>


                    <p className="mt-4 text-[15px] leading-relaxed text-ink/80">

                      {item}

                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          ELIGIBILITY
      ================================================== */}

      {d?.eligibility && (

        <section className="py-20 bg-cream">

          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">


            <div className="lg:col-span-4">

              <div className="h-11 w-11 rounded-2xl bg-coral/10 text-coral grid place-items-center">

                <GraduationCap className="h-5 w-5" />

              </div>


              <h2 className="serif mt-5 text-4xl font-normal">

                {d.eligibility.title}

              </h2>

            </div>


            <div className="lg:col-span-8">


              <div className="rounded-[30px] bg-white border border-ink/10 p-6 sm:p-8">


                {(d.eligibility.points || []).map(
                  (point, index) => (

                    <div
                      key={index}
                      className={`flex gap-3 py-4 ${
                        index !== 0
                          ? 'border-t border-ink/10'
                          : ''
                      }`}
                    >

                      <Check className="h-5 w-5 text-coral shrink-0 mt-0.5" />

                      <p className="text-[15px] leading-relaxed text-ink/75">

                        {point}

                      </p>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          ACADEMICS
      ================================================== */}

      {d?.academics && (

        <section className="py-20 bg-ink text-cream">

          <div className="max-w-7xl mx-auto px-4 sm:px-6">


            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

              <BookOpen className="h-4 w-4" />

              Academics

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal">

              Programme at a glance.

            </h2>


            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">


              {[
                {
                  label: 'Duration',
                  value: d.academics.duration
                },

                {
                  label: 'Medium',
                  value: d.academics.medium
                },

                {
                  label: 'Intake',
                  value: d.academics.intake
                },

                {
                  label: 'Degree',
                  value:
                    d.academics.degree ||
                    (
                      isMbbs
                        ? 'Medical programme'
                        : 'Course dependent'
                    )
                }

              ].map(
                (item) => (

                  <div
                    key={item.label}
                    className="rounded-3xl border border-cream/15 bg-white/5 p-6"
                  >

                    <div className="text-[10px] mono uppercase tracking-widest text-cream/50">

                      {item.label}

                    </div>


                    <div className="mt-2 serif text-[20px]">

                      {item.value}

                    </div>

                  </div>

                )
              )}

            </div>


            {d.academics.notes && (

              <p className="mt-7 max-w-3xl text-[14px] leading-relaxed text-cream/65">

                {d.academics.notes}

              </p>

            )}

          </div>

        </section>

      )}


      {/* ==================================================
          UNIVERSITIES + FEES
      ================================================== */}

      {(d?.universities || d?.fees) && (

        <section className="py-20 bg-cream">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-6">


            {Array.isArray(d?.universities) &&
              d.universities.length > 0 && (

              <div className="rounded-[32px] bg-white border border-ink/10 p-7 sm:p-9">


                <div className="h-11 w-11 rounded-2xl bg-coral/10 text-coral grid place-items-center">

                  <Building2 className="h-5 w-5" />

                </div>


                <h2 className="serif mt-5 text-3xl">

                  Universities to explore

                </h2>


                <div className="mt-6 space-y-3">


                  {d.universities.map(
                    (university, index) => (

                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-2xl bg-cream border border-ink/10 px-4 py-3"
                      >

                        <span className="h-7 w-7 rounded-full bg-ink text-cream text-[11px] grid place-items-center">

                          {index + 1}

                        </span>

                        <span className="font-medium text-[14px]">

                          {university}

                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


            {d?.fees && (

              <div className="rounded-[32px] bg-sand border border-ink/10 p-7 sm:p-9">


                <div className="h-11 w-11 rounded-2xl bg-coral/10 text-coral grid place-items-center">

                  <WalletCards className="h-5 w-5" />

                </div>


                <div className="mt-5 text-[11px] mono uppercase tracking-widest text-coral">

                  Estimated tuition

                </div>


                <h2 className="serif mt-2 text-3xl sm:text-4xl">

                  {d.fees.range}

                </h2>


                {d.fees.note && (

                  <p className="mt-5 text-[14px] text-ink/65 leading-relaxed">

                    {d.fees.note}

                  </p>

                )}

              </div>

            )}

          </div>

        </section>

      )}


      {/* ==================================================
          ADMISSION PROCESS
      ================================================== */}

      {Array.isArray(d?.admissionSteps) &&
        d.admissionSteps.length > 0 && (

        <section className="py-20 bg-sand grain-bg">

          <div className="max-w-6xl mx-auto px-4 sm:px-6">


            <div className="flex items-center gap-2 text-[11px] mono uppercase tracking-widest text-coral">

              <ListChecks className="h-4 w-4" />

              Admission process

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl">

              From enquiry to campus.

            </h2>


            <div className="mt-10 space-y-3">


              {d.admissionSteps.map(
                (step, index) => (

                  <div
                    key={index}
                    className="grid grid-cols-[50px_1fr] gap-4 rounded-3xl bg-white border border-ink/10 px-5 py-5"
                  >

                    <div className="h-10 w-10 rounded-full bg-ink text-cream grid place-items-center serif text-[18px]">

                      {String(index + 1).padStart(2, '0')}

                    </div>


                    <div className="flex items-center">

                      <p className="text-[15px] font-medium">

                        {step}

                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          DOCUMENTS
      ================================================== */}

      {Array.isArray(d?.documents) &&
        d.documents.length > 0 && (

        <section className="py-20 bg-cream">

          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">


            <div className="lg:col-span-4">

              <FileText className="h-7 w-7 text-coral" />


              <h2 className="serif mt-4 text-4xl">

                Documents required.

              </h2>

            </div>


            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-3">


              {d.documents.map(
                (document, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl bg-white border border-ink/10 p-4"
                  >

                    <Check className="h-4 w-4 text-coral shrink-0 mt-0.5" />

                    <span className="text-[14px] text-ink/75">

                      {document}

                    </span>

                  </div>

                )
              )}

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          VISA
      ================================================== */}

      {d?.visa && (

        <section className="py-20 bg-cream">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">


            <div className="lg:col-span-5">

              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

                <Plane className="h-3.5 w-3.5" />

                Visa

              </div>


              <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95]">

                How to get in.

              </h2>


              <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-md">

                Visa requirements may change.
                Always use the latest university and immigration guidance before applying.

              </p>

            </div>


            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">


              {[
                {
                  k: 'Visa type',
                  v: d.visa.type
                },

                {
                  k: 'Process time',
                  v: d.visa.processTime
                },

                {
                  k: 'Validity',
                  v: d.visa.validity
                },

                {
                  k: 'Key requirement',
                  v: d.visa.notes
                }

              ].map(
                (item) => (

                  <div
                    key={item.k}
                    className="rounded-3xl border border-ink/10 bg-white p-5"
                  >

                    <div className="text-[10px] mono uppercase tracking-widest text-ink/50">

                      {item.k}

                    </div>


                    <div className="mt-2 serif text-[20px] font-medium text-ink leading-tight">

                      {item.v}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          COST OF LIVING
      ================================================== */}

      {d?.costOfLiving && (

        <section className="py-20 bg-sand grain-bg">

          <div className="max-w-6xl mx-auto px-4 sm:px-6">


            <WalletCards className="h-6 w-6 text-coral" />


            <h2 className="serif mt-4 text-4xl sm:text-5xl">

              {d.costOfLiving.title}

            </h2>


            {d.costOfLiving.intro && (

              <p className="mt-5 max-w-3xl text-[15px] text-ink/70 leading-relaxed">

                {d.costOfLiving.intro}

              </p>

            )}


            <div className="mt-8 grid sm:grid-cols-2 gap-4">


              {(d.costOfLiving.points || []).map(
                (point, index) => (

                  <div
                    key={index}
                    className="rounded-3xl bg-white border border-ink/10 p-5 flex gap-3"
                  >

                    <Check className="h-5 w-5 text-coral shrink-0" />

                    <p className="text-[14px] leading-relaxed text-ink/75">

                      {point}

                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          NMC / REGULATORY
      ================================================== */}

      {d?.nmc && (

        <section className="py-20 bg-cream">

          <div className="max-w-5xl mx-auto px-4 sm:px-6">


            <div className="rounded-[32px] border border-ink/10 bg-white p-7 sm:p-10">


              <ShieldCheck className="h-7 w-7 text-coral" />


              <h2 className="serif mt-4 text-3xl sm:text-4xl">

                {d.nmc.title}

              </h2>


              <p className="mt-5 text-[15px] text-ink/70 leading-[1.8]">

                {d.nmc.text}

              </p>

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          LIFESTYLE
      ================================================== */}

      {d?.lifestyle && (

        <section className="py-20 bg-sand grain-bg">

          <div className="max-w-7xl mx-auto px-4 sm:px-6">


            <div className="max-w-2xl">


              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

                <Sun className="h-3.5 w-3.5" />

                Student life

              </div>


              <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95] text-ink">

                What life looks like there.

              </h2>

            </div>


            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">


              {[
                {
                  icon: Sun,
                  k: 'Climate',
                  v: d.lifestyle.climate
                },

                {
                  icon: Languages,
                  k: 'Language',
                  v: d.lifestyle.language
                },

                {
                  icon: UtensilsCrossed,
                  k: 'Food & culture',
                  v: d.lifestyle.food
                },

                {
                  icon: Users,
                  k: 'Indian community',
                  v: d.lifestyle.community
                }

              ].map(
                (item) => {

                  const Icon = item.icon;

                  return (

                    <div
                      key={item.k}
                      className="rounded-3xl border border-ink/10 bg-white p-6 card-lift"
                    >

                      <div className="h-10 w-10 rounded-xl bg-coral/10 text-coral grid place-items-center">

                        <Icon className="h-5 w-5" />

                      </div>


                      <div className="mt-4 text-[10px] mono uppercase tracking-widest text-ink/50">

                        {item.k}

                      </div>


                      <div className="mt-1 text-[15px] text-ink leading-snug">

                        {item.v}

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          FAQ
      ================================================== */}

      {Array.isArray(d?.faqs) &&
        d.faqs.length > 0 && (

        <section className="py-20 bg-cream">

          <div className="max-w-4xl mx-auto px-4 sm:px-6">


            <div className="flex items-center gap-2 text-[11px] mono uppercase tracking-widest text-coral">

              <HelpCircle className="h-4 w-4" />

              Frequently asked questions

            </div>


            <h2 className="serif mt-3 text-4xl sm:text-5xl">

              Questions students ask us.

            </h2>


            <div className="mt-10 space-y-4">


              {d.faqs.map(
                (faq, index) => (

                  <details
                    key={index}
                    className="group rounded-3xl bg-white border border-ink/10 p-6"
                  >

                    <summary className="cursor-pointer list-none flex items-center justify-between gap-4">

                      <span className="serif text-[20px] font-medium">

                        {faq.q}

                      </span>


                      <span className="h-8 w-8 rounded-full bg-cream border border-ink/10 grid place-items-center shrink-0">

                        +

                      </span>

                    </summary>


                    <p className="mt-4 text-[15px] text-ink/70 leading-relaxed pr-6">

                      {faq.a}

                    </p>

                  </details>

                )
              )}

            </div>

          </div>

        </section>

      )}


      {/* ==================================================
          CTA
      ================================================== */}

      <section className="py-24 bg-cream">

        <div className="max-w-6xl mx-auto px-4 sm:px-6">


          <div className="relative rounded-[36px] bg-ink text-cream p-10 sm:p-14 overflow-hidden grain-bg">


            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-coral/25 blur-3xl" />


            <div className="relative grid lg:grid-cols-12 gap-8 items-end">


              <div className="lg:col-span-8">


                <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

                  <Sparkles className="h-3.5 w-3.5" />

                  Explore more · {c.name}

                </div>


                <h2 className="serif mt-3 text-4xl sm:text-6xl font-normal leading-[0.95]">

                  Talk to our

                  <br />

                  <em className="font-light">

                    {c.name} coordinator.

                  </em>

                </h2>


                <p className="mt-5 text-cream/75 text-[15px] max-w-xl leading-relaxed">

                  Get help comparing universities,
                  fees, admissions, documentation,
                  visa requirements and student life.

                </p>

              </div>


              <div className="lg:col-span-4 flex flex-col gap-3">


                <a
                  href={brand.callbackLink}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center justify-between gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-6 py-4 text-[14px] font-bold"
                >

                  <span className="inline-flex items-center gap-2">

                    <PhoneCall className="h-4 w-4" />

                    Request a callback

                  </span>


                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" />

                </a>


                <a
                  href={`https://wa.me/${brand.whatsapp.replace('+', '')}?text=Hi%2C%20I'm%20interested%20in%20${encodeURIComponent(c.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-2 rounded-full bg-cream text-ink px-6 py-4 text-[14px] font-bold hover:bg-white"
                >

                  <span className="inline-flex items-center gap-2">

                    <MessageCircle className="h-4 w-4" />

                    WhatsApp us

                  </span>


                  <ArrowUpRight className="h-5 w-5" />

                </a>


                <a
                  href={brand.applyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-2 rounded-full border border-cream/25 text-cream px-6 py-3 text-[13px] font-semibold hover:bg-cream/10"
                >

                  <span>
                    Apply Online
                  </span>

                  <ArrowUpRight className="h-4 w-4" />

                </a>


              </div>

            </div>

          </div>

        </div>

      </section>


      <Footer />

      <AiChatWidget />

    </div>

  );
}
