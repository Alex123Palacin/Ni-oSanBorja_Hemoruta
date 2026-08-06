import FormInicioComp from '../components/FormInicioComp'
import { BtnCrear } from '../ui/BotonUi'
import AdaptadoMobil from '../components/pacienteMcomp/AdaptadoMobil'

function AlexExperimentos() {
  return (
    <AdaptadoMobil>
    <main className='flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-[#f3f9fb] py-10'>
      <FormInicioComp />

      <section
        aria-label='Prueba de botones para crear'
        className='flex w-[85%] max-w-[620px] flex-col items-center gap-4'
      >
        <BtnCrear ruta='/antonella' texto='Nuevo usuario' />
        <BtnCrear ruta='/antonella' texto='Nuevo paciente' />
      </section>
    </main>
    </AdaptadoMobil>
  )
}

export default AlexExperimentos
