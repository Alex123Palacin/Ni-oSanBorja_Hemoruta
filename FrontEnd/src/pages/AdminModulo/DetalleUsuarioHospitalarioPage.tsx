import iconoHemoRuta from "../../assets/iconoHemoRutaNoBg.png";
import fondoNino from "../../assets/FondoNiño4.png";

import useRedirrecion from "../../hooks/Redirrecion";

function DetalleUsuarioHospitalarioPage() {
  const redirigir = useRedirrecion();

  function evtClickUsuariosHospitalarios() {
    redirigir("/admin/UsuariosHospitalarios");
  }

  function evtClickNuevoUsuario() {
    redirigir("/admin/CrearUs");
  }

  function evtClickDescargarReporte() {
    console.log("Descargar reporte");
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
            {/* INICIO */}
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

            {/* USUARIOS */}
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

            {/* ACTIVIDAD */}
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

          {/* NIÑO */}
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

          {/* MENSAJE */}
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
              type="button"
            >
              {/* AVATAR ADMIN */}
              <div
                className="
                  grid
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
                  Lic. Andrea Salazar
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
              px-[clamp(16px,2.7vw,38px)]
              pb-8
              pt-[clamp(18px,2vw,28px)]
            "
          >
            <div className="mx-auto max-w-[1240px]">
              {/* VOLVER */}
              <button
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-2
                  text-xs
                  font-semibold
                  text-[#009fa7]
                  transition
                  hover:text-[#007f87]
                "
                onClick={evtClickUsuariosHospitalarios}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
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
                Usuarios hospitalarios
              </button>

              {/* TÍTULO */}
              <section
                className="
                  mt-3
                  flex
                  flex-col
                  gap-4
                  lg:flex-row
                  lg:items-start
                  lg:justify-between
                "
              >
                <div>
                  <h1
                    className="
                      text-[clamp(27px,2.5vw,39px)]
                      font-bold
                      tracking-[-0.035em]
                      text-[#082767]
                    "
                  >
                    Detalle de usuario hospitalario
                  </h1>

                  <p className="mt-1 text-xs text-[#65738d] sm:text-sm">
                    Información detallada y estado de activación de la cuenta
                    del usuario.
                  </p>
                </div>

                <button
                  className="
                    flex
                    h-11
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    self-start
                    rounded-xl
                    bg-gradient-to-r
                    from-[#09afb1]
                    to-[#00999f]
                    px-6
                    text-xs
                    font-semibold
                    text-white
                    shadow-[0_6px_16px_rgba(0,158,166,0.20)]
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-[0_8px_20px_rgba(0,158,166,0.27)]
                  "
                  onClick={evtClickNuevoUsuario}
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
                  Nuevo usuario
                </button>
              </section>

              {/* =========================
                  FILA SUPERIOR
              ========================== */}
              <section
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-4
                  xl:grid-cols-[0.95fr_1.05fr]
                "
              >
                {/* PERFIL */}
                <article
                  className="
                    rounded-2xl
                    border
                    border-[#d9e3eb]
                    bg-white
                    p-[clamp(18px,2vw,28px)]
                    shadow-[0_3px_13px_rgba(15,46,85,0.035)]
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      sm:flex-row
                      sm:items-start
                    "
                  >
                    {/* AVATAR MÉDICO */}
                    <div
                      className="
                        mx-auto
                        grid
                        h-[clamp(110px,10vw,145px)]
                        w-[clamp(110px,10vw,145px)]
                        shrink-0
                        place-items-center
                        overflow-hidden
                        rounded-full
                        bg-[#e3f6f5]
                        sm:mx-0
                      "
                    >
                      <svg
                        aria-hidden="true"
                        className="h-full w-full"
                        viewBox="0 0 120 120"
                      >
                        <circle cx="60" cy="60" fill="#DCF3F3" r="60" />

                        <circle cx="60" cy="44" fill="#E8AE87" r="26" />

                        <path
                          d="M34 45c0-23 11-34 27-34 19 0 30 13 30 34-8-3-15-9-19-17-8 10-22 16-38 17Z"
                          fill="#172C31"
                        />

                        <path
                          d="M28 120c3-31 15-49 32-49s29 18 32 49H28Z"
                          fill="#FFFFFF"
                        />

                        <path d="m45 74 15 18 15-18" fill="#10aeb1" />

                        <path
                          d="M37 82c-8 8-12 23-13 38M83 82c8 8 12 23 13 38"
                          fill="none"
                          stroke="#5D7185"
                          strokeLinecap="round"
                          strokeWidth="3"
                        />

                        <circle cx="50" cy="44" fill="#263442" r="2.2" />
                        <circle cx="70" cy="44" fill="#263442" r="2.2" />

                        <path
                          d="M53 56c4 3 10 3 14 0"
                          fill="none"
                          stroke="#B9654E"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2
                        className="
                          text-center
                          text-[clamp(20px,1.7vw,27px)]
                          font-bold
                          text-[#082767]
                          sm:text-left
                        "
                      >
                        Dr. Luis Paredes
                      </h2>

                      <div className="mt-4 space-y-3">
                        {/* DNI */}
                        <div
                          className="
                            grid
                            grid-cols-[24px_110px_1fr]
                            items-center
                            gap-2
                            text-xs
                          "
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4.5 w-4.5 text-[#637795]"
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

                          <span className="text-[#50617d]">DNI</span>

                          <strong className="font-medium text-[#263d64]">
                            43321108
                          </strong>
                        </div>

                        {/* CORREO */}
                        <div
                          className="
                            grid
                            grid-cols-[24px_110px_1fr]
                            items-center
                            gap-2
                            text-xs
                          "
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4.5 w-4.5 text-[#637795]"
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

                          <span className="text-[#50617d]">
                            Correo institucional
                          </span>

                          <strong
                            className="
                              min-w-0
                              truncate
                              font-medium
                              text-[#263d64]
                            "
                          >
                            luis.paredes@hnsb.gob.pe
                          </strong>
                        </div>

                        {/* TELEFONO */}
                        <div
                          className="
                            grid
                            grid-cols-[24px_110px_1fr]
                            items-center
                            gap-2
                            text-xs
                          "
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4.5 w-4.5 text-[#637795]"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M7.2 4.5 9.5 8 8 9.8c1.2 2.5 3 4.3 5.5 5.5l1.8-1.5 3.5 2.3-.3 2.5c-.1.8-.8 1.4-1.6 1.4C9.8 19.5 4.5 14.2 4 7.1c-.1-.8.5-1.5 1.3-1.6l1.9-1Z"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.6"
                            />
                          </svg>

                          <span className="text-[#50617d]">Teléfono</span>

                          <strong className="font-medium text-[#263d64]">
                            987 654 321
                          </strong>
                        </div>

                        {/* PERFIL */}
                        <div
                          className="
                            grid
                            grid-cols-[24px_110px_1fr]
                            items-center
                            gap-2
                            text-xs
                          "
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4.5 w-4.5 text-[#637795]"
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

                          <span className="text-[#50617d]">Perfil</span>

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
                                text-[#2676d3]
                              "
                            >
                              Médico
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                {/* CONSULTAS */}
                <article
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    rounded-2xl
                    border
                    border-[#d9e3eb]
                    bg-white
                    p-[clamp(16px,1.8vw,24px)]
                    shadow-[0_3px_13px_rgba(15,46,85,0.035)]
                    md:grid-cols-[150px_1fr]
                  "
                >
                  {/* MÉTRICAS */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                    <div
                      className="
                        rounded-xl
                        border
                        border-[#dce4ec]
                        bg-gradient-to-br
                        from-white
                        to-[#fbfdff]
                        p-4
                      "
                    >
                      <p className="text-[11px] font-medium text-[#475b7a]">
                        Pacientes activos
                      </p>

                      <p className="mt-1 text-3xl font-bold text-[#082767]">
                        248
                      </p>

                      <p className="mt-3 text-[10px] font-semibold text-[#18a35e]">
                        +12%{" "}
                        <span className="font-normal text-[#397a5c]">
                          vs mes anterior
                        </span>
                      </p>
                    </div>

                    <div
                      className="
                        rounded-xl
                        border
                        border-[#dce4ec]
                        bg-gradient-to-br
                        from-white
                        to-[#fbfdff]
                        p-4
                      "
                    >
                      <p className="text-[11px] font-medium text-[#475b7a]">
                        Consultas este mes
                      </p>

                      <p className="mt-1 text-3xl font-bold text-[#082767]">
                        186
                      </p>

                      <p className="mt-3 text-[10px] font-semibold text-[#18a35e]">
                        +8%{" "}
                        <span className="font-normal text-[#397a5c]">
                          vs mes anterior
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* GRÁFICO AZUL */}
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-[#17356e]">
                      Consultas por semana
                    </h3>

                    <svg
                      aria-label="Gráfico de consultas por semana"
                      className="mt-2 h-[190px] w-full"
                      preserveAspectRatio="none"
                      role="img"
                      viewBox="0 0 500 220"
                    >
                      {/* GRID */}
                      {[30, 75, 120, 165].map((y) => (
                        <line
                          key={y}
                          stroke="#e4eaf0"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                          x1="40"
                          x2="490"
                          y1={y}
                          y2={y}
                        />
                      ))}

                      <line
                        stroke="#cfd9e5"
                        strokeWidth="1"
                        x1="40"
                        x2="40"
                        y1="20"
                        y2="180"
                      />

                      <line
                        stroke="#cfd9e5"
                        strokeWidth="1"
                        x1="40"
                        x2="490"
                        y1="180"
                        y2="180"
                      />

                      {/* VALORES Y */}
                      <g fill="#50617b" fontFamily="sans-serif" fontSize="11">
                        <text x="4" y="34">
                          80
                        </text>
                        <text x="4" y="79">
                          60
                        </text>
                        <text x="4" y="124">
                          40
                        </text>
                        <text x="4" y="169">
                          20
                        </text>
                      </g>

                      {/* LINEA */}
                      <polyline
                        fill="none"
                        points="
                          65,155
                          125,120
                          185,78
                          245,105
                          305,115
                          365,78
                          425,73
                          475,50
                        "
                        stroke="#1585e7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />

                      {[
                        [65, 155],
                        [125, 120],
                        [185, 78],
                        [245, 105],
                        [305, 115],
                        [365, 78],
                        [425, 73],
                        [475, 50],
                      ].map(([cx, cy]) => (
                        <circle
                          cx={cx}
                          cy={cy}
                          fill="#1585e7"
                          key={`${cx}-${cy}`}
                          r="4.5"
                        />
                      ))}

                      <g
                        fill="#50617b"
                        fontFamily="sans-serif"
                        fontSize="11"
                        textAnchor="middle"
                      >
                        <text x="75" y="205">
                          Sem 1
                        </text>
                        <text x="180" y="205">
                          Sem 2
                        </text>
                        <text x="290" y="205">
                          Sem 3
                        </text>
                        <text x="390" y="205">
                          Sem 4
                        </text>
                        <text x="470" y="205">
                          Sem 5
                        </text>
                      </g>
                    </svg>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-[#f1f4ff]
                        px-3
                        py-2
                        text-[10px]
                        text-[#566b98]
                      "
                    >
                      <div
                        className="
                          grid
                          h-4
                          w-4
                          shrink-0
                          place-items-center
                          rounded-full
                          border
                          border-[#4677e6]
                          text-[9px]
                          font-bold
                          text-[#4677e6]
                        "
                      >
                        i
                      </div>
                      Datos de todas las sedes.
                    </div>
                  </div>
                </article>
              </section>

              {/* =========================
                  FILA INFERIOR
              ========================== */}
              <section
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-4
                  xl:grid-cols-[0.8fr_1.2fr]
                "
              >
                {/* DATOS REGISTRADOS */}
                <article
                  className="
                    rounded-2xl
                    border
                    border-[#d9e3eb]
                    bg-white
                    p-[clamp(18px,2vw,26px)]
                    shadow-[0_3px_13px_rgba(15,46,85,0.035)]
                  "
                >
                  <div className="flex items-center gap-3">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5 text-[#00a7ae]"
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

                      <circle
                        cx="18.5"
                        cy="16.5"
                        fill="white"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />

                      <path
                        d="m17.2 16.6.9.9 1.7-1.8"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.2"
                      />
                    </svg>

                    <h2 className="text-sm font-bold text-[#009fa7]">
                      Datos registrados
                    </h2>
                  </div>

                  <div className="mt-4">
                    {[
                      ["Nombre completo", "Luis Paredes"],
                      ["DNI", "43321108"],
                      ["Correo institucional", "luis.paredes@hnsb.gob.pe"],
                      ["Teléfono", "987 654 321"],
                    ].map(([label, value]) => (
                      <div
                        className="
                          grid
                          min-h-[43px]
                          grid-cols-[140px_1fr]
                          items-center
                          gap-4
                          border-b
                          border-dashed
                          border-[#d9e2eb]
                          text-[11px]
                        "
                        key={label}
                      >
                        <span className="font-medium text-[#52637e]">
                          {label}
                        </span>

                        <span className="min-w-0 truncate text-[#344966]">
                          {value}
                        </span>
                      </div>
                    ))}

                    <div
                      className="
                        grid
                        min-h-[43px]
                        grid-cols-[140px_1fr]
                        items-center
                        gap-4
                        border-b
                        border-dashed
                        border-[#d9e2eb]
                        text-[11px]
                      "
                    >
                      <span className="font-medium text-[#52637e]">Perfil</span>

                      <div>
                        <span
                          className="
                            inline-flex
                            rounded-lg
                            bg-[#e6f2ff]
                            px-3
                            py-1.5
                            text-[10px]
                            font-semibold
                            text-[#2676d3]
                          "
                        >
                          Médico
                        </span>
                      </div>
                    </div>

                    <div
                      className="
                        grid
                        min-h-[43px]
                        grid-cols-[140px_1fr]
                        items-center
                        gap-4
                        text-[11px]
                      "
                    >
                      <span className="font-medium text-[#52637e]">
                        Fecha de registro
                      </span>

                      <span className="text-[#344966]">
                        15 may. 2024, 09:15 a. m.
                      </span>
                    </div>
                  </div>
                </article>

                {/* CALIFICACIÓN + RESEÑAS */}
                <article
                  className="
                    grid
                    grid-cols-1
                    gap-5
                    rounded-2xl
                    border
                    border-[#d9e3eb]
                    bg-white
                    p-[clamp(18px,2vw,26px)]
                    shadow-[0_3px_13px_rgba(15,46,85,0.035)]
                    md:grid-cols-[1fr_0.9fr]
                  "
                >
                  {/* GRÁFICO MORADO */}
                  <div className="min-w-0 md:border-r md:border-[#dce4ec] md:pr-5">
                    <h3 className="text-xs font-medium text-[#344966]">
                      Calificación de atención por semana
                    </h3>

                    <svg
                      aria-label="Calificación de atención por semana"
                      className="mt-3 h-[210px] w-full"
                      preserveAspectRatio="none"
                      role="img"
                      viewBox="0 0 420 220"
                    >
                      {[35, 90, 145, 190].map((y) => (
                        <line
                          key={y}
                          stroke="#e5e9ef"
                          strokeWidth="1"
                          x1="40"
                          x2="410"
                          y1={y}
                          y2={y}
                        />
                      ))}

                      {[40, 100, 160, 220, 280, 340, 400].map((x) => (
                        <line
                          key={x}
                          stroke="#edf0f4"
                          strokeWidth="1"
                          x1={x}
                          x2={x}
                          y1="20"
                          y2="190"
                        />
                      ))}

                      <line
                        stroke="#cfd9e5"
                        strokeWidth="1"
                        x1="40"
                        x2="40"
                        y1="20"
                        y2="190"
                      />

                      <line
                        stroke="#cfd9e5"
                        strokeWidth="1"
                        x1="40"
                        x2="410"
                        y1="190"
                        y2="190"
                      />

                      <g fill="#53637c" fontFamily="sans-serif" fontSize="10">
                        <text x="10" y="38">
                          30
                        </text>
                        <text x="10" y="95">
                          20
                        </text>
                        <text x="10" y="150">
                          10
                        </text>
                        <text x="16" y="194">
                          0
                        </text>
                      </g>

                      <polyline
                        fill="none"
                        points="
                          50,138
                          105,78
                          160,105
                          215,70
                          270,112
                          325,116
                          385,162
                        "
                        stroke="#7c36e8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />

                      {[
                        [50, 138],
                        [105, 78],
                        [160, 105],
                        [215, 70],
                        [270, 112],
                        [325, 116],
                        [385, 162],
                      ].map(([cx, cy]) => (
                        <circle
                          cx={cx}
                          cy={cy}
                          fill="#7c36e8"
                          key={`${cx}-${cy}`}
                          r="4.5"
                        />
                      ))}

                      <g
                        fill="#52627c"
                        fontFamily="sans-serif"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        <text x="50" y="210">
                          13
                        </text>
                        <text x="105" y="210">
                          14
                        </text>
                        <text x="160" y="210">
                          15
                        </text>
                        <text x="215" y="210">
                          16
                        </text>
                        <text x="270" y="210">
                          17
                        </text>
                        <text x="325" y="210">
                          18
                        </text>
                        <text x="385" y="210">
                          19
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* GAUGE */}
                  <div className="flex min-w-0 flex-col">
                    <h3 className="text-center text-xs font-medium text-[#344966]">
                      Nivel de reseñas
                    </h3>

                    <div className="mt-3 flex flex-1 items-center justify-center">
                      <svg
                        aria-label="Nivel de reseñas"
                        className="w-full max-w-[280px]"
                        role="img"
                        viewBox="0 0 300 180"
                      >
                        {/* ROJO */}
                        <path
                          d="M35 145 A115 115 0 0 1 58 77 L93 101 A72 72 0 0 0 78 145Z"
                          fill="#f5252b"
                        />

                        {/* NARANJA */}
                        <path
                          d="M58 77 A115 115 0 0 1 117 35 L130 77 A72 72 0 0 0 93 101Z"
                          fill="#f57c00"
                        />

                        {/* AMARILLO */}
                        <path
                          d="M117 35 A115 115 0 0 1 184 36 L171 78 A72 72 0 0 0 130 77Z"
                          fill="#f6ca28"
                        />

                        {/* VERDE CLARO */}
                        <path
                          d="M184 36 A115 115 0 0 1 243 80 L207 103 A72 72 0 0 0 171 78Z"
                          fill="#79c832"
                        />

                        {/* VERDE */}
                        <path
                          d="M243 80 A115 115 0 0 1 265 145 H222 A72 72 0 0 0 207 103Z"
                          fill="#13a254"
                        />

                        {/* =========================================
    CARITA 1 - ROJO
========================================== */}
                        <g
                          transform="translate(61 116)"
                          fill="none"
                          stroke="#9d2825"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                        >
                          <circle
                            cx="-6"
                            cy="-5"
                            r="2.4"
                            fill="#9d2825"
                            stroke="none"
                          />
                          <circle
                            cx="6"
                            cy="-5"
                            r="2.4"
                            fill="#9d2825"
                            stroke="none"
                          />
                          <path d="M-8 9 Q0 1 8 9" />
                        </g>

                        {/* =========================================
    CARITA 2 - NARANJA
========================================== */}
                        <g
                          transform="translate(95 69)"
                          fill="none"
                          stroke="#88451e"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                        >
                          <circle
                            cx="-6"
                            cy="-5"
                            r="2.4"
                            fill="#88451e"
                            stroke="none"
                          />
                          <circle
                            cx="6"
                            cy="-5"
                            r="2.4"
                            fill="#88451e"
                            stroke="none"
                          />
                          <path d="M-7 8 Q0 2 7 8" />
                        </g>

                        {/* =========================================
    CARITA 3 - AMARILLO
========================================== */}
                        <g
                          transform="translate(150 52)"
                          fill="none"
                          stroke="#80620a"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                        >
                          <circle
                            cx="-6"
                            cy="-5"
                            r="2.4"
                            fill="#80620a"
                            stroke="none"
                          />
                          <circle
                            cx="6"
                            cy="-5"
                            r="2.4"
                            fill="#80620a"
                            stroke="none"
                          />
                          <path d="M-7 7 H7" />
                        </g>

                        {/* =========================================
    CARITA 4 - VERDE CLARO
========================================== */}
                        <g
                          transform="translate(205 69)"
                          fill="none"
                          stroke="#4b761c"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                        >
                          <circle
                            cx="-6"
                            cy="-5"
                            r="2.4"
                            fill="#4b761c"
                            stroke="none"
                          />
                          <circle
                            cx="6"
                            cy="-5"
                            r="2.4"
                            fill="#4b761c"
                            stroke="none"
                          />
                          <path d="M-7 3 Q0 11 7 3" />
                        </g>

                        {/* =========================================
    CARITA 5 - VERDE
========================================== */}
                        <g
                          transform="translate(239 116)"
                          fill="none"
                          stroke="#08723d"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                        >
                          <circle
                            cx="-6"
                            cy="-5"
                            r="2.4"
                            fill="#08723d"
                            stroke="none"
                          />
                          <circle
                            cx="6"
                            cy="-5"
                            r="2.4"
                            fill="#08723d"
                            stroke="none"
                          />
                          <path d="M-8 2 Q0 12 8 2" />
                        </g>
                        {/* =========================================
      AGUJA
  ========================================== */}
                        <line
                          stroke="#0a2e68"
                          strokeLinecap="round"
                          strokeWidth="7"
                          x1="150"
                          x2="213"
                          y1="145"
                          y2="97"
                        />

                        {/* CENTRO DE LA AGUJA */}
                        <circle
                          cx="150"
                          cy="145"
                          fill="#0b3978"
                          r="12"
                          stroke="#082767"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>

                    <button
                      className="
                        mt-2
                        flex
                        h-12
                        w-full
                        cursor-pointer
                        items-center
                        justify-center
                        gap-3
                        rounded-xl
                        bg-gradient-to-r
                        from-[#09afb1]
                        to-[#00999f]
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        shadow-[0_6px_16px_rgba(0,158,166,0.18)]
                        transition
                        hover:-translate-y-0.5
                        hover:shadow-[0_8px_20px_rgba(0,158,166,0.25)]
                      "
                      onClick={evtClickDescargarReporte}
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 4v10m-4-4 4 4 4-4M5 17v2h14v-2"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                        />
                      </svg>
                      Descargar reporte
                    </button>
                  </div>
                </article>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DetalleUsuarioHospitalarioPage;
