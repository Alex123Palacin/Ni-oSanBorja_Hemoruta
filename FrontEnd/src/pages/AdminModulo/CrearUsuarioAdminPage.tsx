import { useState, type FormEvent } from "react";

import {
  crearContrasenaTemporalAdmin,
  crearUsuarioHospitalarioApi,
  type CrearUsuarioHospitalarioApi,
} from "../../api/admin/AdminApi";
import { obtenerMensajeErrorApi } from "../../api/compartido/ClienteApi";
import useAuth from "../../auth/useAuth";
import iconoHemoRuta from "../../assets/iconoHemoRutaNoBg.png";
import fondoNino from "../../assets/FondoNiño4.png";

import useRedirrecion from "../../hooks/Redirrecion";

function CrearUsuarioAdminPage() {
  const redirigir = useRedirrecion();
  const { usuario: usuarioSesion } = useAuth();

  const [perfil, setPerfil] = useState("");
  const [creando, setCreando] = useState(false);
  const [errorCreacion, setErrorCreacion] = useState("");

  async function evtSubmitCrearUsuario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rol = String(formData.get("perfil") ?? "");
    if (rol !== "MEDICO" && rol !== "ADMINISTRADOR" && rol !== "PACIENTE") {
      setErrorCreacion("Selecciona un perfil hospitalario válido.");
      return;
    }

    const usuario: CrearUsuarioHospitalarioApi = {
      nombres: String(formData.get("nombres") ?? ""),
      dni: String(formData.get("dni") ?? ""),
      correo: String(formData.get("correo") ?? ""),
      telefono: String(formData.get("telefono") ?? ""),
      rol,
    };

    setCreando(true);
    setErrorCreacion("");
    try {
      const creado = await crearUsuarioHospitalarioApi(usuario);
      window.sessionStorage.setItem(
        "hemoruta.admin.ultimoUsuarioCreado",
        JSON.stringify({
          ...creado,
          contrasenaTemporal: crearContrasenaTemporalAdmin(usuario.dni),
        }),
      );
      redirigir("/admin/confirmacion");
    } catch (error) {
      setErrorCreacion(obtenerMensajeErrorApi(error));
    } finally {
      setCreando(false);
    }
  }

  function evtClickVolver() {
    redirigir("/admin/UsuariosHospitalarios");
  }

  function evtClickCancelar() {
    redirigir("/admin/UsuariosHospitalarios");
  }

  return (
    <div className="min-h-dvh bg-[#fbfdff] text-[#0b2b69]">
      <div className="flex min-h-dvh">
        {/* SIDEBAR */}
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
              onClick={() => redirigir('/admin/inicio')}
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
              onClick={evtClickVolver}
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
              disabled
              title="La vista de actividad todavía no está habilitada"
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

        {/* CONTENIDO */}
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

          {/* PAGE */}
          <main
            className="
              flex-1
              overflow-auto
              px-[clamp(20px,3vw,42px)]
              pb-8
              pt-[clamp(20px,2.4vw,32px)]
            "
          >
            <div className="mx-auto max-w-[1100px]">
              <h1
                className="
                  text-[clamp(28px,2.5vw,40px)]
                  font-bold
                  tracking-[-0.035em]
                  text-[#082767]
                "
              >
                Nuevo usuario hospitalario
              </h1>

              <div
                className="
                  mt-1
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  text-[12px]
                  text-[#667794]
                "
              >
                <span>Administración general</span>
                <span>/</span>
                <button
                  className="cursor-pointer hover:text-[#08aeb5]"
                  onClick={evtClickVolver}
                  type="button"
                >
                  Usuarios hospitalarios
                </button>
                <span>/</span>
                <span>Nuevo usuario</span>
              </div>

              {/* FORM */}
              <form
                className="
                  mt-4
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#dce4ec]
                  bg-white
                  shadow-[0_7px_22px_rgba(15,46,85,0.07)]
                "
                onSubmit={evtSubmitCrearUsuario}
              >
                <div className="px-[clamp(20px,2.5vw,30px)] py-5">
                  <h2 className="text-base font-bold text-[#009da6]">
                    Información del usuario
                  </h2>

                  <p className="mt-1 text-xs text-[#64738d]">
                    Completa los datos para registrar un nuevo usuario
                    hospitalario.
                  </p>

                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-1
                      gap-x-8
                      gap-y-5
                      md:grid-cols-2
                    "
                  >
                    {/* NOMBRE */}
                    <label>
                      <span className="mb-2 block text-xs font-semibold text-[#17356e]">
                        Nombres y apellidos{" "}
                        <span className="text-[#ef4f4f]">*</span>
                      </span>

                      <div
                        className="
                          flex
                          h-11
                          items-center
                          rounded-xl
                          border
                          border-[#d5dee9]
                          bg-white
                          px-3
                          transition
                          focus-within:border-[#08aeb5]
                          focus-within:ring-3
                          focus-within:ring-[#08aeb5]/10
                        "
                      >
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-[#637797]"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="8"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />

                          <path
                            d="M5.5 19c.5-3.5 2.7-5.3 6.5-5.3s6 1.8 6.5 5.3"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.7"
                          />
                        </svg>

                        <input
                          className="
                            h-full
                            min-w-0
                            flex-1
                            bg-transparent
                            px-3
                            text-xs
                            text-[#17356e]
                            outline-none
                            placeholder:text-[#8795ac]
                          "
                          name="nombres"
                          placeholder="Ej: Juan Carlos Pérez Gómez"
                          required
                          type="text"
                        />
                      </div>
                    </label>

                    {/* DNI */}
                    <label>
                      <span className="mb-2 block text-xs font-semibold text-[#17356e]">
                        DNI <span className="text-[#ef4f4f]">*</span>
                      </span>

                      <div
                        className="
                          flex
                          h-11
                          items-center
                          rounded-xl
                          border
                          border-[#d5dee9]
                          bg-white
                          px-3
                          transition
                          focus-within:border-[#08aeb5]
                          focus-within:ring-3
                          focus-within:ring-[#08aeb5]/10
                        "
                      >
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-[#637797]"
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

                          <circle
                            cx="8.5"
                            cy="10"
                            r="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />

                          <path
                            d="M6 15c.4-1.7 1.3-2.5 2.5-2.5S10.6 13.3 11 15M13.5 9.5h4M13.5 13h4"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.5"
                          />
                        </svg>

                        <input
                          className="
                            h-full
                            min-w-0
                            flex-1
                            bg-transparent
                            px-3
                            text-xs
                            text-[#17356e]
                            outline-none
                            placeholder:text-[#8795ac]
                          "
                          inputMode="numeric"
                          maxLength={8}
                          name="dni"
                          placeholder="Ej: 12345678"
                          required
                          type="text"
                        />
                      </div>
                    </label>

                    {/* CORREO */}
                    <label>
                      <span className="mb-2 block text-xs font-semibold text-[#17356e]">
                        Correo institucional{" "}
                        <span className="text-[#ef4f4f]">*</span>
                      </span>

                      <div
                        className="
                          flex
                          h-11
                          items-center
                          rounded-xl
                          border
                          border-[#d5dee9]
                          bg-white
                          px-3
                          transition
                          focus-within:border-[#08aeb5]
                          focus-within:ring-3
                          focus-within:ring-[#08aeb5]/10
                        "
                      >
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-[#637797]"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="m4 7 7 5a1.7 1.7 0 0 0 2 0l7-5"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                          />

                          <rect
                            height="14"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            width="17"
                            x="3.5"
                            y="5"
                          />
                        </svg>

                        <input
                          autoComplete="email"
                          className="
                            h-full
                            min-w-0
                            flex-1
                            bg-transparent
                            px-3
                            text-xs
                            text-[#17356e]
                            outline-none
                            placeholder:text-[#8795ac]
                          "
                          name="correo"
                          placeholder="Ej: juan.perez@hnsb.gob.pe"
                          required
                          type="email"
                        />
                      </div>

                      <span className="mt-2 block text-[10px] text-[#65738d]">
                        Usa el correo institucional del hospital.
                      </span>
                    </label>

                    {/* TELEFONO */}
                    <label>
                      <span className="mb-2 block text-xs font-semibold text-[#17356e]">
                        Teléfono
                      </span>

                      <div
                        className="
                          flex
                          h-11
                          items-center
                          rounded-xl
                          border
                          border-[#d5dee9]
                          bg-white
                          px-3
                          transition
                          focus-within:border-[#08aeb5]
                          focus-within:ring-3
                          focus-within:ring-[#08aeb5]/10
                        "
                      >
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-[#637797]"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M7.2 4.5 9.5 8 8 9.8c1.2 2.5 3 4.3 5.5 5.5l1.8-1.5 3.5 2.3-.3 2.5c-.1.8-.8 1.4-1.6 1.4C9.8 19.5 4.5 14.2 4 7.1c-.1-.8.5-1.5 1.3-1.6l1.9-1Z"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                          />
                        </svg>

                        <input
                          className="
                            h-full
                            min-w-0
                            flex-1
                            bg-transparent
                            px-3
                            text-xs
                            text-[#17356e]
                            outline-none
                            placeholder:text-[#8795ac]
                          "
                          inputMode="tel"
                          name="telefono"
                          placeholder="Ej: 987 654 321"
                          type="tel"
                        />
                      </div>

                      <span className="mt-2 block text-[10px] text-[#65738d]">
                        Número de contacto opcional.
                      </span>
                    </label>

                    {/* PERFIL */}
                    <label>
                      <span className="mb-2 block text-xs font-semibold text-[#17356e]">
                        Perfil <span className="text-[#ef4f4f]">*</span>
                      </span>

                      <div className="relative">
                        <svg
                          aria-hidden="true"
                          className="
                            pointer-events-none
                            absolute
                            left-3
                            top-1/2
                            z-10
                            h-5
                            w-5
                            -translate-y-1/2
                            text-[#637797]
                          "
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="8"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />

                          <path
                            d="M5.5 19c.5-3.5 2.7-5.3 6.5-5.3s6 1.8 6.5 5.3"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.7"
                          />
                        </svg>

                        <select
                          className="
                            h-11
                            w-full
                            cursor-pointer
                            appearance-none
                            rounded-xl
                            border
                            border-[#d5dee9]
                            bg-white
                            pl-11
                            pr-10
                            text-xs
                            text-[#53647f]
                            outline-none
                            transition
                            focus:border-[#08aeb5]
                            focus:ring-3
                            focus:ring-[#08aeb5]/10
                          "
                          name="perfil"
                          onChange={(event) => setPerfil(event.target.value)}
                          required
                          value={perfil}
                        >
                          <option disabled value="">
                            Selecciona un perfil
                          </option>

                          <option value="MEDICO">Médico</option>
                          <option value="PACIENTE">Paciente o responsable</option>
                          <option value="ADMINISTRADOR">
                            Administrador general
                          </option>
                        </select>

                        <svg
                          aria-hidden="true"
                          className="
                            pointer-events-none
                            absolute
                            right-3
                            top-1/2
                            h-4
                            w-4
                            -translate-y-1/2
                            text-[#53647f]
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
                      </div>

                      <span className="mt-2 block text-[10px] text-[#65738d]">
                        Define el rol y permisos que tendrá el usuario.
                      </span>
                    </label>

                    {/* ESTADO */}
                    <div>
                      <span className="mb-2 block text-xs font-semibold text-[#17356e]">
                        Estado inicial
                      </span>

                      <div
                        className="
                          flex
                          h-11
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-[#bfe7ce]
                          bg-[#f0fbf4]
                          px-4
                          text-xs
                          font-semibold
                          text-[#168b58]
                        "
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#1cb16d]" />
                        Cuenta activa
                      </div>

                      <span className="mt-2 block text-[10px] text-[#65738d]">
                        El usuario podrá ingresar con su contraseña temporal.
                      </span>
                    </div>
                  </div>

                  {/* INFORMACION */}
                  <div
                    className="
                      mt-6
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-[#bcdcf7]
                      bg-gradient-to-r
                      from-[#f1f8ff]
                      to-[#eef8ff]
                      px-4
                      py-3
                    "
                  >
                    <div
                      className="
                        grid
                        h-7
                        w-7
                        shrink-0
                        place-items-center
                        rounded-full
                        border-2
                        border-[#2375d8]
                        text-sm
                        font-bold
                        text-[#2375d8]
                      "
                    >
                      i
                    </div>

                    <p className="text-[11px] leading-[1.45] text-[#28598e]">
                      Se creará una contraseña temporal basada en el DNI. El
                      usuario deberá cambiarla después de iniciar sesión.
                    </p>
                  </div>

                  {errorCreacion && (
                    <div
                      className="mt-4 rounded-xl border border-[#f2b7b7] bg-[#fff3f3] px-4 py-3 text-xs text-[#a73838]"
                      role="alert"
                    >
                      {errorCreacion}
                    </div>
                  )}
                </div>

                {/* FOOTER FORM */}
                <div
                  className="
                    flex
                    flex-col-reverse
                    gap-3
                    border-t
                    border-[#e4e9ef]
                    px-[clamp(20px,2.5vw,30px)]
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <button
                    className="
                      flex
                      h-11
                      cursor-pointer
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-[#d8e0e9]
                      bg-white
                      px-6
                      text-xs
                      font-semibold
                      text-[#069da5]
                      transition
                      hover:bg-[#f5fbfb]
                    "
                    onClick={evtClickVolver}
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
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
                    Volver
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      className="
                        h-11
                        cursor-pointer
                        rounded-xl
                        border
                        border-[#08aeb5]
                        bg-white
                        px-8
                        text-xs
                        font-semibold
                        text-[#008f98]
                        transition
                        hover:bg-[#f2fbfb]
                      "
                      onClick={evtClickCancelar}
                      type="button"
                    >
                      Cancelar
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
                        disabled:cursor-wait
                        disabled:opacity-70
                      "
                      disabled={creando}
                      type="submit"
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
                      {creando ? "Creando usuario..." : "Crear usuario"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default CrearUsuarioAdminPage;
