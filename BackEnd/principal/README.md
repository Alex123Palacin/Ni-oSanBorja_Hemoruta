# Backend de HemoRuta

Backend REST para HemoRuta Pediátrica del Hospital del Niño San Borja. Usa Django, Django REST Framework, PostgreSQL y un módulo separado para voz e inteligencia artificial.

## Modulos

- `nucleo`: modelos y utilidades compartidas, salud del servicio y paginacion.
- `usuarios`: cuentas, roles, perfiles medicos, login, logout y administracion.
- `pacientes`: ficha demografica, tutores, cuenta movil y asignacion medica.
- `clinica`: diagnosticos, consultas, secciones estructuradas y planes de tratamiento.
- `citas`: citas declaradas o registradas por el hospital.
- `medicacion`: catalogo, prescripciones, horarios, dosis y reportes de toma.
- `seguimiento`: sintomas, eventos, semaforos y alertas.
- `documentos`: metadatos, carga y descarga autenticada de archivos clínicos.
- `ML_core`: entrevista clínica por voz, resumen estructurado y asistente del paciente.

## Configuración

La configuracion se lee desde `.env`. El archivo local ya apunta a:

- Base: `NiñoSanBorjaDataBase`
- Usuario PostgreSQL: `postgres`
- Host: `localhost:5432`

Para preparar otra computadora:

```powershell
cd BackEnd
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r .\principal\requirements.txt
cd .\principal
Copy-Item .env.example .env
```

Luego se editan en `.env` el nombre de la base y la contrasena local de PostgreSQL.

## Crear tablas y datos iniciales

```powershell
python manage.py migrate
python manage.py crear_admin_inicial
python manage.py seed_hemoruta_demo --password alex
```

`seed_hemoruta_demo` no elimina registros. Crea o actualiza un escenario de prueba con un
administrador, dos médicos, cinco pacientes con sus cuentas familiares, tutores, asignaciones
compartidas, diagnósticos, citas, consultas, planes, prescripciones, horarios, dosis, reportes de
adherencia, síntomas, semáforos, alertas, eventos de seguimiento y metadatos de documentos.

Opciones útiles:

```powershell
# Misma clave para todas las cuentas demo
python manage.py seed_hemoruta_demo --password alex

# Claves separadas y una fecha reproducible para pruebas
python manage.py seed_hemoruta_demo `
  --admin-password admin-demo `
  --doctor-password medico-demo `
  --patient-password familia-demo `
  --fecha-base 2026-08-11
```

La contraseña común también se puede definir con `HEMORUTA_DEMO_PASSWORD`. Si no se proporciona
una contraseña, el comando conserva las claves de las cuentas existentes y deja las cuentas nuevas
sin una clave utilizable. La repetición con la misma `--fecha-base` es idempotente; usar otra fecha
desplaza la agenda y añade las dosis correspondientes a la nueva semana de demostración.

Credenciales locales:

| Perfil | Usuario | Contrasena |
| --- | --- | --- |
| Administrador Django/HemoRuta | `alex` | `alex` |
| Medico | `valeria.ruiz` | `alex` |
| Medico | `luis.paredes` | `alex` |
| Paciente o responsable | `maria.flores` o DNI `45678912` | `alex` |

Las otras familias demo usan `carlos.rojas`, `veronica.medina`, `jorge.torres` y
`katherine.perez`; reciben la contraseña indicada en `--password` o `--patient-password`.

## Iniciar

```powershell
python manage.py runserver 0.0.0.0:8000
```

- Django Admin: `http://127.0.0.1:8000/admin/`
- API v1: `http://127.0.0.1:8000/api/v1/`
- Salud: `http://127.0.0.1:8000/api/v1/salud/`

El frontend usa un token en la cabecera `Authorization: Bearer <token>`.

## Rutas principales

- `POST /api/v1/auth/personal/login/`
- `POST /api/v1/auth/paciente/login/`
- `GET /api/v1/auth/me/`
- `POST /api/v1/auth/logout/`
- `GET|POST /api/v1/admin/usuarios/`
- `GET /api/v1/admin/usuarios/{id}/detalle-administrativo/`
- `GET /api/v1/medico/pacientes/`
- `GET /api/v1/medico/pacientes/{id}/ficha/`
- `GET /api/v1/medico/pacientes/{id}/historial/`
- `GET /api/v1/medico/seguimiento/`
- `GET /api/v1/medico/pacientes/{id}/seguimiento/`
- `GET /api/v1/paciente/inicio/`
- `GET /api/v1/paciente/medicacion/`
- `POST /api/v1/paciente/medicacion/tomas/`
- `POST /api/v1/paciente/sintomas/`
- `GET /api/v1/paciente/tratamiento/`
- `GET|POST /api/v1/paciente/documentos/`
- `GET /api/v1/paciente/documentos/{id}/archivo/?descargar=0|1`
- `POST /api/v1/ml/consultas-voz/`
- `POST /api/v1/ml/consultas-voz/{id}/transcribir/`
- `POST /api/v1/ml/consultas-voz/{id}/publicar/`
- `POST /api/v1/ml/asistente-paciente/consultar/`

Las respuestas paginadas usan el formato:

```json
{
  "paginacion": {
    "pagina": 1,
    "paginasTotales": 1,
    "tamanoPagina": 20,
    "total": 1
  },
  "resultados": []
}
```

## Frontend

Desde `FrontEnd`:

```powershell
npm install
npm run dev
```

La URL del backend se configura en `FrontEnd/.env` usando `FrontEnd/.env.example` como base. Para otra computadora de la red local se reemplaza `127.0.0.1` por la IP del equipo que ejecuta Django.

## Uso multiusuario en la red local

Cada administrador, médico y paciente utiliza su propia cuenta y token. Varias cuentas distintas pueden trabajar al mismo tiempo desde computadoras o perfiles de navegador diferentes. Cuando `Recordarme` no está marcado, el frontend conserva la sesión por pestaña para permitir cuentas diferentes en una misma computadora.

Para usar el sistema desde los equipos de la red del hospital:

```powershell
python manage.py runserver 0.0.0.0:8000
cd ..\..\FrontEnd
npm run dev -- --host 0.0.0.0
```

En el `.env` del frontend se usa la IP del equipo servidor:

```env
VITE_API_URL=http://IP_DEL_SERVIDOR:8000/api/v1
```

## Flujos que permanecen como prototipo

- Recuperacion y verificacion reales de cuentas.
- Envio de correo o WhatsApp.

Las pantallas de recuperación y verificación se mantienen visuales y no envían correo ni mensajes.
