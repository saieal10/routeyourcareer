import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Copy,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Route as RouteIcon,
  Sparkles,
  User
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

const INITIAL_FORM = {
  name: '',
  phone: '',
  email: '',
  state: '',
  preferred_contact: 'WhatsApp',
  stream: '',
  preferred_country: ''
};

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
        w-full text-left rounded-2xl border p-5 transition
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

export default function StartApplication() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [createdApplicationId, setCreatedApplicationId] =
    useState('');

  const [copied, setCopied] =
    useState(false);

  const countries = useMemo(() => {
    if (form.stream === 'MBBS') {
      return MBBS_COUNTRIES;
    }

    if (form.stream === 'Management') {
      return MANAGEMENT_COUNTRIES;
    }

    return [];
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

  const chooseStream = stream => {
    setForm(old => ({
      ...old,
      stream,
      preferred_country: ''
    }));
  };

  const submit = async e => {
    e.preventDefault();

    setError('');

    const name =
      form.name.trim();

    const phone =
      form.phone.trim();

    if (!name) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone) {
      setError('Please enter your WhatsApp / mobile number.');
      return;
    }

    if (!form.stream) {
      setError('Please choose MBBS or Management.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        phone,

        email:
          form.email.trim() ||
          null,

        state:
          form.state.trim() ||
          null,

        preferred_contact:
          form.preferred_contact,

        stream:
          form.stream,

        preferred_country:
          form.preferred_country ||
          null
      };

      const response =
        await fetch(
          `${BACKEND_URL}/api/applications/start`,
          {
            method: 'POST',

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
            : `Could not start application (${response.status}).`
        );
      }

      if (!data?.application_id) {
        throw new Error(
          'Application was created but no application ID was returned.'
        );
      }

      /*
      =====================================================
      SAVE APPLICATION SESSION

      BuildMyRoute.jsx will read these values.
      =====================================================
      */

      localStorage.setItem(
        'ryc_application_id',
        data.application_id
      );

      localStorage.setItem(
        'ryc_application_contact',
        JSON.stringify({
          name,
          phone,
          email:
            form.email.trim() ||
            '',
          state:
            form.state.trim() ||
            '',
          preferred_contact:
            form.preferred_contact,
          stream:
            form.stream,
          preferred_country:
            form.preferred_country ||
            ''
        })
      );

      setCreatedApplicationId(
        data.application_id
      );

      setCopied(false);
    }
    catch (err) {
      setError(
        err.message ||
        'Could not start your application right now.'
      );
    }
    finally {
      setLoading(false);
    }
  };

  const copyApplicationId = async () => {
    if (!createdApplicationId) return;

    try {
      await navigator.clipboard.writeText(
        createdApplicationId
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1800
      );
    }
    catch {
      setCopied(false);
    }
  };

  const continueToRoute = () => {
    if (!createdApplicationId) return;

    navigate(
      `/build-my-route?application_id=${encodeURIComponent(
        createdApplicationId
      )}`
    );
  };

  return (
    <div className="min-h-screen bg-cream text-ink">

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-start">

          {/* LEFT */}
          <section className="lg:sticky lg:top-28">

            <div className="inline-flex items-center gap-2 text-[10px] mono uppercase tracking-[0.2em] text-coral">
              <RouteIcon className="h-3.5 w-3.5" />
              Start your RYC journey
            </div>

            <h1 className="serif text-5xl sm:text-6xl lg:text-7xl leading-[0.92] mt-5">
              Start once.
              <br />
              <em className="font-light">
                Build your route next.
              </em>
            </h1>

            <p className="mt-6 text-[15px] leading-relaxed text-ink/60 max-w-xl">
              Give us your basic contact details first. We will create your RYC application reference, then take you directly into Build My Route to find and compare suitable university options.
            </p>

            <div className="mt-8 space-y-4">

              {[
                [
                  '1',
                  'Create your application',
                  'We save your name and contact details first.'
                ],
                [
                  '2',
                  'Build your route',
                  'Tell us your academics, budget and destination preferences.'
                ],
                [
                  '3',
                  'Choose your university',
                  'Your selected route is attached to the same application.'
                ]
              ].map(
                ([number, title, body]) => (

                  <div
                    key={number}
                    className="flex gap-4"
                  >
                    <div className="h-9 w-9 rounded-full bg-ink text-cream grid place-items-center text-[11px] font-bold shrink-0">
                      {number}
                    </div>

                    <div>
                      <div className="font-semibold text-[13px]">
                        {title}
                      </div>

                      <div className="text-[12px] text-ink/50 mt-1 leading-relaxed">
                        {body}
                      </div>
                    </div>
                  </div>

                )
              )}

            </div>

            <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-4">

              <div className="flex gap-3">

                <Sparkles className="h-5 w-5 text-coral shrink-0" />

                <div>

                  <div className="font-semibold text-[12px]">
                    No repeated form filling.
                  </div>

                  <div className="text-[11px] text-ink/50 leading-relaxed mt-1">
                    Once your application starts, Build My Route can continue the same student journey instead of creating another lead.
                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* FORM */}
          <section className="rounded-[30px] bg-white border border-ink/10 overflow-hidden">

            <div className="bg-ink text-cream px-6 sm:px-8 py-6">

              <div className="text-[10px] mono uppercase tracking-widest text-coral">
                Pre-application
              </div>

              <h2 className="serif text-3xl sm:text-4xl mt-2">
                Tell us how to reach you.
              </h2>

              <p className="mt-2 text-[12px] text-cream/55 leading-relaxed">
                This does not submit a university application. It starts your Route Your Career application journey.
              </p>

            </div>

            {createdApplicationId ? (

              <div className="p-6 sm:p-8">

                <div className="h-12 w-12 rounded-full bg-green-100 text-green-700 grid place-items-center">
                  <Check className="h-5 w-5" />
                </div>

                <div className="text-[10px] mono uppercase tracking-widest text-coral mt-5">
                  Application created
                </div>

                <h3 className="serif text-3xl sm:text-4xl mt-2">
                  Save your RYC Application ID.
                </h3>

                <p className="mt-3 text-[13px] leading-relaxed text-ink/60">
                  You will use this reference to track your application progress. We have also saved it on this device.
                </p>

                <div className="mt-6 rounded-3xl bg-ink text-cream p-5 sm:p-6">

                  <div className="text-[9px] mono uppercase tracking-[0.2em] text-coral">
                    Your Application ID
                  </div>

                  <div className="mt-2 serif text-2xl sm:text-3xl break-all">
                    {createdApplicationId}
                  </div>

                  <button
                    type="button"
                    onClick={copyApplicationId}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream text-ink px-4 py-2.5 text-[11px] font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Application ID
                      </>
                    )}
                  </button>

                </div>

                <div className="mt-5 rounded-2xl bg-white border border-ink/10 p-4">

                  <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                    What happens next
                  </div>

                  <div className="mt-3 space-y-3 text-[12px] text-ink/60">

                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-ink text-cream grid place-items-center text-[9px] font-bold shrink-0">
                        1
                      </div>
                      <div>
                        Complete Build My Route with your academic profile and budget.
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-ink text-cream grid place-items-center text-[9px] font-bold shrink-0">
                        2
                      </div>
                      <div>
                        Compare suitable universities and select your preferred route.
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-ink text-cream grid place-items-center text-[9px] font-bold shrink-0">
                        3
                      </div>
                      <div>
                        Track the same application later using this RYC ID.
                      </div>
                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={continueToRoute}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-coral text-white px-6 py-4 text-[13px] font-bold"
                >
                  Continue to Build My Route
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/track-application?application_id=${encodeURIComponent(
                        createdApplicationId
                      )}`
                    )
                  }
                  className="mt-3 w-full rounded-full border border-ink/15 bg-white px-6 py-3.5 text-[12px] font-semibold"
                >
                  Track this application
                </button>

              </div>

            ) : (

            <form
              onSubmit={submit}
              className="p-6 sm:p-8"
            >

              {/* CONTACT */}
              <div>

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  1 · Contact details
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">

                  <label className="block">

                    <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                      Full name *
                    </div>

                    <div className="relative">

                      <User className="absolute left-4 top-4 h-4 w-4 text-ink/30" />

                      <input
                        value={form.name}
                        onChange={
                          e =>
                            update(
                              'name',
                              e.target.value
                            )
                        }
                        autoComplete="name"
                        placeholder="Your full name"
                        className="w-full rounded-2xl border border-ink/15 bg-cream pl-11 pr-4 py-3.5 outline-none focus:border-coral"
                      />

                    </div>

                  </label>


                  <label className="block">

                    <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                      WhatsApp / mobile *
                    </div>

                    <div className="relative">

                      <Phone className="absolute left-4 top-4 h-4 w-4 text-ink/30" />

                      <input
                        type="tel"
                        value={form.phone}
                        onChange={
                          e =>
                            update(
                              'phone',
                              e.target.value
                            )
                        }
                        autoComplete="tel"
                        placeholder="+91..."
                        className="w-full rounded-2xl border border-ink/15 bg-cream pl-11 pr-4 py-3.5 outline-none focus:border-coral"
                      />

                    </div>

                  </label>


                  <label className="block">

                    <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                      Email
                    </div>

                    <div className="relative">

                      <Mail className="absolute left-4 top-4 h-4 w-4 text-ink/30" />

                      <input
                        type="email"
                        value={form.email}
                        onChange={
                          e =>
                            update(
                              'email',
                              e.target.value
                            )
                        }
                        autoComplete="email"
                        placeholder="Optional"
                        className="w-full rounded-2xl border border-ink/15 bg-cream pl-11 pr-4 py-3.5 outline-none focus:border-coral"
                      />

                    </div>

                  </label>


                  <label className="block">

                    <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                      State
                    </div>

                    <div className="relative">

                      <MapPin className="absolute left-4 top-4 h-4 w-4 text-ink/30" />

                      <input
                        value={form.state}
                        onChange={
                          e =>
                            update(
                              'state',
                              e.target.value
                            )
                        }
                        placeholder="Example: Kerala"
                        className="w-full rounded-2xl border border-ink/15 bg-cream pl-11 pr-4 py-3.5 outline-none focus:border-coral"
                      />

                    </div>

                  </label>

                </div>

              </div>


              {/* CONTACT METHOD */}
              <div className="mt-7">

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
                          update(
                            'preferred_contact',
                            method
                          )
                        }
                        className={`
                          rounded-2xl border px-3 py-3 text-[11px] font-semibold transition
                          ${
                            form.preferred_contact ===
                            method
                              ? 'bg-ink text-cream border-ink'
                              : 'bg-cream text-ink border-ink/10 hover:border-ink/25'
                          }
                        `}
                      >
                        {method}
                      </button>

                    )
                  )}

                </div>

              </div>


              {/* STREAM */}
              <div className="mt-8 pt-7 border-t border-ink/10">

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  2 · Study track
                </div>

                <h3 className="serif text-2xl mt-2">
                  What are you planning to study?
                </h3>

                <div className="grid sm:grid-cols-2 gap-3 mt-4">

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
                    description="Bachelor's and Master's study options."
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


              {/* PREFERRED COUNTRY */}
              {form.stream && (
                <div className="mt-7">

                  <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
                    Preferred country
                  </div>

                  <select
                    value={
                      form.preferred_country
                    }
                    onChange={
                      e =>
                        update(
                          'preferred_country',
                          e.target.value
                        )
                    }
                    className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3.5 outline-none focus:border-coral"
                  >

                    <option value="">
                      No preference yet
                    </option>

                    {countries.map(
                      country => (
                        <option
                          key={country}
                          value={country}
                        >
                          {country}
                        </option>
                      )
                    )}

                  </select>

                  <div className="mt-2 text-[10px] text-ink/40">
                    Optional. You can choose or change countries again inside Build My Route.
                  </div>

                </div>
              )}


              {error && (
                <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-[12px] text-red-700">
                  {error}
                </div>
              )}


              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full bg-coral text-white px-6 py-4 text-[13px] font-bold disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting your application…
                  </>
                ) : (
                  <>
                    Continue to Build My Route
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}

              </button>


              <p className="mt-4 text-center text-[10px] text-ink/40 leading-relaxed">
                By continuing, your contact details are sent to Route Your Career for admissions guidance and follow-up. This does not guarantee admission, visa approval, scholarship or university acceptance.
              </p>

            </form>

            )}

          </section>

        </div>

      </main>

      <Footer />

    </div>
  );
}
