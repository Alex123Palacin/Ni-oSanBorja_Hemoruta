from django.contrib import admin

from .models import AsignacionMedica, CuentaMovilPaciente, Paciente, TutorPaciente

admin.site.register((Paciente, TutorPaciente, AsignacionMedica, CuentaMovilPaciente))

