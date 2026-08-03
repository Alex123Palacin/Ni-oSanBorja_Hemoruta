import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import useRedirrecion from "../hooks/Redirrecion";

const CANTIDAD_DIGITOS = 6;
const TIEMPO_CODIGO_SEGUNDOS = 300;

function FormVerificacionComp() {
  const [codigo, setCodigo] = useState<string[]>(
    Array(CANTIDAD_DIGITOS).fill(""),
  );
  const [segundosRestantes, setSegundosRestantes] = useState(
    TIEMPO_CODIGO_SEGUNDOS,
  );

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const redirigir = useRedirrecion();

  const codigoCompleto = useMemo(
    () => codigo.every((digito) => digito.length === 1),
    [codigo],
  );

  const tiempoFormateado = useMemo(() => {
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;

    return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(
      2,
      "0",
    )}`;
  }, [segundosRestantes]);

  useEffect(() => {
    if (segundosRestantes <= 0) {
      return;
    }

    const intervalo = window.setInterval(() => {
      setSegundosRestantes((segundosActuales) =>
        Math.max(segundosActuales - 1, 0),
      );
    }, 1000);

    return () => window.clearInterval(intervalo);
  }, [segundosRestantes]);

  function evtChangeInputCodigo(index: number, valor: string) {
    const digito = valor.replace(/\D/g, "").slice(-1);

    setCodigo((codigoActual) => {
      const nuevoCodigo = [...codigoActual];
      nuevoCodigo[index] = digito;
      return nuevoCodigo;
    });

    if (digito && index < CANTIDAD_DIGITOS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function evtKeyDownInputCodigo(
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace" && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < CANTIDAD_DIGITOS - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function evtPasteInputCodigo(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const digitosPegados = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CANTIDAD_DIGITOS)
      .split("");

    if (digitosPegados.length === 0) {
      return;
    }

    setCodigo(
      Array.from(
        { length: CANTIDAD_DIGITOS },
        (_, index) => digitosPegados[index] ?? "",
      ),
    );

    const siguienteIndice = Math.min(
      digitosPegados.length,
      CANTIDAD_DIGITOS - 1,
    );

    inputRefs.current[siguienteIndice]?.focus();
  }

  function evtClickButtonReenviarCodigo() {
    setCodigo(Array(CANTIDAD_DIGITOS).fill(""));
    setSegundosRestantes(TIEMPO_CODIGO_SEGUNDOS);

    window.setTimeout(() => {
      inputRefs.current[0]?.focus();
    });
  }

  function evtSubmitFormVerificacion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!codigoCompleto || segundosRestantes === 0) {
      inputRefs.current[codigo.findIndex((digito) => !digito)]?.focus();
      return;
    }

    const codigoVerificacion = codigo.join("");

    console.log("Código de verificación:", codigoVerificacion);

    redirigir("/antonella");
  }

  return (
    <form
      className="
        relative
        mx-auto
        w-[calc(100%-2rem)]
        max-w-[clamp(440px,44vw,650px)]
        rounded-[clamp(18px,1.4vw,24px)]
        border
        border-[#e2e8f0]
        bg-white
        px-[clamp(28px,4vw,56px)]
        pb-[clamp(24px,2.6vw,42px)]
        pt-[clamp(22px,2.5vw,38px)]
        shadow-[0_14px_40px_rgba(15,46,85,0.14)]
      "
      onSubmit={evtSubmitFormVerificacion}
    >
      <div
        className="
          relative
          mx-auto
          h-[clamp(76px,7vw,104px)]
          w-[clamp(92px,8vw,122px)]
        "
      >
        <span
          className="
            absolute
            bottom-1
            left-0
            h-[clamp(34px,3vw,46px)]
            w-[clamp(34px,3vw,46px)]
            rounded-full
            bg-[#e8f7fb]
          "
        />

        <span
          className="
            absolute
            bottom-0
            right-0
            h-[clamp(38px,3.2vw,50px)]
            w-[clamp(38px,3.2vw,50px)]
            rounded-full
            bg-[#e7f4fb]
          "
        />

        <svg
          aria-hidden="true"
          className="
            absolute
            left-1/2
            top-0
            h-[clamp(76px,6.5vw,96px)]
            w-[clamp(68px,5.8vw,88px)]
            -translate-x-1/2
            drop-shadow-[0_9px_12px_rgba(0,141,153,0.22)]
          "
          viewBox="0 0 88 96"
        >
          <defs>
            <linearGradient
              id="gradiente-escudo-frente"
              x1="0"
              x2="1"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#16c7c3" />
              <stop offset="100%" stopColor="#008f9b" />
            </linearGradient>

            <linearGradient
              id="gradiente-escudo-lateral"
              x1="0"
              x2="1"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#008894" />
              <stop offset="100%" stopColor="#006975" />
            </linearGradient>
          </defs>

          <path
            d="M44 3 78 15v28c0 23-13.5 39.5-34 50C23.5 82.5 10 66 10 43V15L44 3Z"
            fill="url(#gradiente-escudo-frente)"
          />

          <path
            d="M44 3v90C23.5 82.5 10 66 10 43V15L44 3Z"
            fill="#13aaa9"
            opacity="0.72"
          />

          <path
            d="M44 11 70 20v23c0 18-10.2 31.5-26 41-15.8-9.5-26-23-26-41V20l26-9Z"
            fill="none"
            stroke="#22d3cf"
            strokeWidth="2.2"
          />

          <rect fill="white" height="26" rx="5" width="28" x="30" y="39" />

          <path
            d="M35.5 39v-6.5a8.5 8.5 0 0 1 17 0V39"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="5"
          />

          <circle cx="44" cy="51" fill="#08a3a7" r="3" />

          <path
            d="M44 53v5"
            stroke="#08a3a7"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        </svg>

        <span
          className="
            absolute
            -left-1
            top-[28%]
            h-2
            w-2
            text-[#63baf5]
          "
        >
          <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-current" />
          <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-current" />
        </span>

        <span
          className="
            absolute
            -right-1
            top-[36%]
            h-2
            w-2
            text-[#63baf5]
          "
        >
          <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-current" />
          <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-current" />
        </span>
      </div>

      <header className="mt-[clamp(8px,0.8vw,14px)] text-center">
        <h1
          className="
            text-[clamp(23px,2vw,34px)]
            font-bold
            tracking-[-0.025em]
            text-[#082767]
          "
        >
          Verificación de acceso
        </h1>

        <p
          className="
            mt-[clamp(5px,0.5vw,9px)]
            text-[clamp(13px,0.95vw,17px)]
            leading-[1.4]
            text-[#65779b]
          "
        >
          Hemos enviado un código al correo institucional
        </p>

        <div
          className="
            mt-1.5
            flex
            items-center
            justify-center
            gap-2
            text-[clamp(13px,0.95vw,17px)]
            font-semibold
            text-[#08aeb5]
          "
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="m3.75 6.75 7.22 5.35a1.75 1.75 0 0 0 2.06 0l7.22-5.35M5.5 19.25h13a2 2 0 0 0 2-2V6.75a2 2 0 0 0-2-2h-13a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          dr.valeria@***.pe
        </div>
      </header>

      <div
        className="
          mt-[clamp(22px,2vw,34px)]
          flex
          items-center
          justify-center
          gap-[clamp(8px,1.1vw,14px)]
        "
        onPaste={evtPasteInputCodigo}
      >
        {codigo.map((digito, index) => (
          <input
            aria-label={`Dígito ${index + 1} del código`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            className="
              h-[clamp(48px,5vw,66px)]
              w-[clamp(40px,4.8vw,64px)]
              rounded-[clamp(10px,1vw,14px)]
              border
              border-[#d6dfeb]
              bg-white
              text-center
              text-[clamp(22px,2vw,30px)]
              font-medium
              text-[#00a6ad]
              shadow-[0_3px_10px_rgba(15,46,85,0.03)]
              outline-none
              transition
              focus:border-[#06aeb4]
              focus:ring-3
              focus:ring-[#06aeb4]/10
            "
            inputMode="numeric"
            key={index}
            maxLength={1}
            onChange={(event) =>
              evtChangeInputCodigo(index, event.target.value)
            }
            onKeyDown={(event) => evtKeyDownInputCodigo(event, index)}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            value={digito}
          />
        ))}
      </div>

      <div
        className="
          mt-[clamp(16px,1.4vw,24px)]
          flex
          items-center
          justify-center
          gap-2
          text-[clamp(12px,0.9vw,15px)]
          text-[#6d7f9d]
        "
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="8.25"
            stroke="currentColor"
            strokeWidth="1.7"
          />

          <path
            d="M12 7.5V12l3 1.75"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>

        <span>El código vence en</span>

        <strong
          className={
            segundosRestantes === 0
              ? "font-semibold text-[#ef5350]"
              : "font-semibold text-[#00aaa9]"
          }
        >
          {tiempoFormateado}
        </strong>
      </div>

      <div className="my-[clamp(16px,1.5vw,26px)] h-px bg-[#e1e8f0]" />

      <button
        className="
          mx-auto
          flex
          cursor-pointer
          items-center
          justify-center
          gap-2
          text-[clamp(13px,0.95vw,16px)]
          font-semibold
          text-[#00a9ad]
          transition
          hover:text-[#008d95]
          hover:underline
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#08aeb5]
        "
        onClick={evtClickButtonReenviarCodigo}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M18.25 8.25A7 7 0 1 0 19 14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />

          <path
            d="M18.25 4.75v3.5h-3.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        Reenviar código
      </button>

      <button
        className="
          mt-[clamp(18px,1.7vw,28px)]
          flex
          h-[clamp(48px,4vw,62px)]
          w-full
          cursor-pointer
          items-center
          justify-center
          rounded-xl
          bg-gradient-to-r
          from-[#0bb7ae]
          to-[#009da7]
          px-5
          text-[clamp(15px,1.1vw,19px)]
          font-semibold
          text-white
          shadow-[0_9px_20px_rgba(4,162,170,0.24)]
          transition
          hover:-translate-y-0.5
          hover:shadow-[0_11px_25px_rgba(4,162,170,0.30)]
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#08aeb5]
          active:translate-y-0
        "
        type="submit"
      >
        <span className="flex-1 text-center">Verificar acceso</span>

        <svg
          aria-hidden="true"
          className="h-6 w-6 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M5 12h14m-5-5 5 5-5 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </svg>
      </button>
    </form>
  );
}

export default FormVerificacionComp;
