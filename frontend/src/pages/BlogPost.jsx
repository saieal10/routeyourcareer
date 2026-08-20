import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { brand } from '../mock';

import {
  Clock,
  ArrowUpRight,
  ArrowLeft,
  Loader2,
  BookOpen
} from 'lucide-react';

import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';


const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  'https://routeyourcareer.onrender.com';

const DEFAULT_BLOG_IMAGE = '/blog-default.png';


/* =========================================================
   CTA
========================================================= */

function ctaFor(cta) {
  if (cta === 'italy') {
    return {
      label: 'Explore Italy',
      to: '/countries/italy'
    };
  }

  if (cta === 'georgia') {
    return {
      label: 'Explore MBBS in Georgia',
      to: '/countries/georgia'
    };
  }

  if (cta === 'management') {
    return {
      label: 'See Management destinations',
      to: '/#management'
    };
  }

  if (cta === 'mbbs') {
    return {
      label: 'See MBBS destinations',
      to: '/#featured'
    };
  }

  if (cta === 'quiz') {
    return {
      label: 'Take the Course Finder Quiz',
      to: '/quiz'
    };
  }

  return {
    label: 'Explore Route Your Career',
    to: '/'
  };
}


/* =========================================================
   DATE
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) return '';

  try {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  } catch {
    return '';
  }
}


/* =========================================================
   META TAG HELPER
========================================================= */

function setMeta(selector, attribute, value) {
  let element = document.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');

    const match = selector.match(
      /meta\[(name|property)="([^"]+)"\]/
    );

    if (match) {
      element.setAttribute(match[1], match[2]);
    }

    document.head.appendChild(element);
  }

  element.setAttribute(attribute, value);

  return element;
}


/* =========================================================
   BLOG POST
========================================================= */

export default function BlogPost() {
  const { slug } = useParams();
  const nav = useNavigate();

  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  /* =======================================================
     LOAD BLOG
  ======================================================= */

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError('');
        setPost(null);

        const response = await fetch(
          `${BACKEND_URL}/api/blogs/${encodeURIComponent(slug)}`
        );

        if (response.status === 404) {
          setError('not-found');
          return;
        }

        if (!response.ok) {
          throw new Error('Could not load blog post');
        }

        const data = await response.json();

        setPost(data);


        /* ===============================================
           RELATED ARTICLES
        =============================================== */

        try {
          const relatedResponse = await fetch(
            `${BACKEND_URL}/api/blogs`
          );

          if (relatedResponse.ok) {
            const allBlogs =
              await relatedResponse.json();

            const relatedPosts =
              Array.isArray(allBlogs)
                ? allBlogs
                    .filter(
                      (item) =>
                        item.slug !== data.slug
                    )
                    .slice(0, 3)
                : [];

            setRelated(relatedPosts);
          }

        } catch (relatedError) {
          console.error(
            'Related blog error:',
            relatedError
          );
        }

      } catch (err) {
        console.error(
          'Blog loading error:',
          err
        );

        setError('load-error');

      } finally {
        setLoading(false);
      }
    };

    loadPost();

  }, [slug]);


  /* =======================================================
     BLOG SEO
  ======================================================= */

  useEffect(() => {
    if (!post) return;


    /* ===============================================
       SEO TITLE

       Priority:
       1. seo_title from admin
       2. blog title
    =============================================== */

    const seoTitle =
      post.seo_title ||
      `${post.title} | Route Your Career`;


    /* ===============================================
       META DESCRIPTION

       Priority:
       1. meta_description from admin
       2. excerpt
    =============================================== */

    const seoDescription =
      post.meta_description ||
      post.excerpt ||
      'Read the latest study abroad guidance from Route Your Career.';


    const pageUrl =
      `https://routeyourcareer.in/blog/${post.slug}`;


    const imageUrl =
      'https://routeyourcareer.in/blog-default.png';


    /* ===============================================
       PAGE TITLE
    =============================================== */

    document.title = seoTitle;


    /* ===============================================
       DESCRIPTION
    =============================================== */

    setMeta(
      'meta[name="description"]',
      'content',
      seoDescription
    );


    /* ===============================================
       ROBOTS
    =============================================== */

    setMeta(
      'meta[name="robots"]',
      'content',
      'index, follow'
    );


    /* ===============================================
       OPEN GRAPH
    =============================================== */

    setMeta(
      'meta[property="og:type"]',
      'content',
      'article'
    );

    setMeta(
      'meta[property="og:title"]',
      'content',
      seoTitle
    );

    setMeta(
      'meta[property="og:description"]',
      'content',
      seoDescription
    );

    setMeta(
      'meta[property="og:url"]',
      'content',
      pageUrl
    );

    setMeta(
      'meta[property="og:image"]',
      'content',
      imageUrl
    );


    /* ===============================================
       TWITTER
    =============================================== */

    setMeta(
      'meta[name="twitter:card"]',
      'content',
      'summary_large_image'
    );

    setMeta(
      'meta[name="twitter:title"]',
      'content',
      seoTitle
    );

    setMeta(
      'meta[name="twitter:description"]',
      'content',
      seoDescription
    );

    setMeta(
      'meta[name="twitter:image"]',
      'content',
      imageUrl
    );


    /* ===============================================
       CANONICAL URL
    =============================================== */

    let canonical =
      document.querySelector(
        'link[rel="canonical"]'
      );

    if (!canonical) {
      canonical =
        document.createElement('link');

      canonical.setAttribute(
        'rel',
        'canonical'
      );

      document.head.appendChild(
        canonical
      );
    }

    canonical.setAttribute(
      'href',
      pageUrl
    );


    /* ===============================================
       ARTICLE STRUCTURED DATA
    =============================================== */

    const oldSchema =
      document.getElementById(
        'ryc-blog-schema'
      );

    if (oldSchema) {
      oldSchema.remove();
    }


    const schema =
      document.createElement('script');

    schema.type =
      'application/ld+json';

    schema.id =
      'ryc-blog-schema';


    schema.textContent =
      JSON.stringify({
        '@context':
          'https://schema.org',

        '@type':
          'Article',

        headline:
          post.title,

        description:
          seoDescription,

        image: [
          imageUrl
        ],

        datePublished:
          post.published_at ||
          undefined,

        dateModified:
          post.updated_at ||
          post.published_at ||
          undefined,

        author: {
          '@type':
            'Organization',

          name:
            post.author ||
            'Route Your Career'
        },

        publisher: {
          '@type':
            'Organization',

          name:
            'Route Your Career',

          url:
            'https://routeyourcareer.in/'
        },

        mainEntityOfPage: {
          '@type':
            'WebPage',

          '@id':
            pageUrl
        }
      });


    document.head.appendChild(
      schema
    );


    /* ===============================================
       RESET WHEN LEAVING BLOG
    =============================================== */

    return () => {

      document.title =
        'Route Your Career | MBBS Abroad & Career Counselling';


      setMeta(
        'meta[name="description"]',
        'content',
        'Route Your Career provides guidance for MBBS abroad, medical university admissions, management courses and career counselling for Indian students.'
      );


      const canonicalTag =
        document.querySelector(
          'link[rel="canonical"]'
        );

      if (canonicalTag) {
        canonicalTag.setAttribute(
          'href',
          'https://routeyourcareer.in/'
        );
      }


      const blogSchema =
        document.getElementById(
          'ryc-blog-schema'
        );

      if (blogSchema) {
        blogSchema.remove();
      }

    };

  }, [post]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-cream text-ink">

        <AnnouncementBar />
        <Navbar />

        <div className="min-h-[60vh] flex items-center justify-center">

          <div className="flex items-center gap-2 text-ink/60">

            <Loader2 className="h-5 w-5 animate-spin" />

            <span className="text-[13px]">
              Loading article...
            </span>

          </div>

        </div>

        <Footer />

      </div>
    );
  }


  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (error === 'not-found' || !post) {
    return (
      <div className="min-h-screen bg-cream text-ink">

        <AnnouncementBar />
        <Navbar />

        <div className="max-w-3xl mx-auto py-24 px-6 text-center">

          <BookOpen className="h-10 w-10 mx-auto text-coral" />

          <h1 className="serif mt-4 text-4xl text-ink">
            Post not found.
          </h1>

          <p className="mt-3 text-ink/60">
            This article may have been removed or is not published yet.
          </p>

          <Link
            to="/#blog"
            className="mt-5 inline-flex items-center gap-1 text-ink font-semibold link-uline"
          >
            Back to blog
          </Link>

        </div>

        <Footer />

      </div>
    );
  }


  /* =======================================================
     LOAD ERROR
  ======================================================= */

  if (error === 'load-error') {
    return (
      <div className="min-h-screen bg-cream text-ink">

        <AnnouncementBar />
        <Navbar />

        <div className="max-w-3xl mx-auto py-24 px-6 text-center">

          <h1 className="serif text-4xl">
            Could not load this article.
          </h1>

          <p className="mt-3 text-ink/60">
            Please try again in a moment.
          </p>

        </div>

        <Footer />

      </div>
    );
  }


  const cta =
    ctaFor(post.cta);


  /* =======================================================
     ARTICLE
  ======================================================= */

  return (
    <div className="min-h-screen bg-cream text-ink">

      <AnnouncementBar />
      <Navbar />


      <article>


        {/* ================================================
            HEADER
        ================================================= */}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">

          <button
            onClick={() => nav(-1)}
            className="inline-flex items-center gap-1 text-[12px] mono uppercase tracking-widest text-ink/60 hover:text-ink"
          >

            <ArrowLeft className="h-3.5 w-3.5" />

            Back

          </button>


          <div className="mt-6 flex flex-wrap items-center gap-3">

            <span className="inline-flex items-center rounded-full bg-ink text-cream text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">

              {post.category}

            </span>


            <span className="text-[11px] mono uppercase tracking-widest text-ink/50 flex items-center gap-1">

              <Clock className="h-3 w-3" />

              {post.read_time || 5} min read

            </span>


            {post.published_at && (

              <span className="text-[11px] mono uppercase tracking-widest text-ink/50">

                {formatDate(
                  post.published_at
                )}

              </span>

            )}

          </div>


          <h1 className="mt-4 serif text-4xl sm:text-6xl font-normal leading-[0.98] text-ink">

            {post.title}

          </h1>


          <p className="mt-5 text-ink/70 text-[16px] leading-relaxed">

            {post.excerpt}

          </p>


          <div className="mt-4 text-[12px] mono uppercase tracking-widest text-ink/50">

            By {
              post.author ||
              'RYC Editorial'
            }

          </div>

        </div>


        {/* ================================================
            DEFAULT IMAGE
        ================================================= */}

        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10">

          <img
            src={DEFAULT_BLOG_IMAGE}
            alt={post.title}
            className="rounded-3xl object-cover w-full aspect-[16/8]"
          />

        </div>


        {/* ================================================
            BODY
        ================================================= */}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 pb-4">


          {(post.body || []).map(
            (block, index) => {


              /* HEADING */

              if (
                block.type ===
                'heading'
              ) {

                return (

                  <h2
                    key={index}
                    className="serif text-3xl font-medium text-ink mt-10 mb-3 leading-tight"
                  >

                    {block.text}

                  </h2>

                );

              }


              /* PARAGRAPH */

              if (
                block.type ===
                'paragraph'
              ) {

                return (

                  <p
                    key={index}
                    className="text-ink/80 text-[16px] leading-[1.7] mt-3"
                  >

                    {block.text}

                  </p>

                );

              }


              /* LIST */

              if (
                block.type ===
                'list'
              ) {

                return (

                  <ul
                    key={index}
                    className="mt-4 space-y-2 pl-1"
                  >

                    {(block.items || []).map(
                      (
                        item,
                        itemIndex
                      ) => (

                        <li
                          key={
                            itemIndex
                          }
                          className="flex items-start gap-2 text-ink/80 text-[15px]"
                        >

                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-coral shrink-0" />

                          {item}

                        </li>

                      )
                    )}

                  </ul>

                );

              }


              return null;

            }
          )}


          {/* ==============================================
              CTA
          =============================================== */}

          <div className="mt-14 rounded-3xl bg-ink text-cream p-8">

            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              One next step

            </div>


            <h3 className="serif text-2xl mt-2">

              Ready to route the rest?

            </h3>


            <p className="mt-2 text-cream/70 text-[14px]">

              Free consultation on request.
              Two clicks and we’re on it.

            </p>


            <div className="mt-5 flex flex-wrap gap-3">


              <Link
                to={cta.to}
                className="inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-5 py-3 text-[13px] font-bold"
              >

                {cta.label}

                <ArrowUpRight className="h-4 w-4" />

              </Link>


              <a
                href={brand.applyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cream/25 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/10"
              >

                Apply Online

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


        {/* ================================================
            RELATED ARTICLES
        ================================================= */}

        {related.length > 0 && (

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24">

            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              More from the RYC Journal

            </div>


            <h3 className="serif text-3xl mt-2 text-ink">

              Keep reading.

            </h3>


            <div className="mt-6 grid sm:grid-cols-3 gap-5">


              {related.map(
                (item) => (

                  <Link
                    key={
                      item.id ||
                      item.slug
                    }
                    to={`/blog/${item.slug}`}
                    className="group rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift block"
                  >


                    <div className="aspect-[16/10] overflow-hidden bg-ink/5">

                      <img
                        src={DEFAULT_BLOG_IMAGE}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                    </div>


                    <div className="p-5">


                      <div className="flex items-center justify-between gap-3">

                        <span className="inline-flex items-center rounded-full bg-cream border border-ink/10 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">

                          {item.category}

                        </span>


                        <span className="text-[10px] mono uppercase tracking-widest text-ink/40 flex items-center gap-1 whitespace-nowrap">

                          <Clock className="h-3 w-3" />

                          {item.read_time || 5} min read

                        </span>

                      </div>


                      <h4 className="mt-3 serif text-[19px] font-medium text-ink leading-snug">

                        {item.title}

                      </h4>


                    </div>

                  </Link>

                )
              )}

            </div>

          </div>

        )}

      </article>


      <Footer />

      <AiChatWidget />

    </div>
  );
}
