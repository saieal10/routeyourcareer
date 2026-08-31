import React from 'react';

import {
  ArrowUpRight,
  Play,
  Quote
} from 'lucide-react';


/* =========================================================
   TEMPORARY VIDEO DATA

   Later we can move this into Admin Dashboard.
========================================================= */

const YOUTUBE_VIDEOS = [

  {
    title:
      'MBBS Abroad — How to Choose the Right Country',

    youtubeId:
      'YOUR_VIDEO_ID_1'
  },

  {
    title:
      'MBBS in Georgia — Complete Student Guide',

    youtubeId:
      'YOUR_VIDEO_ID_2'
  },

  {
    title:
      'Studying Abroad — Costs Students Should Know',

    youtubeId:
      'YOUR_VIDEO_ID_3'
  }

];


const TESTIMONIALS = [

  {
    title:
      'Student Experience — MBBS Abroad',

    youtubeId:
      'YOUR_TESTIMONIAL_ID_1'
  },

  {
    title:
      'Student Journey with Route Your Career',

    youtubeId:
      'YOUR_TESTIMONIAL_ID_2'
  },

  {
    title:
      'Life as an International Medical Student',

    youtubeId:
      'YOUR_TESTIMONIAL_ID_3'
  }

];


/* =========================================================
   VIDEO CARD
========================================================= */

function VideoCard({
  video
}) {

  const validVideo =
    video.youtubeId &&
    !video.youtubeId.startsWith(
      'YOUR_'
    );


  return (

    <article
      className="
        min-w-[280px]
        sm:min-w-[320px]

        rounded-[24px]

        overflow-hidden

        bg-white

        border
        border-ink/10

        shadow-sm
      "
    >

      <div
        className="
          relative

          aspect-video

          bg-ink
        "
      >

        {validVideo ? (

          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}`}
            title={video.title}
            className="
              absolute
              inset-0

              w-full
              h-full
            "
            loading="lazy"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              web-share
            "
            allowFullScreen
          />

        ) : (

          <div
            className="
              absolute
              inset-0

              flex
              flex-col

              items-center
              justify-center

              gap-3

              text-center

              px-6

              bg-gradient-to-br
              from-ink
              to-forest

              text-cream
            "
          >

            <div
              className="
                h-12
                w-12

                rounded-full

                bg-coral

                grid
                place-items-center
              "
            >

              <Play
                className="
                  h-5
                  w-5

                  fill-current
                "
              />

            </div>


            <div
              className="
                text-[10px]

                mono
                uppercase

                tracking-widest

                text-cream/50
              "
            >
              Add YouTube video
            </div>

          </div>

        )}

      </div>


      <div className="p-4">

        <h3
          className="
            serif

            text-[18px]

            leading-tight
          "
        >
          {video.title}
        </h3>

      </div>

    </article>

  );

}


/* =========================================================
   SCROLL ROW
========================================================= */

function VideoRow({
  videos
}) {

  return (

    <div
      className="
        flex

        gap-4

        overflow-x-auto

        pb-3

        snap-x
        snap-mandatory

        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >

      {videos.map(
        (
          video,
          index
        ) => (

          <div
            key={`${video.youtubeId}-${index}`}
            className="snap-start"
          >

            <VideoCard
              video={video}
            />

          </div>

        )
      )}

    </div>

  );

}


/* =========================================================
   MEDIA HUB
========================================================= */

export default function MediaHub() {

  return (

    <section
      className="
        max-w-7xl
        mx-auto

        px-4
        sm:px-6

        py-16
        sm:py-20
      "
    >


      {/* ===================================================
          HEADING
      =================================================== */}

      <div
        className="
          grid

          lg:grid-cols-[0.9fr_1.1fr]

          gap-6

          items-end
        "
      >

        <div>

          <div
            className="
              text-[10px]

              mono
              uppercase

              tracking-[0.2em]

              text-coral
            "
          >
            Watch · Listen · Decide
          </div>


          <h2
            className="
              serif

              text-4xl
              sm:text-5xl

              mt-2
            "
          >
            Real guidance.
            <br />

            <span className="italic">
              Real student stories.
            </span>
          </h2>

        </div>


        <p
          className="
            text-[13px]
            sm:text-[14px]

            leading-relaxed

            text-ink/55

            max-w-xl
          "
        >

          Watch Route Your Career explain study-abroad options
          and hear directly from students about their
          experiences.

        </p>

      </div>


      {/* ===================================================
          TWO COLUMNS
      =================================================== */}

      <div
        className="
          mt-10

          grid

          lg:grid-cols-2

          gap-6
        "
      >


        {/* =================================================
            YOUTUBE COLUMN
        ================================================= */}

        <div
          className="
            rounded-[28px]

            bg-ink

            text-cream

            p-5
            sm:p-6

            overflow-hidden
          "
        >

          <div
            className="
              flex
              items-center
              justify-between

              gap-4

              mb-5
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2

                  text-[9px]

                  mono
                  uppercase

                  tracking-widest

                  text-coral
                "
              >

                <Play
                  className="
                    h-3.5
                    w-3.5
                  "
                />

                RYC YouTube

              </div>


              <h3
                className="
                  serif

                  text-2xl

                  mt-1
                "
              >
                Guides & explainers
              </h3>

            </div>


            <a
              href="https://www.youtube.com/@route_your_career"
              target="_blank"
              rel="noreferrer"

              className="
                hidden
                sm:inline-flex

                items-center
                gap-1.5

                text-[10px]

                font-semibold

                text-cream/60

                hover:text-coral
              "
            >

              View channel

              <ArrowUpRight
                className="
                  h-3.5
                  w-3.5
                "
              />

            </a>

          </div>


          <VideoRow
            videos={
              YOUTUBE_VIDEOS
            }
          />

        </div>


        {/* =================================================
            TESTIMONIAL COLUMN
        ================================================= */}

        <div
          className="
            rounded-[28px]

            bg-white

            border
            border-ink/10

            p-5
            sm:p-6

            overflow-hidden
          "
        >

          <div
            className="
              flex
              items-center
              justify-between

              gap-4

              mb-5
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2

                  text-[9px]

                  mono
                  uppercase

                  tracking-widest

                  text-coral
                "
              >

                <Quote
                  className="
                    h-3.5
                    w-3.5
                  "
                />

                Student Stories

              </div>


              <h3
                className="
                  serif

                  text-2xl

                  mt-1
                "
              >
                Hear from students
              </h3>

            </div>


            <a
              href="https://www.youtube.com/@route_your_career"
              target="_blank"
              rel="noreferrer"

              className="
                hidden
                sm:inline-flex

                items-center
                gap-1.5

                text-[10px]

                font-semibold

                text-ink/50

                hover:text-coral
              "
            >

              More stories

              <ArrowUpRight
                className="
                  h-3.5
                  w-3.5
                "
              />

            </a>

          </div>


          <VideoRow
            videos={
              TESTIMONIALS
            }
          />

        </div>

      </div>

    </section>

  );

}
