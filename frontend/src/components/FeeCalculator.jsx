import React, { useState } from 'react';
import { countries, managementCountries, brand } from '../mock';
import {
  Calculator,
  ArrowUpRight,
  IndianRupee,
  Clock,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { submitLead } from '../lib/api';
import { toast } from '../hooks/use-toast';

const BASE = {
  // MBBS
  ge: { name: 'Georgia', track: 'mbbs', low: 20, high: 28, living: 5, years: 6 },
  uz: { name: 'Uzbekistan', track: 'mbbs', low: 16, high: 20, living: 3, years: 6 },
  ie: { name: 'Ireland', track: 'mbbs', low: 35, high: 45, living: 12, years: 5 },
  eg: { name: 'Egypt', track: 'mbbs', low: 18, high: 24, living: 3, years: 6 },
  md: { name: 'Moldova', track: 'mbbs', low: 15, high: 19, living: 4, years: 6 },
  ru: { name: 'Russia', track: 'mbbs', low: 17, high: 25, living: 4, years: 6 },
  kz: { name: 'Kazakhstan', track: 'mbbs', low: 18, high: 22, living: 4, years: 5 },
  kg: { name: 'Kyrgyzstan', track: 'mbbs', low: 15, high: 19, living: 3, years: 5 },
  np: { name: 'Nepal', track: 'mbbs', low: 35, high: 45, living: 5, years: 5.5 },

  // Management
  it: {
    name: 'Italy',
    track: 'management',
    low: 0,
    high: 2,
    living: 7,
    years: 2,
    note: 'Zero-tuition public unis'
  },
  de: { name: 'Germany', track: 'management', low: 0, high: 10, living: 9, years: 2 },
  sg: { name: 'Singapore', track: 'management', low: 20, high: 50, living: 12, years: 1 },
  us: { name: 'USA', track: 'management', low: 30, high: 55, living: 15, years: 2 },
  gb: { name: 'UK', track: 'management', low: 20, high: 40, living: 14, years: 1 },
  au: { name: 'Australia', track: 'management', low: 22, high: 40, living: 13, years: 2 },
  es: { name: 'Spain', track: 'management', low: 15, high: 30, living: 10, years: 1 },
  ae: { name: 'UAE', track: 'management', low: 12, high: 30, living: 12, years: 2 },
};

function eligibilityFor(code, score) {
  const s = Number(score) || 0;
  const b = BASE[code];
  const isMgmt = b?.track === 'management';

  if (isMgmt) {
    if (s >= 85) {
      return {
        tag: 'Top-tier',
        color: 'bg-emerald-100 text-emerald-800',
        note: `Strong profile for ${b.name}. Aim for QS-ranked and top private universities.`
      };
    }

    if (s >= 70) {
      return {
        tag: 'Strong fit',
        color: 'bg-teal-100 text-teal-800',
        note: `Very good shortlist across ${b.name} — public and private universities are open.`
      };
    }

    if (s >= 55) {
      return {
        tag: 'Qualifying',
        color: 'bg-amber-100 text-amber-900',
        note: `Solid fit for ${b.name}. We'll match you to admission-friendly programmes.`
      };
    }

    if (s > 0) {
      return {
        tag: 'Foundation-first',
        color: 'bg-rose-100 text-rose-800',
        note: 'Consider a foundation / pathway programme before direct UG / PG.'
      };
    }

    return {
      tag: '—',
      color: 'bg-slate-100 text-slate-700',
      note: 'Enter your 12th % or UG GPA (out of 100) to see personalised eligibility.'
    };
  }

  // MBBS / NEET ELIGIBILITY
  if (s >= 500) {
    return {
      tag: 'Top-tier',
      color: 'bg-emerald-100 text-emerald-800',
      note: 'Eligible everywhere — you can aim for premium picks like Ireland, top Georgia unis.'
    };
  }

  if (s >= 300) {
    return {
      tag: 'Strong fit',
      color: 'bg-teal-100 text-teal-800',
      note: `Excellent shortlist across ${b.name} — multiple partner universities open.`
    };
  }

  if (s >= 213) {
    return {
      tag: 'Qualifying',
      color: 'bg-amber-100 text-amber-900',
      note: `NEET-qualified. ${b.name} accepts qualifying scores at most partner universities.`
    };
  }

  if (s > 0) {
    return {
      tag: 'Retake advised',
      color: 'bg-rose-100 text-rose-800',
      note: 'A qualifying NEET score (213+) is mandatory — or consider a pivot to Management.'
    };
  }

  return {
    tag: '—',
    color: 'bg-slate-100 text-slate-700',
    note: 'Enter your NEET score to see personalised eligibility.'
  };
}

export default function FeeCalculator() {
  const [code, setCode] = useState('ge');
  const [track, setTrack] = useState('mbbs');
  const [score, setScore] = useState(400);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  const c = BASE[code];

  const isMgmt = c.track === 'management';

  const scoreLabel = isMgmt
    ? 'Your 12th % / UG GPA'
    : 'Your NEET score';

  const scoreMax = isMgmt ? 100 : 720;

  const currentTrackList =
    track === 'mbbs'
      ? countries
      : managementCountries;

  const tuitionLow = c.low;
  const tuitionHigh = c.high;

  const livingTotal = c.living * c.years;

  const totalLow = tuitionLow + livingTotal;
  const totalHigh = tuitionHigh + livingTotal;

  const perYearLow = (tuitionLow / c.years).toFixed(1);
  const perYearHigh = (tuitionHigh / c.years).toFixed(1);

  const elig = eligibilityFor(code, score);

  const sendMe = async (e) => {
    e.preventDefault();

    if (!name || !phone) {
      toast({
        title: 'Add your name and phone to receive the estimate.'
      });
      return;
    }

    try {
      setSending(true);

      await submitLead({
        name,
        phone,
        country: c.name,
        neet_score: String(score),
        message: `Fee estimate: total ₹${totalLow}–${totalHigh}L over ${c.years} yrs. Eligibility: ${elig.tag}.`,
        source: 'fee-calculator',
        type: 'quick',
      });

      toast({
        title: 'Sent!',
        description: `We’ll WhatsApp your ${c.name} estimate to ${phone} within a few minutes.`
      });

      setName('');
      setPhone('');

    } catch (err) {
      toast({
        title: 'Could not send',
        description:
          err?.response?.data?.detail ||
          'Please try again.'
      });

    } finally {
      setSending(false);
    }
  };

  return (
    <section id="calculator" className="py-24 bg-cream">

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* HEADER */}

        <div className="grid lg:grid-cols-12 gap-8 items-end">

          <div className="lg:col-span-7">

            <div className="flex items-center gap-2 text-[11px] mono uppercase tracking-widest text-coral">
              <Calculator className="h-3.5 w-3.5" />
              / 04 — Live estimate
            </div>

            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">
              Pick a country. Enter NEET.
              <br />

              <em className="font-light">
                See your fee & timeline.
              </em>
            </h2>

          </div>

          <p className="lg:col-span-5 text-ink/70 text-[15px] leading-relaxed">
            A ball-park number in ten seconds — tuition,
            living, duration and your NEET-eligibility band.
            Fine-tune with a real counsellor after.
          </p>

        </div>


        <div className="mt-12 grid lg:grid-cols-12 gap-6">

          {/* LEFT SIDE CONTROLS */}

          <div className="lg:col-span-5 rounded-3xl bg-white border border-ink/10 p-6 lg:p-8">

            {/* TRACK */}

            <div>

              <label className="text-[10px] mono uppercase tracking-widest text-ink/60">
                Track
              </label>

              <div className="mt-2 inline-flex rounded-full bg-cream/60 border border-ink/10 p-1">

                {[
                  { k: 'mbbs', l: 'MBBS' },
                  { k: 'management', l: 'Management' }
                ].map((t) => (

                  <button
                    key={t.k}
                    onClick={() => {

                      setTrack(t.k);

                      const first =
                        (
                          t.k === 'mbbs'
                            ? countries
                            : managementCountries
                        )[0];

                      setCode(first.code);

                      setScore(
                        t.k === 'management'
                          ? 75
                          : 400
                      );
                    }}

                    className={`px-4 py-1.5 rounded-full text-[12px] font-semibold ${
                      track === t.k
                        ? 'bg-ink text-cream'
                        : 'text-ink/60 hover:text-ink'
                    }`}
                  >

                    {t.l}

                  </button>

                ))}

              </div>

            </div>


            {/* COUNTRY */}

            <div className="mt-4">

              <label className="text-[10px] mono uppercase tracking-widest text-ink/60">
                Preferred country
              </label>

              <div className="mt-3 grid grid-cols-3 gap-2">

                {currentTrackList.map((cc) => (

                  <button
                    key={cc.code}
                    onClick={() => setCode(cc.code)}

                    className={`group text-left rounded-2xl border p-3 transition-all ${
                      code === cc.code
                        ? 'bg-ink text-cream border-ink'
                        : 'bg-cream/60 border-ink/10 hover:border-ink/30'
                    }`}
                  >

                    <img
                      src={cc.flag}
                      alt=""
                      className="h-4 w-6 rounded-sm ring-1 ring-black/10"
                    />

                    <div
                      className={`mt-2 font-semibold text-[13px] ${
                        code === cc.code
                          ? 'text-cream'
                          : 'text-ink'
                      }`}
                    >
                      {cc.name}
                    </div>

                    <div
                      className={`text-[10px] mono uppercase tracking-widest ${
                        code === cc.code
                          ? 'text-cream/60'
                          : 'text-ink/40'
                      }`}
                    >
                      {cc.fee}
                    </div>

                  </button>

                ))}

              </div>

            </div>


            {/* SCORE */}

            <div className="mt-6">

              <div className="flex items-center justify-between">

                <label className="text-[10px] mono uppercase tracking-widest text-ink/60">
                  {scoreLabel}
                </label>

                <span className="serif text-[22px] font-medium text-ink">
                  {score}
                </span>

              </div>

              <input
                type="range"
                min="0"
                max={scoreMax}
                step="1"
                value={score}
                onChange={(e) =>
                  setScore(Number(e.target.value))
                }
                className="w-full mt-2 accent-[#e85d3a]"
              />

              <div className="flex justify-between text-[10px] mono uppercase tracking-widest text-ink/40 mt-1">

                <span>0</span>

                <span>
                  {isMgmt
                    ? '55 min. eligible'
                    : '213 qualifying'}
                </span>

                <span>{scoreMax}</span>

              </div>

            </div>


            {/* WHATSAPP FORM */}

            <form
              onSubmit={sendMe}
              className="mt-6 pt-6 border-t border-ink/10"
            >

              <div className="text-[10px] mono uppercase tracking-widest text-coral">
                WhatsApp me this estimate
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Full name"
                  className="rounded-lg border border-ink/15 bg-cream/60 px-3 py-2.5 text-[13px] focus:border-forest"
                />

                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="WhatsApp number"
                  className="rounded-lg border border-ink/15 bg-cream/60 px-3 py-2.5 text-[13px] focus:border-forest"
                />

              </div>

              <button
                type="submit"
                disabled={sending}
                className="mt-3 w-full rounded-lg bg-coral hover:bg-[#d94a26] text-white font-semibold py-2.5 text-[13px] disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >

                {sending
                  ? 'Sending…'
                  : 'Send my estimate'}

                <ArrowUpRight className="h-4 w-4" />

              </button>

            </form>

          </div>


          {/* RIGHT RESULT CARD */}

          <div className="lg:col-span-7 rounded-3xl bg-ink text-cream p-8 lg:p-10 relative overflow-hidden">

            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-coral/25 blur-3xl" />

            <div className="relative">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Sparkles className="h-4 w-4 text-coral" />

                  <div className="text-[10px] mono uppercase tracking-widest text-coral">
                    Personalised estimate
                  </div>

                </div>

                <div
                  className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 ${elig.color}`}
                >
                  {elig.tag}
                </div>

              </div>


              <div className="mt-4 flex items-baseline gap-3">

                <div className="serif text-6xl sm:text-7xl font-light leading-none">
                  {c.name}
                </div>

              </div>

              <p className="mt-3 text-cream/70 text-[14px] max-w-lg">
                {elig.note}
              </p>


              {/* FEE BOXES */}

              <div className="mt-8 grid sm:grid-cols-3 gap-3">

                <div className="rounded-2xl bg-white/5 border border-cream/10 p-4">

                  <div className="text-[10px] mono uppercase tracking-widest text-cream/50 flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    Total (tuition + living)
                  </div>

                  <div className="mt-1 serif text-3xl font-medium">
                    ₹{totalLow}–{totalHigh}L
                  </div>

                  <div className="text-[11px] text-cream/60 mt-1">
                    Over {c.years} years
                  </div>

                </div>


                <div className="rounded-2xl bg-white/5 border border-cream/10 p-4">

                  <div className="text-[10px] mono uppercase tracking-widest text-cream/50 flex items-center gap-1">

                    <GraduationCap className="h-3 w-3" />

                    Tuition / year

                  </div>

                  <div className="mt-1 serif text-3xl font-medium">
                    ₹{perYearLow}–{perYearHigh}L
                  </div>

                  <div className="text-[11px] text-cream/60 mt-1">
                    Government universities
                  </div>

                </div>


                <div className="rounded-2xl bg-white/5 border border-cream/10 p-4">

                  <div className="text-[10px] mono uppercase tracking-widest text-cream/50 flex items-center gap-1">

                    <Clock className="h-3 w-3" />

                    Duration

                  </div>

                  <div className="mt-1 serif text-3xl font-medium">
                    {c.years} yrs
                  </div>

                  <div className="text-[11px] text-cream/60 mt-1">
                    {isMgmt
                      ? 'Management programme'
                      : 'MBBS · English-medium'}
                  </div>

                </div>

              </div>


              {/* TIMELINE */}

              <div className="mt-8">

                <div className="text-[10px] mono uppercase tracking-widest text-cream/50">
                  Suggested timeline
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">

                  {[
                    'Free counselling',
                    'Doc prep (2–4 wks)',
                    'Admission letter',
                    'Visa & tickets',
                    `Fly to ${c.name}`
                  ].map((s, i) => (

                    <React.Fragment key={s}>

                      <div className="rounded-full border border-cream/15 px-3 py-1.5 text-[12px] font-medium text-cream/90">
                        {s}
                      </div>

                      {i < 4 && (
                        <div className="h-px w-4 bg-cream/20" />
                      )}

                    </React.Fragment>

                  ))}

                </div>

              </div>


              {/* BUTTONS */}

              <div className="mt-8 flex flex-wrap gap-3">

                <a
                  href={brand.applyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-5 py-3 text-[13px] font-bold"
                >

                  Apply for {c.name}

                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

                </a>


                <a
                  href={brand.callbackLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-cream/25 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/10"
                >

                  Request callback

                </a>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
