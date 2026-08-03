import FormVerificacionComp from "../components/FormVerificacionComp";

import fondoFormulario from "../assets/FondoNiño3.png";
import iconoHemoRuta from "../assets/iconoHemoRutaNoBg.png";

function VerificacionCuentaAdminsPage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-white">
      <header
        className="
          relative
          z-40
          flex
          h-[clamp(70px,5.2vw,88px)]
          w-full
          shrink-0
          items-center
          justify-between
          border-b
          border-[#e7ecf3]
          bg-white
          px-[clamp(24px,3vw,48px)]
          shadow-[0_2px_9px_rgba(15,46,85,0.06)]
        "
      >
        <div className="flex min-w-0 flex-col items-start">
          <img
            alt="HemoRuta Pediátrica"
            className="
              w-[clamp(145px,15vw,190px)]
              object-contain
            "
            src={iconoHemoRuta}
          />

          <p
            className="
              ml-1
              mt-0.5
              hidden
              text-[clamp(9px,0.75vw,12px)]
              font-medium
              text-[#5f7193]
              sm:block
            "
          >
            Hospital del Niño San Borja
          </p>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-[clamp(12px,1.4vw,22px)]
          "
        >
          <button
            className="
              hidden
              h-[clamp(40px,3.2vw,48px)]
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[#d7e4ee]
              bg-white
              px-[clamp(12px,1.2vw,20px)]
              text-[clamp(11px,0.85vw,14px)]
              font-semibold
              text-[#00a5ab]
              shadow-[0_3px_10px_rgba(23,58,103,0.05)]
              transition
              hover:border-[#0db5b8]
              hover:bg-[#f5fcfc]
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-[#08aeb5]
              sm:flex
            "
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3.5 19 6v5.5c0 4.4-2.75 7.55-7 9-4.25-1.45-7-4.6-7-9V6l7-2.5Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />

              <path
                d="M9.75 11.75 11.4 13.4l3.2-3.4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
            ¿Necesitas ayuda?
          </button>

          <div
            className="
              hidden
              h-[clamp(34px,2.8vw,46px)]
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
              gap-[clamp(8px,0.9vw,14px)]
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
                h-[clamp(40px,3.3vw,52px)]
                w-[clamp(40px,3.3vw,52px)]
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
                  max-w-[210px]
                  truncate
                  text-[clamp(12px,0.9vw,15px)]
                  font-bold
                  text-[#082767]
                "
              >
                Dra. Valeria Ruiz
              </p>

              <p
                className="
                  max-w-[210px]
                  truncate
                  text-[clamp(10px,0.75vw,13px)]
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
                h-4
                w-4
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

      <main
        className="
          relative
          flex
          min-h-0
          flex-1
          items-center
          justify-center
          overflow-hidden
          bg-cover
          bg-center
          bg-no-repeat
          px-4
          pb-[clamp(80px,8vh,110px)]
          pt-[clamp(20px,3vh,40px)]
        "
        style={{
          backgroundImage: `url(${fondoFormulario})`,
        }}
      >
        <div className="relative z-10 w-full">
          <FormVerificacionComp />
        </div>

        <footer
          className="
            absolute
            bottom-0
            left-2
            right-2
            z-20
            flex
            min-h-[clamp(58px,6vw,78px)]
            items-center
            justify-between
            gap-5
            rounded-t-xl
            border
            border-b-0
            border-[#e3eaf2]
            bg-white/95
            px-[clamp(18px,3vw,42px)]
            shadow-[0_-4px_18px_rgba(15,46,85,0.06)]
            backdrop-blur-sm
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <svg
              aria-hidden="true"
              className="
                h-[clamp(25px,2vw,34px)]
                w-[clamp(25px,2vw,34px)]
                shrink-0
                text-[#08afb4]
              "
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3.5 19 6v5.5c0 4.4-2.75 7.55-7 9-4.25-1.45-7-4.6-7-9V6l7-2.5Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />

              <path
                d="M9.5 11.8 11.3 13.6 14.8 10"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-[clamp(11px,0.85vw,14px)]
                  font-semibold
                  text-[#17356e]
                "
              >
                Tu seguridad es nuestra prioridad
              </p>

              <p
                className="
                  hidden
                  truncate
                  text-[clamp(9px,0.7vw,12px)]
                  text-[#647695]
                  sm:block
                "
              >
                Protegemos la información de nuestros pacientes y familias.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <svg
              aria-hidden="true"
              className="
                h-[clamp(25px,2vw,34px)]
                w-[clamp(25px,2vw,34px)]
                shrink-0
                text-[#63799e]
              "
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3.5 19 6v5.5c0 4.4-2.75 7.55-7 9-4.25-1.45-7-4.6-7-9V6l7-2.5Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />

              <path
                d="M8.8 12.1 11 14.3l4.4-4.6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>

            <div>
              <p
                className="
                  text-[clamp(11px,0.85vw,14px)]
                  font-semibold
                  text-[#17356e]
                "
              >
                Cumplimos con la Ley N.° 29733
              </p>

              <p
                className="
                  text-[clamp(9px,0.7vw,12px)]
                  text-[#647695]
                "
              >
                Ley de Protección de Datos Personales
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default VerificacionCuentaAdminsPage;
