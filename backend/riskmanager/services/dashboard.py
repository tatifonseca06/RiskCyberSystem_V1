from django.db.models import Avg, Sum
from ..models import (
    Activo,
    CatalogoAmenaza,
    CatalogoVulnerabilidad,
    EscenarioRiesgo,
    AnalisisRiesgo,
    ResultadoMontecarlo,
)


class DashboardService:

    @staticmethod
    def obtener_dashboard(usuario):

        if usuario.is_superuser:
            activos = Activo.objects.all()
            amenazas = CatalogoAmenaza.objects.all()
            vulnerabilidades = CatalogoVulnerabilidad.objects.all()
            escenarios = EscenarioRiesgo.objects.all()
            analisis = AnalisisRiesgo.objects.all()
            montecarlo = ResultadoMontecarlo.objects.all()
        else:
            org = usuario.perfil.organizacion

            activos = Activo.objects.filter(organizacion=org)
            amenazas = CatalogoAmenaza.objects.filter(organizacion=org)
            vulnerabilidades = CatalogoVulnerabilidad.objects.filter(organizacion=org)
            escenarios = EscenarioRiesgo.objects.filter(organizacion=org)
            analisis = AnalisisRiesgo.objects.filter(
                escenario__organizacion=org
            )
            montecarlo = ResultadoMontecarlo.objects.filter(
                analisis__escenario__organizacion=org
            )

        total_activos = activos.count()
        total_amenazas = amenazas.count()
        total_vulnerabilidades = vulnerabilidades.count()
        total_escenarios = escenarios.count()
        total_analisis = analisis.count()

        riesgos = {
            "MUY_ALTO": 0,
            "ALTO": 0,
            "MEDIO": 0,
            "BAJO": 0,
            "MUY_BAJO": 0,
        }

        for a in analisis:
            riesgos[a.nivel_riesgo_simple] += 1

        ale_total = (
            montecarlo.aggregate(
                total=Sum("ale_media")
            )["total"]
            or 0
        )

        ale_promedio = (
            montecarlo.aggregate(
                promedio=Avg("ale_media")
            )["promedio"]
            or 0
        )

        return {
            "total_activos": total_activos,
            "total_amenazas": total_amenazas,
            "total_vulnerabilidades": total_vulnerabilidades,
            "total_escenarios": total_escenarios,
            "total_analisis": total_analisis,
            "riesgos": riesgos,
            "ale_total": ale_total,
            "ale_promedio": ale_promedio,
        }