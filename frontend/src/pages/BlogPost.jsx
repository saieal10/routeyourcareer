import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blog';
import { brand } from '../mock';
import { Clock, ArrowUpRight, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';

function ctaFor(cta) {
  if (cta === 'italy') return { label: 'Explore Italy zero-fee', to: '/countries/italy' };
  if (cta === 'georgia') return { label: 'Explore MBBS in Georgia', to: '/countries/georgia' };
  if (cta === 'management') return { label: 'See Management destinations', to: '/#management' };
  if (cta === 'mbbs') return { label: 'See MBBS destinations', to: '/#featured' };
  if (cta === 'quiz') return { label: 'Take the Course Finder Quiz', to: '/quiz' };
  return { label: 'Explore RYC', to: '/' };
}

export default function BlogPost() {
  const { slug } = useParams();
  const nav = useNavigate();
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) {
    return (
      <div className="min-h-screen bg-cream text-ink">
        <AnnouncementBar /><Navbar />
        <div className="max-w-3xl mx-auto py-24 px-6 text-center">
          <h1 className="serif text-4xl text-ink">Post not found.</h1>
          <Link to="/#blog" className="mt-4 inline-flex items-center gap-1 text-ink font-semibold link-uline">Back to blog</Link>
        </div>
        <Footer />
      </div>
    );
  }
  const related = blogPosts.filter(p => p.slug !== slug).slice(0, 3);
  const cta = ctaFor(post.cta);
  return (
    <div className="min-h-screen bg-cream text-ink">
      <AnnouncementBar /><Navbar />

      <article>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
          <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 text-[12px] mono uppercase tracking-widest text-ink/60 hover:text-ink"><ArrowLeft className="h-3.5 w-3.5"/> Back</button>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-ink text-cream text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">{post.cat}</span>
            <span className="text-[11px] mono uppercase tracking-widest text-ink/50 flex items-center gap-1"><Clock className="h-3 w-3"/> {post.mins} min read</span>
            <span className="text-[11px] mono uppercase tracking-widest text-ink/50">{post.date}</span>
          </div>
          <h1 className="mt-4 serif text-4xl sm:text-6xl font-normal leading-[0.98] text-ink">{post.title}</h1>
          <p className="mt-5 text-ink/70 text-[16px] leading-relaxed">{post.excerpt}</p>
          <div className="mt-4 text-[12px] mono uppercase tracking-widest text-ink/50">By {post.author}</div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10">
          <img src={post.hero} alt={post.title} className="rounded-3xl object-cover w-full aspect-[16/8]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 pb-4">
          {post.body.map((b, i) => {
            if (b.h) return <h2 key={i} className="serif text-3xl font-medium text-ink mt-10 mb-3 leading-tight">{b.h}</h2>;
            if (b.p) return <p key={i} className="text-ink/80 text-[16px] leading-[1.7] mt-3">{b.p}</p>;
            if (b.list) return (
              <ul key={i} className="mt-4 space-y-2 pl-1">
                {b.list.map((l, j) => (
                  <li key={j} className="flex items-start gap-2 text-ink/80 text-[15px]"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-coral shrink-0"/>{l}</li>
                ))}
              </ul>
            );
            return null;
          })}

          {/* CTA block */}
          <div className="mt-14 rounded-3xl bg-ink text-cream p-8">
            <div className="text-[11px] mono uppercase tracking-widest text-coral">One next step</div>
            <h3 className="serif text-2xl mt-2">Ready to route the rest?</h3>
            <p className="mt-2 text-cream/70 text-[14px]">Free consultation on request. Two clicks and we’re on it.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={cta.to} className="inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-5 py-3 text-[13px] font-bold">{cta.label} <ArrowUpRight className="h-4 w-4"/></Link>
              <a href={brand.applyLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/25 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/10">Apply Online</a>
              <a href={brand.callbackLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/25 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/10">Request callback</a>
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24">
          <div className="text-[11px] mono uppercase tracking-widest text-coral">More from the RYC Journal</div>
          <h3 className="serif text-3xl mt-2 text-ink">Keep reading.</h3>
          <div className="mt-6 grid sm:grid-cols-3 gap-5">
            {related.map(r => (
              <Link key={r.slug} to={`/blog/${r.slug}`} className="group rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift block">
                <div className="aspect-[16/10] overflow-hidden"><img src={r.hero} alt={r.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/></div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-cream border border-ink/10 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">{r.cat}</span>
                    <span className="text-[10px] mono uppercase tracking-widest text-ink/40 flex items-center gap-1"><Clock className="h-3 w-3"/> {r.mins} min</span>
                  </div>
                  <h4 className="mt-3 serif text-[19px] font-medium text-ink leading-snug">{r.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>

      <Footer />
      <AiChatWidget />
    </div>
  );
}
