import type { FichaPacienteAdministrativaApi } from '../../api/admin/AdminApi'
import IconoMedico from '../IconoMedico'

interface FichaPacienteAdminCompProps {
  pacientes: readonly FichaPacienteAdministrativaApi[]
}

function FichaPacienteAdminComp({ pacientes }: FichaPacienteAdminCompProps) {
  if (pacientes.length === 0) {
    return (
      <section className='rounded-2xl border border-dashed border-[#bfd6df] bg-white p-8 text-center'>
        <IconoMedico className='mx-auto h-9 w-9 text-[#0aa5b0]' nombre='idCard' />
        <h2 className='mt-3 text-sm font-extrabold text-[#082767]'>Cuenta todavía no vinculada</h2>
        <p className='mt-1 text-[11px] text-[#687b98]'>El usuario existe, pero aún no administra la ficha de un paciente.</p>
      </section>
    )
  }

  return (
    <section aria-labelledby='fichas-paciente-titulo' className='space-y-4'>
      <div className='rounded-xl border border-[#cde6eb] bg-[#f0fbfc] px-4 py-3 text-[10px] leading-4 text-[#356580]'>
        <strong className='text-[#078c9b]' id='fichas-paciente-titulo'>Ficha administrativa del paciente.</strong>{' '}
        No incluye diagnósticos, consultas, medicación, síntomas, documentos ni seguimiento clínico.
      </div>
      {pacientes.map((paciente) => {
        const datos = [
          ['Historia clínica', paciente.historiaClinica],
          ['DNI', paciente.dni || 'No registrado'],
          ['Fecha de nacimiento', paciente.fechaNacimiento || 'Por completar'],
          ['Edad', paciente.edad === null ? 'Por completar' : `${paciente.edad} años`],
          ['Sexo', paciente.sexo],
          ['Grupo sanguíneo', paciente.grupoSanguineo || 'No registrado'],
          ['Nacionalidad', paciente.nacionalidad],
          ['Procedencia', paciente.procedencia || 'No registrada'],
          ['Dirección', [paciente.direccion, paciente.distrito].filter(Boolean).join(', ') || 'No registrada'],
          ['Idioma preferido', paciente.idiomaPreferido],
          ['Registrado por', paciente.registradoPor?.nombre || 'Registro institucional'],
        ]
        return (
          <article className='rounded-2xl border border-[#dbe5ed] bg-white p-5 shadow-[0_5px_18px_rgba(18,52,91,0.05)]' key={paciente.id}>
            <header className='flex flex-wrap items-center justify-between gap-3 border-b border-[#e5ebf1] pb-4'>
              <div>
                <h2 className='text-lg font-extrabold text-[#082767]'>{paciente.nombreCompleto}</h2>
                <p className='mt-0.5 text-[10px] font-semibold text-[#657795]'>Paciente vinculado a esta cuenta</p>
              </div>
              <span className='rounded-full bg-[#e8f7ec] px-3 py-1 text-[9px] font-extrabold text-[#19954e]'>{paciente.estado}</span>
            </header>

            <dl className='mt-4 grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3'>
              {datos.map(([etiqueta, valor]) => (
                <div className='border-b border-dashed border-[#e0e7ee] py-3' key={etiqueta}>
                  <dt className='text-[9px] font-semibold text-[#73829b]'>{etiqueta}</dt>
                  <dd className='mt-1 break-words text-[11px] font-bold text-[#29436e]'>{valor}</dd>
                </div>
              ))}
            </dl>

            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <div className='rounded-xl bg-[#f7fbfd] p-3 text-[10px] text-[#536a8c]'>
                <strong className='block text-[#0a2b70]'>Responsable</strong>
                {paciente.vinculo
                  ? `${paciente.vinculo.parentesco} · ${paciente.vinculo.telefono || 'sin teléfono'}`
                  : 'Vínculo mediante cuenta móvil'}
              </div>
              <div className='rounded-xl bg-[#f7fbfd] p-3 text-[10px] text-[#536a8c]'>
                <strong className='block text-[#0a2b70]'>Cuenta móvil</strong>
                {paciente.cuentaMovil
                  ? `${paciente.cuentaMovil.alias} · ${paciente.cuentaMovil.estado}`
                  : 'Sin cuenta móvil vinculada'}
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}

export default FichaPacienteAdminComp
