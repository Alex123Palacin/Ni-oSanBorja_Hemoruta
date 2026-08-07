import MenuMedicoComp from "../../components/MenuMedicoComp";

function NuevoPacientePage() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Menu Sidebar */}
      <MenuMedicoComp />

      {/* Empty Content Area */}
      <div className="flex-1"></div>
    </div>
  );
}

export default NuevoPacientePage;
