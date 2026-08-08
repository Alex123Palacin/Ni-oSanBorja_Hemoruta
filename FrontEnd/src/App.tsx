import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
//importaciones antonella
import AlexExperimentos from './pages/AlexExperimentos'
import LoginAdminPage from './pages/LoginAdminPage'
import RecuperacionCuentaAdminsPage from './pages/RecuperacionCuentaAdminsPage'
import VerificacionCuentaAdminsPage from './pages/VerificacionCuentaAdminsPage'

import ConfirmacionUsuarioPage from './pages/AdminModulo/ConfirmacionUsuarioPage'
import CrearUsuarioAdminPage from './pages/AdminModulo/CrearUsuarioAdminPage'
import DetalleUsuarioHospitalarioPage from './pages/AdminModulo/DetalleUsuarioHospitalarioPage'
import UsuariosHospitalariosPage from './pages/AdminModulo/UsuariosHospitalariosPage'

import ActivacionCuentaPage from './pages/MedicoModulo/ActivacionCuentaPage'
import ConsultaVozPage from './pages/MedicoModulo/ConsultaVozPage'
import FichaPacientePage from './pages/MedicoModulo/FichaPacientePage'
import GestionarPacientesPage from './pages/MedicoModulo/GestionarPacientesPage'
import HistoriaPacientePage from './pages/MedicoModulo/HistoriaPacientePage'
import NuevoPacientePage from './pages/MedicoModulo/NuevoPacientePage'
import SeguimientoPacientesListaPage from './pages/MedicoModulo/SeguimientoPacientesListaPage'
import VisualizarSeguimientoPacientePage from './pages/MedicoModulo/VisualizarSeguimientoPacientePage'

import DocumentosPage from './pages/PacienteModulo/DocumentosPage'
import InicioPage from './pages/PacienteModulo/InicioPage'
import LoginPacientePage from './pages/PacienteModulo/LoginPacientePage'
import MedicamentosPage from './pages/PacienteModulo/MedicamentosPage'
import RecuperacionCuentaPacientePage from './pages/PacienteModulo/RecuperacionCuentaPacientePage'
import SintomasPage from './pages/PacienteModulo/SintomasPage'
import TratamientoPage from './pages/PacienteModulo/TratamientoPage'
import VerificacionCuentaPacientePage from './pages/PacienteModulo/VerificacionCuentaPacientePage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/alex' element={<AlexExperimentos />} />

        <Route path='/login' element={<LoginAdminPage />} />
        <Route path='/recuperacion' element={<RecuperacionCuentaAdminsPage />} />
        <Route path='/verificacion' element={<VerificacionCuentaAdminsPage />} />

        <Route path='/doctor/activacion' element={<ActivacionCuentaPage />} />
        <Route path='/doctor/pacientes' element={<GestionarPacientesPage />} />
        <Route path='/doctor/ficha' element={<FichaPacientePage />} />
        <Route path='/doctor/consulta' element={<ConsultaVozPage />} />
        <Route path='/doctor/historial' element={<HistoriaPacientePage />} />
        <Route path='/doctor/nuevoRegistro' element={<NuevoPacientePage />} />
        <Route path='/doctor/seguimiento' element={<SeguimientoPacientesListaPage />} />
        <Route path='/doctor/visualizar' element={<VisualizarSeguimientoPacientePage />} />

        <Route path='/admin/UsuariosHospitalarios' element={<UsuariosHospitalariosPage />} />
        <Route path='/admin/CrearUs' element={<CrearUsuarioAdminPage />} />
        <Route path='/admin/confirmacion' element={<ConfirmacionUsuarioPage />} />
        <Route path='/admin/detalleUs' element={<DetalleUsuarioHospitalarioPage />} />

        <Route path='/paciente/login' element={<LoginPacientePage />} />
        <Route path='/paciente/recuperacion' element={<RecuperacionCuentaPacientePage />} />
        <Route path='/paciente/verificacion' element={<VerificacionCuentaPacientePage />} />
        <Route path='/paciente/inicio' element={<InicioPage />} />
        <Route path='/paciente/medicamento' element={<MedicamentosPage />} />
        <Route path='/paciente/sintomas' element={<SintomasPage />} />
        <Route path='/paciente/tratamiento' element={<TratamientoPage />} />
        <Route path='/paciente/documentos' element={<DocumentosPage />} />
      </Routes>
    </Router>
  )
}

export default App
