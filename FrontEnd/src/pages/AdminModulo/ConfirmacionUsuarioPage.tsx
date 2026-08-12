import iconoHemoRuta from "../../assets/iconoHemoRutaNoBg.png";
import fondoNino from "../../assets/FondoNiño4.png";

import useRedirrecion from "../../hooks/Redirrecion";
import useAuth from "../../auth/useAuth";

interface UsuarioCreadoLocal {
  contrasenaTemporal: string;
  correo: string;
  documento: string;
  nombreCompleto: string;
  rol: "ADMINISTRADOR" | "MEDICO" | "PACIENTE";
}

function obtenerUsuarioCreado(): UsuarioCreadoLocal {
  const respaldo: UsuarioCreadoLocal = {
    contrasenaTemporal: "HemoRuta-44567891!",
    correo: "sofia.gutierrez@hnsb.gob.pe",
    documento: "44567891",
    nombreCompleto: "Dra. Sofía Gutiérrez",
    rol: "MEDICO",
  };

  try {
    const guardado = window.sessionStorage.getItem("hemoruta.admin.ultimoUsuarioCreado");
    return guardado ? { ...respaldo, ...JSON.parse(guardado) } : respaldo;
  } catch {
    return respaldo;
  }
}

function ConfirmacionUsuarioPage() {
  const { usuario: usuarioSesion } = useAuth();
  const redirigir = useRedirrecion();
  const usuarioCreado = obtenerUsuarioCreado();
  const perfiles = {
    ADMINISTRADOR: "Administrador general",
    MEDICO: "Médico",
    PACIENTE: "Paciente o responsable",
  } as const;
  const perfilUsuario = perfiles[usuarioCreado.rol];

  function evtClickIrListado() {
    redirigir("/admin/UsuariosHospitalarios");
  }

  function evtClickCrearOtroUsuario() {
    redirigir("/admin/CrearUs");
  }

  function evtClickUsuariosHospitalarios() {
    redirigir("/admin/UsuariosHospitalarios");
  }

  return (
    <div className="min-h-dvh bg-[#fbfdff] text-[#0b2b69]">
      <div className="flex min-h-dvh">
        {/* =========================
            SIDEBAR
        ========================== */}
        <aside
          className="
            hidden
            w-[250px]
            shrink-0
            flex-col
            border-r
            border-[#dce5ee]
            bg-white
            lg:flex
          "
        >
          <div className="px-6 pb-4 pt-6">
            <img
              alt="HemoRuta Pediátrica"
              className="w-[165px] object-contain"
              src={iconoHemoRuta}
            />

            <div className="mt-5 flex items-center gap-3">
              <div
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-lg
                  bg-[#e8f8f8]
                  text-[#0aaeb5]
                "
              >
                <svg
                  aria-hidden="true"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 21V7.5h14V21M8 7.5V4h8v3.5M8.5 11h2M13.5 11h2M8.5 14.5h2M13.5 14.5h2M10 21v-3.5h4V21"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
              </div>

              <div className="text-[14px] font-bold leading-[1.45] text-[#0b2b69]">
                <p>Hospital del Niño</p>
                <p>San Borja</p>
              </div>
            </div>
          </div>

          <div className="mx-5 h-px bg-[#dce5ee]" />

          <nav className="mt-3 px-3">
            <button
              className="
                flex
                h-12
                w-full
                cursor-pointer
                items-center
                gap-4
                rounded-xl
                px-4
                text-left
                text-sm
                font-medium
                text-[#5d6f91]
                transition
                hover:bg-[#f4fafb]
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
                  d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
              Inicio
            </button>

            <button
              className="
                relative
                mt-1
                flex
                h-12
                w-full
                cursor-pointer
                items-center
                gap-4
                rounded-xl
                bg-[#e9f8f8]
                px-4
                text-left
                text-sm
                font-semibold
                text-[#029ca5]
              "
              onClick={evtClickUsuariosHospitalarios}
              type="button"
            >
              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  top-0
                  w-[4px]
                  rounded-r-full
                  bg-[#06afb5]
                "
              />
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15.8 10a2.5 2.5 0 1 0 0-5M3.5 19v-1.2c0-3 2.1-4.8 5-4.8s5 1.8 5 4.8V19h-10ZM14 13.6c3.6-.6 6.5.9 6.5 4.2V19h-4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
              Usuarios hospitalarios
            </button>

            <button
              className="
                mt-1
                flex
                h-12
                w-full
                cursor-pointer
                items-center
                gap-4
                rounded-xl
                px-4
                text-left
                text-sm
                font-medium
                text-[#5d6f91]
                transition
                hover:bg-[#f4fafb]
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
                  d="M5 20V12h3v8H5ZM10.5 20V5h3v15h-3ZM16 20V9h3v11h-3Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
              Actividad
            </button>
          </nav>

          {/* ILUSTRACIÓN */}
          <div className="relative mt-2 flex-1 overflow-hidden">
            <img
              alt=""
              aria-hidden="true"
              className="
                absolute
                left-1/2
                top-1
                h-[240px]
                w-[220px]
                -translate-x-1/2
                object-cover
                object-[50%_57%]
              "
              src={fondoNino}
            />
          </div>

          {/* AVISO */}
          <div
            className="
              mx-4
              mb-5
              flex
              gap-3
              rounded-2xl
              border
              border-[#cfe9eb]
              bg-gradient-to-br
              from-[#f4fcfc]
              to-[#eff8fa]
              p-4
            "
          >
            <svg
              aria-hidden="true"
              className="h-9 w-9 shrink-0 text-[#08aeb5]"
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

            <p className="text-[11px] leading-[1.55] text-[#30486e]">
              Este rol es únicamente administrativo y no tiene acceso a datos de
              pacientes ni a información clínica.
            </p>
          </div>
        </aside>

        {/* =========================
            CONTENIDO
        ========================== */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* HEADER */}
          <header
            className="
              flex
              h-[68px]
              shrink-0
              items-center
              justify-end
              border-b
              border-[#e4eaf1]
              bg-white
              px-[clamp(20px,3vw,42px)]
            "
          >
            <button
              className="
                flex
                cursor-pointer
                items-center
                gap-3
                rounded-xl
                px-2
                py-1
                text-left
                transition
                hover:bg-[#f6f9fc]
              "
              onClick={() => redirigir('/admin/inicio')}
              type="button"
            >
              <div
                className="
                  grid
                  relative
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  overflow-hidden
                  rounded-full
                  border
                  border-[#cfe2e6]
                  bg-[#eaf8f8]
                "
              >
                {usuarioSesion?.fotoPerfil && (
                  <img alt={`Foto de ${usuarioSesion.nombre}`} className="absolute inset-0 z-10 h-full w-full object-cover" src={usuarioSesion.fotoPerfil} />
                )}
                <svg
                  aria-hidden="true"
                  className="h-full w-full"
                  viewBox="0 0 48 48"
                >
                  <circle cx="24" cy="24" fill="#E5F5F5" r="24" />

                  <circle cx="24" cy="17" fill="#E4B59B" r="8" />

                  <path
                    d="M16 17c0-6 3.2-10 8.2-10 5.3 0 8.3 4.1 8.3 10-2.1-1.1-4.2-3.5-5-6.1-2.4 3.4-6.8 5.5-11.5 6.1Z"
                    fill="#8B4F36"
                  />

                  <path
                    d="M11.5 44c.8-10 5.4-15 12.5-15s11.7 5 12.5 15h-25Z"
                    fill="#0BAEB5"
                  />

                  <path d="M19 29.5 24 35l5-5.5" fill="#FFFFFF" />
                </svg>
              </div>

              <div className="hidden md:block">
                <p className="text-xs font-bold text-[#0b2b69]">
                  {usuarioSesion?.nombre ?? "Administrador"}
                </p>

                <p className="mt-0.5 text-[10px] text-[#667794]">
                  Administrador general
                </p>
              </div>

              <svg
                aria-hidden="true"
                className="h-4 w-4 text-[#0b2b69]"
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
          </header>

          {/* =========================
              PAGE
          ========================== */}
          <main
            className="
              flex-1
              overflow-auto
              px-[clamp(20px,3vw,42px)]
              pb-8
              pt-[clamp(20px,2.4vw,32px)]
            "
          >
            <div className="mx-auto max-w-[1120px]">
              <h1
                className="
                  text-[clamp(28px,2.5vw,40px)]
                  font-bold
                  tracking-[-0.035em]
                  text-[#082767]
                "
              >
                Usuario creado correctamente
              </h1>

              <p className="mt-1 text-xs text-[#65738d] sm:text-sm">
                La cuenta está activa y lista para ingresar con su
                contraseña temporal.
              </p>

              {/* =========================
                  CONFIRMACIÓN
              ========================== */}
              <section
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-[#dce4ec]
                  bg-white
                  px-[clamp(20px,4vw,60px)]
                  pb-[clamp(24px,3vw,38px)]
                  pt-[clamp(18px,2vw,28px)]
                  shadow-[0_7px_24px_rgba(15,46,85,0.08)]
                "
              >
                {/* CHECK */}
                <div className="flex justify-center">
                  <div className="relative">
                    <span
                      className="
                        absolute
                        -left-8
                        top-2
                        h-2
                        w-2
                        rounded-full
                        bg-[#30bfc1]
                      "
                    />

                    <span
                      className="
                        absolute
                        -right-7
                        top-4
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-[#f7ae22]
                      "
                    />

                    <span
                      className="
                        absolute
                        -right-10
                        bottom-2
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-[#39bcc1]
                      "
                    />

                    <div
                      className="
                        grid
                        h-[clamp(58px,5vw,78px)]
                        w-[clamp(58px,5vw,78px)]
                        place-items-center
                        rounded-full
                        bg-[#ddf5e8]
                        text-[#11935e]
                      "
                    >
                      <svg
                        aria-hidden="true"
                        className="
                          h-[clamp(30px,2.8vw,42px)]
                          w-[clamp(30px,2.8vw,42px)]
                        "
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="m5 12.5 4.3 4.3L19.5 6.5"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.8"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ESTADO ENVÍO */}
                <div className="mt-3 flex justify-center">
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-lg
                      bg-[#e4f7eb]
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      text-[#168b58]
                    "
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        height="14"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        width="17"
                        x="3.5"
                        y="5"
                      />

                      <path
                        d="m4.5 7 6.5 5a1.7 1.7 0 0 0 2 0l6.5-5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                      />
                    </svg>
                    Cuenta hospitalaria activa
                  </div>
                </div>

                {/* DATOS */}
                <div
                  className="
                    mx-auto
                    mt-3
                    flex
                    max-w-[720px]
                    flex-col
                    gap-5
                    md:flex-row
                    md:items-center
                  "
                >
                  {/* AVATAR */}
                  <div className="flex justify-center md:block">
                    <div
                      className="
                        grid
                        h-[clamp(100px,10vw,140px)]
                        w-[clamp(100px,10vw,140px)]
                        shrink-0
                        place-items-center
                        overflow-hidden
                        rounded-full
                        bg-[#e9f7f7]
                      "
                    >
                      <svg
                        aria-hidden="true"
                        className="h-full w-full"
                        viewBox="0 0 120 120"
                      >
                        <circle cx="60" cy="60" fill="#E8F5F4" r="60" />

                        <circle cx="60" cy="47" fill="#EDB28E" r="26" />

                        <path
                          d="M34 50c0-24 11-37 27-37 20 0 31 14 31 36-7-2-14-8-18-17-8 10-23 17-40 18Z"
                          fill="#6D321E"
                        />

                        <path
                          d="M29 117c2-32 14-49 31-49s29 17 31 49H29Z"
                          fill="#FFFFFF"
                        />

                        <path d="M47 72 60 88l13-16" fill="#0BAEB5" />

                        <path
                          d="M37 81c-7 9-11 22-12 36h12M83 81c7 9 11 22 12 36H83"
                          fill="none"
                          stroke="#526B7E"
                          strokeLinecap="round"
                          strokeWidth="3"
                        />

                        <circle cx="50" cy="48" fill="#26394B" r="2" />
                        <circle cx="70" cy="48" fill="#26394B" r="2" />

                        <path
                          d="M53 59c4 3 10 3 14 0"
                          fill="none"
                          stroke="#B45A48"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="min-w-0 flex-1">
                    {/* NOMBRE */}
                    <div
                      className="
                        grid
                        min-h-[42px]
                        grid-cols-[28px_130px_1fr]
                        items-center
                        border-b
                        border-[#dce4ec]
                        text-xs
                      "
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-[#667895]"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />

                        <path
                          d="M5.5 19c.5-3.5 2.7-5.3 6.5-5.3s6 1.8 6.5 5.3"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="1.6"
                        />
                      </svg>

                      <span className="text-[#60708a]">Nombre</span>

                      <strong className="font-semibold text-[#17356e]">
                        {usuarioCreado.nombreCompleto}
                      </strong>
                    </div>

                    {/* DNI */}
                    <div
                      className="
                        grid
                        min-h-[42px]
                        grid-cols-[28px_130px_1fr]
                        items-center
                        border-b
                        border-[#dce4ec]
                        text-xs
                      "
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-[#667895]"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          height="14"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          width="17"
                          x="3.5"
                          y="5"
                        />

                        <circle
                          cx="8.5"
                          cy="10"
                          r="2"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />

                        <path
                          d="M6 15c.4-1.7 1.3-2.5 2.5-2.5S10.6 13.3 11 15M13.5 9.5h4M13.5 13h4"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="1.4"
                        />
                      </svg>

                      <span className="text-[#60708a]">DNI</span>

                      <strong className="font-semibold text-[#17356e]">
                        {usuarioCreado.documento}
                      </strong>
                    </div>

                    {/* CORREO */}
                    <div
                      className="
                        grid
                        min-h-[42px]
                        grid-cols-[28px_130px_1fr]
                        items-center
                        border-b
                        border-[#dce4ec]
                        text-xs
                      "
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-[#667895]"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          height="14"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          width="17"
                          x="3.5"
                          y="5"
                        />

                        <path
                          d="m4.5 7 6.5 5a1.7 1.7 0 0 0 2 0l6.5-5"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                        />
                      </svg>

                      <span className="text-[#60708a]">Correo electrónico</span>

                      <strong
                        className="
                          min-w-0
                          truncate
                          font-semibold
                          text-[#17356e]
                        "
                      >
                        {usuarioCreado.correo}
                      </strong>
                    </div>

                    {/* PERFIL */}
                    <div
                      className="
                        grid
                        min-h-[42px]
                        grid-cols-[28px_130px_1fr]
                        items-center
                        border-b
                        border-[#dce4ec]
                        text-xs
                      "
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-[#667895]"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 20V9h14v11M8 9V5h8v4M9 13h6"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                        />
                      </svg>

                      <span className="text-[#60708a]">Perfil</span>

                      <div>
                        <span
                          className="
                            inline-flex
                            rounded-lg
                            bg-[#e7f2ff]
                            px-3
                            py-1.5
                            text-[10px]
                            font-semibold
                            text-[#2879d8]
                          "
                        >
                          {perfilUsuario}
                        </span>
                      </div>
                    </div>

                    {/* ESTADO */}
                    <div
                      className="
                        grid
                        min-h-[42px]
                        grid-cols-[28px_130px_1fr]
                        items-center
                        text-xs
                      "
                    >
                      <div className="grid h-5 w-5 place-items-center">
                        <span
                          className="
                            h-2.5
                            w-2.5
                            rounded-full
                            bg-[#1cb16d]
                            ring-4
                            ring-[#e3f7ec]
                          "
                        />
                      </div>

                      <span className="text-[#60708a]">Estado</span>

                      <div>
                        <span
                          className="
                            inline-flex
                            rounded-lg
                            bg-[#e4f7eb]
                            px-3
                            py-1.5
                            text-[10px]
                            font-medium
                            text-[#168b58]
                          "
                        >
                          Activa
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================
                    PROGRESO
                ========================== */}
                <div className="mx-auto mt-6 max-w-[760px]">
                  <div className="relative">
                    <div
                      className="
                        absolute
                        left-[8%]
                        right-[8%]
                        top-4
                        h-[2px]
                        bg-[#159a66]
                      "
                    />

                    <div
                      className="
                        relative
                        grid
                        grid-cols-3
                        gap-2
                      "
                    >
                      {/* PASO 1 */}
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="
                            relative
                            z-10
                            grid
                            h-8
                            w-8
                            place-items-center
                            rounded-full
                            border-2
                            border-[#159a66]
                            bg-white
                            text-[#159a66]
                          "
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="m6.5 12 3.2 3.2 7.5-7.5"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>

                        <p className="mt-2 text-xs font-semibold text-[#17356e]">
                          Usuario creado
                        </p>

                        <p className="mt-1 text-[10px] text-[#65738d]">
                          Completado
                        </p>
                      </div>

                      {/* PASO 2 */}
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="
                            relative
                            z-10
                            grid
                            h-8
                            w-8
                            place-items-center
                            rounded-full
                            border-2
                            border-[#159a66]
                            bg-white
                            text-[#159a66]
                          "
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="m6.5 12 3.2 3.2 7.5-7.5"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>

                        <p className="mt-2 text-xs font-semibold text-[#17356e]">
                          Credenciales generadas
                        </p>

                        <p className="mt-1 text-[10px] text-[#65738d]">
                          Completado
                        </p>
                      </div>

                      {/* PASO 3 */}
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="
                            relative
                            z-10
                            grid
                            h-8
                            w-8
                            place-items-center
                            rounded-full
                            bg-[#159a66]
                            text-xs
                            font-bold
                            text-white
                          "
                        >
                          3
                        </div>

                        <p className="mt-2 text-xs font-semibold text-[#17356e]">
                          Listo para ingresar
                        </p>

                        <p
                          className="
                            mt-1
                            max-w-[170px]
                            text-[10px]
                            leading-[1.4]
                            text-[#65738d]
                          "
                        >
                          Contraseña temporal: {usuarioCreado.contrasenaTemporal}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =========================
                  BOTONES
              ========================== */}
              <div
                className="
                  mt-5
                  flex
                  flex-col
                  items-stretch
                  justify-center
                  gap-3
                  sm:flex-row
                  sm:items-center
                "
              >
                <button
                  className="
                    flex
                    h-11
                    cursor-pointer
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    border
                    border-[#08aeb5]
                    bg-white
                    px-7
                    text-xs
                    font-semibold
                    text-[#008f98]
                    transition
                    hover:bg-[#f2fbfb]
                  "
                  onClick={evtClickIrListado}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8 6h11M8 12h11M8 18h11"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />

                    <circle cx="4" cy="6" fill="currentColor" r="1" />
                    <circle cx="4" cy="12" fill="currentColor" r="1" />
                    <circle cx="4" cy="18" fill="currentColor" r="1" />
                  </svg>
                  Ir al listado
                </button>

                <button
                  className="
                    flex
                    h-11
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-[#09afb1]
                    to-[#00999f]
                    px-7
                    text-xs
                    font-semibold
                    text-white
                    shadow-[0_6px_16px_rgba(0,158,166,0.20)]
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-[0_8px_20px_rgba(0,158,166,0.27)]
                  "
                  onClick={evtClickCrearOtroUsuario}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="9"
                      cy="8"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                    <path
                      d="M3.5 19v-1.4c0-3 2.1-4.8 5.5-4.8s5.5 1.8 5.5 4.8V19h-11ZM18.5 7v6M15.5 10h6"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.7"
                    />
                  </svg>
                  Crear otro usuario
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ConfirmacionUsuarioPage;
