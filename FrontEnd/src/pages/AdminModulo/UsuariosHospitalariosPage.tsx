import { useEffect, useState } from "react";

import {
  listarUsuariosHospitalariosApi,
  type UsuarioHospitalarioListaApi,
} from "../../api/admin/AdminApi";
import { obtenerMensajeErrorApi } from "../../api/compartido/ClienteApi";
import useAuth from "../../auth/useAuth";
import useRedirrecion from "../../hooks/Redirrecion";

type PerfilUsuario = "Médico" | "Paciente" | "Administrador";

interface UsuarioHospitalario {
  id: string;
  nombre: string;
  documento: string;
  correo: string;
  perfil: PerfilUsuario;
}

const TAMANO_PAGINA = 10;

function convertirUsuarioApi(usuario: UsuarioHospitalarioListaApi): UsuarioHospitalario {
  const perfiles: Record<UsuarioHospitalarioListaApi["rol"], PerfilUsuario> = {
    ADMINISTRADOR: "Administrador",
    MEDICO: "Médico",
    PACIENTE: "Paciente",
  };

  return {
    correo: usuario.correo,
    documento: usuario.documento,
    id: usuario.id,
    nombre: usuario.nombreCompleto,
    perfil: perfiles[usuario.rol],
  };
}

function UsuariosHospitalariosPage() {
  const { usuario: usuarioSesion } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [perfil, setPerfil] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [paginasTotales, setPaginasTotales] = useState(1);
  const [total, setTotal] = useState(0);
  const [usuarios, setUsuarios] = useState<UsuarioHospitalario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [resumen, setResumen] = useState({ medicos: 0, pacientes: 0, total: 0 });
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState(false);
  const redirigir = useRedirrecion();

  useEffect(() => {
    let vigente = true;

    Promise.all([
      listarUsuariosHospitalariosApi({ pagina: 1, tamanoPagina: 1 }),
      listarUsuariosHospitalariosApi({ pagina: 1, rol: "MEDICO", tamanoPagina: 1 }),
      listarUsuariosHospitalariosApi({ pagina: 1, rol: "PACIENTE", tamanoPagina: 1 }),
    ])
      .then(([todos, medicos, pacientes]) => {
        if (!vigente) return;
        setResumen({
          medicos: medicos.paginacion.total,
          pacientes: pacientes.paginacion.total,
          total: todos.paginacion.total,
        });
      })
      .catch(() => {
        if (!vigente) return;
        setResumen({ medicos: 0, pacientes: 0, total: 0 });
        setErrorResumen(true);
      })
      .finally(() => {
        if (vigente) setCargandoResumen(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    let vigente = true;
    const temporizador = window.setTimeout(async () => {
      setCargando(true);
      setErrorCarga("");

      try {
        const roles = { Administrador: "ADMINISTRADOR", Médico: "MEDICO", Paciente: "PACIENTE" } as const;
        const respuesta = await listarUsuariosHospitalariosApi({
          busqueda,
          pagina,
          rol: perfil === "todos" ? undefined : roles[perfil as keyof typeof roles],
          tamanoPagina: TAMANO_PAGINA,
        });
        if (!vigente) return;

        setUsuarios(respuesta.resultados.map(convertirUsuarioApi));
        setPaginasTotales(Math.max(1, respuesta.paginacion.paginasTotales));
        setTotal(respuesta.paginacion.total);
      } catch (error) {
        if (!vigente) return;
        setUsuarios([]);
        setPaginasTotales(1);
        setTotal(0);
        setErrorCarga(`No fue posible cargar los usuarios. ${obtenerMensajeErrorApi(error)}`);
      } finally {
        if (vigente) setCargando(false);
      }
    }, 250);

    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [busqueda, pagina, perfil]);

  const usuariosFiltrados = usuarios;

  function evtClickNuevoUsuario() {
    redirigir("/admin/CrearUs");
  }

  function evtClickVerUsuario(usuario: UsuarioHospitalario) {
    window.sessionStorage.setItem(
      "hemoruta.admin.usuarioSeleccionado",
      JSON.stringify(usuario),
    );
    redirigir(`/admin/detalleUs/${encodeURIComponent(usuario.id)}`);
  }

  function perfilClass(perfilUsuario: PerfilUsuario) {
    switch (perfilUsuario) {
      case "Médico":
        return "bg-[#e8f3ff] text-[#2879d8]";

      case "Paciente":
        return "bg-[#e5f7ea] text-[#1b9a58]";

      case "Administrador":
        return "bg-[#f4ecff] text-[#8c4cd7]";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  return (
    <div className="min-h-dvh bg-[#fbfdff] text-[#0b2b69]">
      <div className="flex min-h-dvh">
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

          <main
            className="
              flex-1
              overflow-auto
              px-[clamp(20px,3vw,42px)]
              pb-8
              pt-[clamp(22px,2.4vw,34px)]
            "
          >
            {/* TITULO */}
            <section
              className="
                flex
                flex-col
                gap-5
                lg:flex-row
                lg:items-start
                lg:justify-between
              "
            >
              <div>
                <h1
                  className="
                    text-[clamp(28px,2.6vw,40px)]
                    font-bold
                    tracking-[-0.035em]
                    text-[#082767]
                  "
                >
                  Usuarios hospitalarios
                </h1>

                <p className="mt-1 text-sm text-[#65738d]">
                  Gestione los usuarios con acceso a la plataforma (médicos y
                  administradores generales).
                </p>
              </div>

            <button
                className="
                  flex
                  h-12
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  self-start
                  rounded-xl
                  bg-gradient-to-r
                  from-[#00a5aa]
                  to-[#00989f]
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_7px_18px_rgba(0,158,166,0.18)]
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-[0_9px_22px_rgba(0,158,166,0.25)]
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
                    cx="10"
                    cy="8"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M4.5 19v-1.5c0-3 2.2-4.8 5.5-4.8s5.5 1.8 5.5 4.8V19h-11ZM18.5 7v6M15.5 10h6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.7"
                  />
                </svg>
                Nuevo usuario
              </button>
            </section>

            {/* TARJETAS */}
            <section
              className="
                mt-6
                grid
                grid-cols-1
                gap-4
                md:grid-cols-3
              "
            >
              <div
                className="
                  flex
                  min-h-[112px]
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-[#cfe5e8]
                  bg-gradient-to-br
                  from-[#f8fdfd]
                  to-[#f0fbfb]
                  px-5
                  py-4
                "
              >
                <div
                  className="
                    grid
                    h-14
                    w-14
                    shrink-0
                    place-items-center
                    rounded-full
                    bg-[#dcf5f4]
                    text-[#059fa7]
                  "
                >
                  <svg
                    aria-hidden="true"
                    className="h-8 w-8"
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

                    <circle
                      cx="5.5"
                      cy="10"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <circle
                      cx="18.5"
                      cy="10"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <path
                      d="M7 19v-1.5c0-3 2-4.8 5-4.8s5 1.8 5 4.8V19H7ZM2.5 18v-1c0-2 1-3.2 3-3.5M21.5 18v-1c0-2-1-3.2-3-3.5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.6"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#069fa7]">
                    Usuarios registrados
                  </p>

                  <p className="mt-0.5 text-3xl font-bold leading-none text-[#082767]">
                    {cargandoResumen ? "…" : errorResumen ? "—" : resumen.total}
                  </p>

                  <p className="mt-2 text-[11px] text-[#53647f]">
                    Total de usuarios en el sistema
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  min-h-[112px]
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-[#f0dfc9]
                  bg-gradient-to-br
                  from-[#fffdfb]
                  to-[#fffaf3]
                  px-5
                  py-4
                "
              >
                <div
                  className="
                    grid
                    h-14
                    w-14
                    shrink-0
                    place-items-center
                    rounded-full
                    bg-[#fff3db]
                    text-[#f5a000]
                  "
                >
                  <svg
                    aria-hidden="true"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M12 7v5l3.5 2"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#4c5871]">
                    Pacientes
                  </p>

                  <p className="mt-0.5 text-3xl font-bold leading-none text-[#082767]">
                    {cargandoResumen ? "…" : errorResumen ? "—" : resumen.pacientes}
                  </p>

                  <p className="mt-2 text-[11px] text-[#53647f]">
                    Usuarios con perfil de paciente
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  min-h-[112px]
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-[#d4e4f7]
                  bg-gradient-to-br
                  from-[#fbfdff]
                  to-[#f1f7ff]
                  px-5
                  py-4
                "
              >
                <div
                  className="
                    grid
                    h-14
                    w-14
                    shrink-0
                    place-items-center
                    rounded-full
                    bg-[#e5f1ff]
                    text-[#2879d8]
                  "
                >
                  <svg
                    aria-hidden="true"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7 4v5a5 5 0 0 0 10 0V4M7 4H5.5M17 4h1.5M12 14v2a4 4 0 0 0 8 0v-1"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                    />

                    <circle
                      cx="20"
                      cy="12"
                      r="1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#2879d8]">
                    Médicos
                  </p>

                  <p className="mt-0.5 text-3xl font-bold leading-none text-[#082767]">
                    {cargandoResumen ? "…" : errorResumen ? "—" : resumen.medicos}
                  </p>

                  <p className="mt-2 text-[11px] text-[#53647f]">
                    Usuarios con perfil médico
                  </p>
                </div>
              </div>
            </section>

            {errorResumen && (
              <p className="mt-2 text-xs font-medium text-[#94620b]" role="status">
                No fue posible cargar el resumen de usuarios.
              </p>
            )}

            {/* FILTROS */}
            <section
              className="
                mt-5
                flex
                flex-col
                items-start
                gap-4
                sm:flex-row
                sm:items-end
              "
            >
              <div className="relative w-full max-w-[330px]">
                <svg
                  aria-hidden="true"
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    h-5
                    w-5
                    -translate-y-1/2
                    text-[#6c7b95]
                  "
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="10.5"
                    cy="10.5"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="m15 15 4 4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.7"
                  />
                </svg>

                <input
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-[#d8e0e9]
                    bg-white
                    pl-11
                    pr-4
                    text-xs
                    text-[#17356e]
                    outline-none
                    transition
                    placeholder:text-[#8995a9]
                    focus:border-[#08aeb5]
                    focus:ring-3
                    focus:ring-[#08aeb5]/10
                  "
                  onChange={(event) => {
                    setBusqueda(event.target.value);
                    setPagina(1);
                  }}
                  placeholder="Buscar por nombre, documento o correo..."
                  type="text"
                  value={busqueda}
                />
              </div>

              <label className="w-full max-w-[210px]">
                <span className="mb-1 block text-[11px] text-[#586980]">
                  Filtrar por perfil
                </span>

                <div className="relative">
                  <select
                    className="
                      h-11
                      w-full
                      cursor-pointer
                      appearance-none
                      rounded-xl
                      border
                      border-[#d8e0e9]
                      bg-white
                      px-3.5
                      pr-9
                      text-xs
                      font-medium
                      text-[#17356e]
                      outline-none
                      transition
                      focus:border-[#08aeb5]
                      focus:ring-3
                      focus:ring-[#08aeb5]/10
                    "
                    onChange={(event) => {
                      setPerfil(event.target.value);
                      setPagina(1);
                    }}
                    value={perfil}
                  >
                    <option value="todos">Todos los perfiles</option>
                    <option value="Médico">Médicos</option>
                    <option value="Paciente">Pacientes</option>
                    <option value="Administrador">Administradores</option>
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
                      text-[#53647e]
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
              </label>
            </section>

            {errorCarga && (
              <div
                className="mt-3 rounded-xl border border-[#f4d9a8] bg-[#fff9ed] px-4 py-3 text-xs text-[#94620b]"
                role="alert"
              >
                {errorCarga}
              </div>
            )}

            {/* TABLA */}
            <section
              className="
                mt-4
                overflow-hidden
                rounded-2xl
                border
                border-[#dce4ec]
                bg-white
                shadow-[0_5px_18px_rgba(15,46,85,0.04)]
              "
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#dce4ec]">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#009ca5]">
                        <div className="flex items-center gap-1">
                          Nombre
                          <svg
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="m8 14 4-4 4 4"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </div>
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold text-[#009ca5]">
                        Documento
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold text-[#009ca5]">
                        Correo institucional
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold text-[#009ca5]">
                        Perfil
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold text-[#17356e]">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando && (
                      <tr>
                        <td className="px-6 py-12 text-center text-sm text-[#78879d]" colSpan={5}>
                          Cargando usuarios hospitalarios...
                        </td>
                      </tr>
                    )}

                    {!cargando && usuariosFiltrados.map((usuario, index) => (
                      <tr
                        className={
                          index !== usuariosFiltrados.length - 1
                            ? "border-b border-[#e5eaf0]"
                            : ""
                        }
                        key={usuario.id}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
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
                                border-[#d5e2e8]
                                bg-[#eaf7f7]
                              "
                            >
                              <svg
                                aria-hidden="true"
                                className="h-full w-full"
                                viewBox="0 0 48 48"
                              >
                                <circle
                                  cx="24"
                                  cy="24"
                                  fill={
                                    index % 2 === 0 ? "#DFF3F4" : "#F4E8DB"
                                  }
                                  r="24"
                                />

                                <circle cx="24" cy="17" fill="#E8B48F" r="8" />

                                <path
                                  d="M16 17c0-6 3.2-10 8.2-10 5.3 0 8.3 4.1 8.3 10-2.1-1.1-4.2-3.5-5-6.1-2.4 3.4-6.8 5.5-11.5 6.1Z"
                                  fill={
                                    index % 2 === 0 ? "#183E57" : "#6D4435"
                                  }
                                />

                                <path
                                  d="M11.5 44c.8-10 5.4-15 12.5-15s11.7 5 12.5 15h-25Z"
                                  fill="#0BAEB5"
                                />
                              </svg>
                            </div>

                            <button
                              className="cursor-pointer text-left text-xs font-bold text-[#17356e] transition hover:text-[#009ca5] hover:underline"
                              onClick={() => evtClickVerUsuario(usuario)}
                              type="button"
                            >
                              {usuario.nombre}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-xs text-[#5c6d88]">
                          {usuario.documento}
                        </td>

                        <td className="px-4 py-3 text-xs text-[#5c6d88]">
                          {usuario.correo}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`
                              inline-flex
                              rounded-lg
                              px-3
                              py-1.5
                              text-[10px]
                              font-semibold
                              ${perfilClass(usuario.perfil)}
                            `}
                          >
                            {usuario.perfil}
                          </span>
                        </td>

                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-4">
                            <button
                              aria-label={`Ver ${usuario.nombre}`}
                              className="
                                cursor-pointer
                                text-[#00a7ae]
                                transition
                                hover:text-[#007f87]
                              "
                              onClick={() => evtClickVerUsuario(usuario)}
                              type="button"
                            >
                              <svg
                                aria-hidden="true"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M3.5 12S6.75 7.5 12 7.5 20.5 12 20.5 12 17.25 16.5 12 16.5 3.5 12 3.5 12Z"
                                  stroke="currentColor"
                                  strokeLinejoin="round"
                                  strokeWidth="1.7"
                                />

                                <circle
                                  cx="12"
                                  cy="12"
                                  r="2"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                />
                              </svg>
                            </button>

                            <button
                              aria-label={`Editar ${usuario.nombre}`}
                              className="
                                cursor-not-allowed
                                opacity-45
                                text-[#00a7ae]
                              "
                              disabled
                              title="La edición de usuarios todavía no está habilitada"
                              type="button"
                            >
                              <svg
                                aria-hidden="true"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="m5 16-.75 3.75L8 19l10.2-10.2a2.1 2.1 0 0 0-3-3L5 16Z"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.7"
                                />

                                <path
                                  d="m13.8 7.2 3 3"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                />
                              </svg>
                            </button>

                            <button
                              aria-label={`Opciones de ${usuario.nombre}`}
                              className="
                                cursor-not-allowed
                                opacity-45
                                text-[#17356e]
                              "
                              disabled
                              title="No hay acciones adicionales disponibles"
                              type="button"
                            >
                              <svg
                                aria-hidden="true"
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="12" cy="5" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="19" r="1.5" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!cargando && usuariosFiltrados.length === 0 && (
                      <tr>
                        <td
                          className="
                            px-6
                            py-12
                            text-center
                            text-sm
                            text-[#78879d]
                          "
                          colSpan={5}
                        >
                          {errorCarga
                            ? "La lista de usuarios no está disponible en este momento."
                            : "No se encontraron usuarios con los filtros seleccionados."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-[#e4eaf0]
                  px-6
                  py-3
                "
              >
                <p className="text-[11px] text-[#687992]">
                  Mostrando {total === 0 ? 0 : (pagina - 1) * TAMANO_PAGINA + 1} a{" "}
                  {Math.min(pagina * TAMANO_PAGINA, total)} de {total} usuarios
                </p>

                <div className="flex items-center gap-2">
                  <button
                    aria-label="Página anterior"
                    className="
                      grid
                      h-9
                      w-9
                      cursor-pointer
                      place-items-center
                      rounded-lg
                      border
                      border-[#dce4ec]
                      bg-white
                      text-[#9aa6b7]
                      transition
                      hover:bg-[#f6f9fb]
                    "
                    disabled={pagina <= 1 || cargando}
                    onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="m14 7-5 5 5 5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </button>

                  <button
                    className="
                      grid
                      h-9
                      w-9
                      cursor-pointer
                      place-items-center
                      rounded-lg
                      border
                      border-[#05aeb5]
                      bg-[#eafafb]
                      text-xs
                      font-semibold
                      text-[#009da6]
                    "
                    type="button"
                  >
                    {pagina}
                  </button>

                  <button
                    aria-label="Página siguiente"
                    className="
                      grid
                      h-9
                      w-9
                      cursor-pointer
                      place-items-center
                      rounded-lg
                      border
                      border-[#dce4ec]
                      bg-white
                      text-[#9aa6b7]
                      transition
                      hover:bg-[#f6f9fb]
                    "
                    disabled={pagina >= paginasTotales || cargando}
                    onClick={() => setPagina((actual) => Math.min(paginasTotales, actual + 1))}
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="m10 7 5 5-5 5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default UsuariosHospitalariosPage;
