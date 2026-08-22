import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  GraduationCap,
  Loader2,
  MapPin,
  Route as RouteIcon,
  Sparkles
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  'https://routeyourcareer.onrender.com';

const MBBS_COUNTRIES = [
  'Georgia',
  'Uzbekistan',
  'Russia'
];

const MANAGEMENT_COUNTRIES = [
  'Italy',
  'Germany',
  'United Kingdom',
  'United States',
  'Australia',
  'Singapore',
  'Spain',
  'UAE'
];

const PRIORITIES = [
  {
    value: 'best_overall',
    title: 'Best overall option',
    description: 'Balance affordability, fit and RYC recommendation signals.'
  },
  {
    value: 'lowest_cost',
    title: 'Lowest total cost',
    description: 'Prioritise options that fit your overall study budget.'
  },
  {
    value: 'recommended',
    title: 'RYC recommended',
    description: 'Prefer programmes marked as recommended by Route Your Career.'
  },
  {
    value: 'no_preference',
    title: 'No preference',
    description: 'Let the matcher rank all suitable published options.'
  }
];

const INITIAL_FORM = {
  stream: '',
  pcb_percentage: '',
  neet_status: '',
  neet_score: '',
  desired_level: '',
  academic_percentage: '',
  ielts_score: '',
  work_experience_years: '',
  budget_total: '',
  budget_currency: 'USD',
  preferred_countries: [],
  priority: 'best_overall'
};

function money(value, currency) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'Not verified';
  }

  return `${currency || 'USD'} ${Number(value).toLocaleString()}`;
}

function ChoiceCard({
  active,
  title,
  description,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        text-left rounded-2xl border p-5 transition
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
            mt-0.5 h-5 w-5 rounded-full border grid place-items-center
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
            <div className="mt-1 text-[12px] leading-relaxed text-ink/55">
              {description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function BuildMyRoute() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const countries = useMemo(() => {
    if (form.stream === 'MBBS') {
      return MBBS_COUNTRIES;
    }

    return MANAGEMENT_COUNTRIES;
  }, [form.stream]);

  const update = (key, value) => {
    setForm(old => ({
      ...old,
      [key]: value
    }));
  };

  const toggleCountry = country => {
    setForm(old => {
      const exists =
        old.preferred_countries.includes(country);

      return {
        ...old,
        preferred_countries:
          exists
            ? old.preferred_countries.filter(
                x => x !== country
              )
            : [
                ...old.preferred_countries,
                country
              ]
      };
    });
  };

  const chooseStream = stream => {
    setForm({
      ...INITIAL_FORM,
      stream,
      budget_currency:
        stream === 'MBBS'
          ? 'USD'
          : 'EUR'
    });

    setStep(2);
  };

  const canContinue = () => {
    if (step === 1) {
      return Boolean(form.stream);
    }

    if (
      step === 2 &&
      form.stream === 'MBBS'
    ) {
      return (
        form.pcb_percentage !== '' &&
        Boolean(form.neet_status)
      );
    }

    if (
      step === 2 &&
      form.stream === 'Management'
    ) {
      return (
        Boolean(form.desired_level) &&
        form.academic_percentage !== ''
      );
    }

    return true;
  };

  const submitRoute = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        stream:
          form.stream,

        preferred_countries:
          form.preferred_countries,

        budget_total:
          form.budget_total
            ? Number(form.budget_total)
            : null,

        budget_currency:
          form.budget_currency,

        // Intake deliberately omitted from matching until intake data
        // is standardised in the course database.
        intake:
          null,

        max_results:
          12,

        neet_status:
          form.stream === 'MBBS'
            ? form.neet_status || null
            : null,

        neet_score:
          form.stream === 'MBBS' &&
          form.neet_score !== ''
            ? Number(form.neet_score)
            : null,

        pcb_percentage:
          form.stream === 'MBBS' &&
          form.pcb_percentage !== ''
            ? Number(form.pcb_percentage)
            : null,

        desired_level:
          form.stream === 'Management'
            ? form.desired_level || null
            : null,

        academic_percentage:
          form.stream === 'Management' &&
          form.academic_percentage !== ''
            ? Number(form.academic_percentage)
            : null,

        english_test:
          null,

        ielts_score:
          form.stream === 'Management' &&
          form.ielts_score !== ''
            ? Number(form.ielts_score)
            : null,

        work_experience_years:
          form.stream === 'Management' &&
          form.work_experience_years !== ''
            ? Number(form.work_experience_years)
            : null
      };

      const response =
        await fetch(
          `${BACKEND_URL}/api/build-my-route`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify(payload)
          }
        );

      let data = null;

      try {
        data = await response.json();
      }
      catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          typeof data?.detail === 'string'
            ? data.detail
            : `Build My Route API returned ${response.status}.`;

        throw new Error(message);
      }

      setResult(data);
      setStep(5);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    catch (e) {
      setError(
        e.message ||
        'Could not build your route right now.'
      );
    }
    finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setError('');
    setStep(1);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const renderedResults = useMemo(() => {
    const rows = Array.isArray(result?.results)
      ? [...result.results]
      : [];

    if (form.priority === 'recommended') {
      rows.sort((a, b) => {
        if (Boolean(b.recommended) !== Boolean(a.recommended)) {
          return Number(Boolean(b.recommended)) -
            Number(Boolean(a.recommended));
        }

        return (b.score || 0) - (a.score || 0);
      });
    }

    if (form.priority === 'lowest_cost') {
      rows.sort((a, b) => {
        const aCost =
          a.total_course_cost ??
          Number.POSITIVE_INFINITY;

        const bCost =
          b.total_course_cost ??
          Number.POSITIVE_INFINITY;

        if (aCost !== bCost) {
          return aCost - bCost;
        }

        return (b.score || 0) - (a.score || 0);
      });
    }

    return rows;
  }, [result, form.priority]);

  return (
    <div className="min-h-screen bg-cream text-ink">

      <Navbar />

      {/* HERO */}
      <section className="border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 text-[10px] mono uppercase tracking-[0.2em] text-coral">
              <RouteIcon className="h-3.5 w-3.5" />
              Route Your Career V2
            </div>

            <h1 className="serif text-5xl sm:text-7xl font-normal leading-[0.92] mt-5">
              Build your route.
              <br />
              <em className="font-light">
                Not just a shortlist.
              </em>
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] sm:text-[17px] text-ink/65 leading-relaxed">
              Tell us where you stand academically,
              what you can spend and where you want
              to go. Route Your Career checks the
              programmes currently available in our
              database and builds a personalised route.
            </p>

          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* PROGRESS */}
        {step < 5 && (
          <div className="max-w-3xl mx-auto mb-8">

            <div className="flex justify-between text-[10px] mono uppercase tracking-widest text-ink/45 mb-3">
              <span>
                Step {step} of 4
              </span>

              <span>
                Build My Route
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
              <div
                className="h-full bg-coral transition-all duration-300"
                style={{
                  width:
                    `${(step / 4) * 100}%`
                }}
              />
            </div>

          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto">

            <div className="text-[10px] mono uppercase tracking-widest text-coral">
              Start here
            </div>

            <h2 className="serif text-4xl sm:text-5xl mt-2">
              What are you planning to study?
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">

              <ChoiceCard
                title="MBBS Abroad"
                description="Medical university matching for Indian students."
                active={
                  form.stream === 'MBBS'
                }
                onClick={() =>
                  chooseStream('MBBS')
                }
              />

              <ChoiceCard
                title="Management Abroad"
                description="Bachelor's and Master's programme matching."
                active={
                  form.stream === 'Management'
                }
                onClick={() =>
                  chooseStream('Management')
                }
              />

            </div>
          </div>
        )}

        {/* STEP 2 MBBS */}
        {step === 2 &&
         form.stream === 'MBBS' && (

          <div className="max-w-3xl mx-auto">

            <div className="text-[10px] mono uppercase tracking-widest text-coral">
              Academic profile
            </div>

            <h2 className="serif text-4xl sm:text-5xl mt-2">
              Tell us where you stand.
            </h2>

            <div className="mt-8 grid sm:grid-cols-2 gap-5">

              <label>
                <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                  Class XII PCB %
                </div>

                <input
                  type="number"
                  value={form.pcb_percentage}
                  onChange={e =>
                    update(
                      'pcb_percentage',
                      e.target.value
                    )
                  }
                  placeholder="Example: 65"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none"
                />
              </label>

              <label>
                <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                  NEET score
                </div>

                <input
                  type="number"
                  value={form.neet_score}
                  onChange={e =>
                    update(
                      'neet_score',
                      e.target.value
                    )
                  }
                  placeholder="Example: 350"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none"
                />
              </label>

            </div>

            <div className="mt-7">

              <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-3">
                NEET status
              </div>

              <div className="grid sm:grid-cols-3 gap-3">

                {[
                  [
                    'qualified',
                    'Qualified'
                  ],
                  [
                    'not_qualified',
                    'Not qualified'
                  ],
                  [
                    'not_taken',
                    'Not taken'
                  ]
                ].map(
                  ([value, label]) => (

                    <ChoiceCard
                      key={value}
                      title={label}
                      active={
                        form.neet_status ===
                        value
                      }
                      onClick={() =>
                        update(
                          'neet_status',
                          value
                        )
                      }
                    />

                  )
                )}

              </div>
            </div>

          </div>

        )}

        {/* STEP 2 MANAGEMENT */}
        {step === 2 &&
         form.stream === 'Management' && (

          <div className="max-w-3xl mx-auto">

            <div className="text-[10px] mono uppercase tracking-widest text-coral">
              Academic profile
            </div>

            <h2 className="serif text-4xl sm:text-5xl mt-2">
              What programme level fits you?
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">

              {[
                'Bachelor',
                'Master'
              ].map(level => (

                <ChoiceCard
                  key={level}
                  title={level}
                  active={
                    form.desired_level ===
                    level
                  }
                  onClick={() =>
                    update(
                      'desired_level',
                      level
                    )
                  }
                />

              ))}

            </div>

            <div className="grid sm:grid-cols-3 gap-5 mt-7">

              <label>
                <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                  Academic %
                </div>

                <input
                  type="number"
                  value={
                    form.academic_percentage
                  }
                  onChange={e =>
                    update(
                      'academic_percentage',
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5"
                />
              </label>

              <label>
                <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                  IELTS
                </div>

                <input
                  type="number"
                  step="0.5"
                  value={
                    form.ielts_score
                  }
                  onChange={e =>
                    update(
                      'ielts_score',
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5"
                />
              </label>

              <label>
                <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                  Work experience
                </div>

                <input
                  type="number"
                  value={
                    form.work_experience_years
                  }
                  onChange={e =>
                    update(
                      'work_experience_years',
                      e.target.value
                    )
                  }
                  placeholder="Years"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5"
                />
              </label>

            </div>

          </div>

        )}

        {/* STEP 3 */}
        {step === 3 && (

          <div className="max-w-3xl mx-auto">

            <div className="text-[10px] mono uppercase tracking-widest text-coral">
              Budget & destination
            </div>

            <h2 className="serif text-4xl sm:text-5xl mt-2">
              What works for you?
            </h2>

            <div className="grid sm:grid-cols-[180px_1fr] gap-4 mt-8">

              <select
                value={form.budget_currency}
                onChange={e =>
                  update(
                    'budget_currency',
                    e.target.value
                  )
                }
                className="rounded-2xl border border-ink/15 bg-white px-4 py-3.5"
              >

                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>AUD</option>

              </select>

              <input
                type="number"
                value={form.budget_total}
                onChange={e =>
                  update(
                    'budget_total',
                    e.target.value
                  )
                }
                placeholder="Total study budget — optional"
                className="rounded-2xl border border-ink/15 bg-white px-4 py-3.5"
              />

            </div>

            <div className="mt-8">

              <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-3">
                Preferred countries
              </div>

              <p className="text-[12px] text-ink/50 mb-4">
                Optional. Leave everything
                unselected if you want RYC to
                search everywhere.
              </p>

              <div className="flex flex-wrap gap-2">

                {countries.map(country => {

                  const active =
                    form.preferred_countries
                      .includes(country);

                  return (

                    <button
                      type="button"
                      key={country}
                      onClick={() =>
                        toggleCountry(country)
                      }
                      className={`
                        rounded-full px-4 py-2.5
                        text-[12px] font-semibold
                        border transition
                        ${
                          active
                            ? 'bg-ink text-cream border-ink'
                            : 'bg-white border-ink/15 text-ink'
                        }
                      `}
                    >

                      {country}

                    </button>

                  );

                })}

              </div>

            </div>

          </div>

        )}

        {/* STEP 4 */}
        {step === 4 && (

          <div className="max-w-3xl mx-auto">

            <div className="text-[10px] mono uppercase tracking-widest text-coral">
              Final preference
            </div>

            <h2 className="serif text-4xl sm:text-5xl mt-2">
              What matters most to you?
            </h2>

            <p className="mt-3 text-[13px] text-ink/55">
              This changes how your results are presented.
              It does not override known eligibility requirements.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">

              {PRIORITIES.map(item => (

                <ChoiceCard
                  key={item.value}
                  title={item.title}
                  description={item.description}
                  active={
                    form.priority === item.value
                  }
                  onClick={() =>
                    update(
                      'priority',
                      item.value
                    )
                  }
                />

              ))}

            </div>

            <div className="mt-6 rounded-3xl bg-white border border-ink/10 p-5">

              <div className="flex gap-3">

                <CircleAlert className="h-5 w-5 text-coral shrink-0" />

                <div>

                  <div className="font-semibold text-[13px]">
                    Intake is not used for matching yet.
                  </div>

                  <div className="text-[12px] text-ink/55 leading-relaxed mt-1">
                    Intake wording is not standardised across the current database.
                    RYC will show recorded intake information later, but it will not
                    reduce your match score or exclude a course.
                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* RESULTS */}
        {step === 5 && result && (

          <div>

            <div className="flex flex-wrap items-end justify-between gap-5">

              <div>

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Your Route
                </div>

                <h2 className="serif text-4xl sm:text-6xl mt-2">
                  Your best options.
                </h2>

                <p className="text-[14px] text-ink/60 mt-3">
                  {result.matches_found}
                  {' '}
                  suitable programmes found.
                </p>

              </div>

              <button
                onClick={restart}
                className="rounded-full border border-ink/15 bg-white px-4 py-2.5 text-[12px] font-semibold"
              >
                Start again
              </button>

            </div>

            <div className="mt-10 grid lg:grid-cols-2 gap-5">

              {renderedResults.map(
                (item, index) => (

                  <div
                    key={item.course_id}
                    className="rounded-3xl border border-ink/10 bg-white overflow-hidden"
                  >

                    <div className="p-6">

                      <div className="flex items-start gap-4">

                        <div>

                          <div className="text-[10px] mono uppercase tracking-widest text-coral">

                            #{index + 1}

                            {' · '}

                            {item.match_type ===
                            'best_match'
                              ? 'Best match'
                              : 'Possible match'}

                          </div>

                          <h3 className="serif text-3xl leading-tight mt-2">
                            {item.university_name}
                          </h3>

                          <div className="flex items-center gap-1.5 text-[12px] text-ink/55 mt-2">

                            <MapPin className="h-3.5 w-3.5" />

                            {item.city
                              ? `${item.city}, `
                              : ''}

                            {item.country}

                          </div>

                        </div>

                        <div className="ml-auto rounded-2xl bg-ink text-cream px-4 py-3 text-center">

                          <div className="serif text-2xl">
                            {item.score}%
                          </div>

                          <div className="text-[8px] mono uppercase tracking-widest text-cream/55">
                            Route match
                          </div>

                        </div>

                      </div>

                      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">

                        <div>

                          <div className="text-[9px] mono uppercase text-ink/40">
                            Course
                          </div>

                          <div className="text-[12px] font-semibold mt-1">
                            {item.course_name}
                          </div>

                        </div>

                        <div>

                          <div className="text-[9px] mono uppercase text-ink/40">
                            Tuition / year
                          </div>

                          <div className="text-[12px] font-semibold mt-1">
                            {money(
                              item.tuition_fee_year,
                              item.currency
                            )}
                          </div>

                        </div>

                        <div>

                          <div className="text-[9px] mono uppercase text-ink/40">
                            Duration
                          </div>

                          <div className="text-[12px] font-semibold mt-1">
                            {item.duration || 'Verify'}
                          </div>

                        </div>

                      </div>

                      {item.reasons?.length > 0 && (

                        <div className="mt-6">

                          <div className="text-[10px] mono uppercase tracking-widest text-ink/40 mb-3">
                            Why it matches
                          </div>

                          <div className="space-y-2">

                            {item.reasons.map(reason => (

                              <div
                                key={reason}
                                className="flex items-start gap-2 text-[12px] text-ink/70"
                              >

                                <div className="h-5 w-5 rounded-full bg-forest text-cream grid place-items-center shrink-0">
                                  <Check className="h-3 w-3" />
                                </div>

                                {reason}

                              </div>

                            ))}

                          </div>

                        </div>

                      )}

                      {item.cautions?.length > 0 && (

                        <div className="mt-5 rounded-2xl bg-cream p-4">

                          {item.cautions
                            .slice(0, 3)
                            .map(caution => (

                              <div
                                key={caution}
                                className="text-[11px] text-ink/55 leading-relaxed mb-1 last:mb-0"
                              >
                                • {caution}
                              </div>

                            ))}

                        </div>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

            {renderedResults.length === 0 && (

              <div className="mt-10 rounded-3xl bg-white border border-ink/10 p-10 text-center">

                <GraduationCap className="h-8 w-8 mx-auto text-ink/30" />

                <div className="serif text-2xl mt-3">
                  No published match yet.
                </div>

                <p className="text-[13px] text-ink/55 mt-2">
                  Try broader preferences or speak with an RYC counsellor.
                </p>

              </div>

            )}

          </div>

        )}

        {/* ERROR */}
        {error && (

          <div className="max-w-3xl mx-auto mt-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 p-4 text-[12px]">

            <div className="font-semibold">
              Build My Route could not complete this request.
            </div>

            <div className="mt-1">
              {error}
            </div>

            <div className="mt-2 text-red-600/70">
              API: {BACKEND_URL}/api/build-my-route
            </div>

          </div>

        )}

        {/* NAVIGATION */}
        {step > 1 && step < 5 && (

          <div className="max-w-3xl mx-auto mt-10 pt-6 border-t border-ink/10 flex items-center justify-between gap-3">

            <button
              onClick={() =>
                setStep(step - 1)
              }
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-3 text-[12px] font-semibold"
            >

              <ArrowLeft className="h-4 w-4" />
              Back

            </button>

            {step < 4 ? (

              <button
                disabled={!canContinue()}
                onClick={() =>
                  setStep(step + 1)
                }
                className="inline-flex items-center gap-2 rounded-full bg-ink text-cream disabled:bg-ink/20 px-6 py-3 text-[12px] font-bold"
              >

                Continue
                <ArrowRight className="h-4 w-4" />

              </button>

            ) : (

              <button
                onClick={submitRoute}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-6 py-3 text-[12px] font-bold disabled:opacity-50"
              >

                {loading ? (

                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building…
                  </>

                ) : (

                  <>
                    <Sparkles className="h-4 w-4" />
                    Build My Route
                  </>

                )}

              </button>

            )}

          </div>

        )}

      </main>

      <Footer />

    </div>
  );
}
