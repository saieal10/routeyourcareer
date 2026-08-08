import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { brand } from '../mock';
import { submitLead } from '../lib/api';
import { toast } from '../hooks/use-toast';
import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import { ArrowRight, ArrowUpRight, ArrowLeft, PhoneCall, Stethoscope, Briefcase, Sparkles, RotateCcw } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'When you imagine your future self at work, which picture makes you smile more?',
    options: [
      { l: 'Wearing a white coat, treating patients in a hospital', v: 'mbbs' },
      { l: 'Leading a project or business meeting at an office', v: 'mgmt' },
      { l: 'Honestly, I’m not sure yet', v: 'both' },
    ],
  },
  {
    q: 'Which Class 11–12 subjects lit you up the most?',
    options: [
      { l: 'Biology + Chemistry — living systems fascinate me', v: 'mbbs' },
      { l: 'Business studies / Economics / Maths', v: 'mgmt' },
      { l: 'A mix — nothing dominated', v: 'both' },
    ],
  },
  {
    q: 'What did you (or will you) score in NEET?',
    options: [
      { l: '300+ (comfortably qualifying)', v: 'mbbs' },
      { l: '137–300 (just qualifying)', v: 'mbbs' },
      { l: 'Under 137 / did not appear', v: 'mgmt' },
    ],
  },
  {
    q: 'How comfortable is your family with a 6-year commitment abroad + a licensing exam (FMGE / NExT) after?',
    options: [
      { l: 'Completely fine — the goal justifies the time', v: 'mbbs' },
      { l: 'Prefer a shorter 1–4 year programme', v: 'mgmt' },
      { l: 'Depends on cost — need to see numbers first', v: 'both' },
    ],
  },
  {
    q: 'What matters most in your family’s decision right now?',
    options: [
      { l: 'A stable, respected medical profession', v: 'mbbs' },
      { l: 'A global career + international work visa', v: 'mgmt' },
      { l: 'Lowest possible total cost', v: 'both' },
    ],
  },
];

function verdict(scores) {
  const total = scores.mbbs + scores.mgmt;
  if (total === 0) return null;
  const mbbsPct = Math.round((scores.mbbs / total) * 100);
  const mgmtPct = 100 - mbbsPct;
  let route;
  if (mbbsPct >= 70) route = { title: 'MBBS Abroad', tag: 'STRONG MATCH', desc: 'Your answers point clearly to medicine. Given your priorities, MBBS abroad (Georgia + Uzbekistan first) will get you a doctor career fastest and without the ₹1Cr+ private-India route.', ctaLabel: 'See MBBS priority destinations', to: '/countries/georgia' };
  else if (mgmtPct >= 70) route = { title: 'Management Abroad', tag: 'STRONG MATCH', desc: 'A UG or PG in business / tech / management is a much better fit than pushing through MBBS. Italy’s tuition-free public universities are the smartest first stop.', ctaLabel: 'See Italy zero-tuition', to: '/countries/italy' };
  else if (mbbsPct > mgmtPct) route = { title: 'Leaning MBBS — with caveats', tag: 'MOSTLY MEDICAL', desc: 'You lean medical but with real doubts. We’d run a proper counselling call: MBBS abroad if you’re sure; a management pivot if not.', ctaLabel: 'Book a counselling call', to: '/#book' };
  else route = { title: 'Leaning Management — keep MBBS as a fallback', tag: 'MOSTLY BUSINESS', desc: 'A management degree fits your priorities better. If you still want to be around medicine, consider PG in health-management or bio-tech UG.', ctaLabel: 'See Management destinations', to: '/#management' };
  return { ...route, mbbsPct, mgmtPct };
}

export default function CourseFinderQuiz() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [captured, setCaptured] = useState(false);

  const scores = useMemo(() => {
    const s = { mbbs: 0, mgmt: 0 };
    Object.values(answers).forEach(v => {
      if (v === 'mbbs') s.mbbs += 1;
      else if (v === 'mgmt') s.mgmt += 1;
      else if (v === 'both') { s.mbbs += 0.5; s.mgmt += 0.5; }
    });
    return s;
  }, [answers]);

  const done = step >= QUESTIONS.length;
  const v = done ? verdict(scores) : null;

  const pick = (i, val) => {
    setAnswers({ ...answers, [i]: val });
    setTimeout(() => setStep(i + 1), 200);
  };

  const sendLead = async (e) => {
    e.preventDefault();
    if (!name || !phone) { toast({ title: 'Please add your name and WhatsApp.' }); return; }
    try {
      setSending(true);
      await submitLead({
        name, phone,
        message: `Course Finder Quiz — Verdict: ${v.title} (MBBS ${v.mbbsPct}% / Mgmt ${v.mgmtPct}%). Answers: ${JSON.stringify(answers)}`,
        source: 'course-finder-quiz',
        type: 'quick',
      });
      setCaptured(true);
      toast({ title: 'We’ll be in touch!', description: 'A counsellor will WhatsApp your personalised shortlist within a few hours.' });
    } catch (err) {
      toast({ title: 'Could not send', description: err?.response?.data?.detail || 'Please try again.' });
    } finally { setSending(false); }
  };

  const restart = () => { setStep(0); setAnswers({}); setName(''); setPhone(''); setCaptured(false); };

  return (
    <div className="min-h-screen bg-cream text-ink">
      <AnnouncementBar />
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 text-[12px] mono uppercase tracking-widest text-ink/60 hover:text-ink"><ArrowLeft className="h-3.5 w-3.5"/> Back</button>

        <div className="mt-5 text-[11px] mono uppercase tracking-widest text-coral">Course Finder · 5 questions</div>
        <h1 className="mt-2 serif text-4xl sm:text-6xl font-normal leading-[0.98] text-ink">MBBS or Management?<br/><em className="font-light">Let’s figure it out.</em></h1>

        {/* Progress */}
        {!done && (
          <div className="mt-8">
            <div className="flex items-center gap-1">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-coral' : i === step ? 'bg-ink' : 'bg-ink/10'}`}/>
              ))}
            </div>
            <div className="mt-2 text-[10px] mono uppercase tracking-widest text-ink/50">Question {step + 1} of {QUESTIONS.length}</div>
          </div>
        )}

        {/* Question */}
        {!done && (
          <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 sm:p-8">
            <h2 className="serif text-2xl sm:text-3xl font-medium text-ink">{QUESTIONS[step].q}</h2>
            <div className="mt-6 space-y-3">
              {QUESTIONS[step].options.map(o => (
                <button key={o.l} onClick={() => pick(step, o.v)} className={`w-full text-left rounded-2xl border p-4 flex items-center justify-between hover:border-ink transition-all ${answers[step] === o.v ? 'border-coral bg-coral/5' : 'border-ink/15 bg-cream/40'}`}>
                  <span className="text-[14px] font-medium text-ink">{o.l}</span>
                  <ArrowRight className="h-4 w-4 text-ink/40 group-hover:text-ink"/>
                </button>
              ))}
            </div>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="mt-6 inline-flex items-center gap-1 text-[12px] mono uppercase tracking-widest text-ink/60 hover:text-ink"><ArrowLeft className="h-3 w-3"/> Previous</button>
            )}
          </div>
        )}

        {/* Result */}
        {done && v && (
          <div className="mt-10 rounded-3xl bg-ink text-cream p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-coral/25 blur-3xl"/>
            <div className="relative">
              <div className="flex items-center gap-2 text-[10px] mono uppercase tracking-widest text-coral"><Sparkles className="h-3.5 w-3.5"/> {v.tag}</div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-cream/10 border border-cream/20 grid place-items-center text-coral">{v.title.includes('MBBS') ? <Stethoscope className="h-6 w-6"/> : <Briefcase className="h-6 w-6"/>}</div>
                <h2 className="serif text-4xl sm:text-5xl font-normal leading-[0.98]">{v.title}</h2>
              </div>
              <p className="mt-4 text-cream/80 text-[15px] leading-relaxed max-w-2xl">{v.desc}</p>

              {/* Bar */}
              <div className="mt-8">
                <div className="flex items-center justify-between text-[10px] mono uppercase tracking-widest text-cream/60"><span>MBBS {v.mbbsPct}%</span><span>Management {v.mgmtPct}%</span></div>
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden flex">
                  <div className="bg-coral" style={{ width: `${v.mbbsPct}%` }}/>
                  <div className="bg-emerald-400" style={{ width: `${v.mgmtPct}%` }}/>
                </div>
              </div>

              {/* Lead capture */}
              {!captured && (
                <form onSubmit={sendLead} className="mt-8 rounded-2xl bg-white/5 border border-cream/15 backdrop-blur p-5">
                  <div className="text-[11px] mono uppercase tracking-widest text-coral">Get your personalised shortlist</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="rounded-lg border border-cream/20 bg-white/5 text-cream px-3 py-2.5 text-[13px] placeholder:text-cream/40 focus:border-coral"/>
                    <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="WhatsApp number" className="rounded-lg border border-cream/20 bg-white/5 text-cream px-3 py-2.5 text-[13px] placeholder:text-cream/40 focus:border-coral"/>
                  </div>
                  <button type="submit" disabled={sending} className="mt-3 w-full rounded-lg bg-coral hover:bg-[#d94a26] text-white font-semibold py-3 text-[13px] disabled:opacity-60 inline-flex items-center justify-center gap-2">
                    {sending ? 'Sending…' : 'Send my shortlist'} <ArrowUpRight className="h-4 w-4"/>
                  </button>
                </form>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={v.to} className="inline-flex items-center gap-2 rounded-full bg-cream text-ink px-5 py-3 text-[13px] font-bold hover:bg-white">{v.ctaLabel} <ArrowUpRight className="h-4 w-4"/></Link>
                <a href={brand.callbackLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/25 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/10"><PhoneCall className="h-4 w-4"/> Request callback</a>
                <button onClick={restart} className="inline-flex items-center gap-2 rounded-full border border-cream/15 text-cream/70 px-4 py-3 text-[12px] font-medium hover:text-cream hover:border-cream/30"><RotateCcw className="h-3.5 w-3.5"/> Retake quiz</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
