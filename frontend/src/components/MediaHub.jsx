import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Play,
  Quote,
  Youtube
} from 'lucide-react';


/* =========================================================
   BACKEND
========================================================= */

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  'https://routeyourcareer.onrender.com';


/* =========================================================
   VIDEO CARD
========================================================= */

function VideoCard({
  item,
  testimonial = false
}) {

  return (

    <a
      href={item.youtube_url}
      target="_blank"
      rel="noreferrer"

      className="
        group

        block

        w-[275px]
        sm:w-[310px]
        lg:w-[340px]

        shrink-0

        rounded-[24px]

        overflow-hidden

        bg-white

        border
        border-ink/10

        shadow-sm

        hover:shadow-xl
        hover:-translate-y-1

        transition-all
        duration-300
      "
    >

      {/* ===================================================
          THUMBNAIL
      =================================================== */}

      <div
        className="
          relative

          aspect-video

          overflow-hidden

          bg-ink
        "
      >

        {item.thumbnail_url ? (

          <img
            src={item.thumbnail_url}
            alt={
              item.title ||
              'Route Your Career video'
            }
            loading="lazy"

            className="
              h-full
              w-full

              object-cover

              transition-transform
              duration-500

              group-hover:scale-105
            "
          />

        ) : (

          <div
            className="
              h-full
              w-full

              grid
              place-items-center

              bg-ink

              text-cream/40
            "
          >

            <Youtube
              className="
                h-10
                w-10
              "
            />

          </div>

        )}


        {/* DARK OVERLAY */}

        <div
          className="
            absolute
            inset-0

            bg-gradient-to-t

            from-black/45
            via-transparent
            to-transparent
          "
        />


        {/* PLAY BUTTON */}

        <div
          className="
            absolute
            inset-0

            grid
            place-items-center
          "
        >

          <div
            className="
              h-14
              w-14

              rounded-full

              bg-white/95

              text-coral

              shadow-xl

              grid
              place-items-center

              transition-transform

              group-hover:scale-110
            "
          >

            <Play
              className="
                h-5
                w-5

                fill-current

                ml-0.5
              "
            />

          </div>

        </div>


        {/* VIDEO TYPE */}

        <div
          className="
            absolute

            top-3
            left-3

            rounded-full

            bg-ink/90

            backdrop-blur

            px-3
            py-1.5

            text-[8px]

            mono
            uppercase

            tracking-[0.16em]

            text-cream
          "
        >

          {testimonial
            ? 'Student Story'
            : 'RYC Guide'}

        </div>

      </div>


      {/* ===================================================
          CARD CONTENT
      =================================================== */}

      <div className="p-4 sm:p-5">

        {testimonial && (

          <div
            className="
              flex
              items-center
              gap-1.5

              mb-2

              text-coral
            "
          >

            <Quote
              className="
                h-3.5
                w-3.5
              "
            />


            <span
              className="
                text-[8px]

                mono
                uppercase

                tracking-widest
              "
            >
              Student Experience
            </span>

          </div>

        )}


        <h3
          className="
            text-[14px]
            sm:text-[15px]

            font-bold

            leading-snug

            text-ink

            line-clamp-2
          "
        >
          {item.title}
        </h3>


        {item.description && (

          <p
            className="
              mt-2

              text-[11px]
              sm:text-[12px]

              leading-relaxed

              text-ink/50

              line-clamp-2
            "
          >
            {item.description}
          </p>

        )}


        {/* TESTIMONIAL DETAILS */}

        {testimonial && (

          <div
            className="
              mt-4
              pt-3

              border-t
              border-ink/10
            "
          >

            {item.student_name && (

              <div
                className="
                  text-[12px]

                  font-bold

                  text-ink
                "
              >
                {item.student_name}
              </div>

            )}


            {(item.university ||
              item.country) && (

              <div
                className="
                  mt-1

                  text-[10px]

                  leading-relaxed

                  text-ink/45
                "
              >

                {[
                  item.university,
                  item.country
                ]
                  .filter(Boolean)
                  .join(' · ')}

              </div>

            )}

          </div>

        )}


        <div
          className="
            mt-4

            inline-flex
            items-center
            gap-1

            text-[10px]

            font-semibold

            text-coral
          "
        >

          Watch video

          <ArrowUpRight
            className="
              h-3
              w-3
            "
          />

        </div>

      </div>

    </a>

  );

}


/* =========================================================
   HORIZONTAL MEDIA ROW
========================================================= */

function MediaRow({
  eyebrow,
  title,
  italicTitle,
  description,
  items,
  testimonial = false,
  youtube = false
}) {

  const scrollRef =
    useRef(null);


  const scroll =
    direction => {

      if (!scrollRef.current) {
        return;
      }


      const amount =
        Math.min(
          720,
          scrollRef.current.clientWidth * 0.8
        );


      scrollRef.current.scrollBy({

        left:
          direction === 'left'
            ? -amount
            : amount,

        behavior: 'smooth'

      });

    };


  return (

    <section
      className="
        py-10
        sm:py-12

        border-t
        border-ink/10

        first:border-t-0
      "
    >

      {/* ===================================================
          ROW HEADING
      =================================================== */}

      <div
        className="
          flex

          flex-col
          lg:flex-row

          lg:items-end
          lg:justify-between

          gap-5
        "
      >

        <div className="max-w-3xl">

          <div
            className="
              flex
              items-center
              gap-2

              text-[9px]

              mono
              uppercase

              tracking-[0.2em]

              text-coral
            "
          >

            {testimonial && (

              <Quote
                className="
                  h-3.5
                  w-3.5
                "
              />

            )}


            {youtube && (

              <Youtube
                className="
                  h-4
                  w-4
                "
              />

            )}


            {eyebrow}

          </div>


          <h3
            className="
              serif

              text-3xl
              sm:text-4xl
              lg:text-[44px]

              leading-[1]

              mt-2
            "
          >

            {title}{' '}

            {italicTitle && (

              <span className="italic">
                {italicTitle}
              </span>

            )}

          </h3>


          <p
            className="
              mt-3

              max-w-2xl

              text-[12px]
              sm:text-[13px]

              leading-relaxed

              text-ink/50
            "
          >
            {description}
          </p>

        </div>


        {/* =================================================
            ARROWS
        ================================================= */}

        {items.length > 0 && (

          <div
            className="
              hidden
              sm:flex

              items-center
              gap-2

              shrink-0
            "
          >

            <button
              type="button"

              onClick={() =>
                scroll('left')
              }

              className="
                h-10
                w-10

                rounded-full

                border
                border-ink/15

                bg-white

                grid
                place-items-center

                hover:bg-ink
                hover:text-cream

                transition
              "

              aria-label="Scroll left"
            >

              <ArrowLeft
                className="
                  h-4
                  w-4
                "
              />

            </button>


            <button
              type="button"

              onClick={() =>
                scroll('right')
              }

              className="
                h-10
                w-10

                rounded-full

                bg-ink

                text-cream

                grid
                place-items-center

                hover:bg-coral

                transition
              "

              aria-label="Scroll right"
            >

              <ArrowRight
                className="
                  h-4
                  w-4
                "
              />

            </button>

          </div>

        )}

      </div>


      {/* ===================================================
          VIDEOS
      =================================================== */}

      {items.length > 0 ? (

        <div
          ref={scrollRef}

          className="
            mt-7

            flex

            gap-4
            sm:gap-5

            overflow-x-auto

            pb-4

            snap-x
            snap-mandatory

            scroll-smooth

            [scrollbar-width:none]

            [&::-webkit-scrollbar]:hidden
          "
        >

          {items.map(
            item => (

              <div
                key={item.id}

                className="
                  snap-start
                  shrink-0
                "
              >

                <VideoCard
                  item={item}
                  testimonial={testimonial}
                />

              </div>

            )
          )}

        </div>

      ) : (

        <div
          className="
            mt-7

            rounded-[24px]

            border
            border-dashed
            border-ink/15

            bg-white/50

            px-6
            py-10

            text-center
          "
        >

          {testimonial ? (

            <Quote
              className="
                h-7
                w-7

                mx-auto

                text-ink/20
              "
            />

          ) : (

            <Youtube
              className="
                h-8
                w-8

                mx-auto

                text-ink/20
              "
            />

          )}


          <div
            className="
              mt-3

              text-[12px]

              text-ink/40
            "
          >

            {testimonial
              ? 'Student testimonials coming soon.'
              : 'New RYC videos coming soon.'}

          </div>

        </div>

      )}

    </section>

  );

}


/* =========================================================
   MEDIA HUB
========================================================= */

export default function MediaHub() {

  const [
    media,
    setMedia
  ] =
    useState([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    error,
    setError
  ] =
    useState('');


  /* =======================================================
     LOAD MEDIA FROM ADMIN / BACKEND
  ======================================================= */

  useEffect(() => {

    let active =
      true;


    async function loadMedia() {

      try {

        setLoading(true);

        setError('');


        const response =
          await fetch(
            `${BACKEND_URL}/api/media`
          );


        if (!response.ok) {

          throw new Error(
            `Media request failed (${response.status})`
          );

        }


        const data =
          await response.json();


        if (active) {

          setMedia(
            Array.isArray(data)
              ? data
              : []
          );

        }

      }

      catch (err) {

        console.error(
          'MediaHub error:',
          err
        );


        if (active) {

          setError(
            'Videos are temporarily unavailable.'
          );

        }

      }

      finally {

        if (active) {

          setLoading(false);

        }

      }

    }


    loadMedia();


    return () => {

      active =
        false;

    };

  }, []);


  /* =======================================================
     SEPARATE ADMIN TYPES
  ======================================================= */

  const testimonials =
    useMemo(
      () =>
        media.filter(
          item =>
            item.type ===
            'testimonial'
        ),
      [
        media
      ]
    );


  const youtubeVideos =
    useMemo(
      () =>
        media.filter(
          item =>
            item.type ===
            'youtube'
        ),
      [
        media
      ]
    );


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <section
        id="stories"

        className="
          scroll-mt-28

          max-w-7xl
          mx-auto

          px-4
          sm:px-6

          py-16
        "
      >

        <div
          className="
            h-[140px]

            rounded-[28px]

            border
            border-ink/10

            bg-white

            animate-pulse
          "
        />

      </section>

    );

  }


  /* =======================================================
     MEDIA HUB
  ======================================================= */

  return (

    <section
      id="stories"

      className="
        scroll-mt-28

        bg-cream

        py-8
        sm:py-12
      "
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
            MAIN HEADER
        ================================================= */}

        <div
          className="
            max-w-4xl

            mb-4
          "
        >

          <div
            className="
              text-[9px]

              mono
              uppercase

              tracking-[0.22em]

              text-coral
            "
          >
            Route Your Career · Media
          </div>


          <h2
            className="
              serif

              text-4xl
              sm:text-5xl
              lg:text-6xl

              leading-[0.95]

              mt-3
            "
          >

            See the journey
            <br />

            <span className="italic">
              before you choose yours.
            </span>

          </h2>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className="
              mt-5

              rounded-xl

              border
              border-red-100

              bg-red-50

              px-4
              py-3

              text-[11px]

              text-red-700
            "
          >
            {error}
          </div>

        )}


        {/* =================================================
            ROW 1 — STUDENT TESTIMONIALS
        ================================================= */}

        <MediaRow

          eyebrow="Student Testimonials"

          title="Real students."

          italicTitle="Real stories."

          description="
            Hear directly from students about their university,
            destination and study-abroad experience.
          "

          items={
            testimonials
          }

          testimonial

        />


        {/* =================================================
            ROW 2 — YOUTUBE
        ================================================= */}

        <MediaRow

          eyebrow="RYC on YouTube"

          title="Guidance before"

          italicTitle="you decide."

          description="
            University guides, country explainers, admission
            updates and practical study-abroad guidance from
            Route Your Career.
          "

          items={
            youtubeVideos
          }

          youtube

        />


        {/* =================================================
            YOUTUBE CHANNEL CTA
        ================================================= */}

        <div
          className="
            flex
            justify-end

            pt-2
          "
        >

          <a
            href="https://www.youtube.com/@route_your_career"

            target="_blank"
            rel="noreferrer"

            className="
              inline-flex
              items-center
              gap-2

              rounded-full

              border
              border-ink/15

              bg-white

              px-5
              py-3

              text-[11px]

              font-semibold

              hover:bg-ink
              hover:text-cream

              transition
            "
          >

            <Youtube
              className="
                h-4
                w-4
              "
            />

            Visit RYC on YouTube

            <ArrowUpRight
              className="
                h-3.5
                w-3.5
              "
            />

          </a>

        </div>

      </div>

    </section>

  );

}
