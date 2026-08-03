import iconoHemoRuta from "../assets/iconoHemoRutaNoBg.png";

function HeaderForm() {
  return (
    <header
      className="
        relative
        z-40
        flex
        h-[clamp(64px,5.2vw,96px)]
        w-full
        shrink-0
        items-center
        justify-between
        border-b
        border-[#e5eaf1]
        bg-white
        px-[clamp(24px,2.7vw,52px)]
        shadow-[0_2px_8px_rgba(15,46,85,0.06)]
      "
    >
      <div className="flex min-w-0 items-center">
        <img
          alt="HemoRuta Pediátrica"
          className="
            h-[clamp(46px,4vw,70px)]
            w-auto
            shrink-0
            object-contain
          "
          src={iconoHemoRuta}
        />

        <div
          className="
            mx-[clamp(16px,1.6vw,30px)]
            hidden
            h-[clamp(34px,3vw,50px)]
            w-px
            bg-[#b9c4d4]
            sm:block
          "
        />

        <div className="hidden items-center gap-[clamp(10px,1vw,18px)] sm:flex">
          <div
            className="
              text-[clamp(10px,0.8vw,14px)]
              font-semibold
              leading-[1.45]
              text-[#17356e]
            "
          >
            <p>Hospital del Niño</p>
            <p>San Borja</p>
          </div>

          <div
            className="
              grid
              h-[clamp(42px,3.3vw,58px)]
              w-[clamp(42px,3.3vw,58px)]
              shrink-0
              place-items-center
            "
          >
            <svg
              aria-label="Hospital del Niño San Borja"
              className="h-full w-full text-[#09adae]"
              fill="none"
              role="img"
              viewBox="6 3 36 40"
            >
              <circle cx="24" cy="7" fill="currentColor" r="3.4" />

              <path
                d="M18 13.25C18 9.8 20.7 7 24 7s6 2.8 6 6.25V17H18v-3.75Z"
                fill="currentColor"
              />

              <path d="M14.25 17h19.5v24h-19.5V17Z" fill="currentColor" />

              <path
                d="M8.5 21.5h5.75V41H8.5V21.5ZM33.75 21.5h5.75V41h-5.75V21.5Z"
                fill="currentColor"
              />

              <circle cx="11.4" cy="17.2" fill="currentColor" r="2.8" />
              <circle cx="36.6" cy="17.2" fill="currentColor" r="2.8" />

              <path d="M21 29.5h6V41h-6V29.5Z" fill="white" />

              <path
                d="M21.25 21.5h5.5M24 18.75v5.5"
                stroke="white"
                strokeLinecap="round"
                strokeWidth="2.4"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[clamp(8px,1vw,16px)]">
        <button
          aria-label="Ver notificaciones"
          className="
            relative
            grid
            h-[clamp(42px,3.3vw,58px)]
            w-[clamp(42px,3.3vw,58px)]
            cursor-pointer
            place-items-center
            rounded-full
            text-[#0a3279]
            transition
            hover:bg-[#f1f7fc]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[#08aeb5]
          "
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-[clamp(24px,1.8vw,32px)] w-[clamp(24px,1.8vw,32px)]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M6.75 9.5a5.25 5.25 0 0 1 10.5 0c0 6 2.25 6.25 2.25 7.5H4.5c0-1.25 2.25-1.5 2.25-7.5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />

            <path
              d="M10 19a2.1 2.1 0 0 0 4 0"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.7"
            />
          </svg>

          <span
            className="
              absolute
              right-0
              top-0
              grid
              h-[clamp(17px,1.3vw,22px)]
              min-w-[clamp(17px,1.3vw,22px)]
              place-items-center
              rounded-full
              bg-[#ff594f]
              px-1
              text-[clamp(10px,0.7vw,12px)]
              font-bold
              leading-none
              text-white
              ring-2
              ring-white
            "
          >
            2
          </span>
        </button>

        <div
          className="
            hidden
            h-[clamp(34px,2.8vw,48px)]
            w-px
            bg-[#e0e6ee]
            sm:block
          "
        />

        <button
          className="
            flex
            cursor-pointer
            items-center
            gap-[clamp(8px,0.8vw,14px)]
            rounded-xl
            px-1.5
            py-1
            text-left
            transition
            hover:bg-[#f6f9fc]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[#08aeb5]
          "
          type="button"
        >
          <div
            className="
              grid
              h-[clamp(42px,3.4vw,60px)]
              w-[clamp(42px,3.4vw,60px)]
              shrink-0
              place-items-center
              overflow-hidden
              rounded-full
              border
              border-[#d9e1eb]
              bg-[#edf7f7]
            "
          >
            <svg
              aria-hidden="true"
              className="h-full w-full"
              viewBox="0 0 48 48"
            >
              <circle cx="24" cy="24" fill="#E5F5F5" r="24" />
              <circle cx="24" cy="17" fill="#E4B59B" r="8" />

              <path
                d="M16 17c0-6 3.2-10 8.2-10 5.3 0 8.3 4.1 8.3 10-2.1-1.1-4.2-3.5-5-6.1-2.4 3.4-6.8 5.5-11.5 6.1Z"
                fill="#253651"
              />

              <path
                d="M11.5 44c.8-10 5.4-15 12.5-15s11.7 5 12.5 15h-25Z"
                fill="#FFFFFF"
              />

              <path d="M19 29.5 24 35l5-5.5" fill="#C9EEF0" />
              <path d="M21 34h6v10h-6V34Z" fill="#0BAEB5" />
            </svg>
          </div>

          <div className="hidden min-w-0 md:block">
            <p
              className="
                max-w-[220px]
                truncate
                text-[clamp(14px,1vw,18px)]
                font-bold
                text-[#082767]
              "
            >
              Dra. Valeria Ruiz
            </p>

            <p
              className="
                max-w-[220px]
                truncate
                text-[clamp(11px,0.8vw,14px)]
                text-[#647695]
              "
            >
              Hematología Pediátrica
            </p>
          </div>

          <svg
            aria-hidden="true"
            className="
              hidden
              h-[clamp(16px,1.2vw,22px)]
              w-[clamp(16px,1.2vw,22px)]
              text-[#082767]
              sm:block
            "
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="m7 9 5 5 5-5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default HeaderForm;
