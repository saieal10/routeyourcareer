import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Clock,
  ArrowUpRight,
  BookOpen,
  Loader2,
  CalendarDays
} from 'lucide-react';


const BACKEND_URL =
  'https://routeyourcareer.onrender.com';


function formatBlogDate(value) {

  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  );
}


export default function Blogs() {

  const [blogs, setBlogs] =
    useState([]);

  const [category, setCategory] =
    useState('All');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  /*
  =========================================================
  LOAD BLOGS
  =========================================================
  */

  useEffect(() => {

    let mounted = true;


    async function loadBlogs() {

      try {

        setLoading(true);
        setError('');


        const response =
          await fetch(
            `${BACKEND_URL}/api/blogs`,
            {
              method: 'GET',
              headers: {
                Accept:
                  'application/json'
              }
            }
          );


        if (!response.ok) {

          throw new Error(
            `Blog request failed: ${response.status}`
          );

        }


        const data =
          await response.json();


        if (!mounted) {
          return;
        }


        const list =
          Array.isArray(data)
            ? data
            : [];


        /*
        Only published posts.

        Backend already does this,
        but this gives us an extra
        safety check.
        */

        const published =
          list.filter(
            (blog) =>
              blog &&
              blog.status ===
                'published'
          );


        /*
        Newest first
        */

        published.sort(
          (a, b) => {

            const aDate =
              new Date(
                a.published_at ||
                a.created_at ||
                0
              ).getTime();

            const bDate =
              new Date(
                b.published_at ||
                b.created_at ||
                0
              ).getTime();


            return bDate - aDate;

          }
        );


        setBlogs(published);

      }

      catch (err) {

        console.error(
          'RYC blog error:',
          err
        );


        if (mounted) {

          setError(
            'We could not load the RYC Journal right now.'
          );

        }

      }

      finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }


    loadBlogs();


    return () => {

      mounted = false;

    };

  }, []);


  /*
  =========================================================
  CATEGORIES
  =========================================================
  */

  const categories = [
    'All',
    ...Array.from(
      new Set(
        blogs
          .map(
            (blog) =>
              blog.category
          )
          .filter(Boolean)
      )
    )
  ];


  /*
  =========================================================
  FILTER
  =========================================================
  */

  const visibleBlogs =
    category === 'All'

      ? blogs

      : blogs.filter(
          (blog) =>
            blog.category ===
            category
        );


  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (

    <section
      id="blog"
      className="py-24 bg-cream"
    >

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
        "
      >


        {/* =================================================
            HEADING
        ================================================= */}

        <div
          className="
            grid
            lg:grid-cols-12
            gap-8
            items-end
          "
        >

          <div
            className="lg:col-span-7"
          >

            <div
              className="
                text-[11px]
                mono
                uppercase
                tracking-widest
                text-coral
                flex
                items-center
                gap-2
              "
            >

              <BookOpen
                className="h-3.5 w-3.5"
              />

              RYC Journal

            </div>


            <h2
              className="
                serif
                mt-3
                text-5xl
                sm:text-6xl
                font-normal
                leading-[0.95]
                text-ink
              "
            >

              Read{' '}

              <em
                className="font-light"
              >
                before you apply.
              </em>

            </h2>

          </div>


          <div
            className="lg:col-span-5"
          >

            <p
              className="
                text-ink/70
                text-[15px]
                leading-relaxed
              "
            >

              Practical guides on
              MBBS abroad, NEET,
              universities, admissions,
              visas and student life —
              published by Route Your
              Career.

            </p>


            {!loading &&
              !error &&
              blogs.length > 0 && (

                <div
                  className="
                    mt-3
                    text-[11px]
                    mono
                    uppercase
                    tracking-widest
                    text-coral
                  "
                >

                  {blogs.length}
                  {' '}
                  published articles

                </div>

              )}

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div
            className="
              mt-12
              min-h-[180px]
              flex
              items-center
              justify-center
              gap-2
              text-ink/60
            "
          >

            <Loader2
              className="
                h-5
                w-5
                animate-spin
              "
            />

            <span
              className="text-[13px]"
            >
              Loading RYC Journal...
            </span>

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading &&
          error && (

            <div
              className="
                mt-10
                rounded-3xl
                border
                border-red-200
                bg-red-50
                px-6
                py-8
                text-center
              "
            >

              <BookOpen
                className="
                  h-7
                  w-7
                  mx-auto
                  text-red-500
                "
              />


              <div
                className="
                  mt-3
                  text-[14px]
                  text-red-700
                "
              >

                {error}

              </div>

            </div>

          )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          blogs.length === 0 && (

            <div
              className="
                mt-10
                rounded-3xl
                bg-white
                border
                border-ink/10
                px-6
                py-12
                text-center
              "
            >

              <BookOpen
                className="
                  h-8
                  w-8
                  mx-auto
                  text-coral
                "
              />


              <h3
                className="
                  serif
                  mt-4
                  text-2xl
                  text-ink
                "
              >

                No published articles yet.

              </h3>

            </div>

          )}


        {/* =================================================
            CATEGORIES
        ================================================= */}

        {!loading &&
          !error &&
          blogs.length > 0 && (

            <div
              className="
                mt-8
                flex
                flex-wrap
                gap-2
              "
            >

              {categories.map(
                (item) => (

                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setCategory(item)
                    }
                    className={`
                      rounded-full
                      border
                      px-4
                      py-2
                      text-[12px]
                      font-semibold
                      transition-colors

                      ${
                        category === item

                          ? `
                            bg-ink
                            text-cream
                            border-ink
                          `

                          : `
                            bg-white
                            text-ink/65
                            border-ink/10
                            hover:text-ink
                          `
                      }
                    `}
                  >

                    {item}

                  </button>

                )
              )}

            </div>

          )}


        {/* =================================================
            BLOG CARDS
        ================================================= */}

        {!loading &&
          !error &&
          visibleBlogs.length > 0 && (

            <div
              className="
                mt-8
                grid
                sm:grid-cols-2
                lg:grid-cols-3
                gap-5
              "
            >

              {visibleBlogs.map(
                (blog) => {

                  const date =
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
                      to={
                        `/blog/${blog.slug}`
                      }
                      className="
                        group
                        rounded-3xl
                        overflow-hidden
                        bg-white
                        border
                        border-ink/10
                        card-lift
                        flex
                        flex-col
                      "
                    >


                      {/* IMAGE */}

                      <div
                        className="
                          aspect-[16/10]
                          overflow-hidden
                          bg-sand
                        "
                      >

                        <img
                          src={
                            blog.hero_image ||
                            '/blog-default.png'
                          }
                          alt={
                            blog.title ||
                            'Route Your Career article'
                          }
                          loading="lazy"
                          onError={
                            (e) => {

                              e.currentTarget.onerror =
                                null;

                              e.currentTarget.src =
                                '/blog-default.png';

                            }
                          }
                          className="
                            w-full
                            h-full
                            object-cover
                            transition-transform
                            duration-700
                            group-hover:scale-105
                          "
                        />

                      </div>


                      {/* CONTENT */}

                      <div
                        className="
                          p-5
                          flex
                          flex-col
                          flex-1
                        "
                      >


                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >

                          <span
                            className="
                              inline-flex
                              items-center
                              rounded-full
                              bg-cream
                              border
                              border-ink/10
                              text-ink
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-widest
                              px-2
                              py-1
                            "
                          >

                            {
                              blog.category ||
                              'Guide'
                            }

                          </span>

                        </div>


                        <div
                          className="
                            mt-3
                            flex
                            flex-wrap
                            items-center
                            gap-x-4
                            gap-y-1
                            text-[10px]
                            mono
                            uppercase
                            tracking-widest
                            text-ink/40
                          "
                        >


                          {date && (

                            <span
                              className="
                                flex
                                items-center
                                gap-1
                              "
                            >

                              <CalendarDays
                                className="h-3 w-3"
                              />

                              {date}

                            </span>

                          )}


                          <span
                            className="
                              flex
                              items-center
                              gap-1
                            "
                          >

                            <Clock
                              className="h-3 w-3"
                            />

                            {
                              blog.read_time ||
                              5
                            }
                            {' '}
                            min read

                          </span>

                        </div>


                        <h3
                          className="
                            mt-3
                            serif
                            text-[22px]
                            font-medium
                            text-ink
                            leading-snug
                          "
                        >

                          {blog.title}

                        </h3>


                        <p
                          className="
                            mt-2
                            text-[13px]
                            text-ink/70
                            leading-relaxed
                          "
                        >

                          {blog.excerpt}

                        </p>


                        <div
                          className="
                            mt-auto
                            pt-5
                            inline-flex
                            items-center
                            gap-1
                            text-ink
                            group-hover:text-coral
                            font-semibold
                            text-[13px]
                          "
                        >

                          Read article

                          <ArrowUpRight
                            className="
                              h-4
                              w-4
                              transition-transform
                              group-hover:rotate-45
                            "
                          />

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
