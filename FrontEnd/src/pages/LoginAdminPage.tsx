import FormInicioComp from "../components/FormInicioComp";
import iconoHemoRuta from "../assets/iconoHemoRutaNoBg.png";

function LoginAdminPage() {
  //1375
  let classNameTitle = "text-3xl max-[1375px]:text-[40px] text-[50px] ";
  let classNameDescription = "max-[1375px]:text-3xl text-[25px]";
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7F8FA]">
      <div className="max-[830px]:hidden w-[55%] bg-[url('assets/FondoNiño1.png')] bg-cover  min-h-screen bg-no-repeat bg-center pl-20 pt-10 min-[1250px]:pl-50 min-[1250px]:pt-20 flex flex-col gap-12 ">
        <div className="text-lg text-[#082767] font-normal sm:text-[27px] max-w-[350px]">
          <img src={iconoHemoRuta} alt="HemoRuta" />
          <p>Hospital del Niño San Borja</p>
        </div>
        <header className="flex  flex-col gap-8 max-w-[590px]">
          <h1
            className={
              "font-bold tracking-tight text-[#082767] " + classNameTitle
            }
          >
            Bienbenido al sistema <br /> de gestión hematológica
          </h1>
          <p className={"text-[#082767] font-normal " + classNameDescription}>
            Acompañamos cada oasi dek cuidado hematológico pediátrico con
            tecnología, seguridad y empatía.
          </p>
        </header>
      </div>
      <div className="flex-1 flex overflow-hidden h-screen items-center justify-center">
        <div className="flex-1 max-w-full scale-x-125 scale-y-150 max-[1600px]:scale-100">
          <FormInicioComp />
        </div>
      </div>
    </div>
  );
}

export default LoginAdminPage;
