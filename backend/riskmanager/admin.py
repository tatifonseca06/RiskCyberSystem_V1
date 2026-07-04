from django.contrib import admin
from .models import (
    Organizacion, PerfilUsuario, Activo, CatalogoAmenaza,
    CatalogoVulnerabilidad, ControlExistente, EscenarioRiesgo,
    AnalisisRiesgo, ResultadoMontecarlo, TratamientoRiesgo
)


@admin.register(Organizacion)
class OrganizacionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'sector', 'apetito_riesgo', 'activa', 'fecha_creacion')
    list_filter = ('sector', 'apetito_riesgo', 'activa')
    search_fields = ('nombre',)


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'organizacion', 'rol')
    list_filter = ('rol', 'organizacion')


@admin.register(Activo)
class ActivoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'tipo', 'organizacion', 'valor_activo_display', 'criticidad_display')
    list_filter = ('tipo', 'organizacion')
    search_fields = ('codigo', 'nombre')

    @admin.display(description='VA (C+I+D)')
    def valor_activo_display(self, obj):
        return obj.valor_activo

    @admin.display(description='Criticidad')
    def criticidad_display(self, obj):
        return obj.criticidad


@admin.register(CatalogoAmenaza)
class CatalogoAmenazaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'origen', 'organizacion', 'es_generica')
    list_filter = ('origen', 'organizacion')
    search_fields = ('nombre',)


@admin.register(CatalogoVulnerabilidad)
class CatalogoVulnerabilidadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'organizacion', 'es_generica')
    list_filter = ('categoria', 'organizacion')
    search_fields = ('nombre',)


@admin.register(ControlExistente)
class ControlExistenteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'activo', 'efectividad', 'organizacion')
    list_filter = ('categoria', 'organizacion')
    search_fields = ('nombre',)


@admin.register(EscenarioRiesgo)
class EscenarioRiesgoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'activo', 'amenaza', 'vulnerabilidad', 'organizacion')
    list_filter = ('organizacion',)
    search_fields = ('codigo',)
    filter_horizontal = ('controles_mitigantes',)


@admin.register(AnalisisRiesgo)
class AnalisisRiesgoAdmin(admin.ModelAdmin):
    list_display = ('escenario', 'probabilidad', 'impacto', 'riesgo_simple_display',
                     'nivel_riesgo_display', 'ale_estimado_display')
    list_filter = ('probabilidad', 'impacto')

    @admin.display(description='R = P x I')
    def riesgo_simple_display(self, obj):
        return obj.riesgo_simple

    @admin.display(description='Nivel')
    def nivel_riesgo_display(self, obj):
        return obj.nivel_riesgo_simple

    @admin.display(description='ALE estimado (USD)')
    def ale_estimado_display(self, obj):
        return f"${obj.ale_estimado:,.2f}"


@admin.register(ResultadoMontecarlo)
class ResultadoMontecarloAdmin(admin.ModelAdmin):
    list_display = ('analisis', 'n_iteraciones', 'distribucion', 'ale_media',
                     'ale_percentil_95', 'fecha_ejecucion')
    list_filter = ('distribucion',)
    readonly_fields = ('fecha_ejecucion',)


@admin.register(TratamientoRiesgo)
class TratamientoRiesgoAdmin(admin.ModelAdmin):
    list_display = ('escenario', 'estrategia', 'estado', 'responsable', 'plazo_dias', 'fecha_limite')
    list_filter = ('estrategia', 'estado')