import FormRecuperarComp from "../components/FormRecuperarComp";
import HeaderForm from "../components/HeaderForm";
import fondoFormulario from "../assets/FondoNiño2.png";

function RecuperarPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <HeaderForm />

      <main
        className="
          relative
          flex
          flex-1
          items-center
          justify-center
          overflow-hidden
          bg-cover
          bg-center
          bg-no-repeat
          px-4
          py-[clamp(24px,3vw,48px)]
        "
        style={{
          backgroundImage: `url(${fondoFormulario})`,
        }}
      >
        <div className="relative z-10 w-full">
          <FormRecuperarComp />
        </div>
      </main>
    </div>
  );
}

export default RecuperarPage;
