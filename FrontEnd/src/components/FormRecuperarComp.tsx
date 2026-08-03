import type { FormEvent } from "react";

import useRedirrecion from "../hooks/Redirrecion";

function FormRecuperarComp() {
  const redirigir = useRedirrecion();

  function evtSubmitFormRecuperar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const identificador = String(formData.get("identificador") ?? "").trim();

    if (!identificador) {
      return;
    }

    redirigir("/antonella");
  }

  function evtClickButtonVolverLogin() {
    redirigir("/login");
  }

  return (
    <form
      className="
        relative
        mx-auto
        w-[calc(100%-2rem)]
        max-w-[clamp(458px,39vw,720px)]
        rounded-[clamp(18px,1.3vw,24px)]
        border
        border-[#e3e9f1]
        bg-white
        px-[clamp(28px,2.8vw,52px)]
        pb-[clamp(24px,2.5vw,46px)]
        pt-[clamp(20px,2.2vw,40px)]
        shadow-[0_12px_38px_rgba(15,46,85,0.13)]
      "
      onSubmit={evtSubmitFormRecuperar}
    >
      <div
        className="
          mx-auto
          grid
          h-[clamp(56px,4.2vw,76px)]
          w-[clamp(56px,4.2vw,76px)]
          place-items-center
          rounded-full
          bg-[#e3f7f7]
          text-[#00aeb5]
        "
      >
        <svg
          aria-hidden="true"
          className="
            h-[clamp(32px,2.5vw,44px)]
            w-[clamp(32px,2.5vw,44px)]
          "
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />

          <rect
            height="10"
            rx="2.2"
            stroke="currentColor"
            strokeWidth="1.8"
            width="14"
            x="5"
            y="10"
          />

          <path
            d="M12 14v2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      </div>

      <header className="mt-[clamp(12px,1vw,18px)] text-center">
        <h1
          className="
            text-[clamp(22px,1.8vw,34px)]
            font-bold
            tracking-[-0.02em]
            text-[#082767]
          "
        >
          Recuperar o restablecer contraseña
        </h1>

        <p
          className="
            mx-auto
            mt-[clamp(8px,0.8vw,14px)]
            max-w-[560px]
            text-[clamp(14px,1vw,18px)]
            leading-[1.45]
            text-[#5f7193]
          "
        >
          Ingresa tu DNI, correo electrónico o teléfono registrado
          <br className="hidden sm:block" /> y te enviaremos un código o enlace
          para continuar.
        </p>
      </header>

      <div className="mt-[clamp(22px,1.8vw,34px)]">
        <label
          className="
            mb-[clamp(8px,0.7vw,12px)]
            block
            text-[clamp(14px,1vw,17px)]
            font-semibold
            text-[#082767]
          "
          htmlFor="identificador-recuperacion"
        >
          DNI, correo o teléfono
        </label>

        <div
          className="
            flex
            h-[clamp(48px,3.5vw,62px)]
            items-center
            rounded-xl
            border
            border-[#ccd6e5]
            bg-white
            px-[clamp(14px,1.2vw,22px)]
            transition
            focus-within:border-[#0aaeb5]
            focus-within:ring-3
            focus-within:ring-[#0aaeb5]/10
          "
        >
          <svg
            aria-hidden="true"
            className="
              h-[clamp(20px,1.5vw,26px)]
              w-[clamp(20px,1.5vw,26px)]
              shrink-0
              text-[#60769c]
            "
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="8"
              r="3.25"
              stroke="currentColor"
              strokeWidth="1.7"
            />

            <path
              d="M5.75 19c.45-3.18 2.55-5 6.25-5s5.8 1.82 6.25 5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.7"
            />
          </svg>

          <input
            autoComplete="username"
            className="
              h-full
              min-w-0
              flex-1
              bg-transparent
              px-[clamp(12px,1vw,18px)]
              text-[clamp(14px,1vw,17px)]
              text-[#16366f]
              outline-none
              placeholder:text-[#8fa0bd]
            "
            id="identificador-recuperacion"
            name="identificador"
            placeholder="Ej: 45678901, correo@ejemplo.com o 987 654 321"
            required
            type="text"
          />
        </div>
      </div>

      <div
        className="
          mt-[clamp(16px,1.3vw,24px)]
          flex
          min-h-[clamp(52px,4vw,70px)]
          items-center
          gap-[clamp(12px,1vw,18px)]
          rounded-xl
          bg-gradient-to-r
          from-[#e9f3ff]
          to-[#edf6ff]
          px-[clamp(14px,1.3vw,24px)]
          py-[clamp(10px,1vw,16px)]
        "
      >
        <div
          className="
            grid
            h-[clamp(28px,2.2vw,38px)]
            w-[clamp(28px,2.2vw,38px)]
            shrink-0
            place-items-center
            rounded-full
            bg-[#176ed4]
            text-[clamp(14px,1vw,18px)]
            font-bold
            text-white
          "
        >
          i
        </div>

        <p
          className="
            text-[clamp(12px,0.85vw,15px)]
            leading-[1.4]
            text-[#27487d]
          "
        >
          <strong className="font-semibold text-[#173b79]">
            Te enviaremos un código o enlace temporal
          </strong>
          <br />
          para que puedas crear una nueva contraseña de forma segura.
        </p>
      </div>

      <button
        className="
          mt-[clamp(16px,1.4vw,26px)]
          flex
          h-[clamp(48px,3.5vw,62px)]
          w-full
          cursor-pointer
          items-center
          justify-center
          gap-[clamp(10px,0.9vw,16px)]
          rounded-xl
          bg-gradient-to-r
          from-[#0bb7ae]
          to-[#00aea9]
          text-[clamp(16px,1.1vw,20px)]
          font-semibold
          text-white
          shadow-[0_7px_17px_rgba(4,174,174,0.20)]
          transition
          hover:-translate-y-0.5
          hover:shadow-[0_9px_20px_rgba(4,174,174,0.27)]
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#08aeb5]
          active:translate-y-0
        "
        type="submit"
      >
        <svg
          aria-hidden="true"
          className="
            h-[clamp(20px,1.5vw,26px)]
            w-[clamp(20px,1.5vw,26px)]
          "
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="m3.5 11.25 16.75-7-5.75 16-3.15-6.1-7.85-2.9Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />

          <path
            d="m11.35 14.15 4.35-5.05"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
        Enviar código
      </button>

      <div
        className="
          my-[clamp(16px,1.4vw,26px)]
          flex
          items-center
          gap-[clamp(14px,1.2vw,22px)]
          text-[clamp(12px,0.85vw,15px)]
          font-medium
          text-[#637597]
        "
      >
        <span className="h-px flex-1 bg-[#d3deeb]" />

        <span>o</span>

        <span className="h-px flex-1 bg-[#d3deeb]" />
      </div>

      <button
        className="
          flex
          h-[clamp(48px,3.5vw,62px)]
          w-full
          cursor-pointer
          items-center
          justify-center
          gap-[clamp(10px,0.9vw,16px)]
          rounded-xl
          border
          border-[#4587ed]
          bg-white
          px-4
          text-[clamp(14px,1vw,18px)]
          font-semibold
          text-[#1264d7]
          transition
          hover:bg-[#f3f8ff]
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#4587ed]
        "
        onClick={evtClickButtonVolverLogin}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="
            h-[clamp(20px,1.5vw,26px)]
            w-[clamp(20px,1.5vw,26px)]
          "
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 12H5m5-5-5 5 5 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        Volver al inicio de sesión
      </button>
    </form>
  );
}

export default FormRecuperarComp;
