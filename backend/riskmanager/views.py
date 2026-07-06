from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .services.dashboard import DashboardService

from rest_framework.filters import SearchFilter, OrderingFilter

from .services.montecarlo import MonteCarloEngine

from .models import (
    Organizacion,
    PerfilUsuario,
    Activo,
    CatalogoAmenaza,
    CatalogoVulnerabilidad,
    ControlExistente,
    EscenarioRiesgo,
    AnalisisRiesgo,
    ResultadoMontecarlo,
    TratamientoRiesgo,
)

from .serializers import (
    OrganizacionSerializer,
    PerfilUsuarioSerializer,
    ActivoSerializer,
    CatalogoAmenazaSerializer,
    CatalogoVulnerabilidadSerializer,
    ControlExistenteSerializer,
    EscenarioRiesgoSerializer,
    AnalisisRiesgoSerializer,
    ResultadoMontecarloSerializer,
    TratamientoRiesgoSerializer,
)


class BaseOrganizationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user

        if usuario.is_superuser:
            return self.queryset

        if not hasattr(usuario, "perfil"):
            return self.queryset.none()

        organizacion = usuario.perfil.organizacion

        return self.queryset.filter(organizacion=organizacion)


class OrganizacionViewSet(viewsets.ModelViewSet):
    queryset = Organizacion.objects.all()
    serializer_class = OrganizacionSerializer
    permission_classes = [IsAuthenticated]

    # 🔥 ESTO ACTIVA EL BUSCADOR
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = [
        "nombre",
        "identificacion",
        "sector",
        "email",
        "telefono",
        "direccion",
    ]

    ordering_fields = ["nombre", "sector", "fecha_creacion"]


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.all()
    serializer_class = PerfilUsuarioSerializer
    permission_classes = [IsAuthenticated]


class ActivoViewSet(BaseOrganizationViewSet):
    queryset = Activo.objects.all()
    serializer_class = ActivoSerializer


class CatalogoAmenazaViewSet(BaseOrganizationViewSet):
    queryset = CatalogoAmenaza.objects.all()
    serializer_class = CatalogoAmenazaSerializer


class CatalogoVulnerabilidadViewSet(BaseOrganizationViewSet):
    queryset = CatalogoVulnerabilidad.objects.all()
    serializer_class = CatalogoVulnerabilidadSerializer


class ControlExistenteViewSet(BaseOrganizationViewSet):
    queryset = ControlExistente.objects.all()
    serializer_class = ControlExistenteSerializer


class EscenarioRiesgoViewSet(BaseOrganizationViewSet):
    queryset = EscenarioRiesgo.objects.all()
    serializer_class = EscenarioRiesgoSerializer


class AnalisisRiesgoViewSet(viewsets.ModelViewSet):
    queryset = AnalisisRiesgo.objects.all()
    serializer_class = AnalisisRiesgoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"], url_path="ejecutar-montecarlo")
    def ejecutar_montecarlo(self, request, pk=None):
        analisis = self.get_object()

        resultados = MonteCarloEngine.ejecutar(analisis)

        resultado, creado = ResultadoMontecarlo.objects.update_or_create(
            analisis=analisis,
            defaults=resultados
        )

        serializer = ResultadoMontecarloSerializer(resultado)

        return Response({
            "mensaje": "Simulación Monte Carlo ejecutada correctamente.",
            "resultado": serializer.data
        })


class ResultadoMontecarloViewSet(viewsets.ModelViewSet):
    queryset = ResultadoMontecarlo.objects.all()
    serializer_class = ResultadoMontecarloSerializer
    permission_classes = [IsAuthenticated]


class TratamientoRiesgoViewSet(viewsets.ModelViewSet):
    queryset = TratamientoRiesgo.objects.all()
    serializer_class = TratamientoRiesgoSerializer
    permission_classes = [IsAuthenticated]
    
from rest_framework.views import APIView


class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        datos = DashboardService.obtener_dashboard(request.user)

        return Response(datos)