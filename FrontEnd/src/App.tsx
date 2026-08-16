import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthProvider from './auth/AuthProvider'
import ProtectedRoute from './auth/ProtectedRoute'
import AdminSessionLayoutComp from './components/adminMcomp/AdminSessionLayoutComp'
import DoctorSessionLayoutComp from './components/medicoMcomp/DoctorSessionLayoutComp'
import PacienteSessionLayoutComp from './components/pacienteMcomp/PacienteSessionLayoutComp'
//importaciones antonella
import AlexExperimentos from './pages/AlexExperimentos'
import LoginAdminPage from './pages/LoginAdminPage'
import RecuperacionCuentaAdminsPage from './pages/RecuperacionCuentaAdminsPage'
import VerificacionCuentaAdminsPage from './pages/VerificacionCuentaAdminsPage'

import ConfirmacionUsuarioPage from './pages/AdminModulo/ConfirmacionUsuarioPage'
import CrearUsuarioAdminPage from './pages/AdminModulo/CrearUsuarioAdminPage'
import DetalleUsuarioHospitalarioPage from './pages/AdminModulo/DetalleUsuarioHospitalarioPage'
import ClinicaDiaPage from './pages/AdminModulo/ClinicaDiaPage'
import InicioAdminPage from './pages/AdminModulo/InicioAdminPage'
import UsuariosHospitalariosPage from './pages/AdminModulo/UsuariosHospitalariosPage'

import ActivacionCuentaPage from './pages/MedicoModulo/ActivacionCuentaPage'
import ConsultaVozPage from './pages/MedicoModulo/ConsultaVozPage'
import FichaPacientePage from './pages/MedicoModulo/FichaPacientePage'
import GestionarPacientesPage from './pages/MedicoModulo/GestionarPacientesPage'
import HistoriaPacientePage from './pages/MedicoModulo/HistoriaPacientePage'
import InicioDoctorPage from './pages/MedicoModulo/InicioDoctorPage'
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
      <AuthProvider>
        <Routes>
          <Route path='/whassapp' element={<AlexExperimentos />} />

          <Route path='/login' element={<LoginAdminPage />} />
          <Route path='/recuperacion' element={<RecuperacionCuentaAdminsPage />} />
          <Route path='/verificacion' element={<VerificacionCuentaAdminsPage />} />

          <Route path='/doctor/activacion' element={<ActivacionCuentaPage />} />
          <Route element={<ProtectedRoute rolesPermitidos={['MEDICO']} rutaLogin='/login' />}>
            <Route element={<DoctorSessionLayoutComp />}>
              <Route path='/doctor/inicio' element={<InicioDoctorPage />} />
              <Route path='/doctor/pacientes' element={<GestionarPacientesPage />} />
              <Route path='/doctor/ficha' element={<FichaPacientePage />} />
              <Route path='/doctor/consulta' element={<ConsultaVozPage />} />
              <Route path='/doctor/historial' element={<HistoriaPacientePage />} />
              <Route path='/doctor/seguimiento' element={<SeguimientoPacientesListaPage />} />
              <Route path='/doctor/visualizar' element={<VisualizarSeguimientoPacientePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute rolesPermitidos={['ADMINISTRADOR']} rutaLogin='/login' />}>
            <Route element={<AdminSessionLayoutComp />}>
              <Route path='/admin/inicio' element={<InicioAdminPage />} />
              <Route path='/admin/UsuariosHospitalarios' element={<UsuariosHospitalariosPage />} />
              <Route path='/admin/CrearUs' element={<CrearUsuarioAdminPage />} />
              <Route path='/admin/clinica-dia' element={<ClinicaDiaPage />} />
              <Route path='/admin/confirmacion' element={<ConfirmacionUsuarioPage />} />
              <Route path='/admin/detalleUs' element={<Navigate replace to='/admin/UsuariosHospitalarios' />} />
              <Route path='/admin/detalleUs/:usuarioId' element={<DetalleUsuarioHospitalarioPage />} />
            </Route>
          </Route>

          <Route element={<PacienteSessionLayoutComp />}>
            <Route path='/paciente/login' element={<LoginPacientePage />} />
            <Route path='/paciente/recuperacion' element={<RecuperacionCuentaPacientePage />} />
            <Route path='/paciente/verificacion' element={<VerificacionCuentaPacientePage />} />
            <Route element={<ProtectedRoute rolesPermitidos={['PACIENTE']} rutaLogin='/paciente/login' />}>
              <Route path='/paciente/inicio' element={<InicioPage />} />
              <Route path='/paciente/medicamento' element={<MedicamentosPage />} />
              <Route path='/paciente/sintomas' element={<SintomasPage />} />
              <Route path='/paciente/tratamiento' element={<TratamientoPage />} />
              <Route path='/paciente/documentos' element={<DocumentosPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
