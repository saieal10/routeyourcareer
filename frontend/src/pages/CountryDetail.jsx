import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { countries, managementCountries, brand } from '../mock';
import { countryDetails } from '../data/countryDetails';
import { ArrowLeft, ArrowUpRight, Check, MapPin, PhoneCall, Sparkles, Plane, Languages, UtensilsCrossed, Sun, Users, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';

export default function CountryDetail() {
  const { code } = useParams();
  const nav = useNavigate();
  const all = [...countries, ...managementCountries];
  const c = all.find(x => x.code === code);
  const d = countryDetails[code];

  if (!c) {
    return (
      <div className="min-h-screen bg-cream text-ink">
        <AnnouncementBar/><Navbar/>
        <div className="max-w-3xl mx-auto py-24 px-6 text-center">
          <h1 className="serif text-4xl">Country not found.</h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-1 text-ink font-semibold link-uline">Back home</Link>
        </div>
        <Footer/>
      </div>
    );
  }
  const isMbbs = c.track === 'mbbs';

  return (
    <div className="min-h-screen bg-cream text-ink">
      <AnnouncementBar /><Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30"/>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 text-cream">
          <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 text-[12px] mono uppercase tracking-widest text-cream/70 hover:text-cream"><ArrowLeft className="h-3.5 w-3.5"/> Back</button>
          <div className="mt-6 flex items-center gap-2">
            <img src={c.flag} alt="" className="h-6 w-9 rounded-sm ring-1 ring-white/20"/>
            <div className="text-[11px] mono uppercase tracking-widest text-coral">{isMbbs ? 'MBBS in' : 'Study in'} {c.name}{c.tag ? ' · ' + c.tag : ''}</div>
          </div>
          <h1 className="mt-4 serif text-5xl sm:text-7xl lg:text-8xl font-normal leading-[0.9] max-w-4xl">{c.name}</h1>
          <p className="mt-6 text-cream/85 text-[16px] max-w-2xl leading-relaxed">{c.desc}</p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
            <div className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3"><div className="text-[10px] mono uppercase tracking-widest text-cream/50">{isMbbs ? 'Total fee' : 'Tuition'}</div><div className="mt-1 serif text-[18px] font-medium">{c.fee}</div></div>
            <div className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3"><div className="text-[10px] mono uppercase tracking-widest text-cream/50">Track</div><div className="mt-1 serif text-[18px] font-medium">{isMbbs ? 'MBBS' : 'Management'}</div></div>
            <div className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3"><div className="text-[10px] mono uppercase tracking-widest text-cream/50">Medium</div><div className="mt-1 serif text-[18px] font-medium">English</div></div>
            <div className="rounded-2xl bg-white/5 border border-cream/15 backdrop-blur px-3 py-3"><div className="text-[10px] mono uppercase tracking-widest text-cream/50">Intake</div><div className="mt-1 serif text-[18px] font-medium">Sep 2026</div></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={brand.applyLink} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-6 py-3.5 text-[14px] font-bold">
              Apply for {c.name} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45"/>
            </a>
            <a href={brand.callbackLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/30 text-cream px-6 py-3.5 text-[14px] font-semibold hover:bg-cream/10">
              <PhoneCall className="h-4 w-4"/> Speak to a coordinator
            </a>
          </div>
        </div>
      </section>

      {/* VISA */}
      {d?.visa && (
        <section className="py-24 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2"><Plane className="h-3.5 w-3.5"/> Visa</div>
              <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95]">How to get in.</h2>
              <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-md">The quick facts every parent asks in the first call. Our coordinator handles the paperwork end-to-end.</p>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {[{k:'Visa type', v:d.visa.type},{k:'Process time', v:d.visa.processTime},{k:'Validity', v:d.visa.validity},{k:'Key requirement', v:d.visa.notes}].map(x => (
                <div key={x.k} className="rounded-3xl border border-ink/10 bg-white p-5"><div className="text-[10px] mono uppercase tracking-widest text-ink/50">{x.k}</div><div className="mt-2 serif text-[20px] font-medium text-ink leading-tight">{x.v}</div></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LIFESTYLE */}
      {d?.lifestyle && (
        <section className="py-24 bg-sand grain-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl">
              <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2"><Sun className="h-3.5 w-3.5"/> Lifestyle</div>
              <h2 className="serif mt-3 text-4xl sm:text-5xl font-normal leading-[0.95] text-ink">What life looks like there.</h2>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[{icon: Sun, k:'Climate', v:d.lifestyle.climate},{icon: Languages, k:'Language', v:d.lifestyle.language},{icon: UtensilsCrossed, k:'Food & culture', v:d.lifestyle.food},{icon: Users, k:'Indian community', v:d.lifestyle.community}].map(x => (
                <div key={x.k} className="rounded-3xl border border-ink/10 bg-white p-6 card-lift">
                  <div className="h-10 w-10 rounded-xl bg-coral/10 text-coral grid place-items-center"><x.icon className="h-5 w-5"/></div>
                  <div className="mt-4 text-[10px] mono uppercase tracking-widest text-ink/50">{x.k}</div>
                  <div className="mt-1 text-[15px] text-ink leading-snug">{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EXPLORE MORE / COORDINATOR CTA */}
      <section className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-[36px] bg-ink text-cream p-10 sm:p-14 overflow-hidden grain-bg">
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-coral/25 blur-3xl"/>
            <div className="relative grid lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8">
                <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2"><Sparkles className="h-3.5 w-3.5"/> Explore more · {c.name}</div>
                <h2 className="serif mt-3 text-4xl sm:text-6xl font-normal leading-[0.95]">Talk to our<br/><em className="font-light">{c.name} coordinator.</em></h2>
                <p className="mt-5 text-cream/75 text-[15px] max-w-xl leading-relaxed">A dedicated RYC coordinator handles admissions, visa, arrival and on-ground support for {c.name}. Free consultation on request.</p>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-3">
                <a href={brand.callbackLink} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-between gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-6 py-4 text-[14px] font-bold">
                  <span className="inline-flex items-center gap-2"><PhoneCall className="h-4 w-4"/> Connect to {c.name} coordinator</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45"/>
                </a>
                <a href={`https://wa.me/${brand.whatsapp.replace('+','')}?text=Hi%2C%20I'm%20interested%20in%20${c.name}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between gap-2 rounded-full bg-cream text-ink px-6 py-4 text-[14px] font-bold hover:bg-white"><span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4"/> WhatsApp us</span><ArrowUpRight className="h-5 w-5"/></a>
                <a href={brand.applyLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between gap-2 rounded-full border border-cream/25 text-cream px-6 py-3 text-[13px] font-semibold hover:bg-cream/10"><span>Apply Online</span><ArrowUpRight className="h-4 w-4"/></a>
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
