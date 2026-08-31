import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowUpRight,
  BookOpen,
  Search,
  Sparkles
} from 'lucide-react';

import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';


const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://routeyourcareer.onrender.com';


export default function BlogsPage() {

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');


  /* =====================================================
     LOAD EXISTING BLOGS FROM BACKEND
  ===================================================== */

  useEffect(() => {

    let cancelled = false;

    async function loadBlogs() {

      try {

        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/blogs`
        );

        if (!response.ok) {
          throw new Error('Could not load blogs');
        }

        const data = await response.json();

        if (!cancelled) {

          setBlogs(
            Array.isArray(data)
              ? data
              : []
          );

        }

      }

      catch (error) {

        console.error(
          'Blogs page error:',
          error
        );

      }

      finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }

    loadBlogs();

    return () => {
      cancelled = true;
    };

  }, []);


  /* =====================================================
     BUILD CATEGORIES FROM EXISTING BLOGS
  ===================================================== */

  const categories = useMemo(() => {

    const values = blogs
      .map(blog => blog.category)
      .filter(Boolean);

    return [
      'All',
      ...Array.from(
        new Set(values)
      ).sort()
    ];

  }, [blogs]);


  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const filteredBlogs = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    return blogs.filter(blog => {

      const categoryMatches =
        category === 'All' ||
        blog.category === category;

      const searchableText = [
        blog.title,
        blog.excerpt,
        blog.category,
        blog.country
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const searchMatches =
        !query ||
        searchableText.includes(query);

      return (
        categoryMatches &&
        searchMatches
      );

    });

  }, [blogs, search, category]);


  return (

    <div className="min-h-screen bg-cream text-ink">

      <AnnouncementBar />

      <Navbar />


      {/* ===================================================
          HERO
      =================================================== */}

      <section className="border-b border-ink/10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">

          <div className="grid lg:grid-cols-[1fr_0.65fr] gap-10 items-end">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral/[0.06] px-3 py-2 text-[9px] mono uppercase tracking-[0.2em] text-coral">

                <Sparkles className="h-3.5 w-3.5" />

                RYC Journal

              </div>


              <h1 className="serif mt-5 text-5xl sm:text-6xl lg:text-7xl leading-[0.92]">

                Guidance for your

                <br />

                <span className="italic">
                  global career.
                </span>

              </h1>

            </div>


            <div>

              <p className="max-w-lg text-[13px] sm:text-[14px] leading-relaxed text-ink/55">

                Explore Route Your Career guides covering
                MBBS abroad, management programmes,
                universities, Italy admissions, application
                guidance and international education.

              </p>


              <div className="mt-6 flex items-center gap-2 text-[10px] mono uppercase tracking-[0.18em] text-ink/40">

                <BookOpen className="h-4 w-4" />

                {blogs.length} published articles

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          SEARCH + CATEGORIES
      =================================================== */}

      <section className="sticky top-[76px] z-30 border-b border-ink/10 bg-cream/95 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex flex-col lg:flex-row lg:items-center gap-3">


            {/* SEARCH */}

            <div className="relative lg:w-[320px] shrink-0">

              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search articles..."
                className="w-full rounded-full border border-ink/10 bg-white pl-11 pr-4 py-3 text-[12px] outline-none focus:border-coral/50"
              />

            </div>


            {/* CATEGORIES */}

            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {categories.map(item => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`
                    shrink-0
                    rounded-full
                    px-4
                    py-2.5
                    text-[10px]
                    font-semibold
                    transition

                    ${
                      category === item
                        ? 'bg-ink text-cream'
                        : 'border border-ink/10 bg-white text-ink/60 hover:border-ink/25'
                    }
                  `}
                >

                  {item}

                </button>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          BLOG CONTENT
      =================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">


        {/* LOADING */}

        {loading ? (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {[1, 2, 3, 4, 5, 6].map(item => (

              <div
                key={item}
                className="h-[390px] rounded-[26px] bg-white border border-ink/10 animate-pulse"
              />

            ))}

          </div>

        ) : filteredBlogs.length === 0 ? (


          /* NO BLOGS */

          <div className="rounded-[28px] border border-dashed border-ink/15 py-20 text-center">

            <BookOpen className="mx-auto h-8 w-8 text-ink/20" />

            <h2 className="serif mt-4 text-3xl">
              No articles found.
            </h2>

            <p className="mt-2 text-[12px] text-ink/45">
              Try another search or category.
            </p>

          </div>

        ) : (


          /* BLOG GRID */

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">

            {filteredBlogs.map((blog, index) => (

              <Link
                key={
                  blog.id ||
                  blog._id ||
                  blog.slug
                }
                to={`/blog/${blog.slug}`}
                className={`
                  group
                  overflow-hidden
                  rounded-[26px]
                  border
                  border-ink/10
                  bg-white
                  hover:-translate-y-1
                  hover:shadow-xl
                  transition-all

                  ${
                    index === 0
                      ? 'md:col-span-2 lg:col-span-2'
                      : ''
                  }
                `}
              >


                {/* IMAGE */}

                <div
                  className={`
                    relative
                    overflow-hidden
                    bg-ink/[0.04]

                    ${
                      index === 0
                        ? 'aspect-[16/7]'
                        : 'aspect-[16/10]'
                    }
                  `}
                >

                  {blog.image ? (

                    <img
                      src={blog.image}
                      alt={blog.title || 'Route Your Career article'}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />

                  ) : (

                    <div className="h-full w-full grid place-items-center bg-ink">

                      <div className="serif italic text-6xl text-cream/20">
                        r
                      </div>

                    </div>

                  )}


                  {blog.category && (

                    <div className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[8px] mono uppercase tracking-widest">

                      {blog.category}

                    </div>

                  )}

                </div>


                {/* TEXT */}

                <div className="p-5 sm:p-6">

                  <h2
                    className={`
                      serif
                      leading-[1.05]

                      ${
                        index === 0
                          ? 'text-3xl sm:text-4xl'
                          : 'text-2xl'
                      }
                    `}
                  >

                    {blog.title}

                  </h2>


                  {blog.excerpt && (

                    <p className="mt-3 text-[12px] leading-relaxed text-ink/50 line-clamp-3">

                      {blog.excerpt}

                    </p>

                  )}


                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-ink/[0.07] pt-4">

                    <span className="text-[9px] mono uppercase tracking-widest text-ink/35">

                      Route Your Career

                    </span>


                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-coral">

                      Read article

                      <ArrowUpRight className="h-3.5 w-3.5" />

                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </main>


      <Footer />

      <AiChatWidget />

    </div>

  );

}
