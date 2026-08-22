import React, { useEffect, useState } from 'react';
import {
  Check,
  Circle,
  Loader2,
  Search,
  ShieldCheck,
  MapPin,
  GraduationCap
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  'https://routeyourcareer.onrender.com';

const STAGES = [
  'started',
  'route_built',
  'university_selected',
  'contacted',
  'documents',
  'applied',
  'offer_received',
  'visa',
  'enrolled'
];

function formatDate(value) {
  if (!value) return '';

  try {
    return new Date(value).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }
  catch {
    return '';
  }
}

function stageLabel(value) {
  const labels = {
    started: 'Application Started',
    route_built: 'Route Built',
    university_selected: 'University Selected',
    contacted: 'Contacted',
    documents: 'Documents',
    applied: 'Applied',
    offer_received: 'Offer Received',
    visa: 'Visa',
    enrolled: 'Enrolled'
  };

  return labels[value] || value;
}

export default function TrackApplication() {
  const location = useLocation();

  const [applicationId, setApplicationId] =
    useState('');

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const fetchTracking = async rawId => {
    setError('');
    setData(null);

    const id =
      String(rawId || '')
        .trim()
        .toUpperCase();

    if (!id) {
      setError(
        'Enter your Route Your Career application ID.'
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `${BACKEND_URL}/api/applications/${encodeURIComponent(
            id
          )}/track`
        );

      let body = null;

      try {
        body =
          await response.json();
      }
      catch {
        body = null;
      }

      if (!response.ok) {
        throw new Error(
          typeof body?.detail === 'string'
            ? body.detail
            : 'Could not find this application.'
        );
      }

      setData(body);

      const resolvedId =
        body.application_id ||
        id;

      setApplicationId(
        resolvedId
      );

      localStorage.setItem(
        'ryc_application_id',
        resolvedId
      );
    }
    catch (err) {
      setError(
        err.message ||
        'Could not track this application.'
      );
    }
    finally {
      setLoading(false);
    }
  };

  const track = async e => {
    e.preventDefault();
    await fetchTracking(
      applicationId
    );
  };

  useEffect(() => {
    const params =
      new URLSearchParams(
        location.search
      );

    const fromQuery =
      params.get(
        'application_id'
      );

    const fromStorage =
      localStorage.getItem(
        'ryc_application_id'
      );

    const savedId =
      (
        fromQuery ||
        fromStorage ||
        ''
      )
        .trim()
        .toUpperCase();

    if (!savedId) {
      return;
    }

    setApplicationId(
      savedId
    );

    fetchTracking(
      savedId
    );
    // Run only when the tracking page/query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const timeline =
    Array.isArray(data?.timeline)
      ? data.timeline
      : STAGES.map(key => ({
          key,
          label:
            stageLabel(key),
          status:
            'upcoming',
          completed:
            false,
          current:
            false,
          date:
            null
        }));

  return (
    <div className="min-h-screen bg-cream text-ink">

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* HERO */}
        <section className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 text-[10px] mono uppercase tracking-[0.2em] text-coral">
            <ShieldCheck className="h-4 w-4" />
            Application tracking
          </div>

          <h1 className="serif text-5xl sm:text-6xl mt-5">
            Track your application.
          </h1>

          <p className="mt-4 text-[14px] leading-relaxed text-ink/60">
            Enter the RYC application ID you received when you started your application.
          </p>

        </section>


        {/* SEARCH */}
        <section className="max-w-2xl mx-auto mt-8">

          <form
            onSubmit={track}
            className="rounded-3xl bg-white border border-ink/10 p-4 sm:p-5"
          >

            <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-2">
              Application ID
            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <div className="relative flex-1">

                <Search className="absolute left-4 top-4 h-4 w-4 text-ink/30" />

                <input
                  value={applicationId}
                  onChange={e =>
                    setApplicationId(
                      e.target.value
                    )
                  }
                  placeholder="RYC-20260822-AB12CD34"
                  className="w-full rounded-2xl border border-ink/15 bg-cream pl-11 pr-4 py-3.5 outline-none focus:border-coral uppercase"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink text-cream px-6 py-3.5 text-[12px] font-bold disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking…
                  </>
                ) : (
                  <>
                    Track Application
                  </>
                )}

              </button>

            </div>

            {error && (
              <div className="mt-3 rounded-2xl bg-red-50 border border-red-200 p-3 text-[12px] text-red-700">
                {error}
              </div>
            )}

            {!error && applicationId && (
              <div className="mt-3 text-[10px] text-ink/40">
                Application ID loaded from this browser or the tracking link.
              </div>
            )}

          </form>

        </section>


        {/* RESULT */}
        {data && (
          <section className="mt-10">

            <div className="rounded-[30px] bg-ink text-cream overflow-hidden">

              <div className="px-6 sm:px-8 py-7">

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  {data.application_id}
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 mt-2">

                  <div>

                    <h2 className="serif text-3xl sm:text-4xl">
                      {data.student_name
                        ? `${data.student_name}'s application`
                        : 'Your application'}
                    </h2>

                    <div className="mt-2 text-[12px] text-cream/55">
                      Current stage:{' '}
                      <strong className="text-cream">
                        {data.stage_label ||
                          stageLabel(
                            data.stage
                          )}
                      </strong>
                    </div>

                  </div>

                  {data.updated_at && (
                    <div className="text-[10px] text-cream/45">
                      Updated{' '}
                      {formatDate(
                        data.updated_at
                      )}
                    </div>
                  )}

                </div>

              </div>


              {/* SELECTED ROUTE */}
              <div className="bg-cream text-ink px-6 sm:px-8 py-6">

                <div className="grid sm:grid-cols-3 gap-4">

                  <div className="rounded-2xl bg-white border border-ink/10 p-4">

                    <div className="flex items-center gap-2 text-[9px] mono uppercase tracking-widest text-ink/40">
                      <GraduationCap className="h-4 w-4" />
                      Study track
                    </div>

                    <div className="font-semibold mt-2">
                      {data.stream || '—'}
                    </div>

                  </div>

                  <div className="rounded-2xl bg-white border border-ink/10 p-4 sm:col-span-2">

                    <div className="flex items-center gap-2 text-[9px] mono uppercase tracking-widest text-ink/40">
                      <MapPin className="h-4 w-4" />
                      Selected university
                    </div>

                    <div className="serif text-xl mt-2">
                      {data.selected_route?.university_name ||
                        'University not selected yet'}
                    </div>

                    {(data.selected_route?.course_name ||
                      data.selected_route?.country) && (
                      <div className="text-[11px] text-ink/50 mt-1">
                        {data.selected_route?.course_name || ''}
                        {data.selected_route?.country
                          ? `${data.selected_route?.course_name ? ' · ' : ''}${data.selected_route.country}`
                          : ''}
                        {data.selected_route?.city
                          ? ` · ${data.selected_route.city}`
                          : ''}
                      </div>
                    )}

                  </div>

                </div>


                {/* DOCUMENT PROGRESS */}
                {data.document_progress &&
                 Number(data.document_progress.total || 0) > 0 && (
                  <div className="mt-8 rounded-3xl bg-white border border-ink/10 p-5 sm:p-6">

                    <div className="flex flex-wrap items-end justify-between gap-4">

                      <div>
                        <div className="text-[10px] mono uppercase tracking-widest text-coral">
                          Document progress
                        </div>

                        <h3 className="serif text-2xl sm:text-3xl mt-1">
                          Your document checklist.
                        </h3>

                        <p className="mt-2 text-[11px] text-ink/50 max-w-xl">
                          This shows document progress only. Internal review notes and uploaded files are not displayed here.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-ink text-cream px-4 py-3 text-center">

                        <div className="serif text-2xl leading-none">
                          {Number(data.document_progress.submitted || 0)}
                          /
                          {Number(data.document_progress.total || 0)}
                        </div>

                        <div className="mt-1 text-[8px] mono uppercase tracking-widest text-cream/50">
                          received or verified
                        </div>

                      </div>

                    </div>

                    <div className="mt-5 h-2 rounded-full bg-ink/10 overflow-hidden">

                      <div
                        className="h-full bg-forest transition-all"
                        style={{
                          width:
                            `${Math.min(
                              100,
                              Math.round(
                                (
                                  Number(
                                    data.document_progress.submitted || 0
                                  )
                                  /
                                  Math.max(
                                    1,
                                    Number(
                                      data.document_progress.total || 0
                                    )
                                  )
                                ) * 100
                              )
                            )}%`
                        }}
                      />

                    </div>

                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">

                      {[
                        [
                          'Pending',
                          data.document_progress.pending || 0
                        ],
                        [
                          'Received',
                          data.document_progress.received || 0
                        ],
                        [
                          'Verified',
                          data.document_progress.verified || 0
                        ],
                        [
                          'Rejected',
                          data.document_progress.rejected || 0
                        ]
                      ].map(([label, value]) => (

                        <div
                          key={label}
                          className="rounded-2xl bg-cream border border-ink/10 p-4"
                        >

                          <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                            {label}
                          </div>

                          <div className="serif text-2xl mt-1">
                            {value}
                          </div>

                        </div>

                      ))}

                    </div>

                    {Number(data.document_progress.rejected || 0) > 0 && (
                      <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-[11px] text-red-700 leading-relaxed">
                        One or more documents need attention. Please contact your Route Your Career counsellor for the exact correction required.
                      </div>
                    )}

                  </div>
                )}

                {/* TIMELINE */}
                <div className="mt-8">

                  <div className="text-[10px] mono uppercase tracking-widest text-coral">
                    Application progress
                  </div>

                  <div className="mt-5">

                    {timeline.map(
                      (
                        item,
                        index
                      ) => {

                        const completed =
                          item.status ===
                            'completed' ||
                          item.completed;

                        const current =
                          item.status ===
                            'current' ||
                          item.current;

                        return (
                          <div
                            key={item.key}
                            className="relative flex gap-4"
                          >

                            {/* LINE */}
                            {index <
                              timeline.length -
                                1 && (
                              <div
                                className={`absolute left-[17px] top-9 w-px h-[calc(100%-8px)] ${
                                  completed
                                    ? 'bg-forest'
                                    : 'bg-ink/10'
                                }`}
                              />
                            )}

                            {/* ICON */}
                            <div
                              className={`
                                relative z-10 h-9 w-9 rounded-full border grid place-items-center shrink-0
                                ${
                                  completed
                                    ? 'bg-forest border-forest text-cream'
                                    : current
                                    ? 'bg-coral border-coral text-white'
                                    : 'bg-white border-ink/15 text-ink/30'
                                }
                              `}
                            >

                              {completed ? (
                                <Check className="h-4 w-4" />
                              ) : current ? (
                                <Circle className="h-3.5 w-3.5 fill-current" />
                              ) : (
                                <Circle className="h-3.5 w-3.5" />
                              )}

                            </div>

                            {/* CONTENT */}
                            <div className="pb-6 flex-1">

                              <div className="flex flex-wrap items-center gap-2">

                                <div
                                  className={`font-semibold text-[13px] ${
                                    current
                                      ? 'text-coral'
                                      : ''
                                  }`}
                                >
                                  {item.label ||
                                    stageLabel(
                                      item.key
                                    )}
                                </div>

                                {current && (
                                  <span className="rounded-full bg-coral/10 text-coral px-2 py-1 text-[9px] font-semibold">
                                    Current stage
                                  </span>
                                )}

                              </div>

                              <div className="mt-1 text-[10px] text-ink/40">

                                {item.date
                                  ? formatDate(
                                      item.date
                                    )
                                  : completed
                                  ? 'Completed'
                                  : current
                                  ? 'In progress'
                                  : 'Upcoming'}

                              </div>

                            </div>

                          </div>
                        );

                      }
                    )}

                  </div>

                </div>


                <div className="mt-3 rounded-2xl bg-white border border-ink/10 p-4 text-[11px] leading-relaxed text-ink/50">
                  Tracking reflects the current Route Your Career application workflow. University admission, visa approval and other external decisions remain subject to the relevant institution and authorities.
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
