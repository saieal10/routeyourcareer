import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  CircleAlert,
  GraduationCap,
  Loader2,
  MapPin,
  Route as RouteIcon,
  Scale,
  Sparkles,
  WalletCards,
  X
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

const COUNTRY_CODES = {
  Georgia: 'ge',
  Uzbekistan: 'uz',
  Russia: 'ru',
  Italy: 'it',
  Germany: 'de',
  'United Kingdom': 'gb',
  'United States': 'us',
  Australia: 'au',
  Singapore: 'sg',
  Spain: 'es',
  UAE: 'ae'
};

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
  preferred_countries: []
};

function money(value, currency) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'Needs verification';
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'Needs verification';
  }

  return `${currency || 'USD'} ${number.toLocaleString()}`;
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
            mt-0.5 h-5 w-5 rounded-full border grid place-items-center shrink-0
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

function StatBox({
  label,
  value
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-4">
      <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
        {label}
      </div>

      <div className="mt-1 text-[13px] font-semibold text-ink">
        {value}
      </div>
    </div>
  );
}

function MatchBadge({
  score,
  type
}) {
  const isBest =
    type === 'best_match';

  return (
    <div
      className={`
        rounded-2xl px-4 py-3 text-center shrink-0
        ${
          isBest
            ? 'bg-ink text-cream'
            : 'bg-cream border border-ink/10 text-ink'
        }
      `}
    >
      <div className="serif text-2xl leading-none">
        {score ?? 0}%
      </div>

      <div
        className={`
          mt-1 text-[8px] mono uppercase tracking-widest
          ${
            isBest
              ? 'text-cream/55'
              : 'text-ink/45'
          }
        `}
      >
        Route match
      </div>
    </div>
  );
}

function ResultCard({
  item,
  index,
  selected,
  onToggleCompare,
  onStartApplication,
  featured = false
}) {
  const code =
    COUNTRY_CODES[item.country];

  const detailPath =
    code
      ? `/country/${code}`
      : null;

  const totalCost =
    item.estimated_total_cost ??
    item.total_course_cost;

  return (
    <article
      className={`
        rounded-3xl border overflow-hidden
        ${
          featured
            ? 'border-coral/40 bg-white shadow-sm'
            : 'border-ink/10 bg-white'
        }
      `}
    >
      {featured && (
        <div className="bg-ink text-cream px-6 py-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-coral" />

          <div className="text-[10px] mono uppercase tracking-[0.18em]">
            Your #1 route
          </div>
        </div>
      )}

      <div className="p-6 sm:p-7">

        <div className="flex items-start gap-4">

          <div className="min-w-0">

            <div className="text-[10px] mono uppercase tracking-widest text-coral">
              #{index + 1}
              {' · '}
              {item.match_type === 'best_match'
                ? 'Best match'
                : 'Possible match'}
            </div>

            <h3
              className={`
                serif leading-tight mt-2 text-ink
                ${
                  featured
                    ? 'text-4xl'
                    : 'text-3xl'
                }
              `}
            >
              {item.university_name}
            </h3>

            <div className="flex items-center gap-1.5 text-[12px] text-ink/55 mt-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />

              <span>
                {item.city
                  ? `${item.city}, `
                  : ''}
                {item.country}
              </span>
            </div>

          </div>

          <div className="ml-auto">
            <MatchBadge
              score={item.score}
              type={item.match_type}
            />
          </div>

        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">

          <StatBox
            label="Course"
            value={item.course_name || '—'}
          />

          <StatBox
            label="Tuition / year"
            value={money(
              item.tuition_fee_year,
              item.currency
            )}
          />

          <StatBox
            label="Estimated total"
            value={money(
              totalCost,
              item.currency
            )}
          />

          <StatBox
            label="Duration"
            value={item.duration || 'Needs verification'}
          />

        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">

          <StatBox
            label="Medium"
            value={item.medium || 'Needs verification'}
          />

          <StatBox
            label="Recorded intake"
            value={item.intake || 'Needs verification'}
          />

        </div>

        {item.reasons?.length > 0 && (
          <div className="mt-7">

            <div className="flex items-center gap-2 text-[10px] mono uppercase tracking-widest text-ink/40 mb-3">
              <BadgeCheck className="h-4 w-4 text-forest" />
              Why this matches you
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">

              {item.reasons.map(reason => (
                <div
                  key={reason}
                  className="flex items-start gap-2 text-[12px] text-ink/70"
                >
                  <div className="h-5 w-5 rounded-full bg-forest text-cream grid place-items-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>

                  <span className="leading-relaxed">
                    {reason}
                  </span>
                </div>
              ))}

            </div>

          </div>
        )}

        {item.cautions?.length > 0 && (
          <div className="mt-6 rounded-2xl bg-cream border border-ink/8 p-4">

            <div className="flex items-center gap-2 text-[10px] mono uppercase tracking-widest text-ink/40 mb-2">
              <CircleAlert className="h-4 w-4 text-coral" />
              Things to verify
            </div>

            <div className="space-y-1.5">
              {item.cautions
                .slice(0, 4)
                .map(caution => (
                  <div
                    key={caution}
                    className="text-[11px] text-ink/55 leading-relaxed"
                  >
                    • {caution}
                  </div>
                ))}
            </div>

          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">

          {detailPath && (
            <Link
              to={detailPath}
              className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white text-ink px-4 py-2.5 text-[12px] font-semibold hover:bg-ink hover:text-cream transition"
            >
              View destination
            </Link>
          )}

          <button
            type="button"
            onClick={onToggleCompare}
            className={`
              inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-semibold transition
              ${
                selected
                  ? 'bg-coral text-white'
                  : 'border border-ink/15 bg-white text-ink hover:border-coral'
              }
            `}
          >
            <Scale className="h-4 w-4" />

            {selected
              ? 'Added to compare'
              : 'Compare'}
          </button>

          <button
            type="button"
            onClick={onStartApplication}
            className="inline-flex items-center justify-center rounded-full bg-ink text-cream px-4 py-2.5 text-[12px] font-semibold hover:bg-forest transition"
          >
            Start application
          </button>

        </div>

      </div>
    </article>
  );
}

export default function BuildMyRoute() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [step, setStep] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [result, setResult] =
    useState(null);

  const [sortMode, setSortMode] =
    useState('best');

  const [compareIds, setCompareIds] =
    useState([]);

  const [compareOpen, setCompareOpen] =
    useState(false);

  const [applicationOpen, setApplicationOpen] =
    useState(false);

  const [applicationItem, setApplicationItem] =
    useState(null);

  const [applicationForm, setApplicationForm] =
    useState({
      name: '',
      phone: '',
      email: '',
      state: '',
      preferred_contact: 'WhatsApp'
    });

  const [applicationError, setApplicationError] =
    useState('');

  const [applicationSuccess, setApplicationSuccess] =
    useState('');

  const [submittingApplication, setSubmittingApplication] =
    useState(false);

  const countries = useMemo(() => {
    if (form.stream === 'MBBS') {
      return MBBS_COUNTRIES;
    }

    return MANAGEMENT_COUNTRIES;
  }, [form.stream]);

  const update = (
    key,
    value
  ) => {
    setForm(old => ({
      ...old,
      [key]: value
    }));
  };

  const toggleCountry = country => {
    setForm(old => {
      const exists =
        old.preferred_countries
          .includes(country);

      return {
        ...old,
        preferred_countries:
          exists
            ? old.preferred_countries
                .filter(
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
      return Boolean(
        form.stream
      );
    }

    if (
      step === 2 &&
      form.stream === 'MBBS'
    ) {
      return (
        form.pcb_percentage !== '' &&
        Boolean(
          form.neet_status
        )
      );
    }

    if (
      step === 2 &&
      form.stream === 'Management'
    ) {
      return (
        Boolean(
          form.desired_level
        ) &&
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
            ? Number(
                form.budget_total
              )
            : null,

        budget_currency:
          form.budget_currency,

        // Intake intentionally does not control matching.
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
            ? Number(
                form.neet_score
              )
            : null,

        pcb_percentage:
          form.stream === 'MBBS' &&
          form.pcb_percentage !== ''
            ? Number(
                form.pcb_percentage
              )
            : null,

        desired_level:
          form.stream === 'Management'
            ? form.desired_level || null
            : null,

        academic_percentage:
          form.stream === 'Management' &&
          form.academic_percentage !== ''
            ? Number(
                form.academic_percentage
              )
            : null,

        english_test:
          null,

        ielts_score:
          form.stream === 'Management' &&
          form.ielts_score !== ''
            ? Number(
                form.ielts_score
              )
            : null,

        work_experience_years:
          form.stream === 'Management' &&
          form.work_experience_years !== ''
            ? Number(
                form.work_experience_years
              )
            : null
      };

      const response =
        await fetch(
          `${BACKEND_URL}/api/build-my-route`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify(
                payload
              )
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      }
      catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          typeof data?.detail ===
          'string'
            ? data.detail
            : `Build My Route API returned ${response.status}.`;

        throw new Error(
          message
        );
      }

      setResult(data);
      setSortMode('best');
      setCompareIds([]);
      setCompareOpen(false);
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
    setForm(
      INITIAL_FORM
    );

    setResult(null);
    setError('');
    setSortMode('best');
    setCompareIds([]);
    setCompareOpen(false);
    setApplicationOpen(false);
    setApplicationItem(null);
    setApplicationError('');
    setApplicationSuccess('');
    setStep(1);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const renderedResults =
    useMemo(() => {

      const rows =
        Array.isArray(
          result?.results
        )
          ? [...result.results]
          : [];

      if (
        sortMode ===
        'lowest'
      ) {
        rows.sort(
          (a, b) => {

            const aCost =
              a.estimated_total_cost ??
              a.total_course_cost ??
              Number.POSITIVE_INFINITY;

            const bCost =
              b.estimated_total_cost ??
              b.total_course_cost ??
              Number.POSITIVE_INFINITY;

            if (
              aCost !==
              bCost
            ) {
              return (
                aCost -
                bCost
              );
            }

            return (
              (b.score || 0) -
              (a.score || 0)
            );
          }
        );
      }

      if (
        sortMode ===
        'recommended'
      ) {
        rows.sort(
          (a, b) => {

            if (
              Boolean(
                b.recommended
              )
              !==
              Boolean(
                a.recommended
              )
            ) {
              return (
                Number(
                  Boolean(
                    b.recommended
                  )
                )
                -
                Number(
                  Boolean(
                    a.recommended
                  )
                )
              );
            }

            return (
              (b.score || 0) -
              (a.score || 0)
            );
          }
        );
      }

      if (
        sortMode ===
        'best'
      ) {
        rows.sort(
          (a, b) =>
            (b.score || 0) -
            (a.score || 0)
        );
      }

      return rows;

    }, [
      result,
      sortMode
    ]);

  const compareItems =
    useMemo(() => {

      return renderedResults.filter(
        item =>
          compareIds.includes(
            item.course_id
          )
      );

    }, [
      renderedResults,
      compareIds
    ]);

  const toggleCompare =
    item => {

      setCompareIds(old => {

        const exists =
          old.includes(
            item.course_id
          );

        if (exists) {
          return old.filter(
            id =>
              id !==
              item.course_id
          );
        }

        if (
          old.length >= 3
        ) {
          return old;
        }

        return [
          ...old,
          item.course_id
        ];
      });
    };


  const openApplication = item => {
    setApplicationItem(item);
    setApplicationError('');
    setApplicationSuccess('');
    setApplicationOpen(true);
  };

  const closeApplication = () => {
    if (submittingApplication) return;

    setApplicationOpen(false);
    setApplicationItem(null);
    setApplicationError('');
    setApplicationSuccess('');
  };

  const submitApplication = async e => {
    e.preventDefault();

    if (!applicationItem) return;

    setApplicationError('');
    setApplicationSuccess('');

    const name =
      applicationForm.name.trim();

    const phone =
      applicationForm.phone.trim();

    if (!name) {
      setApplicationError('Please enter your full name.');
      return;
    }

    if (!phone) {
      setApplicationError('Please enter your WhatsApp / mobile number.');
      return;
    }

    setSubmittingApplication(true);

    try {
      const shortlistedRoutes =
        compareItems
          .filter(
            item =>
              item.course_id !==
              applicationItem.course_id
          )
          .slice(0, 3)
          .map(item => ({
            course_id:
              item.course_id,

            course_name:
              item.course_name,

            university_id:
              item.university_id,

            university_name:
              item.university_name,

            country:
              item.country,

            city:
              item.city,

            score:
              item.score,

            match_type:
              item.match_type
          }));

      const payload = {
        name,
        phone,

        email:
          applicationForm.email.trim() ||
          null,

        state:
          applicationForm.state.trim() ||
          null,

        preferred_contact:
          applicationForm.preferred_contact,

        stream:
          form.stream,

        preferred_countries:
          form.preferred_countries,

        budget_total:
          form.budget_total
            ? Number(
                form.budget_total
              )
            : null,

        budget_currency:
          form.budget_currency,

        intake:
          null,

        neet_status:
          form.stream === 'MBBS'
            ? form.neet_status || null
            : null,

        neet_score:
          form.stream === 'MBBS' &&
          form.neet_score !== ''
            ? Number(
                form.neet_score
              )
            : null,

        pcb_percentage:
          form.stream === 'MBBS' &&
          form.pcb_percentage !== ''
            ? Number(
                form.pcb_percentage
              )
            : null,

        desired_level:
          form.stream === 'Management'
            ? form.desired_level || null
            : null,

        academic_percentage:
          form.stream === 'Management' &&
          form.academic_percentage !== ''
            ? Number(
                form.academic_percentage
              )
            : null,

        english_test:
          null,

        ielts_score:
          form.stream === 'Management' &&
          form.ielts_score !== ''
            ? Number(
                form.ielts_score
              )
            : null,

        work_experience_years:
          form.stream === 'Management' &&
          form.work_experience_years !== ''
            ? Number(
                form.work_experience_years
              )
            : null,

        selected_course_id:
          applicationItem.course_id,

        selected_course_name:
          applicationItem.course_name,

        selected_course_slug:
          applicationItem.course_slug ||
          null,

        selected_university_id:
          applicationItem.university_id,

        selected_university_name:
          applicationItem.university_name,

        selected_country:
          applicationItem.country,

        selected_city:
          applicationItem.city ||
          null,

        route_score:
          applicationItem.score ??
          null,

        match_type:
          applicationItem.match_type ||
          null,

        shortlisted_routes:
          shortlistedRoutes
      };

      const response =
        await fetch(
          `${BACKEND_URL}/api/build-my-route/lead`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify(
                payload
              )
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      }
      catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          typeof data?.detail ===
          'string'
            ? data.detail
            : `Application request failed (${response.status}).`
        );
      }

      setApplicationSuccess(
        data?.message ||
        'Your application interest has been saved. Our admissions team can now follow up.'
      );

      setApplicationForm({
        name: '',
        phone: '',
        email: '',
        state: '',
        preferred_contact: 'WhatsApp'
      });
    }
    catch (err) {
      setApplicationError(
        err.message ||
        'Could not save your application request.'
      );
    }
    finally {
      setSubmittingApplication(false);
    }
  };

  const topResult =
    renderedResults[0];

  const remainingResults =
    renderedResults.slice(1);

  return (
    <div className="min-h-screen bg-cream text-ink">

      <Navbar />

      {/* HERO */}
      {step < 5 && (
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
      )}

      <main
        className={`
          max-w-6xl mx-auto px-4 sm:px-6
          ${
            step === 5
              ? 'py-10 sm:py-12'
              : 'py-10 sm:py-14'
          }
        `}
      >

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
                  form.stream ===
                  'MBBS'
                }
                onClick={() =>
                  chooseStream(
                    'MBBS'
                  )
                }
              />

              <ChoiceCard
                title="Management Abroad"
                description="Bachelor's and Master's programme matching."
                active={
                  form.stream ===
                  'Management'
                }
                onClick={() =>
                  chooseStream(
                    'Management'
                  )
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
                  min="0"
                  max="100"
                  value={
                    form.pcb_percentage
                  }
                  onChange={
                    e =>
                      update(
                        'pcb_percentage',
                        e.target.value
                      )
                  }
                  placeholder="Example: 65"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
                />

              </label>

              <label>

                <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                  NEET score
                </div>

                <input
                  type="number"
                  value={
                    form.neet_score
                  }
                  onChange={
                    e =>
                      update(
                        'neet_score',
                        e.target.value
                      )
                  }
                  placeholder="Example: 450"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
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
              ].map(
                level => (

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

                )
              )}

            </div>

            <div className="grid sm:grid-cols-3 gap-5 mt-7">

              <label>

                <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                  Academic %
                </div>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    form.academic_percentage
                  }
                  onChange={
                    e =>
                      update(
                        'academic_percentage',
                        e.target.value
                      )
                  }
                  placeholder="Example: 70"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
                />

              </label>

              <label>

                <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                  IELTS
                </div>

                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={
                    form.ielts_score
                  }
                  onChange={
                    e =>
                      update(
                        'ielts_score',
                        e.target.value
                      )
                  }
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
                />

              </label>

              <label>

                <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                  Work experience
                </div>

                <input
                  type="number"
                  min="0"
                  value={
                    form.work_experience_years
                  }
                  onChange={
                    e =>
                      update(
                        'work_experience_years',
                        e.target.value
                      )
                  }
                  placeholder="Years"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
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
                value={
                  form.budget_currency
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

                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>AUD</option>

              </select>

              <input
                type="number"
                min="0"
                value={
                  form.budget_total
                }
                onChange={
                  e =>
                    update(
                      'budget_total',
                      e.target.value
                    )
                }
                placeholder="Total study budget — optional"
                className="rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
              />

            </div>

            <div className="mt-8">

              <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-3">
                Preferred countries
              </div>

              <p className="text-[12px] text-ink/50 mb-4">
                Optional. Leave everything unselected if you want RYC to search all currently available options.
              </p>

              <div className="flex flex-wrap gap-2">

                {countries.map(
                  country => {

                    const active =
                      form
                        .preferred_countries
                        .includes(
                          country
                        );

                    return (
                      <button
                        type="button"
                        key={country}
                        onClick={() =>
                          toggleCountry(
                            country
                          )
                        }
                        className={`
                          rounded-full px-4 py-2.5
                          text-[12px] font-semibold
                          border transition
                          ${
                            active
                              ? 'bg-ink text-cream border-ink'
                              : 'bg-white border-ink/15 text-ink hover:border-ink/30'
                          }
                        `}
                      >
                        {country}
                      </button>
                    );
                  }
                )}

              </div>

            </div>

          </div>

        )}

        {/* STEP 4 - REVIEW */}
        {step === 4 && (

          <div className="max-w-3xl mx-auto">

            <div className="text-[10px] mono uppercase tracking-widest text-coral">
              Review
            </div>

            <h2 className="serif text-4xl sm:text-5xl mt-2">
              Ready to build your route?
            </h2>

            <p className="mt-3 text-[13px] text-ink/55">
              RYC will compare your profile against published course records. Missing information is shown as needing verification rather than being guessed.
            </p>

            <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-6">

              <div className="grid sm:grid-cols-2 gap-5">

                <div>
                  <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                    Study track
                  </div>

                  <div className="mt-1 font-semibold">
                    {form.stream}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                    Budget
                  </div>

                  <div className="mt-1 font-semibold">
                    {form.budget_total
                      ? money(
                          form.budget_total,
                          form.budget_currency
                        )
                      : 'Flexible'}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                    Countries
                  </div>

                  <div className="mt-1 font-semibold">
                    {form
                      .preferred_countries
                      .length
                      ? form
                          .preferred_countries
                          .join(', ')
                      : 'No preference'}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                    Eligibility profile
                  </div>

                  <div className="mt-1 font-semibold">
                    {form.stream === 'MBBS'
                      ? `PCB ${form.pcb_percentage}% · NEET ${form.neet_status.replaceAll('_', ' ')}`
                      : `${form.desired_level} · ${form.academic_percentage}% academics`}
                  </div>
                </div>

              </div>

            </div>

            <div className="mt-5 rounded-3xl bg-white border border-ink/10 p-5">

              <div className="flex gap-3">

                <CircleAlert className="h-5 w-5 text-coral shrink-0" />

                <div>
                  <div className="font-semibold text-[13px]">
                    Intake is informational only.
                  </div>

                  <div className="text-[12px] text-ink/55 leading-relaxed mt-1">
                    RYC will show the recorded intake on results, but intake wording will not remove an otherwise suitable course from your route.
                  </div>
                </div>

              </div>

            </div>

          </div>

        )}

        {/* RESULTS */}
        {step === 5 && result && (

          <div>

            <section className="rounded-[32px] bg-ink text-cream p-6 sm:p-9">

              <div className="flex flex-wrap items-end justify-between gap-6">

                <div>

                  <div className="inline-flex items-center gap-2 text-[10px] mono uppercase tracking-[0.2em] text-coral">
                    <RouteIcon className="h-3.5 w-3.5" />
                    Your Route
                  </div>

                  <h1 className="serif text-4xl sm:text-6xl mt-3 leading-[0.95]">
                    We found
                    {' '}
                    {result.matches_found}
                    {' '}
                    routes for you.
                  </h1>

                  <p className="mt-4 max-w-2xl text-[13px] sm:text-[14px] leading-relaxed text-cream/65">
                    Ranked from the published course information currently stored by Route Your Career. Compare the options, review what still needs verification, and choose what to explore next.
                  </p>

                </div>

                <button
                  onClick={restart}
                  className="rounded-full border border-cream/20 px-5 py-3 text-[12px] font-semibold hover:bg-cream hover:text-ink transition"
                >
                  Build another route
                </button>

              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <BookOpen className="h-4 w-4 text-coral" />

                  <div className="serif text-2xl mt-3">
                    {result.matches_found}
                  </div>

                  <div className="text-[9px] mono uppercase tracking-widest text-cream/45 mt-1">
                    Suitable routes
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <BadgeCheck className="h-4 w-4 text-coral" />

                  <div className="serif text-2xl mt-3">
                    {result.results?.filter(
                      x =>
                        x.match_type ===
                        'best_match'
                    ).length || 0}
                  </div>

                  <div className="text-[9px] mono uppercase tracking-widest text-cream/45 mt-1">
                    Best matches shown
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <WalletCards className="h-4 w-4 text-coral" />

                  <div className="serif text-2xl mt-3">
                    {form.budget_total
                      ? money(
                          form.budget_total,
                          form.budget_currency
                        )
                      : 'Flexible'}
                  </div>

                  <div className="text-[9px] mono uppercase tracking-widest text-cream/45 mt-1">
                    Your budget
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <CalendarDays className="h-4 w-4 text-coral" />

                  <div className="serif text-2xl mt-3">
                    {form
                      .preferred_countries
                      .length || 'Any'}
                  </div>

                  <div className="text-[9px] mono uppercase tracking-widest text-cream/45 mt-1">
                    Country preferences
                  </div>
                </div>

              </div>

            </section>

            {/* RESULT SORTING */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">

              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Explore your matches
                </div>

                <h2 className="serif text-3xl sm:text-4xl mt-1">
                  Choose how to view them.
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">

                {[
                  [
                    'best',
                    'Best Match'
                  ],
                  [
                    'lowest',
                    'Lowest Cost'
                  ],
                  [
                    'recommended',
                    'RYC Recommended'
                  ]
                ].map(
                  ([value, label]) => (

                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setSortMode(
                          value
                        )
                      }
                      className={`
                        rounded-full px-4 py-2.5 text-[11px] font-semibold border transition
                        ${
                          sortMode ===
                          value
                            ? 'bg-ink text-cream border-ink'
                            : 'bg-white text-ink border-ink/15 hover:border-ink/30'
                        }
                      `}
                    >
                      {label}
                    </button>

                  )
                )}

              </div>

            </div>

            {/* TOP RESULT */}
            {topResult && (
              <div className="mt-8">

                <ResultCard
                  item={topResult}
                  index={0}
                  featured
                  selected={
                    compareIds.includes(
                      topResult.course_id
                    )
                  }
                  onToggleCompare={() =>
                    toggleCompare(
                      topResult
                    )
                  }
                  onStartApplication={() =>
                    openApplication(
                      topResult
                    )
                  }
                />

              </div>
            )}

            {/* OTHER RESULTS */}
            <div className="mt-6 grid lg:grid-cols-2 gap-5">

              {remainingResults.map(
                (item, index) => (

                  <ResultCard
                    key={
                      item.course_id
                    }
                    item={item}
                    index={
                      index + 1
                    }
                    selected={
                      compareIds.includes(
                        item.course_id
                      )
                    }
                    onToggleCompare={() =>
                      toggleCompare(
                        item
                      )
                    }
                    onStartApplication={() =>
                      openApplication(
                        item
                      )
                    }
                  />

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

            {result.note && (
              <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-4 text-[11px] leading-relaxed text-ink/50">
                {result.note}
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

        {/* STEP NAVIGATION */}
        {step > 1 &&
         step < 5 && (

          <div className="max-w-3xl mx-auto mt-10 pt-6 border-t border-ink/10 flex items-center justify-between gap-3">

            <button
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

            {step < 4 ? (

              <button
                disabled={
                  !canContinue()
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
                onClick={
                  submitRoute
                }
                disabled={
                  loading
                }
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

      {/* COMPARE TRAY */}
      {step === 5 &&
       compareIds.length > 0 && (

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">

          <div className="rounded-2xl bg-ink text-cream shadow-xl border border-white/10 px-4 sm:px-5 py-3 flex items-center gap-3">

            <Scale className="h-5 w-5 text-coral shrink-0" />

            <div className="min-w-0">

              <div className="text-[12px] font-semibold">
                {compareIds.length}
                {' '}
                selected for comparison
              </div>

              <div className="text-[10px] text-cream/50">
                Choose up to 3 routes.
              </div>

            </div>

            <div className="ml-auto flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  setCompareIds([])
                }
                className="hidden sm:inline text-[11px] text-cream/60 hover:text-cream"
              >
                Clear
              </button>

              <button
                type="button"
                disabled={
                  compareIds.length < 2
                }
                onClick={() =>
                  setCompareOpen(true)
                }
                className="rounded-full bg-coral text-white px-4 py-2.5 text-[11px] font-bold disabled:opacity-40"
              >
                Compare routes
              </button>

            </div>

          </div>

        </div>

      )}

      {/* COMPARE MODAL */}
      {compareOpen && (
        <div className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">

          <div className="max-w-6xl mx-auto rounded-3xl bg-cream min-h-[70vh] overflow-hidden">

            <div className="sticky top-0 z-10 bg-ink text-cream px-5 sm:px-7 py-5 flex items-center gap-4">

              <Scale className="h-5 w-5 text-coral" />

              <div>
                <div className="serif text-2xl">
                  Compare your routes
                </div>

                <div className="text-[10px] text-cream/50 mt-1">
                  Side-by-side using the information currently stored in RYC.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCompareOpen(false)
                }
                className="ml-auto h-10 w-10 rounded-full border border-cream/20 grid place-items-center hover:bg-cream hover:text-ink transition"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <div className="p-5 sm:p-7 overflow-x-auto">

              <div
                className="grid gap-4 min-w-[760px]"
                style={{
                  gridTemplateColumns:
                    `180px repeat(${compareItems.length}, minmax(220px, 1fr))`
                }}
              >

                <div />

                {compareItems.map(
                  item => (
                    <div
                      key={
                        item.course_id
                      }
                      className="rounded-2xl bg-white border border-ink/10 p-4"
                    >

                      <div className="text-[9px] mono uppercase tracking-widest text-coral">
                        {item.score}% match
                      </div>

                      <div className="serif text-2xl mt-1 leading-tight">
                        {item.university_name}
                      </div>

                      <div className="text-[11px] text-ink/50 mt-2">
                        {item.city
                          ? `${item.city}, `
                          : ''}
                        {item.country}
                      </div>

                    </div>
                  )
                )}

                {[
                  [
                    'Course',
                    item =>
                      item.course_name ||
                      '—'
                  ],
                  [
                    'Tuition / year',
                    item =>
                      money(
                        item.tuition_fee_year,
                        item.currency
                      )
                  ],
                  [
                    'Estimated total',
                    item =>
                      money(
                        item.estimated_total_cost ??
                        item.total_course_cost,
                        item.currency
                      )
                  ],
                  [
                    'Duration',
                    item =>
                      item.duration ||
                      'Needs verification'
                  ],
                  [
                    'Medium',
                    item =>
                      item.medium ||
                      'Needs verification'
                  ],
                  [
                    'Recorded intake',
                    item =>
                      item.intake ||
                      'Needs verification'
                  ],
                  [
                    'Match type',
                    item =>
                      item.match_type ===
                      'best_match'
                        ? 'Best match'
                        : 'Possible match'
                  ]
                ].map(
                  ([label, getter]) => (
                    <React.Fragment key={label}>

                      <div className="rounded-2xl bg-ink/5 p-4 text-[10px] mono uppercase tracking-widest text-ink/45">
                        {label}
                      </div>

                      {compareItems.map(
                        item => (
                          <div
                            key={`${label}-${item.course_id}`}
                            className="rounded-2xl bg-white border border-ink/10 p-4 text-[12px] font-semibold"
                          >
                            {getter(item)}
                          </div>
                        )
                      )}

                    </React.Fragment>
                  )
                )}

              </div>

              <div className="mt-6 rounded-2xl bg-white border border-ink/10 p-4 text-[11px] leading-relaxed text-ink/50">
                Comparison is based on current RYC database records. Any field marked as needing verification should be confirmed before application or payment.
              </div>

            </div>

          </div>

        </div>
      )}


      {/* APPLICATION MODAL */}
      {applicationOpen &&
       applicationItem && (

        <div className="fixed inset-0 z-[80] bg-ink/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">

          <div className="max-w-2xl mx-auto rounded-3xl bg-cream overflow-hidden shadow-2xl">

            <div className="bg-ink text-cream px-5 sm:px-7 py-5 flex items-start gap-4">

              <div>

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Start Application
                </div>

                <div className="serif text-2xl sm:text-3xl mt-1">
                  {applicationItem.university_name}
                </div>

                <div className="text-[11px] text-cream/55 mt-1">
                  {applicationItem.course_name}
                  {' · '}
                  {applicationItem.country}
                  {' · '}
                  {applicationItem.score}% route match
                </div>

              </div>

              <button
                type="button"
                onClick={closeApplication}
                className="ml-auto h-10 w-10 rounded-full border border-cream/20 grid place-items-center hover:bg-cream hover:text-ink transition"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {applicationSuccess ? (

              <div className="p-6 sm:p-8">

                <div className="h-12 w-12 rounded-full bg-green-100 text-green-700 grid place-items-center">
                  <Check className="h-5 w-5" />
                </div>

                <h3 className="serif text-3xl mt-5">
                  Application interest saved.
                </h3>

                <p className="mt-3 text-[13px] leading-relaxed text-ink/60">
                  {applicationSuccess}
                </p>

                <div className="mt-6 rounded-2xl bg-white border border-ink/10 p-4">

                  <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                    Selected route
                  </div>

                  <div className="font-semibold mt-1">
                    {applicationItem.university_name}
                  </div>

                  <div className="text-[12px] text-ink/55 mt-1">
                    {applicationItem.course_name}
                    {' · '}
                    {applicationItem.country}
                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeApplication}
                  className="mt-6 w-full rounded-full bg-ink text-cream px-5 py-3 text-[12px] font-bold"
                >
                  Done
                </button>

              </div>

            ) : (

              <form
                onSubmit={submitApplication}
                className="p-6 sm:p-8"
              >

                <p className="text-[13px] leading-relaxed text-ink/60">
                  Your Build My Route profile is already attached. Just tell us how to reach you — you do not need to enter your academic details again.
                </p>

                <div className="mt-6 grid sm:grid-cols-2 gap-4">

                  <label className="block">

                    <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                      Full name *
                    </div>

                    <input
                      value={applicationForm.name}
                      onChange={e =>
                        setApplicationForm(
                          old => ({
                            ...old,
                            name:
                              e.target.value
                          })
                        )
                      }
                      autoComplete="name"
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
                      placeholder="Your full name"
                    />

                  </label>

                  <label className="block">

                    <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                      WhatsApp / mobile *
                    </div>

                    <input
                      type="tel"
                      value={applicationForm.phone}
                      onChange={e =>
                        setApplicationForm(
                          old => ({
                            ...old,
                            phone:
                              e.target.value
                          })
                        )
                      }
                      autoComplete="tel"
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
                      placeholder="+91..."
                    />

                  </label>

                  <label className="block">

                    <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                      Email
                    </div>

                    <input
                      type="email"
                      value={applicationForm.email}
                      onChange={e =>
                        setApplicationForm(
                          old => ({
                            ...old,
                            email:
                              e.target.value
                          })
                        )
                      }
                      autoComplete="email"
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
                      placeholder="Optional"
                    />

                  </label>

                  <label className="block">

                    <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                      State
                    </div>

                    <input
                      value={applicationForm.state}
                      onChange={e =>
                        setApplicationForm(
                          old => ({
                            ...old,
                            state:
                              e.target.value
                          })
                        )
                      }
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 outline-none focus:border-coral"
                      placeholder="Example: Kerala"
                    />

                  </label>

                </div>

                <div className="mt-5">

                  <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-3">
                    Preferred contact
                  </div>

                  <div className="grid grid-cols-3 gap-2">

                    {[
                      'WhatsApp',
                      'Call',
                      'Email'
                    ].map(
                      method => (

                        <button
                          key={method}
                          type="button"
                          onClick={() =>
                            setApplicationForm(
                              old => ({
                                ...old,
                                preferred_contact:
                                  method
                              })
                            )
                          }
                          className={`
                            rounded-2xl border px-3 py-3 text-[11px] font-semibold transition
                            ${
                              applicationForm.preferred_contact ===
                              method
                                ? 'bg-ink text-cream border-ink'
                                : 'bg-white text-ink border-ink/15'
                            }
                          `}
                        >
                          {method}
                        </button>

                      )
                    )}

                  </div>

                </div>

                <div className="mt-5 rounded-2xl bg-white border border-ink/10 p-4">

                  <div className="text-[9px] mono uppercase tracking-widest text-coral">
                    Attached automatically
                  </div>

                  <div className="mt-2 grid sm:grid-cols-2 gap-2 text-[11px] text-ink/60">

                    <div>
                      Track:
                      {' '}
                      <strong className="text-ink">
                        {form.stream}
                      </strong>
                    </div>

                    <div>
                      Budget:
                      {' '}
                      <strong className="text-ink">
                        {form.budget_total
                          ? money(
                              form.budget_total,
                              form.budget_currency
                            )
                          : 'Flexible'}
                      </strong>
                    </div>

                    {form.stream === 'MBBS' && (
                      <>
                        <div>
                          PCB:
                          {' '}
                          <strong className="text-ink">
                            {form.pcb_percentage}%
                          </strong>
                        </div>

                        <div>
                          NEET:
                          {' '}
                          <strong className="text-ink">
                            {form.neet_status.replaceAll(
                              '_',
                              ' '
                            )}
                            {form.neet_score
                              ? ` · ${form.neet_score}`
                              : ''}
                          </strong>
                        </div>
                      </>
                    )}

                    {compareItems.length > 0 && (
                      <div className="sm:col-span-2">
                        Compared shortlist:
                        {' '}
                        <strong className="text-ink">
                          {compareItems.length}
                          {' '}
                          route
                          {compareItems.length === 1 ? '' : 's'}
                        </strong>
                      </div>
                    )}

                  </div>

                </div>

                {applicationError && (
                  <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 p-4 text-[12px]">
                    {applicationError}
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">

                  <button
                    type="button"
                    onClick={closeApplication}
                    className="rounded-full border border-ink/15 bg-white px-5 py-3 text-[12px] font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingApplication}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-coral text-white px-6 py-3 text-[12px] font-bold disabled:opacity-50"
                  >

                    {submittingApplication ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Submit application interest
                      </>
                    )}

                  </button>

                </div>

                <p className="mt-4 text-center text-[10px] leading-relaxed text-ink/40">
                  Submitting this form sends your selected route and contact details to Route Your Career for admissions follow-up. It does not itself constitute a university application or guarantee admission.
                </p>

              </form>

            )}

          </div>

        </div>

      )}

      <Footer />

    </div>
  );
}
