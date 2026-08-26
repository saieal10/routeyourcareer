import React, { useEffect, useRef, useState } from 'react';

import {
  MessageCircle,
  X,
  Send,
  Bot,
  PhoneCall,
  ArrowRight
} from 'lucide-react';

import { brand } from '../mock';
import { sendChat, captureChatLead } from '../lib/api';


/* =========================================================
   SESSION
========================================================= */

function newSessionId() {
  const existing = localStorage.getItem('ryc_chat_session');

  if (existing) return existing;

  const id =
    'ryc_' +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36);

  localStorage.setItem('ryc_chat_session', id);

  return id;
}


/* =========================================================
   STARTER QUESTIONS
========================================================= */

const STARTERS = [
  'Which career suits me after 12th?',
  'MBBS abroad — which country is best for me?',
  'What management courses can I study abroad?',
  'Can I study in Italy with low tuition fees?',
  'I am confused about my career. Help me choose.'
];


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AiChatWidget() {

  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm RYCe, your Route Your Career guide. Tell me what you're studying, what you're interested in, or what you're confused about — I'll help you explore your options."
    }
  ]);

  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);

  const [leadCaptured, setLeadCaptured] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);

  const [lead, setLead] = useState({
    name: '',
    phone: '',
    country: '',
    neet_score: ''
  });

  const sessionRef = useRef(newSessionId());

  const scrollRef = useRef(null);


  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  useEffect(() => {

    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }

  }, [messages, open, showLeadForm]);


  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const send = async (text) => {

    const msg = (text ?? input).trim();

    if (!msg || loading) return;

    setInput('');

    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content: msg
      }
    ]);

    setLoading(true);

    try {

      const res = await sendChat(
        sessionRef.current,
        msg
      );

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: res.reply
        }
      ]);


      /* Show lead form after student has chatted */

      if (!leadCaptured && !showLeadForm) {

        setMessages((current) => {

          const turns = current.filter(
            (message) => message.role === 'user'
          ).length;

          if (turns >= 2) {

            setTimeout(() => {
              setShowLeadForm(true);
            }, 500);

          }

          return current;

        });

      }

    } catch (error) {

      console.error('Chat failed:', error);

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'I could not connect for a moment. Please try again, or continue with our counsellor on WhatsApp.'
        }
      ]);

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     LEAD FORM
  ========================================================= */

  const submitLead = async (event) => {

    event.preventDefault();

    if (!lead.name || !lead.phone) return;

    try {

      await captureChatLead({
        session_id: sessionRef.current,
        ...lead
      });

      setLeadCaptured(true);

      setShowLeadForm(false);

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            `Thanks, ${lead.name.split(' ')[0]}! Your details have been received. ` +
            `A Route Your Career counsellor can contact you on ${lead.phone}. ` +
            `You can continue chatting with me here too.`
        }
      ]);

    } catch (error) {

      console.error(
        'Lead capture failed:',
        error
      );

    }

  };


  /* =========================================================
     UI
  ========================================================= */

  return (
    <>

      {/* =====================================================
          DESKTOP CLOSED RYCe

          IMPORTANT:
          Mascot + globe are ABOVE white card.
          Everything stays in one narrow vertical column.
      ===================================================== */}

      {!open && (

        <div
          className="
            hidden
            xl:block

            fixed

            right-6
            bottom-[82px]

            z-40

            w-[184px]
          "
        >

          {/* ===============================================
              MASCOT AREA
          =============================================== */}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open RYCe career guide"
            className="
              relative

              block

              w-full
              h-[104px]

              bg-transparent

              border-0

              cursor-pointer
            "
          >

            {/* =============================================
                GLOBE
            ============================================= */}

            <img
              src="/ryce-globe.png"
              alt=""
              aria-hidden="true"
              className="
                absolute

                right-[8px]
                bottom-[-5px]

                w-[78px]
                h-auto

                object-contain

                drop-shadow-md

                z-0

                pointer-events-none
              "
            />


            {/* =============================================
                STUDENT MASCOT
            ============================================= */}

            <img
              src="/ryce-student.png"
              alt="RYCe career guide"
              className="
                absolute

                left-[30px]
                bottom-[-5px]

                w-[84px]
                h-auto

                object-contain

                drop-shadow-lg

                z-10

                pointer-events-none

                transition-transform
                duration-200
              "
            />

          </button>


          {/* ===============================================
              WHITE GUIDANCE CARD
          =============================================== */}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="
              relative

              z-20

              block

              w-full

              rounded-[18px]

              bg-white

              border
              border-ink/10

              shadow-xl

              px-4
              py-3

              text-left

              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:shadow-2xl
            "
          >

            {/* LABEL */}

            <div
              className="
                text-[8px]

                mono
                uppercase

                tracking-[0.20em]

                text-coral

                font-semibold
              "
            >
              ASK RYCe
            </div>


            {/* TITLE */}

            <div
              className="
                mt-1

                serif

                text-[17px]

                leading-tight

                text-ink

                font-medium
              "
            >
              Need guidance?
            </div>


            {/* SHORT DESCRIPTION */}

            <div
              className="
                mt-1

                text-[9px]

                leading-[1.4]

                text-ink/45
              "
            >
              Careers · courses · abroad
            </div>


            {/* DIVIDER */}

            <div
              className="
                my-2

                h-px

                bg-ink/10
              "
            />


            {/* CTA */}

            <div
              className="
                flex

                items-center
                justify-between

                text-[10px]

                font-bold

                text-ink
              "
            >

              <span>
                Ask RYCe
              </span>

              <ArrowRight
                className="
                  w-3.5
                  h-3.5
                "
              />

            </div>


            {/* STATUS */}

            <div
              className="
                mt-2

                flex
                items-center
                gap-1.5

                text-[8px]

                text-ink/35
              "
            >

              <span
                className="
                  w-1.5
                  h-1.5

                  rounded-full

                  bg-emerald-500
                "
              />

              AI career guidance

            </div>

          </button>

        </div>

      )}


      {/* =====================================================
          MOBILE CLOSED RYCe
      ===================================================== */}

      {!open && (

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            xl:hidden

            fixed

            bottom-[76px]
            right-4

            z-50

            inline-flex
            items-center
            gap-2

            rounded-full

            bg-coral

            text-white

            px-4
            py-3

            text-[12px]

            font-bold

            shadow-xl

            hover:bg-[#d94a26]

            transition
          "
        >

          <Bot className="h-4 w-4" />

          Ask RYCe

        </button>

      )}


      {/* =====================================================
          OPEN CHAT WINDOW
      ===================================================== */}

      {open && (

        <div
          className="
            fixed

            bottom-[82px]

            right-4
            sm:right-6

            z-50

            w-[380px]

            max-w-[calc(100vw-2rem)]

            rounded-3xl

            bg-white

            border
            border-ink/10

            shadow-2xl

            overflow-hidden

            flex
            flex-col
          "
          style={{
            maxHeight: '76vh'
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              bg-ink

              text-cream

              p-4

              flex
              items-center
              gap-3
            "
          >

            {/* ICON */}

            <div className="relative">

              <div
                className="
                  h-10
                  w-10

                  rounded-full

                  bg-coral

                  text-white

                  grid
                  place-items-center
                "
              >

                <Bot className="h-5 w-5" />

              </div>


              <span
                className="
                  absolute

                  -bottom-0.5
                  -right-0.5

                  h-3
                  w-3

                  rounded-full

                  bg-emerald-400

                  ring-2
                  ring-ink
                "
              />

            </div>


            {/* TEXT */}

            <div className="flex-1">

              <div
                className="
                  serif

                  font-medium

                  text-[17px]
                "
              >
                Ask RYCe
              </div>


              <div
                className="
                  text-[9px]

                  mono
                  uppercase

                  tracking-[0.14em]

                  text-coral
                "
              >
                Career · MBBS · Management · Study Abroad
              </div>

            </div>


            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close guidance"
              className="
                h-9
                w-9

                rounded-full

                border
                border-cream/15

                grid
                place-items-center

                text-cream/70

                hover:text-cream
                hover:bg-white/10

                transition
              "
            >

              <X className="h-4 w-4" />

            </button>

          </div>


          {/* =================================================
              MESSAGES
          ================================================= */}

          <div
            ref={scrollRef}
            className="
              flex-1

              overflow-y-auto

              p-4

              space-y-3

              bg-cream/50
            "
          >

            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={`
                    flex

                    ${
                      message.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }
                  `}
                >

                  <div
                    className={`
                      max-w-[86%]

                      rounded-2xl

                      px-3.5
                      py-2.5

                      text-[13px]

                      leading-relaxed

                      ${
                        message.role === 'user'
                          ? `
                            bg-ink
                            text-cream
                            rounded-br-md
                          `
                          : `
                            bg-white
                            border
                            border-ink/10
                            text-ink
                            rounded-bl-md
                          `
                      }
                    `}
                  >

                    {message.content}

                  </div>

                </div>

              )
            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

              <div className="flex justify-start">

                <div
                  className="
                    rounded-2xl
                    rounded-bl-md

                    px-3.5
                    py-2.5

                    text-[12px]

                    bg-white

                    border
                    border-ink/10

                    text-ink/50
                  "
                >
                  RYCe is thinking…
                </div>

              </div>

            )}


            {/* =================================================
                STARTERS
            ================================================= */}

            {messages.length <= 1 && (

              <div className="pt-2">

                <div
                  className="
                    mb-2

                    text-[9px]

                    mono
                    uppercase

                    tracking-widest

                    text-ink/40
                  "
                >
                  Try asking
                </div>


                <div
                  className="
                    flex
                    flex-wrap
                    gap-1.5
                  "
                >

                  {STARTERS.map((starter) => (

                    <button
                      type="button"
                      key={starter}
                      onClick={() => send(starter)}
                      className="
                        text-[11px]
                        text-left

                        rounded-xl

                        border
                        border-ink/10

                        bg-white

                        px-3
                        py-2

                        hover:bg-ink
                        hover:text-cream

                        transition
                      "
                    >

                      {starter}

                    </button>

                  ))}

                </div>

              </div>

            )}


            {/* =================================================
                LEAD FORM
            ================================================= */}

            {showLeadForm && !leadCaptured && (

              <form
                onSubmit={submitLead}
                className="
                  mt-3

                  rounded-2xl

                  bg-white

                  border
                  border-coral/40

                  p-4

                  space-y-3
                "
              >

                <div>

                  <div
                    className="
                      text-[10px]

                      mono
                      uppercase

                      tracking-widest

                      text-coral
                    "
                  >
                    Want personal guidance?
                  </div>


                  <div
                    className="
                      mt-1

                      text-[12px]

                      leading-relaxed

                      text-ink/60
                    "
                  >
                    Leave your details only if you'd like a counsellor to contact you.
                  </div>

                </div>


                {/* FORM INPUTS */}

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-2
                  "
                >

                  <input
                    value={lead.name}
                    onChange={(event) =>
                      setLead({
                        ...lead,
                        name: event.target.value
                      })
                    }
                    placeholder="Your name"
                    className="
                      rounded-xl

                      border
                      border-ink/15

                      bg-cream/50

                      px-3
                      py-2.5

                      text-[12px]

                      outline-none

                      focus:border-coral
                    "
                  />


                  <input
                    value={lead.phone}
                    onChange={(event) =>
                      setLead({
                        ...lead,
                        phone: event.target.value
                      })
                    }
                    placeholder="WhatsApp"
                    className="
                      rounded-xl

                      border
                      border-ink/15

                      bg-cream/50

                      px-3
                      py-2.5

                      text-[12px]

                      outline-none

                      focus:border-coral
                    "
                  />


                  <input
                    value={lead.country}
                    onChange={(event) =>
                      setLead({
                        ...lead,
                        country: event.target.value
                      })
                    }
                    placeholder="Country / course interest"
                    className="
                      col-span-2

                      rounded-xl

                      border
                      border-ink/15

                      bg-cream/50

                      px-3
                      py-2.5

                      text-[12px]

                      outline-none

                      focus:border-coral
                    "
                  />

                </div>


                {/* FORM BUTTONS */}

                <div
                  className="
                    flex
                    gap-2
                  "
                >

                  <button
                    type="submit"
                    className="
                      flex-1

                      rounded-xl

                      bg-coral

                      hover:bg-[#d94a26]

                      text-white

                      text-[12px]

                      font-bold

                      py-2.5

                      transition
                    "
                  >
                    Request counsellor
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setShowLeadForm(false)
                    }
                    className="
                      px-3

                      text-[11px]

                      text-ink/45

                      hover:text-ink
                    "
                  >
                    Skip
                  </button>

                </div>

              </form>

            )}

          </div>


          {/* =================================================
              MESSAGE INPUT
          ================================================= */}

          <div
            className="
              p-3

              border-t
              border-ink/10

              bg-white
            "
          >

            <form
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
              className="
                flex
                items-center
                gap-2
              "
            >

              <input
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Ask RYCe anything..."
                className="
                  flex-1

                  rounded-full

                  border
                  border-ink/15

                  bg-cream/60

                  px-4
                  py-2.5

                  text-[13px]

                  outline-none

                  focus:border-forest
                "
              />


              <button
                type="submit"
                disabled={
                  loading ||
                  !input.trim()
                }
                aria-label="Send message"
                className="
                  h-10
                  w-10

                  rounded-full

                  bg-coral

                  hover:bg-[#d94a26]

                  text-white

                  grid
                  place-items-center

                  disabled:opacity-40

                  transition
                "
              >

                <Send className="h-4 w-4" />

              </button>

            </form>


            {/* =================================================
                CHAT CONTACT OPTIONS
            ================================================= */}

            <div
              className="
                mt-2

                flex
                items-center
                justify-between

                gap-2
              "
            >

              <a
                href={`https://wa.me/${brand.whatsapp.replace(
                  '+',
                  ''
                )}`}
                target="_blank"
                rel="noreferrer"
                className="
                  text-[10px]

                  font-semibold

                  text-emerald-700

                  hover:underline

                  inline-flex
                  items-center
                  gap-1
                "
              >

                <MessageCircle className="h-3 w-3" />

                Continue on WhatsApp

              </a>


              <a
                href={`tel:${brand.phone}`}
                className="
                  text-[10px]

                  font-semibold

                  text-ink/50

                  hover:text-ink

                  inline-flex
                  items-center
                  gap-1
                "
              >

                <PhoneCall className="h-3 w-3" />

                Call us

              </a>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          WHATSAPP FLOATING BUTTON
      ===================================================== */}

      <a
        href={`https://wa.me/${brand.whatsapp.replace(
          '+',
          ''
        )}`}
        target="_blank"
        rel="noreferrer"
        className="
          fixed

          bottom-4

          right-4
          sm:right-6

          z-50

          inline-flex
          items-center
          gap-2

          rounded-full

          bg-emerald-500

          hover:bg-emerald-400

          text-slate-900

          px-4
          py-3

          text-[12px]

          font-bold

          shadow-xl

          transition
        "
      >

        <MessageCircle className="h-5 w-5" />

        <span className="hidden sm:inline">
          WhatsApp us
        </span>

      </a>

    </>
  );
}
