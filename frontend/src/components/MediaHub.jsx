import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Youtube,
  Quote,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  'https://routeyourcareer.onrender.com';


export default function MediaHub() {

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  /* ======================================================
     LOAD PUBLISHED MEDIA
  ====================================================== */

  useEffect(() => {

    let active = true;

    async function loadMedia() {

      setLoading(true);
      setError('');

      try {

        const response = await fetch(
          `${BACKEND_URL}/api/media`
        );

        if (!response.ok) {
          throw new Error(
            `Media request failed (${response.status})`
          );
        }

        const data = await response.json();

        if (active) {
          setMedia(
            Array.isArray(data) ? data : []
          );
        }

      } catch (err) {

        console.error(
          'Could not load homepage media:',
          err
        );

        if (active) {
          setError(
            'Videos are temporarily unavailable.'
          );
        }

      } finally {

        if (active) {
          setLoading(false);
        }

      }

    }

    loadMedia();

    return () => {
      active = false;
    };

  }, []);


  /* ======================================================
     SEPARATE VIDEOS + TESTIMONIALS
  ====================================================== */

  const youtubeVideos = useMemo(
    () =>
      media.filter(
        item => item.type === 'youtube'
      ),
    [media]
  );


  const testimonials = useMemo(
    () =>
      media.filter(
        item => item.type === 'testimonial'
      ),
    [media]
  );


  /* ======================================================
     VIDEO CARD
  ====================================================== */

  const VideoCard = ({
    item,
    testimonial = false
  }) => {

    return (

      <a
        href={item.youtube_url}
        target="_blank"
        rel="noreferrer"
        className="
          group
          block
          min-w-[280px]
          sm:min-w-[320px]
          lg:min-w-[350px]
          max-w-[350px]
          rounded-[26px]
          overflow-hidden
          bg-white
          border
          border-ink/10
          hover:border-coral/40
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-xl
        "
      >

        {/* THUMBNAIL */}

        <div className="
          relative
          aspect-video
          bg-ink/5
          overflow-hidden
        ">

          {item.thumbnail_url ? (

            <img
              src={item.thumbnail_url}
              alt={item.title || ''}
              loading="lazy"
              className="
                w-full
                h-full
                object-cover
                group-hover:scale-[1.03]
                transition-transform
                duration-500
              "
            />

          ) : (

            <div className="
              w-full
              h-full
              grid
              place-items-center
              bg-ink
              text-cream
            ">

              <Youtube className="h-10 w-10" />

            </div>

          )}


          {/* PLAY BUTTON */}

          <div className="
            absolute
            inset-0
            grid
            place-items-center
          ">

            <div className="
              h-14
              w-14
              rounded-full
              bg-white/95
              text-coral
              shadow-xl
              grid
              place-items-center
              group-hover:scale-110
              transition-transform
            ">

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


          {/* TYPE */}

          <div className="
            absolute
            left-3
            top-3
            rounded-full
            bg-ink/90
            backdrop-blur
            text-cream
            px-3
            py-1.5
            text-[9px]
            mono
            uppercase
            tracking-widest
          ">

            {testimonial
              ? 'Student Story'
              : 'RYC Guide'}

          </div>

        </div>


        {/* CONTENT */}

        <div className="p-5">

          {testimonial && (

            <div className="
              flex
              items-center
              gap-2
              text-coral
              mb-2
            ">

              <Quote className="h-4 w-4" />

              <span className="
                text-[9px]
                mono
                uppercase
                tracking-widest
              ">
                Student Experience
              </span>

            </div>

          )}


          <h3 className="
            font-bold
            text-[15px]
            leading-snug
            text-ink
            line-clamp-2
          ">

            {item.title}

          </h3>


          {item.description && (

            <p className="
              mt-2
              text-[12px]
              leading-relaxed
              text-ink/55
              line-clamp-2
            ">

              {item.description}

            </p>

          )}


          {testimonial && (

            <div className="
              mt-4
              pt-4
              border-t
              border-ink/10
            ">

              {item.student_name && (

                <div className="
                  font-bold
                  text-[12px]
                  text-ink
                ">

                  {item.student_name}

                </div>

              )}


              {(item.university ||
                item.country) && (

                <div className="
                  text-[10px]
                  text-ink/45
                  mt-1
                ">

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


          <div className="
            mt-4
            inline-flex
            items-center
            gap-1
            text-[11px]
            font-semibold
            text-coral
          ">

            Watch video

            <ArrowUpRight className="h-3 w-3" />

          </div>

        </div>

      </a>

    );

  };


  /* ======================================================
     LOADING
  ====================================================== */

  if (loading) {

    return (

      <section className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        py-16
      ">

        <div className="
          rounded-[30px]
          border
          border-ink/10
          bg-white
          py-16
          grid
          place-items-center
        ">

          <div className="
            flex
            items-center
            gap-2
            text-[12px]
            text-ink/50
          ">

            <RefreshCw
              className="
                h-4
                w-4
                animate-spin
              "
            />

            Loading student stories…

          </div>

        </div>

      </section>

    );

  }


  /* ======================================================
     DON'T SHOW EMPTY SECTION
  ====================================================== */

  if (
    !youtubeVideos.length &&
    !testimonials.length
  ) {

    return null;

  }


  return (

    <section
      id="stories"
      className="
        py-16
        sm:py-20
        overflow-hidden
      "
    >

      <div className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
      ">


        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div className="
          flex
          flex-col
          lg:flex-row
          lg:items-end
          justify-between
          gap-5
          mb-10
        ">

          <div>

            <div className="
              text-[10px]
              mono
              uppercase
              tracking-[0.2em]
              text-coral
            ">

              Watch · Learn · Decide

            </div>


            <h2 className="
              serif
              text-4xl
              sm:text-5xl
              lg:text-6xl
              leading-[0.95]
              mt-3
            ">

              Real guidance.
              <br />

              <span className="italic">
                Real student stories.
              </span>

            </h2>

          </div>


          <p className="
            max-w-md
            text-[13px]
            leading-relaxed
            text-ink/55
          ">

            Explore Route Your Career videos and
            hear directly from students about their
            study-abroad journey.

          </p>

        </div>


        {error && (

          <div className="
            mb-6
            rounded-xl
            bg-red-50
            border
            border-red-100
            px-4
            py-3
            text-[11px]
            text-red-700
          ">

            {error}

          </div>

        )}


        {/* =================================================
            TWO COLUMN DESKTOP LAYOUT
        ================================================= */}

        <div className="
          grid
          lg:grid-cols-2
          gap-6
        ">


          {/* =================================================
              TESTIMONIALS
          ================================================= */}

          {testimonials.length > 0 && (

            <div className="
              rounded-[30px]
              bg-ink
              text-cream
              p-5
              sm:p-7
              overflow-hidden
            ">

              <div className="
                flex
                items-center
                justify-between
                gap-4
                mb-6
              ">

                <div>

                  <div className="
                    text-[9px]
                    mono
                    uppercase
                    tracking-[0.2em]
                    text-coral
                  ">

                    Student Testimonials

                  </div>

                  <h3 className="
                    serif
                    text-3xl
                    mt-1
                  ">

                    Their journey.

                  </h3>

                </div>


                <Quote className="
                  h-7
                  w-7
                  text-cream/20
                " />

              </div>


              {/* HORIZONTAL SCROLL */}

              <div className="
                flex
                gap-4
                overflow-x-auto
                pb-3
                snap-x
                snap-mandatory
                scrollbar-hide
              ">

                {testimonials.map(item => (

                  <div
                    key={item.id}
                    className="snap-start"
                  >

                    <VideoCard
                      item={item}
                      testimonial
                    />

                  </div>

                ))}

              </div>

            </div>

          )}


          {/* =================================================
              YOUTUBE
          ================================================= */}

          {youtubeVideos.length > 0 && (

            <div className="
              rounded-[30px]
              bg-white
              border
              border-ink/10
              p-5
              sm:p-7
              overflow-hidden
            ">

              <div className="
                flex
                items-center
                justify-between
                gap-4
                mb-6
              ">

                <div>

                  <div className="
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    mono
                    uppercase
                    tracking-[0.2em]
                    text-coral
                  ">

                    <Youtube className="h-4 w-4" />

                    RYC on YouTube

                  </div>

                  <h3 className="
                    serif
                    text-3xl
                    mt-1
                  ">

                    Know before you go.

                  </h3>

                </div>

              </div>


              {/* HORIZONTAL SCROLL */}

              <div className="
                flex
                gap-4
                overflow-x-auto
                pb-3
                snap-x
                snap-mandatory
                scrollbar-hide
              ">

                {youtubeVideos.map(item => (

                  <div
                    key={item.id}
                    className="snap-start"
                  >

                    <VideoCard
                      item={item}
                    />

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>

      </div>

    </section>

  );

}
