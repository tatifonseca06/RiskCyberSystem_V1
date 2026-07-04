from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DashboardAPIView,
    OrganizacionViewSet,
    PerfilUsuarioViewSet,
    ActivoViewSet,
    CatalogoAmenazaViewSet,
    CatalogoVulnerabilidadViewSet,
    ControlExistenteViewSet,
    EscenarioRiesgoViewSet,
    AnalisisRiesgoViewSet,
    ResultadoMontecarloViewSet,
    TratamientoRiesgoViewSet,
)

router = DefaultRouter()

router.register("organizaciones", OrganizacionViewSet, basename="organizaciones")
router.register("usuarios", PerfilUsuarioViewSet, basename="usuarios")
router.register("activos", ActivoViewSet, basename="activos")
router.register("amenazas", CatalogoAmenazaViewSet, basename="amenazas")
router.register("vulnerabilidades", CatalogoVulnerabilidadViewSet, basename="vulnerabilidades")
router.register("controles", ControlExistenteViewSet, basename="controles")
router.register("escenarios", EscenarioRiesgoViewSet, basename="escenarios")
router.register("analisis", AnalisisRiesgoViewSet, basename="analisis")
router.register("montecarlo", ResultadoMontecarloViewSet, basename="montecarlo")
router.register("tratamientos", TratamientoRiesgoViewSet, basename="tratamientos")

urlpatterns = [
    path("dashboard/", DashboardAPIView.as_view(), name="dashboard"),
    path("", include(router.urls)),
]