import type { ReactNode } from "react";

type AdaptadoMobilProps = {
  children: ReactNode;
  estilos?: string;
};

function AdaptadoMobil({ children, estilos = "" }: AdaptadoMobilProps) {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-white">
      <div className="h-[100dvh] w-full overflow-x-hidden overflow-y-auto overscroll-y-contain border-0 bg-[#dbeee8] p-0 font-[Arial] sm:w-[30vw] sm:min-w-[400px] sm:max-w-[500px] sm:border-4 sm:border-black">
        <div
          className={`flex h-full min-h-full w-full min-w-0 flex-col [overflow-wrap:anywhere] [word-break:normal] [white-space:normal] ${estilos}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdaptadoMobil;
