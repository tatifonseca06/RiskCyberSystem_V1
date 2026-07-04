from rest_framework import serializers

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


class OrganizacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizacion
        fields = "__all__"


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source="usuario.username", read_only=True)
    organizacion_nombre = serializers.CharField(source="organizacion.nombre", read_only=True)

    class Meta:
        model = PerfilUsuario
        fields = "__all__"


class ActivoSerializer(serializers.ModelSerializer):
    organizacion_nombre = serializers.CharField(source="organizacion.nombre", read_only=True)

    class Meta:
        model = Activo
        fields = "__all__"


class CatalogoAmenazaSerializer(serializers.ModelSerializer):
    organizacion_nombre = serializers.CharField(source="organizacion.nombre", read_only=True)

    class Meta:
        model = CatalogoAmenaza
        fields = "__all__"


class CatalogoVulnerabilidadSerializer(serializers.ModelSerializer):
    organizacion_nombre = serializers.CharField(source="organizacion.nombre", read_only=True)

    class Meta:
        model = CatalogoVulnerabilidad
        fields = "__all__"


class ControlExistenteSerializer(serializers.ModelSerializer):
    organizacion_nombre = serializers.CharField(source="organizacion.nombre", read_only=True)

    class Meta:
        model = ControlExistente
        fields = "__all__"


class EscenarioRiesgoSerializer(serializers.ModelSerializer):
    organizacion_nombre = serializers.CharField(source="organizacion.nombre", read_only=True)
    activo_nombre = serializers.CharField(source="activo.nombre", read_only=True)
    amenaza_nombre = serializers.CharField(source="amenaza.nombre", read_only=True)
    vulnerabilidad_nombre = serializers.CharField(source="vulnerabilidad.nombre", read_only=True)

    class Meta:
        model = EscenarioRiesgo
        fields = "__all__"


class AnalisisRiesgoSerializer(serializers.ModelSerializer):
    escenario_codigo = serializers.CharField(source="escenario.codigo", read_only=True)

    class Meta:
        model = AnalisisRiesgo
        fields = "__all__"


class ResultadoMontecarloSerializer(serializers.ModelSerializer):
    escenario_codigo = serializers.CharField(source="analisis.escenario.codigo", read_only=True)

    class Meta:
        model = ResultadoMontecarlo
        fields = "__all__"


class TratamientoRiesgoSerializer(serializers.ModelSerializer):
    escenario_codigo = serializers.CharField(source="escenario.codigo", read_only=True)

    class Meta:
        model = TratamientoRiesgo
        fields = "__all__"