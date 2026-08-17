import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ArrowUpRight,
  BookOpen,
  Loader2,
  CalendarDays
} from 'lucide-react';

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  'https://routeyourcareer.onrender.com';


/* =========================================================
   DATE FORMATTER
   ========================================================= */

function formatBlogDate(dateValue) {
  if (!dateValue) return '';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}


/* =========================================================
   BLOG COMPONENT
   ========================================================= */

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  /* =========================================================
     LOAD BLOGS
     ========================================================= */

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${BACKEND_URL}/api/blogs`
        );

        if (!response.ok) {
          throw new Error('Could not load blogs');
        }

        const data = await response.json();

        const blogList =
          Array.isArray(data) ? data : [];


        /* -----------------------------------------
           NEWEST BLOG FIRST
           ----------------------------------------- */

        const sortedBlogs = [...blogList].sort(
          (a, b) => {
            const dateA = new Date(
              a.published_at ||
              a.created_at ||
              0
            ).getTime();

            const dateB = new Date(
              b.published_at ||
              b.created_at ||
              0
            ).getTime();

            return dateB - dateA;
          }
        );

        setBlogs(sortedBlogs);

      } catch (err) {
        console.error(
          'Blog loading error:',
          err
        );

        setError(
          'Articles are temporarily unavailable.'
        );

      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);


  /* =========================================================
     CATEGORIES
     ========================================================= */

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        blogs
          .map(
            (blog) => blog.category
          )
          .filter(Boolean)
      )
    ];

    return [
      'All',
      ...uniqueCategories
    ];
  }, [blogs]);


  /* =========================================================
     FILTER BLOGS
     ========================================================= */

  const filteredBlogs =
    cat === 'All'
      ? blogs
      : blogs.filter(
          (blog) =>
            blog.category === cat
        );


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <section
      id="blog"
      className="py-24 bg-cream"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6">


        {/* =============================== */}
        {/* HEADING */}
        {/* =============================== */}

        <div className="grid lg:grid-cols-12 gap-8 items-end">

          <div className="lg:col-span-7">

            <div className="text-[11px] mono uppercase tracking-widest text-coral flex items-center gap-2">

              <BookOpen className="h-3.5 w-3.5" />

              RYC Journal

            </div>


            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">

              Read{' '}

              <em className="font-light">
                before you apply.
              </em>

            </h2>

          </div>


          <p className="lg:col-span-5 text-ink/70 text-[15px] leading-relaxed">

            Practical guides on MBBS abroad,
            NEET, universities, admissions,
            visas and student life — published
            by Route Your Career.

          </p>

        </div>


        {/* =============================== */}
        {/* LOADING */}
        {/* =============================== */}

        {loading && (

          <div className="mt-12 flex items-center justify-center gap-2 text-ink/60">

            <Loader2 className="h-5 w-5 animate-spin" />

            <span className="text-[13px]">
              Loading articles...
            </span>

          </div>

        )}


        {/* =============================== */}
        {/* ERROR */}
        {/* =============================== */}

        {!loading && error && (

          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">

            {error}

          </div>

        )}


        {/* =============================== */}
        {/* NO BLOGS */}
        {/* =============================== */}

        {!loading &&
          !error &&
          blogs.length === 0 && (

            <div className="mt-10 rounded-3xl bg-white border border-ink/10 px-6 py-12 text-center">

              <BookOpen className="h-8 w-8 mx-auto text-coral" />

              <h3 className="serif mt-4 text-2xl text-ink">

                The new RYC Journal is coming.

              </h3>

              <p className="mt-2 text-[14px] text-ink/60">

                New guides and counselling
                resources will be published here soon.

              </p>

            </div>

          )}


        {/* =============================== */}
        {/* CATEGORY FILTER */}
        {/* =============================== */}

        {!loading &&
          !error &&
          blogs.length > 0 && (

            <div className="mt-6 inline-flex rounded-full bg-white border border-ink/10 p-1 overflow-x-auto max-w-full">

              {categories.map(
                (category) => (

                  <button
                    key={category}
                    onClick={() =>
                      setCat(category)
                    }
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors ${
                      cat === category
                        ? 'bg-ink text-cream'
                        : 'text-ink/60 hover:text-ink'
                    }`}
                  >

                    {category}

                  </button>

                )
              )}

            </div>

          )}


        {/* =============================== */}
        {/* BLOG CARDS */}
        {/* =============================== */}

        {!loading &&
          !error &&
          filteredBlogs.length > 0 && (

            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredBlogs.map(
                (blog) => {

                  const publishedDate =
                    formatBlogDate(
                      blog.published_at ||
                      blog.created_at
                    );

                  return (

                    <Link
                      key={
                        blog.id ||
                        blog.slug
                      }
                      to={`/blog/${blog.slug}`}
                      className="group rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift block"
                    >


                      {/* =============================== */}
                      {/* DEFAULT BLOG IMAGE */}
                      {/* =============================== */}

                      <div className="aspect-[16/10] overflow-hidden bg-ink/5">

                        <img
                          src="/blog-default.png"
                          alt={blog.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                      </div>


                      {/* =============================== */}
                      {/* CARD CONTENT */}
                      {/* =============================== */}

                      <div className="p-5">


                        {/* CATEGORY */}

                        <div className="flex items-center justify-between gap-3">

                          <span className="inline-flex items-center rounded-full bg-cream border border-ink/10 text-ink text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">

                            {blog.category || 'MBBS'}

                          </span>

                        </div>


                        {/* =============================== */}
                        {/* REAL PUBLICATION DATE */}
                        {/* + READING TIME */}
                        {/* =============================== */}

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] mono uppercase tracking-widest text-ink/40">


                          {publishedDate && (

                            <span className="flex items-center gap-1">

                              <CalendarDays className="h-3 w-3" />

                              {publishedDate}

                            </span>

                          )}


                          <span className="flex items-center gap-1">

                            <Clock className="h-3 w-3" />

                            {blog.read_time || 5} min read

                          </span>

                        </div>


                        {/* TITLE */}

                        <h3 className="mt-3 serif text-[22px] font-medium text-ink leading-snug">

                          {blog.title}

                        </h3>


                        {/* EXCERPT */}

                        <p className="mt-2 text-[13px] text-ink/70 leading-relaxed">

                          {blog.excerpt}

                        </p>


                        {/* READ BUTTON */}

                        <div className="mt-4 inline-flex items-center gap-1 text-ink group-hover:text-coral font-semibold text-[13px]">

                          Read the story

                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

                        </div>

                      </div>

                    </Link>

                  );
                }
              )}

            </div>

          )}

      </div>

    </section>
  );
}
