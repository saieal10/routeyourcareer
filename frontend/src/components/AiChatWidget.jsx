import React, { useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  PhoneCall,
  ArrowRight,
  Sparkles
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


export default function AiChatWidget() {

  /* =======================================================
     STATE
  ======================================================= */

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


  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {

    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }

  }, [messages, open, showLeadForm]);


  /* =======================================================
     SEND MESSAGE
  ======================================================= */

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


      /*
      -------------------------------------------------------
      SHOW COUNSELLOR FORM AFTER 2 USER MESSAGES
      -------------------------------------------------------
      */

      if (!leadCaptured && !showLeadForm) {

        setMessages((current) => {

          const turns =
            current.filter(
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


  /* =======================================================
     LEAD FORM
  ======================================================= */

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
            `Thanks, ${lead.name.split(' ')[0]}! ` +
            `Your details have been received. ` +
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


  return (

    <>

      {/* ===================================================
          DESKTOP INTRO CARD

          Hidden when full chat is open.
          Hidden on small mobile screens.
      =================================================== */}

      {!open && (

        <div
          className="
            hidden md:block
            fixed
            right-5
            bottom-24
            z-40
            w-[300px]
          "
        >

          {/* VISUAL AREA */}

          <div className="relative h-[175px] pointer-events-none">


            {/* GLOBE */}

            <img
              src="/ryce-globe.png"
              alt=""
              aria-hidden="true"
              className="
                absolute
                right-0
                bottom-[-12px]
                w-[170px]
                h-auto
                object-contain
                drop-shadow-xl
              "
            />


            {/* STUDENT */}

            <img
              src="/ryce-student.png"
              alt="RYCe student career guide"
              className="
                absolute
                left-[5px]
                bottom-[-8px]
                w-[125px]
                h-auto
                object-contain
                drop-shadow-xl
                z-10
              "
            />


            {/* SMALL LABEL */}

            <div
              className="
                absolute
                left-[82px]
                top-[15px]
                z-20
                rounded-full
                bg-coral
                text-white
                px-3
                py-1.5
                text-[10px]
                font-bold
                shadow-lg
                flex
                items-center
                gap-1
              "
            >
              <Sparkles className="w-3 h-3" />

              MEET RYCe
            </div>

          </div>


          {/* INTRO CARD */}

          <div
            className="
              relative
              z-20
              rounded-[22px]
              bg-white
              border
              border-ink/10
              shadow-2xl
              overflow-hidden
            "
          >

            <div className="p-5">

              <div
                className="
                  text-[10px]
                  mono
                  uppercase
                  tracking-[0.18em]
                  text-coral
                  font-semibold
                "
              >
                Your Career Guide
              </div>


              <div
                className="
                  mt-2
                  serif
                  text-[23px]
                  leading-tight
                  text-ink
                  font-medium
                "
              >
                Hi, I'm RYCe.
              </div>


              <p
                className="
                  mt-2
                  text-[12px]
                  leading-relaxed
                  text-ink/60
                "
              >
                Confused about your next step?
                Ask me about careers, courses,
                countries, MBBS, management
                or studying abroad.
              </p>


              <button
                onClick={() => setOpen(true)}
                className="
                  mt-4
                  w-full
                  rounded-full
                  bg-ink
                  hover:bg-forest
                  text-cream
                  px-4
                  py-3
                  text-[12px]
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition
                "
              >
                Ask RYCe

                <ArrowRight className="w-4 h-4" />
              </button>


              <div
                className="
                  mt-3
                  flex
                  justify-center
                  items-center
                  gap-2
                  text-[10px]
                  text-ink/45
                "
              >

                <span
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-emerald-500
                  "
                />

                AI guidance available

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ===================================================
          FULL CHAT WINDOW
      =================================================== */}

      {open && (

        <div
          className="
            fixed
            bottom-24
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


          {/* HEADER */}

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
                  tracking-[0.16em]
                  text-coral
                "
              >
                Career · MBBS · Management · Study Abroad
              </div>

            </div>


            <button
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
              "
            >
              <X className="h-4 w-4" />
            </button>

          </div>


          {/* CHAT BODY */}

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

            {messages.map((message, index) => (

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

            ))}


            {/* TYPING */}

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


            {/* STARTERS */}

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


                <div className="flex flex-wrap gap-1.5">

                  {STARTERS.map((starter) => (

                    <button
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


            {/* LEAD FORM */}

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
                    Need human guidance?
                  </div>

                  <div
                    className="
                      mt-1
                      text-[12px]
                      text-ink/60
                    "
                  >
                    Leave your details if you'd like
                    one of our counsellors to contact you.
                  </div>

                </div>


                <div className="grid grid-cols-2 gap-2">

                  <input
                    value={lead.name}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        name: e.target.value
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
                    "
                  />


                  <input
                    value={lead.phone}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        phone: e.target.value
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
                    "
                  />


                  <input
                    value={lead.country}
                    onChange={(e) =>
                      setLead({
                        ...lead,
                        country: e.target.value
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
                    "
                  />

                </div>


                <div className="flex gap-2">

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
              MESSAGE COMPOSER
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
                  focus:outline-none
                  focus:border-forest
                "
              />


              <button
                type="submit"
                disabled={
                  loading ||
                  !input.trim()
                }
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
                "
              >
                <Send className="h-4 w-4" />
              </button>

            </form>


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


      {/* ===================================================
          MOBILE ASK RYCE BUTTON

          Desktop gets the visual card.
          Mobile gets this compact button.
      =================================================== */}

      {!open && (

        <button
          onClick={() => setOpen(true)}
          className="
            md:hidden
            fixed
            bottom-[78px]
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
          "
        >
          <Bot className="h-4 w-4" />

          Ask RYCe
        </button>

      )}


      {/* ===================================================
          WHATSAPP

          Remains independent from RYCe.
      =================================================== */}

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
