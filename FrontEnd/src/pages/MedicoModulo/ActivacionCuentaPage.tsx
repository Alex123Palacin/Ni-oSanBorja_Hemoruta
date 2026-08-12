import FormActivacionCuentaComp, {
  type ContenidoFormActivacionCuenta,
  type RequisitoContrasenaActivacion,
} from '../../components/FormActivacionCuentaComp'
import HeaderActivacionCuentaComp, {
  type DatosHeaderActivacionCuenta,
} from '../../components/HeaderActivacionCuentaComp'
import MenuMedicoComp from '../../components/MenuMedicoComp'

const HEADER: DatosHeaderActivacionCuenta = {
  avatar: '👩🏻‍⚕️',
  especialidad: 'Hematología Pediátrica',
  modulo: 'M01 Seguridad y acceso',
  nombre: 'Dra. Valeria Ruiz',
  notificaciones: 1,
  rutaRegreso: '/doctor/pacientes',
}

const CONTENIDO_FORMULARIO: ContenidoFormActivacionCuenta = {
  botonActivar: 'Activar cuenta',
  confirmarContrasenaEtiqueta: 'Confirmar contraseña',
  confirmarContrasenaPlaceholder: 'Repite tu nueva contraseña',
  correoEtiqueta: 'Correo institucional',
  descripcion: [
    'Tu cuenta ha sido creada por el administrador del hospital.',
    'Define tu contraseña para activar tu acceso a HemoRuta Pediátrica.',
  ],
  enlaceValido: 'Enlace válido',
  errorContrasenasDistintas: 'Las contraseñas no coinciden.',
  errorRequisitos: 'La contraseña todavía no cumple todos los requisitos.',
  nuevaContrasenaEtiqueta: 'Nueva contraseña',
  nuevaContrasenaPlaceholder: 'Ingresa tu nueva contraseña',
  requisitosTitulo: 'Requisitos de contraseña',
  titulo: 'Activa tu cuenta hospitalaria',
}

const REQUISITOS: readonly RequisitoContrasenaActivacion[] = [
  { id: 'longitud', texto: '8 caracteres mínimo', validar: (valor) => valor.length >= 8 },
  { id: 'mayuscula', texto: '1 mayúscula', validar: (valor) => /[A-ZÁÉÍÓÚÑ]/.test(valor) },
  { id: 'numero', texto: '1 número', validar: (valor) => /\d/.test(valor) },
  { id: 'sin-espacios', texto: 'Sin espacios en blanco', validar: (valor) => valor.length > 0 && !/\s/.test(valor) },
]

function ActivacionCuentaPage() {
  return (
    <div className='flex min-h-dvh bg-[#f4f9fd] font-sans text-[#0a2b70]'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderActivacionCuentaComp datos={HEADER} />

        <main className='relative flex min-h-[calc(100dvh-52px)] items-center justify-center overflow-hidden px-4 py-6 pb-24 sm:px-6 md:pb-6 lg:px-10'>
          <span aria-hidden='true' className='pointer-events-none absolute -right-10 top-10 h-36 w-36 rounded-full bg-[#e9f4fb]' />
          <span aria-hidden='true' className='pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-[#e4f2fb]' />
          <span
            aria-hidden='true'
            className='pointer-events-none absolute right-4 top-1/3 hidden h-20 w-10 opacity-75 [background-image:radial-gradient(circle,#54c5d2_2px,transparent_2px)] [background-size:11px_11px] sm:block'
          />

          <div className='relative z-10 w-full md:w-[84%] md:max-w-[840px]'>
            <FormActivacionCuentaComp
              contenido={CONTENIDO_FORMULARIO}
              correoInstitucional='valeria.ruiz@hnsb.gob.pe'
              requisitos={REQUISITOS}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default ActivacionCuentaPage
