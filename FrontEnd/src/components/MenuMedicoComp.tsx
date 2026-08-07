import { useLocation, Link } from "react-router-dom";
import logoHemoRuta from "../assets/iconoHemoRutaNoBg.png";
import fondoNino from "../assets/FondoNiño4.png";

function MenuMedicoComp() {
  const location = useLocation();
  const pathname = location.pathname;

  // ======================================================
  // VALIDACIÓN DE RUTAS ACTIVAS
  // ======================================================

  const isPacientesActive =
    pathname.startsWith("/doctor/pacientes") ||
    pathname.startsWith("/doctor/nuevoRegistro") ||
    pathname.startsWith("/doctor/ficha") ||
    pathname.startsWith("/doctor/consulta") ||
    pathname.startsWith("/doctor/historial");

  const isSeguimientoActive =
    pathname.startsWith("/doctor/seguimiento") ||
    pathname.startsWith("/doctor/visualizar");

  const isInicioActive =
    pathname === "/doctor/inicio" || pathname === "/doctor/dashboard";

  // ======================================================
  // ELEMENTOS DEL MENÚ
  // ======================================================

  const menuItems = [
    {
      label: "Inicio",
      path: "/doctor/inicio",
      active: isInicioActive,
      icon: (
        <svg
          className="h-[25px] w-[25px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 10.2 12 3.5l8.5 6.7" />
          <path d="M5.5 9.4v10.1c0 .55.45 1 1 1h4v-6h3v6h4c.55 0 1-.45 1-1V9.4" />
        </svg>
      ),
    },
    {
      label: "Pacientes",
      path: "/doctor/pacientes",
      active:
        isPacientesActive || (!isInicioActive && !isSeguimientoActive),
      icon: (
        <svg
          className="h-[26px] w-[26px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Persona principal */}
          <circle cx="8.3" cy="7.4" r="3" />

          <path d="M2.9 18.8v-.7c0-2.7 2.2-4.8 4.8-4.8h1.2c2.7 0 4.8 2.1 4.8 4.8v.7" />

          {/* Segunda persona */}
          <circle cx="17.1" cy="8.6" r="2.4" />

          <path d="M15.2 14.5c.6-.3 1.3-.5 2.1-.5h.6c2.3 0 4.1 1.8 4.1 4.1v.7" />
        </svg>
      ),
    },
    {
      label: "Seguimiento",
      path: "/doctor/seguimiento",
      active: isSeguimientoActive,
      icon: (
        <svg
          className="h-[26px] w-[26px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.15"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Contorno estilo WhatsApp */}
          <path d="M20.3 11.4a8.2 8.2 0 0 1-11.9 7.3L3.2 20.3l1.6-5a8.2 8.2 0 1 1 15.5-3.9Z" />

          {/* Teléfono interior */}
          <path d="M9.1 7.7c.2-.3.4-.3.7-.3h.4c.2 0 .4.1.5.4l.9 2.1c.1.3.1.5-.1.7l-.7.8c-.2.2-.2.4-.1.6.6 1.2 1.5 2.1 2.7 2.7.2.1.4.1.6-.1l.8-1c.2-.2.5-.3.7-.1l2 .9c.3.1.4.3.4.6v.4c0 .5-.2.9-.6 1.2-.5.4-1.2.7-1.9.7-1.1 0-2.9-.6-4.7-2.2-1.5-1.3-2.6-3-3.1-4.6-.2-.7-.1-1.5.3-2.1l1.2-.7Z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className="
        sticky top-0
        flex h-screen
        w-[255px] min-w-[255px]
        shrink-0 select-none
        flex-col justify-between
        overflow-y-auto
        border-r border-[#E1E7EF]
        bg-white
        px-[20px]
        pb-[26px]
        pt-[28px]
      "
    >
      {/* ======================================================
          PARTE SUPERIOR
      ====================================================== */}

      <div className="flex flex-col">
        {/* Logo */}

        <div className="flex items-center">
          <img
            src={logoHemoRuta}
            alt="HemoRuta Pediátrica"
            className="h-[68px] w-auto max-w-[190px] object-contain"
            draggable={false}
          />
        </div>

        {/* Información del hospital */}

        <div className="mt-[22px] flex items-center gap-[13px]">
          <div
            className="
              flex h-[46px] w-[46px]
              shrink-0 items-center justify-center
              rounded-[12px]
              bg-[#EAF8FB]
              text-[#0CB8C4]
            "
          >
            <svg
              className="h-[26px] w-[26px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.15"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 21h18" />

              <path d="M7.5 21V7.5c0-.55.45-1 1-1h7c.55 0 1 .45 1 1V21" />

              <path d="M4 21v-9c0-.55.45-1 1-1h2.5" />

              <path d="M16.5 11H19c.55 0 1 .45 1 1v9" />

              <path d="M12 8.5v4" />
              <path d="M10 10.5h4" />

              <path d="M9.5 15h.01" />
              <path d="M12 15h.01" />
              <path d="M14.5 15h.01" />

              <path d="M9.5 18h.01" />
              <path d="M12 18h.01" />
              <path d="M14.5 18h.01" />
            </svg>
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="whitespace-nowrap text-[15px] font-extrabold leading-[18px] text-[#0B216F]">
              Hospital del Niño
            </span>

            <span className="text-[15px] font-extrabold leading-[18px] text-[#0B216F]">
              San Borja
            </span>
          </div>
        </div>

        {/* Separador */}

        <hr className="mb-[24px] mt-[28px] border-[#E2E8F0]" />

        {/* ======================================================
            MENÚ DE NAVEGACIÓN
        ====================================================== */}

        <nav
          className="flex w-full flex-col gap-[8px]"
          aria-label="Menú del médico"
        >
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              aria-current={item.active ? "page" : undefined}
              className={`
                group relative
                flex h-[50px] w-full
                items-center gap-[15px]
                overflow-hidden
                rounded-[13px]
                px-[18px]
                transition-all duration-200

                ${
                  item.active
                    ? "bg-[#E9F8FB] font-bold text-[#08AFBC]"
                    : "font-semibold text-[#263FA0] hover:bg-[#F4FAFC] hover:text-[#08AFBC]"
                }
              `}
            >
              {/* Barra activa izquierda */}

              {item.active && (
                <span
                  className="
                    absolute bottom-[5px] left-0 top-[5px]
                    w-[5px]
                    rounded-r-full
                    bg-[#0BB9C5]
                  "
                  aria-hidden="true"
                />
              )}

              {/* Ícono */}

              <span
                className={`
                  flex h-[27px] w-[27px]
                  shrink-0 items-center justify-center
                  transition-colors duration-200

                  ${
                    item.active
                      ? "text-[#08AFBC]"
                      : "text-[#304CB0] group-hover:text-[#08AFBC]"
                  }
                `}
              >
                {item.icon}
              </span>

              {/* Texto */}

              <span className="text-[15px] leading-none tracking-[0.05px]">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* ======================================================
          PARTE INFERIOR
      ====================================================== */}

      <div className="mt-[40px] flex flex-col">
        {/* Ilustración */}

        <div className="mb-[25px] flex items-center justify-center">
          <img
            src={fondoNino}
            alt="Niño HemoRuta"
            className="h-auto w-[218px] max-w-none object-contain"
            draggable={false}
          />
        </div>

        {/* Tarjeta informativa */}

        <div
          className="
            flex w-full
            items-start gap-[13px]
            rounded-[16px]
            border border-[#D7E8F1]
            bg-[#FBFEFF]
            px-[16px] py-[18px]
            shadow-[0_1px_3px_rgba(8,39,103,0.03)]
          "
        >
          {/* Escudo */}

          <div className="mt-[1px] flex h-[35px] w-[35px] shrink-0 items-center justify-center text-[#0BB9C5]">
            <svg
              className="h-[35px] w-[35px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s7.5-3.8 7.5-10V5.8L12 3 4.5 5.8V12c0 6.2 7.5 10 7.5 10Z" />

              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          {/* Descripción */}

          <p className="text-[13px] font-medium leading-[22px] text-[#293F9E]">
            Este rol médico puede{" "}
            <span className="font-extrabold text-[#00AEBB]">
              visualizar y gestionar
            </span>{" "}
            la información de los pacientes a su cargo.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default MenuMedicoComp;