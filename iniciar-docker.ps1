$ErrorActionPreference = 'Stop'

Write-Host 'Construyendo HemoRuta...' -ForegroundColor Cyan
docker build -f BackEnd/Dockerfile -t hemoruta-nino-san-borja-backend .
if ($LASTEXITCODE -ne 0) { throw 'No se pudo construir el backend.' }

docker build -f FrontEnd/Dockerfile -t hemoruta-nino-san-borja-frontend .
if ($LASTEXITCODE -ne 0) { throw 'No se pudo construir el frontend.' }

docker compose up -d --no-build
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron iniciar los servicios.' }

Write-Host ''
Write-Host 'HemoRuta está disponible en http://localhost:8090' -ForegroundColor Green
Write-Host 'Administrador: alex / alex'
Write-Host 'Para detenerlo: docker compose down'
