import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  MessageCircle,
  X,
  Send,
  Bot,
  PhoneCall,
  Sparkles
} from 'lucide-react';

import { brand } from '../mock';

import {
  sendChat,
  captureChatLead
} from '../lib/api';


/*
=========================================================
SESSION
=========================================================
*/

function newSessionId() {

  const existing =
    localStorage.getItem(
      'ryc_chat_session'
    );

  if (existing) {
    return existing;
  }

  const id =
    'ryc_' +
    Math.random()
      .toString(36)
      .slice(2) +
    Date.now()
      .toString(36);

  localStorage.setItem(
    'ryc_chat_session',
    id
  );

  return id;
}


/*
=========================================================
STARTER QUESTIONS
=========================================================
*/

const STARTERS = [

  'MBBS in Georgia — how much and how long?',

  'Is UG in Italy really tuition-free?',

  'I have 78% in 12th — what management options do I have?',

  'MBA in Singapore vs UK — which is better ROI?',

  'What can I do with a low NEET score?'

];


/*
=========================================================
AI CHAT WIDGET
=========================================================
*/

export default function AiChatWidget() {


  /*
  ---------------------------------------------------------
  CHAT STATE
  ---------------------------------------------------------
  */

  const [
    open,
    setOpen
  ] =
    useState(false);


  /*
  Mini introduction card is shown initially.

  User can close it without closing the mascot.
  */

  const [
    introVisible,
    setIntroVisible
  ] =
    useState(true);


  const [
    messages,
    setMessages
  ] =
    useState([

      {
        role: 'assistant',

        content:
          'Hi! I’m RYCe — your Route Your Career guide. Ask me about MBBS abroad, management courses, countries, fees, admissions or career options.'
      }

    ]);


  const [
    input,
    setInput
  ] =
    useState('');


  const [
    loading,
    setLoading
  ] =
    useState(false);


  const [
    leadCaptured,
    setLeadCaptured
  ] =
    useState(false);


  const [
    showLeadForm,
    setShowLeadForm
  ] =
    useState(false);


  const [
    lead,
    setLead
  ] =
    useState({

      name: '',

      phone: '',

      country: '',

      neet_score: ''

    });


  const sessionRef =
    useRef(
      newSessionId()
    );


  const scrollRef =
    useRef(null);



  /*
  =========================================================
  AUTO SCROLL
  =========================================================
  */

  useEffect(() => {

    if (
      scrollRef.current
    ) {

      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;

    }

  }, [
    messages,
    open,
    showLeadForm
  ]);



  /*
  =========================================================
  SEND MESSAGE
  =========================================================
  */

  const send =
    async text => {


      const msg =
        (text ?? input)
          .trim();


      if (
        !msg ||
        loading
      ) {

        return;

      }


      setInput('');


      setMessages(
        current => [

          ...current,

          {
            role: 'user',
            content: msg
          }

        ]
      );


      setLoading(
        true
      );


      try {


        const res =
          await sendChat(

            sessionRef.current,

            msg

          );


        setMessages(
          current => [

            ...current,

            {
              role: 'assistant',
              content: res.reply
            }

          ]
        );


        /*
        -----------------------------------------------
        LEAD CAPTURE

        Show after the student has interacted
        a couple of times.
        -----------------------------------------------
        */

        if (
          !leadCaptured &&
          !showLeadForm
        ) {


          setMessages(
            current => {


              const turns =
                current.filter(
                  item =>
                    item.role ===
                    'user'
                ).length;


              if (
                turns >= 2
              ) {

                setTimeout(
                  () =>
                    setShowLeadForm(
                      true
                    ),
                  400
                );

              }


              return current;

            }
          );

        }


      }
      catch (
        error
      ) {


        setMessages(
          current => [

            ...current,

            {

              role:
                'assistant',

              content:
                'Sorry — I had a small hiccup. Please try again, or WhatsApp our team directly.'

            }

          ]
        );


      }
      finally {


        setLoading(
          false
        );


      }

    };



  /*
  =========================================================
  LEAD FORM
  =========================================================
  */

  const submitLead =
    async event => {


      event.preventDefault();


      if (
        !lead.name ||
        !lead.phone
      ) {

        return;

      }


      try {


        await captureChatLead({

          session_id:
            sessionRef.current,

          ...lead

        });


        setLeadCaptured(
          true
        );


        setShowLeadForm(
          false
        );


        const firstName =
          lead.name
            .split(' ')[0];


        setMessages(
          current => [

            ...current,

            {

              role:
                'assistant',

              content:
                `Thanks, ${firstName}! A counsellor will call ${lead.phone} within one working day. You can keep chatting with me in the meantime.`

            }

          ]
        );


      }
      catch (
        error
      ) {

        console.error(
          'Lead capture error:',
          error
        );

      }

    };



  /*
  =========================================================
  MAIN UI
  =========================================================
  */

  return (

    <>


      {/* ===================================================
          FULL CHAT WINDOW

          Opens when Ask RYCe is clicked.
      =================================================== */}

      {open && (

        <div
          className="
            fixed

            bottom-[105px]
            right-4
            sm:right-7

            z-[80]

            w-[370px]
            max-w-[calc(100vw-2rem)]

            rounded-[26px]

            bg-white

            border
            border-ink/10

            shadow-2xl

            overflow-hidden

            flex
            flex-col
          "
          style={{
            maxHeight:
              '72vh'
          }}
        >


          {/* HEADER */}

          <div className="bg-ink text-cream p-4 flex items-center gap-3">


            <div className="relative">


              <div className="h-10 w-10 rounded-full bg-coral text-white grid place-items-center">

                <Bot className="h-5 w-5" />

              </div>


              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink" />


            </div>



            <div className="flex-1">


              <div className="font-bold text-[14px]">

                RYCe

              </div>


              <div className="text-[9px] mono uppercase tracking-widest text-coral">

                Your Study Abroad Guide

              </div>


            </div>



            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="text-cream/70 hover:text-cream"
              aria-label="Close guidance chat"
            >

              <X className="h-4 w-4" />

            </button>


          </div>



          {/* =================================================
              CHAT BODY
          ================================================= */}

          <div
            ref={
              scrollRef
            }
            className="flex-1 overflow-y-auto p-4 space-y-2 bg-cream/50"
          >


            {messages.map(
              (
                message,
                index
              ) => (

                <div
                  key={
                    index
                  }
                  className={`
                    flex

                    ${
                      message.role ===
                      'user'
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
                        message.role ===
                        'user'

                          ? 'bg-ink text-cream'

                          : 'bg-white border border-ink/10 text-ink'
                      }
                    `}
                  >

                    {message.content}

                  </div>


                </div>

              )
            )}



            {/* TYPING */}

            {loading && (

              <div className="flex justify-start">

                <div className="rounded-2xl px-3.5 py-2.5 text-[13px] bg-white border border-ink/10 text-ink/50">

                  RYCe is typing…

                </div>

              </div>

            )}



            {/* =================================================
                LEAD FORM
            ================================================= */}

            {showLeadForm &&
             !leadCaptured && (

              <form
                onSubmit={
                  submitLead
                }
                className="mt-3 rounded-2xl bg-white border border-coral/40 p-4 space-y-2"
              >


                <div className="text-[10px] mono uppercase tracking-widest text-coral">

                  Want a counsellor to call?

                </div>



                <div className="grid grid-cols-2 gap-2">


                  <input
                    value={
                      lead.name
                    }
                    onChange={
                      event =>
                        setLead({

                          ...lead,

                          name:
                            event.target.value

                        })
                    }
                    placeholder="Name"
                    className="rounded-lg border border-ink/15 bg-cream/60 px-2.5 py-2 text-[12px]"
                  />


                  <input
                    value={
                      lead.phone
                    }
                    onChange={
                      event =>
                        setLead({

                          ...lead,

                          phone:
                            event.target.value

                        })
                    }
                    placeholder="WhatsApp"
                    className="rounded-lg border border-ink/15 bg-cream/60 px-2.5 py-2 text-[12px]"
                  />


                  <input
                    value={
                      lead.country
                    }
                    onChange={
                      event =>
                        setLead({

                          ...lead,

                          country:
                            event.target.value

                        })
                    }
                    placeholder="Preferred country"
                    className="rounded-lg border border-ink/15 bg-cream/60 px-2.5 py-2 text-[12px] col-span-2"
                  />


                </div>



                <div className="flex items-center gap-2">


                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-coral hover:bg-[#d94a26] text-white text-[12px] font-bold py-2"
                  >

                    Send to counsellor

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setShowLeadForm(
                        false
                      )
                    }
                    className="text-[11px] text-ink/50 hover:text-ink"
                  >

                    skip

                  </button>


                </div>


              </form>

            )}



            {/* =================================================
                STARTER QUESTIONS
            ================================================= */}

            {messages.length <=
              1 && (

              <div className="pt-2 flex flex-wrap gap-1.5">


                {STARTERS.map(
                  starter => (

                    <button
                      type="button"
                      key={
                        starter
                      }
                      onClick={() =>
                        send(
                          starter
                        )
                      }
                      className="text-[11px] rounded-full border border-ink/15 bg-white px-2.5 py-1.5 hover:bg-ink hover:text-cream transition"
                    >

                      {starter}

                    </button>

                  )
                )}


              </div>

            )}


          </div>



          {/* =================================================
              COMPOSER
          ================================================= */}

          <div className="p-3 border-t border-ink/10 bg-white">


            <form
              onSubmit={
                event => {

                  event.preventDefault();

                  send();

                }
              }
              className="flex items-center gap-2"
            >


              <input
                value={
                  input
                }
                onChange={
                  event =>
                    setInput(
                      event.target.value
                    )
                }
                placeholder="Ask RYCe anything…"
                className="flex-1 rounded-full border border-ink/15 bg-cream/60 px-3 py-2 text-[13px] outline-none focus:border-coral"
              />


              <button
                type="submit"
                disabled={
                  loading ||
                  !input.trim()
                }
                className="h-9 w-9 rounded-full bg-coral hover:bg-[#d94a26] text-white grid place-items-center disabled:opacity-50"
              >

                <Send className="h-4 w-4" />

              </button>


            </form>



            <div className="mt-2 flex items-center justify-between gap-3">


              <a
                href={`https://wa.me/${brand.whatsapp.replace('+', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >

                <MessageCircle className="h-3 w-3" />

                WhatsApp

              </a>


              <a
                href={`tel:${brand.phone}`}
                className="text-[10px] font-semibold text-ink/55 hover:text-ink inline-flex items-center gap-1"
              >

                <PhoneCall className="h-3 w-3" />

                {brand.phoneDisplay}

              </a>


            </div>


          </div>


        </div>

      )}



      {/* ===================================================
          MASCOT / GLOBE AREA

          Desktop only.

          This floats OVER the page.
          It does NOT consume hero layout space.
      =================================================== */}

      {!open && (

        <div
          className="
            hidden
            md:block

            fixed

            right-[22px]
            bottom-[118px]

            z-[55]

            w-[285px]
            h-[270px]

            pointer-events-none
          "
        >


          {/* FLIGHT PATH DECORATION */}

          <div
            className="
              absolute
              right-[18px]
              top-[6px]

              w-[110px]
              h-[70px]

              rounded-[50%]

              border-t-2
              border-r-2
              border-dashed
              border-coral/60

              rotate-[-14deg]
            "
          />


          {/* SMALL PLANE SYMBOL */}

          <div
            className="
              absolute
              right-[5px]
              top-[-4px]

              text-coral

              text-[23px]

              rotate-[18deg]
            "
          >
            ✈
          </div>



          {/* GLOBE */}

          <img
            src="/ryc-globe.png"
            alt=""
            aria-hidden="true"
            className="
              absolute

              right-0
              bottom-0

              w-[185px]
              h-[185px]

              object-contain

              drop-shadow-xl

              select-none
            "
          />



          {/* STUDENT MASCOT */}

          <img
            src="/ryc-mascot.png"
            alt=""
            aria-hidden="true"
            className="
              absolute

              left-[5px]
              bottom-[35px]

              w-[175px]

              object-contain

              drop-shadow-2xl

              select-none
            "
          />


        </div>

      )}



      {/* ===================================================
          MINI OPEN GUIDANCE CARD

          Visible before the user opens full chat.
      =================================================== */}

      {!open &&
       introVisible && (

        <div
          className="
            hidden
            md:block

            fixed

            right-[30px]
            bottom-[195px]

            z-[65]

            w-[235px]

            rounded-2xl

            bg-white

            border
            border-ink/10

            shadow-xl

            p-4
          "
        >


          <button
            type="button"
            onClick={() =>
              setIntroVisible(
                false
              )
            }
            className="absolute top-3 right-3 text-ink/35 hover:text-ink"
            aria-label="Close RYCe introduction"
          >

            <X className="h-3.5 w-3.5" />

          </button>



          <div className="flex items-center gap-1.5 pr-5">


            <div className="serif text-[18px] font-semibold">

              Hi! I’m RYCe

            </div>


            <Sparkles className="h-4 w-4 text-coral" />


          </div>



          <div className="mt-1 text-[11px] font-semibold text-ink">

            Your Study Abroad Guide

          </div>



          <div className="mt-3 h-px bg-ink/10" />



          <p className="mt-3 text-[11px] text-ink/60 leading-relaxed">

            Ask me anything about MBBS,
            Management, countries, fees,
            admissions and career guidance.

          </p>


        </div>

      )}



      {/* ===================================================
          BOTTOM RIGHT CONTROLS
      =================================================== */}

      <div
        className="
          fixed

          bottom-4
          right-4
          sm:right-6

          z-[70]

          flex
          flex-col
          items-end
          gap-2.5
        "
      >


        {/* WHATSAPP */}

        <a
          href={`https://wa.me/${brand.whatsapp.replace('+', '')}`}
          target="_blank"
          rel="noreferrer"
          className="
            group

            inline-flex
            items-center
            gap-2

            rounded-full

            bg-emerald-500
            hover:bg-emerald-400

            text-slate-900

            px-4
            py-3

            text-[13px]
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



        {/* ASK RYCE */}

        <button
          type="button"
          onClick={() => {

            setOpen(
              !open
            );

            setIntroVisible(
              false
            );

          }}
          className="
            inline-flex
            items-center
            gap-2

            rounded-full

            bg-coral
            hover:bg-[#d94a26]

            text-white

            px-4
            py-3

            text-[13px]
            font-bold

            shadow-xl

            transition
          "
        >


          {open ? (

            <>

              <X className="h-4 w-4" />

              Close RYCe

            </>

          ) : (

            <>

              <Bot className="h-4 w-4" />

              Ask RYCe

            </>

          )}


        </button>


        {/* ONLINE */}

        {!open && (

          <div className="hidden sm:flex items-center gap-1.5 mr-3 text-[10px] font-semibold text-ink/55">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            Online

          </div>

        )}


      </div>


    </>

  );

}
