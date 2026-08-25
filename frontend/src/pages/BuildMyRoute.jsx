import React, {
  useMemo,
  useRef,
  useState
} from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Compass,
  GraduationCap,
  HeartHandshake,
  MapPin,
  RefreshCcw,
  Sparkles,
  Target
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import {
  EDUCATION_STAGES,
  ACADEMIC_STREAMS,
  INTEREST_AREAS,
  WORK_STYLE_QUESTIONS,
  PRIORITIES,
  STUDY_PREFERENCES,
  getCareerRecommendations
} from '../data/careerGuidanceData';


/*
=========================================================
BACKEND
=========================================================
*/

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  'https://routeyourcareer.onrender.com';


/*
=========================================================
INITIAL PROFILE
=========================================================
*/

const INITIAL_PROFILE = {

  education_stage: '',

  academic_stream: '',

  academic_percentage: '',

  interests: [],

  trait_scores: {},

  priorities: [],

  study_preference: 'either',

  budget_total: '',

  budget_currency: 'INR'

};


/*
=========================================================
CHOICE CARD
=========================================================
*/

function ChoiceCard({
  title,
  description,
  active,
  onClick
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      className={`
        text-left
        rounded-2xl
        border
        p-5
        transition

        ${
          active
            ? 'border-coral bg-coral/5'
            : 'border-ink/10 bg-white hover:border-ink/25'
        }
      `}
    >

      <div className="flex items-start gap-3">


        <div
          className={`
            mt-0.5
            h-5
            w-5
            rounded-full
            border
            grid
            place-items-center
            shrink-0

            ${
              active
                ? 'bg-coral border-coral'
                : 'border-ink/20'
            }
          `}
        >

          {active && (
            <Check className="h-3 w-3 text-white" />
          )}

        </div>


        <div>

          <div className="font-semibold text-[14px] text-ink">
            {title}
          </div>


          {description && (

            <div className="mt-1 text-[12px] text-ink/55 leading-relaxed">
              {description}
            </div>

          )}

        </div>


      </div>

    </button>

  );

}


/*
=========================================================
MULTI SELECT
=========================================================
*/

function MultiChoice({
  label,
  active,
  onClick
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-full
        px-4
        py-2.5
        text-[12px]
        font-semibold
        border
        transition

        ${
          active
            ? 'bg-ink text-cream border-ink'
            : 'bg-white text-ink border-ink/15 hover:border-ink/30'
        }
      `}
    >

      {label}

    </button>

  );

}


/*
=========================================================
FIT BADGE
=========================================================
*/

function FitBadge({
  score
}) {

  let label =
    'Explore';


  if (
    score >= 75
  ) {

    label =
      'Strong fit';

  }
  else if (
    score >= 60
  ) {

    label =
      'Good fit';

  }
  else if (
    score >= 45
  ) {

    label =
      'Possible fit';

  }


  return (

    <div className="rounded-2xl bg-ink text-cream px-4 py-3 text-center shrink-0">

      <div className="serif text-2xl leading-none">

        {score}%

      </div>


      <div className="mt-1 text-[8px] mono uppercase tracking-widest text-cream/50">

        {label}

      </div>

    </div>

  );

}


/*
=========================================================
CAREER RESULT CARD
=========================================================
*/

function CareerResultCard({
  career,
  rank,
  onExplore
}) {

  return (

    <article className="rounded-3xl border border-ink/10 bg-white overflow-hidden">


      {rank === 1 && (

        <div className="bg-ink text-cream px-5 py-3 flex items-center gap-2">

          <Sparkles className="h-4 w-4 text-coral" />

          <div className="text-[10px] mono uppercase tracking-widest">

            Your strongest career family

          </div>

        </div>

      )}


      <div className="p-6">


        <div className="flex items-start gap-4">


          <div className="min-w-0">


            <div className="text-[10px] mono uppercase tracking-widest text-coral">

              #{rank}

            </div>


            <h3 className="serif text-3xl mt-2 leading-tight">

              {career.title}

            </h3>


            <p className="mt-3 text-[13px] text-ink/60 leading-relaxed">

              {career.summary}

            </p>


          </div>


          <div className="ml-auto">

            <FitBadge
              score={career.fit_score}
            />

          </div>


        </div>



        {/* DEGREE PATHWAYS */}

        <div className="mt-6">


          <div className="text-[9px] mono uppercase tracking-widest text-ink/40">

            Degree pathways

          </div>


          <div className="mt-2 flex flex-wrap gap-2">


            {career.degrees.map(
              degree => (

                <span
                  key={degree}
                  className="rounded-full bg-cream border border-ink/10 px-3 py-1.5 text-[11px]"
                >

                  {degree}

                </span>

              )
            )}


          </div>


        </div>



        {/* CAREERS */}

        <div className="mt-6">


          <div className="text-[9px] mono uppercase tracking-widest text-ink/40">

            Career directions

          </div>


          <div className="mt-2 flex flex-wrap gap-2">


            {career.careers.map(
              item => (

                <span
                  key={item}
                  className="rounded-full bg-forest/5 border border-forest/10 px-3 py-1.5 text-[11px]"
                >

                  {item}

                </span>

              )
            )}


          </div>


        </div>



        {/* CAUTION */}

        {career.caution && (

          <div className="mt-6 rounded-2xl bg-cream border border-ink/10 p-4">


            <div className="text-[9px] mono uppercase tracking-widest text-coral">

              Important to know

            </div>


            <p className="mt-1 text-[11px] text-ink/55 leading-relaxed">

              {career.caution}

            </p>


          </div>

        )}



        {/* EXPLORE */}

        <button
          type="button"
          onClick={() =>
            onExplore(
              career
            )
          }
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-[11px] font-semibold hover:bg-ink hover:text-cream transition"
        >

          Explore this career

          <ArrowRight className="h-3.5 w-3.5" />

        </button>


      </div>


    </article>

  );

}


/*
=========================================================
MAIN PAGE
=========================================================
*/

export default function BuildMyRoute() {


  const [
    profile,
    setProfile
  ] =
    useState(
      INITIAL_PROFILE
    );


  const [
    step,
    setStep
  ] =
    useState(1);


  const [
    recommendations,
    setRecommendations
  ] =
    useState([]);


  const [
    selectedCareer,
    setSelectedCareer
  ] =
    useState(null);


  const [
    rycCourses,
    setRycCourses
  ] =
    useState([]);


  const [
    loadingCourses,
    setLoadingCourses
  ] =
    useState(false);


  const [
    courseError,
    setCourseError
  ] =
    useState('');


  /*
  =======================================================
  CAREER DETAIL SCROLL TARGET
  =======================================================
  */

  const careerDetailRef =
    useRef(null);



  /*
  =======================================================
  UPDATE PROFILE
  =======================================================
  */

  const update = (
    key,
    value
  ) => {

    setProfile(
      old => ({
        ...old,
        [key]:
          value
      })
    );

  };



  /*
  =======================================================
  TOGGLE MULTIPLE OPTIONS
  =======================================================
  */

  const toggleArrayValue = (
    key,
    value
  ) => {


    setProfile(
      old => {


        const current =
          Array.isArray(
            old[key]
          )
            ? old[key]
            : [];


        const exists =
          current.includes(
            value
          );


        return {

          ...old,

          [key]:
            exists
              ? current.filter(
                  x =>
                    x !==
                    value
                )
              : [
                  ...current,
                  value
                ]

        };

      }
    );

  };



  /*
  =======================================================
  TRAIT SCORE
  =======================================================
  */

  const updateTrait = (
    trait,
    value
  ) => {


    setProfile(
      old => ({

        ...old,

        trait_scores: {

          ...old.trait_scores,

          [trait]:
            Number(
              value
            )

        }

      })
    );

  };



  /*
  =======================================================
  STEP VALIDATION
  =======================================================
  */

  const canContinue =
    useMemo(
      () => {


        if (
          step === 1
        ) {

          return Boolean(
            profile.education_stage
          );

        }


        if (
          step === 2
        ) {

          return Boolean(
            profile.academic_stream
          );

        }


        if (
          step === 3
        ) {

          return (
            profile.interests.length >
            0
          );

        }


        if (
          step === 4
        ) {

          return (

            Object.keys(
              profile.trait_scores
            ).length >=
            WORK_STYLE_QUESTIONS.length

          );

        }


        if (
          step === 5
        ) {

          return (
            profile.priorities.length >
            0
          );

        }


        return true;

      },
      [
        step,
        profile
      ]
    );



  /*
  =======================================================
  GENERATE CAREER GUIDE
  =======================================================
  */

  const buildCareerRoute = () => {


    const result =
      getCareerRecommendations(
        profile,
        6
      );


    setRecommendations(
      result
    );


    setSelectedCareer(
      null
    );


    setRycCourses([]);


    setCourseError('');


    setStep(7);


    window.scrollTo({

      top: 0,

      behavior:
        'smooth'

    });

  };



  /*
  =======================================================
  EXPLORE CAREER
  =======================================================
  */

  const exploreCareer =
    async career => {


      /*
      Select career
      */

      setSelectedCareer(
        career
      );


      setRycCourses([]);


      setCourseError('');


      /*
      Scroll to career details.

      React needs a tiny delay so the
      selected career section can render.
      */

      window.setTimeout(
        () => {

          careerDetailRef
            .current
            ?.scrollIntoView({

              behavior:
                'smooth',

              block:
                'start'

            });

        },
        120
      );


      /*
      Check whether RYC currently
      offers relevant programmes.
      */

      const tags =
        career.ryc_tags ||
        [];


      /*
      Important:
      Career is still displayed even if
      RYC has no programmes for it.
      */

      if (
        !tags.length
      ) {

        return;

      }


      setLoadingCourses(
        true
      );


      try {


        const response =
          await fetch(

            `${BACKEND_URL}/api/courses`

          );


        if (
          !response.ok
        ) {

          throw new Error(

            'Programme information could not be loaded.'

          );

        }


        const data =
          await response.json();


        const courses =
          Array.isArray(
            data
          )
            ? data
            : data?.courses ||
              [];


        const matches =
          courses.filter(
            course => {


              const stream =
                String(
                  course.stream ||
                  ''
                )
                  .trim()
                  .toLowerCase();


              return tags.some(
                tag =>

                  stream ===
                  String(
                    tag
                  )
                    .trim()
                    .toLowerCase()

              );

            }
          );


        setRycCourses(

          matches.slice(
            0,
            12
          )

        );


      }
      catch (
        err
      ) {


        setCourseError(

          err.message ||
          'Could not load programmes.'

        );


      }
      finally {


        setLoadingCourses(
          false
        );


      }

    };



  /*
  =======================================================
  RESTART
  =======================================================
  */

  const restart = () => {


    setProfile(
      INITIAL_PROFILE
    );


    setStep(1);


    setRecommendations([]);


    setSelectedCareer(
      null
    );


    setRycCourses([]);


    setCourseError('');


    window.scrollTo({

      top: 0,

      behavior:
        'smooth'

    });

  };



  /*
  =======================================================
  PAGE
  =======================================================
  */

  return (

    <div className="min-h-screen bg-cream text-ink">


      <Navbar />



      {/* =================================================
          HERO
      ================================================= */}

      {step < 7 && (

        <section className="border-b border-ink/10">


          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">


            <div className="max-w-4xl">


              <div className="inline-flex items-center gap-2 text-[10px] mono uppercase tracking-[0.2em] text-coral">


                <Compass className="h-4 w-4" />


                Career Guide


              </div>



              <h1 className="serif text-5xl sm:text-7xl font-normal leading-[0.92] mt-5">


                Career Guide.


                <br />


                <em className="font-light">

                  Start with you.

                </em>


              </h1>



              <p className="mt-6 max-w-3xl text-[15px] sm:text-[17px] text-ink/65 leading-relaxed">


                This is not an application form
                and it is not designed to push
                you toward a particular university.


                Tell us about your education,
                interests, work style and priorities.


                We will first identify career
                paths that fit you.


              </p>



              <div className="mt-7 rounded-2xl border border-forest/20 bg-forest/5 p-4 max-w-2xl">


                <div className="flex items-start gap-3">


                  <HeartHandshake className="h-5 w-5 text-forest shrink-0" />


                  <p className="text-[12px] text-ink/60 leading-relaxed">


                    Route Your Career programmes are
                    shown only after your career
                    recommendations are generated.


                    A career can still be recommended
                    even if RYC does not currently
                    offer that programme.


                  </p>


                </div>


              </div>


            </div>


          </div>


        </section>

      )}



      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">



        {/* =================================================
            PROGRESS
        ================================================= */}

        {step < 7 && (

          <div className="max-w-4xl mx-auto mb-10">


            <div className="flex justify-between text-[10px] mono uppercase tracking-widest text-ink/45 mb-3">


              <span>

                Step {step} of 6

              </span>


              <span>

                Career Guide

              </span>


            </div>



            <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">


              <div
                className="h-full bg-coral transition-all duration-300"
                style={{

                  width:
                    `${(step / 6) * 100}%`

                }}
              />


            </div>


          </div>

        )}



        {/* =================================================
            STEP 1
        ================================================= */}

        {step === 1 && (

          <section className="max-w-4xl mx-auto">


            <div className="text-[10px] mono uppercase tracking-widest text-coral">

              Your starting point

            </div>


            <h2 className="serif text-4xl sm:text-5xl mt-2">

              Where are you academically?

            </h2>


            <p className="mt-3 text-[13px] text-ink/55">

              Choose the option that best
              describes you today.

            </p>



            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">


              {EDUCATION_STAGES.map(
                item => (

                  <ChoiceCard
                    key={
                      item.id
                    }
                    title={
                      item.label
                    }
                    active={
                      profile.education_stage ===
                      item.id
                    }
                    onClick={() =>

                      update(
                        'education_stage',
                        item.id
                      )

                    }
                  />

                )
              )}


            </div>


          </section>

        )}



        {/* =================================================
            STEP 2
        ================================================= */}

        {step === 2 && (

          <section className="max-w-4xl mx-auto">


            <div className="text-[10px] mono uppercase tracking-widest text-coral">

              Academic background

            </div>


            <h2 className="serif text-4xl sm:text-5xl mt-2">

              What have you studied?

            </h2>



            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">


              {ACADEMIC_STREAMS.map(
                item => (

                  <ChoiceCard
                    key={
                      item.id
                    }
                    title={
                      item.label
                    }
                    active={
                      profile.academic_stream ===
                      item.id
                    }
                    onClick={() =>

                      update(
                        'academic_stream',
                        item.id
                      )

                    }
                  />

                )
              )}


            </div>



            <label className="block mt-8 max-w-sm">


              <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">

                Most relevant academic percentage

              </div>


              <input
                type="number"
                min="0"
                max="100"
                value={
                  profile.academic_percentage
                }
                onChange={
                  e =>

                    update(
                      'academic_percentage',
                      e.target.value
                    )
                }
                placeholder="Optional — e.g. 72"
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
              />


            </label>


          </section>

        )}



        {/* =================================================
            STEP 3
        ================================================= */}

        {step === 3 && (

          <section className="max-w-4xl mx-auto">


            <div className="text-[10px] mono uppercase tracking-widest text-coral">

              Interests

            </div>


            <h2 className="serif text-4xl sm:text-5xl mt-2">

              What catches your attention?

            </h2>


            <p className="mt-3 text-[13px] text-ink/55">

              Choose as many as you genuinely like.

              There is no right answer.

            </p>



            <div className="mt-8 flex flex-wrap gap-2.5">


              {INTEREST_AREAS.map(
                item => (

                  <MultiChoice
                    key={
                      item.id
                    }
                    label={
                      item.label
                    }
                    active={
                      profile.interests.includes(
                        item.id
                      )
                    }
                    onClick={() =>

                      toggleArrayValue(
                        'interests',
                        item.id
                      )

                    }
                  />

                )
              )}


            </div>


          </section>

        )}



        {/* =================================================
            STEP 4
        ================================================= */}

        {step === 4 && (

          <section className="max-w-4xl mx-auto">


            <div className="text-[10px] mono uppercase tracking-widest text-coral">

              How you work

            </div>


            <h2 className="serif text-4xl sm:text-5xl mt-2">

              What sounds like you?

            </h2>


            <p className="mt-3 text-[13px] text-ink/55">

              Rate each statement from 1 to 5.

            </p>



            <div className="mt-8 space-y-4">


              {WORK_STYLE_QUESTIONS.map(
                question => (

                  <div
                    key={
                      question.id
                    }
                    className="rounded-2xl bg-white border border-ink/10 p-5"
                  >


                    <div className="font-semibold text-[13px]">

                      {question.label}

                    </div>



                    <div className="mt-4 flex items-center gap-2">


                      {[1, 2, 3, 4, 5].map(
                        value => {


                          const active =

                            profile.trait_scores[
                              question.id
                            ] ===
                            value;


                          return (

                            <button
                              type="button"
                              key={
                                value
                              }
                              onClick={() =>

                                updateTrait(
                                  question.id,
                                  value
                                )

                              }
                              className={`
                                h-10
                                w-10
                                rounded-full
                                border
                                text-[12px]
                                font-semibold
                                transition

                                ${
                                  active
                                    ? 'bg-ink text-cream border-ink'
                                    : 'bg-cream border-ink/10 hover:border-ink/30'
                                }
                              `}
                            >

                              {value}

                            </button>

                          );

                        }
                      )}


                    </div>



                    <div className="mt-2 flex justify-between text-[9px] text-ink/35 max-w-[245px]">


                      <span>

                        Not like me

                      </span>


                      <span>

                        Very much me

                      </span>


                    </div>


                  </div>

                )
              )}


            </div>


          </section>

        )}



        {/* =================================================
            STEP 5
        ================================================= */}

        {step === 5 && (

          <section className="max-w-4xl mx-auto">


            <div className="text-[10px] mono uppercase tracking-widest text-coral">

              Your priorities

            </div>


            <h2 className="serif text-4xl sm:text-5xl mt-2">

              What matters in your future?

            </h2>


            <p className="mt-3 text-[13px] text-ink/55">

              Select the things that genuinely
              matter to you.

            </p>



            <div className="mt-8 flex flex-wrap gap-2.5">


              {PRIORITIES.map(
                item => (

                  <MultiChoice
                    key={
                      item.id
                    }
                    label={
                      item.label
                    }
                    active={
                      profile.priorities.includes(
                        item.id
                      )
                    }
                    onClick={() =>

                      toggleArrayValue(
                        'priorities',
                        item.id
                      )

                    }
                  />

                )
              )}


            </div>


          </section>

        )}



        {/* =================================================
            STEP 6
        ================================================= */}

        {step === 6 && (

          <section className="max-w-4xl mx-auto">


            <div className="text-[10px] mono uppercase tracking-widest text-coral">

              Real-world preferences

            </div>


            <h2 className="serif text-4xl sm:text-5xl mt-2">

              Where should your route fit?

            </h2>



            <div className="grid sm:grid-cols-3 gap-4 mt-8">


              {STUDY_PREFERENCES.map(
                item => (

                  <ChoiceCard
                    key={
                      item.id
                    }
                    title={
                      item.label
                    }
                    active={
                      profile.study_preference ===
                      item.id
                    }
                    onClick={() =>

                      update(
                        'study_preference',
                        item.id
                      )

                    }
                  />

                )
              )}


            </div>



            <div className="mt-8">


              <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-3">

                Education budget

              </div>



              <div className="grid sm:grid-cols-[180px_1fr] gap-3 max-w-xl">


                <select
                  value={
                    profile.budget_currency
                  }
                  onChange={
                    e =>

                      update(
                        'budget_currency',
                        e.target.value
                      )
                  }
                  className="rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
                >


                  <option value="INR">
                    INR — ₹
                  </option>


                  <option value="USD">
                    USD — $
                  </option>


                  <option value="EUR">
                    EUR — €
                  </option>


                  <option value="GBP">
                    GBP — £
                  </option>


                  <option value="AUD">
                    AUD — A$
                  </option>


                </select>



                <input
                  type="number"
                  min="0"
                  value={
                    profile.budget_total
                  }
                  onChange={
                    e =>

                      update(
                        'budget_total',
                        e.target.value
                      )
                  }
                  placeholder="Optional total study budget"
                  className="rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
                />


              </div>


            </div>



            <div className="mt-8 rounded-3xl bg-white border border-ink/10 p-6">


              <div className="flex items-start gap-3">


                <Target className="h-5 w-5 text-coral shrink-0" />


                <div>


                  <div className="font-semibold text-[13px]">

                    Your report remains career-first.

                  </div>


                  <p className="text-[11px] text-ink/50 mt-1 leading-relaxed">

                    Budget and location preferences
                    help with practical planning.

                    They do not make a career rank
                    higher because Route Your Career
                    happens to offer that course.

                  </p>


                </div>


              </div>


            </div>


          </section>

        )}



        {/* =================================================
            NAVIGATION
        ================================================= */}

        {step < 7 && (

          <div className="max-w-4xl mx-auto mt-10 pt-6 border-t border-ink/10 flex items-center justify-between gap-3">


            {step > 1 ? (

              <button
                type="button"
                onClick={() =>

                  setStep(
                    step - 1
                  )

                }
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-3 text-[12px] font-semibold"
              >

                <ArrowLeft className="h-4 w-4" />

                Back

              </button>

            ) : (

              <div />

            )}



            {step < 6 ? (

              <button
                type="button"
                disabled={
                  !canContinue
                }
                onClick={() =>

                  setStep(
                    step + 1
                  )

                }
                className="inline-flex items-center gap-2 rounded-full bg-ink text-cream disabled:bg-ink/20 px-6 py-3 text-[12px] font-bold"
              >

                Continue

                <ArrowRight className="h-4 w-4" />

              </button>

            ) : (

              <button
                type="button"
                onClick={
                  buildCareerRoute
                }
                className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-6 py-3 text-[12px] font-bold"
              >

                <Sparkles className="h-4 w-4" />

                Show My Career Guidance

              </button>

            )}


          </div>

        )}



        {/* =================================================
            RESULTS
        ================================================= */}

        {step === 7 && (

          <section>


            {/* RESULT HERO */}

            <div className="rounded-[32px] bg-ink text-cream p-6 sm:p-9">


              <div className="flex flex-wrap items-end justify-between gap-6">


                <div>


                  <div className="inline-flex items-center gap-2 text-[10px] mono uppercase tracking-[0.2em] text-coral">


                    <Compass className="h-4 w-4" />


                    Your Career Guide


                  </div>



                  <h1 className="serif text-4xl sm:text-6xl mt-3 leading-[0.95]">


                    Careers that fit


                    <br />


                    <em className="font-light">

                      the person you described.

                    </em>


                  </h1>



                  <p className="mt-4 max-w-3xl text-[13px] sm:text-[14px] leading-relaxed text-cream/65">


                    These results are guidance,
                    not a psychological aptitude
                    diagnosis.


                    They are based on the interests,
                    academic background, work-style
                    preferences and priorities you entered.


                  </p>


                </div>



                <button
                  type="button"
                  onClick={
                    restart
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-3 text-[12px] font-semibold hover:bg-cream hover:text-ink transition"
                >

                  <RefreshCcw className="h-4 w-4" />

                  Start again

                </button>


              </div>


            </div>



            {/* MATCHES */}

            <div className="mt-8">


              <div className="text-[10px] mono uppercase tracking-widest text-coral">

                Your strongest matches

              </div>


              <h2 className="serif text-3xl sm:text-4xl mt-2">

                Explore before you decide.

              </h2>


            </div>



            <div className="mt-7 grid lg:grid-cols-2 gap-5">


              {recommendations.map(
                (
                  career,
                  index
                ) => (

                  <CareerResultCard
                    key={
                      career.id
                    }
                    career={
                      career
                    }
                    rank={
                      index + 1
                    }
                    onExplore={
                      exploreCareer
                    }
                  />

                )
              )}


            </div>



            {/* =================================================
                EXPLORE CAREER DETAIL
            ================================================= */}

            {selectedCareer && (

              <div
                ref={
                  careerDetailRef
                }
                className="mt-10 scroll-mt-28 rounded-[30px] border border-ink/10 bg-white overflow-hidden"
              >


                {/* HEADER */}

                <div className="p-6 sm:p-8 border-b border-ink/10">


                  <div className="text-[10px] mono uppercase tracking-widest text-coral">

                    Career Guide

                  </div>


                  <h2 className="serif text-4xl sm:text-5xl mt-2">

                    {selectedCareer.title}

                  </h2>


                  <p className="mt-3 max-w-3xl text-[13px] text-ink/55 leading-relaxed">

                    {selectedCareer.summary}

                  </p>



                  {/* MAIN INFORMATION */}

                  <div className="mt-7 grid md:grid-cols-2 gap-4">



                    {/* DEGREE OPTIONS */}

                    <div className="rounded-2xl bg-cream border border-ink/10 p-5">


                      <div className="text-[9px] mono uppercase tracking-widest text-coral">

                        Courses you can consider

                      </div>


                      <div className="mt-3 flex flex-wrap gap-2">


                        {selectedCareer.degrees.map(
                          degree => (

                            <span
                              key={
                                degree
                              }
                              className="rounded-full bg-white border border-ink/10 px-3 py-2 text-[11px]"
                            >

                              {degree}

                            </span>

                          )
                        )}


                      </div>


                    </div>



                    {/* CAREER OPTIONS */}

                    <div className="rounded-2xl bg-cream border border-ink/10 p-5">


                      <div className="text-[9px] mono uppercase tracking-widest text-coral">

                        Possible careers

                      </div>


                      <div className="mt-3 flex flex-wrap gap-2">


                        {selectedCareer.careers.map(
                          careerName => (

                            <span
                              key={
                                careerName
                              }
                              className="rounded-full bg-white border border-ink/10 px-3 py-2 text-[11px]"
                            >

                              {careerName}

                            </span>

                          )
                        )}


                      </div>


                    </div>


                  </div>



                  {/* REALITY CHECK */}

                  {selectedCareer.caution && (

                    <div className="mt-5 rounded-2xl border border-coral/15 bg-coral/5 p-5">


                      <div className="text-[9px] mono uppercase tracking-widest text-coral">

                        Reality check

                      </div>


                      <p className="mt-2 text-[12px] leading-relaxed text-ink/60">

                        {selectedCareer.caution}

                      </p>


                    </div>

                  )}


                </div>



                {/* PROGRAMMES */}

                <div className="p-6 sm:p-8">



                  {/* NO RYC PROGRAMMES */}

                  {selectedCareer.ryc_tags?.length ===
                    0 && (

                    <div className="rounded-2xl bg-cream border border-ink/10 p-5">


                      <div className="flex items-start gap-3">


                        <BookOpen className="h-5 w-5 text-coral shrink-0" />


                        <div>


                          <div className="font-semibold text-[13px]">

                            Career guidance does not depend on our catalogue.

                          </div>


                          <p className="mt-1 text-[12px] text-ink/55 leading-relaxed">


                            Route Your Career does not
                            currently have a dedicated
                            programme catalogue for this
                            pathway.


                            We are still recommending it
                            because it may genuinely fit
                            your profile.


                          </p>


                        </div>


                      </div>


                    </div>

                  )}



                  {/* HAS RYC PROGRAMMES */}

                  {selectedCareer.ryc_tags?.length >
                    0 && (

                    <>


                      <div className="flex items-center gap-2 text-[10px] mono uppercase tracking-widest text-coral">


                        <GraduationCap className="h-4 w-4" />


                        Programmes currently listed on RYC


                      </div>



                      <p className="mt-2 text-[12px] text-ink/50">


                        These options are shown only
                        after your career recommendation.


                        They did not influence your
                        career-fit score.


                      </p>



                      {/* LOADING */}

                      {loadingCourses && (

                        <div className="mt-6 rounded-2xl bg-cream p-5 text-[12px] text-ink/50">

                          Loading available programmes…

                        </div>

                      )}



                      {/* ERROR */}

                      {courseError && (

                        <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-[12px] text-red-700">

                          {courseError}

                        </div>

                      )}



                      {/* NO MATCH */}

                      {!loadingCourses &&
                       !courseError &&
                       rycCourses.length ===
                         0 && (

                        <div className="mt-6 rounded-2xl bg-cream p-5 text-[12px] text-ink/50">


                          There are currently no published
                          RYC programmes matching this
                          pathway.


                        </div>

                      )}



                      {/* COURSE RESULTS */}

                      {rycCourses.length >
                        0 && (

                        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">


                          {rycCourses.map(
                            course => (

                              <div
                                key={
                                  course.id
                                }
                                className="rounded-2xl border border-ink/10 bg-cream p-5"
                              >


                                <div className="text-[9px] mono uppercase tracking-widest text-coral">

                                  {course.country}

                                </div>



                                <div className="serif text-xl mt-1 leading-tight">

                                  {course.university_name}

                                </div>



                                <div className="mt-2 text-[12px] font-semibold">

                                  {course.name}

                                </div>



                                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-ink/45">


                                  <MapPin className="h-3.5 w-3.5" />


                                  {course.city
                                    ? `${course.city}, `
                                    : ''}


                                  {course.country}


                                </div>



                                {course.tuition_fee_year !=
                                  null && (

                                  <div className="mt-4">


                                    <div className="text-[9px] mono uppercase tracking-widest text-ink/35">

                                      Tuition / year

                                    </div>


                                    <div className="mt-1 font-semibold text-[12px]">


                                      {course.currency ||
                                        'USD'}

                                      {' '}

                                      {Number(
                                        course.tuition_fee_year
                                      ).toLocaleString()}


                                    </div>


                                  </div>

                                )}


                              </div>

                            )
                          )}


                        </div>

                      )}


                    </>

                  )}



                  {/* APPLICATION */}

                  <div className="mt-8 border-t border-ink/10 pt-6">


                    <div className="text-[10px] mono uppercase tracking-widest text-ink/40">

                      Ready for the admission stage?

                    </div>



                    <p className="mt-2 text-[12px] text-ink/50 max-w-2xl">

                      Career Guide helps you understand
                      your options.

                      Start Application is separate and
                      should only be used when you are
                      ready to move toward admission.

                    </p>



                    <div className="mt-4 flex flex-wrap gap-3">


                      <Link
                        to="/start-application"
                        className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[12px] font-semibold"
                      >

                        <BriefcaseBusiness className="h-4 w-4" />

                        Start Application

                      </Link>



                      <button
                        type="button"
                        onClick={() => {

                          setSelectedCareer(
                            null
                          );

                          window.scrollTo({

                            top: 350,

                            behavior:
                              'smooth'

                          });

                        }}
                        className="inline-flex items-center rounded-full border border-ink/15 bg-white px-5 py-3 text-[12px] font-semibold"
                      >

                        Explore another career

                      </button>


                    </div>


                  </div>


                </div>


              </div>

            )}



            {/* DISCLAIMER */}

            <div className="mt-10 rounded-3xl bg-forest/5 border border-forest/15 p-6">


              <div className="flex items-start gap-3">


                <HeartHandshake className="h-5 w-5 text-forest shrink-0" />


                <div>


                  <div className="font-semibold text-[13px]">

                    One recommendation should never decide your life.

                  </div>


                  <p className="mt-1 text-[11px] text-ink/55 leading-relaxed max-w-3xl">


                    Use Career Guide as a starting point.


                    Talk to people working in the
                    careers you are considering,
                    research course requirements,
                    understand costs and licensing,
                    and discuss major decisions with
                    your family or a qualified career
                    counsellor.


                  </p>


                </div>


              </div>


            </div>


          </section>

        )}


      </main>


      <Footer />


    </div>

  );

}
