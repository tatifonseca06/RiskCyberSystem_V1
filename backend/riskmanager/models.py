"""
Modelos del Sistema de Gestión de Riesgos Cibernéticos.
Basado en la metodología FAIR + Montecarlo + MAGERIT v3 + ISO/IEC 27005
desarrollada en el proyecto integrador de Seguridad Informática (UDLA).

Fases cubiertas:
  Fase 1 -> Organizacion (contexto + criterios de aceptacion)
  Fase 2 -> Activo, CatalogoAmenaza, CatalogoVulnerabilidad, ControlExistente, EscenarioRiesgo
  Fase 3 -> AnalisisRiesgo, ResultadoMontecarlo
  Fase 4 -> (calculado a partir de AnalisisRiesgo: nivel de riesgo, matriz P x I)
  Fase 5 -> TratamientoRiesgo
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError


# ============================================================
# FASE 1 — ESTABLECIMIENTO DEL CONTEXTO
# ============================================================

class Organizacion(models.Model):
    """
    Módulo de parametrización: cada organización define su propio
    contexto, sector, apetito de riesgo y umbrales de aceptación ALE.
    Esto es lo que hace genérica y reutilizable la metodología (sección 1.1 y 3.2).
    """

    SECTOR_CHOICES = [
        ('PYME', 'PYME'),
        ('SALUD', 'Salud'),
        ('EDUCACION', 'Educación'),
        ('INDUSTRIAL', 'Industrial'),
        ('FINANCIERO', 'Financiero'),
        ('BANCARIO', 'Bancario'),
        ('COMERCIO', 'Comercio'),
        ('SERVICIOS', 'Servicios'),
        ('GOBIERNO', 'Gobierno'),
        ('TECNOLOGIA', 'Tecnología'),
        ('OTRO', 'Otro'),
    ]
    
    

    APETITO_CHOICES = [
        ('AVERSO', 'Averso al riesgo (umbrales bajos)'),
        ('MODERADO', 'Moderado'),
        ('TOLERANTE', 'Tolerante al riesgo (umbrales altos)'),
        ('NEUTRO', 'Neutro')
    ]

    nombre = models.CharField(max_length=200)
    sector = models.CharField(max_length=20, choices=SECTOR_CHOICES, default='OTRO')
    descripcion = models.TextField(blank=True, help_text="Procesos de negocio críticos, contexto general")
    apetito_riesgo = models.CharField(max_length=20, choices=APETITO_CHOICES, default='MODERADO')
    email = models.EmailField(null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.TextField(null=True, blank=True)
    identificacion = models.CharField(max_length=50, null=True, blank=True)

    normativas_aplicables = models.CharField(
        max_length=300, blank=True,
        help_text="Ej: LOPDP, PCI-DSS, regulaciones sectoriales"
    )

    # --- Umbrales de aceptación de riesgo (ALE en USD) — sección 3.4, parametrizables ---
    umbral_muy_bajo = models.DecimalField(max_digits=14, decimal_places=2, default=1000)
    umbral_bajo = models.DecimalField(max_digits=14, decimal_places=2, default=10000)
    umbral_medio = models.DecimalField(max_digits=14, decimal_places=2, default=50000)
    umbral_alto = models.DecimalField(max_digits=14, decimal_places=2, default=200000)
    # Por encima de umbral_alto => Muy Alto

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = "Organización"
        verbose_name_plural = "Organizaciones"

    def __str__(self):
        return f"{self.nombre} ({self.get_sector_display()})"

    def nivel_para_ale(self, ale_valor):
        """Determina el nivel de riesgo (Fase 1, tabla 3.4) según el ALE estimado."""
        ale_valor = float(ale_valor)
        if ale_valor < float(self.umbral_muy_bajo):
            return 'MUY_BAJO'
        elif ale_valor < float(self.umbral_bajo):
            return 'BAJO'
        elif ale_valor < float(self.umbral_medio):
            return 'MEDIO'
        elif ale_valor < float(self.umbral_alto):
            return 'ALTO'
        else:
            return 'MUY_ALTO'


class PerfilUsuario(models.Model):
    """
    Extiende el User de Django para vincularlo a una Organización.
    Permite multi-tenant lógico: cada usuario opera dentro del contexto
    de su organización (sección 3.2 — partes interesadas).
    """
    ROL_CHOICES = [
        ('ADMIN', 'Administrador'),
        ('CISO', 'CISO / Responsable de Riesgos'),
        ('ANALISTA', 'Analista de Riesgos'),
        ('CONSULTA', 'Solo consulta'),
    ]

    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name='miembros')
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='ANALISTA')

    def __str__(self):
        return f"{self.usuario.username} - {self.organizacion.nombre} ({self.rol})"


# ============================================================
# FASE 2 — IDENTIFICACIÓN DEL RIESGO
# ============================================================

class Activo(models.Model):
    """
    Matriz de Inventario de Activos (sección 4.1, Tarea 5).
    VA = C + I + D ; Criticidad derivada automáticamente.
    """

    TIPO_CHOICES = [
        ('INF', 'Información y datos'),
        ('SW', 'Software y aplicaciones'),
        ('HW', 'Hardware e infraestructura'),
        ('SRV', 'Servicios digitales'),
        ('PER', 'Personas y roles críticos'),
        ('IDN', 'Identidad y acceso'),
        ('RED', 'Red y comunicaciones'),
        ('DOC', 'Documentación y conocimiento'),
        ('REP', 'Reputación digital'),
        ('TER', 'Terceros y proveedores'),
    ]

    ESCALA_CID = [(1, '1 - Bajo'), (2, '2 - Medio'), (3, '3 - Alto')]

    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name='activos')
    codigo = models.CharField(max_length=20, help_text="Ej: INF-001, SW-001")
    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=5, choices=TIPO_CHOICES)
    descripcion = models.TextField(blank=True)
    proceso_asociado = models.CharField(max_length=200, blank=True)
    ubicacion = models.CharField(max_length=200, blank=True)
    propietario = models.CharField(max_length=150, blank=True)
    custodio_tecnico = models.CharField(max_length=150, blank=True)
    usuarios_principales = models.CharField(max_length=300, blank=True)
    dependencias = models.TextField(blank=True, help_text="Otros activos de los que depende")

    # Valoración CIA (sección 4.1)
    confidencialidad = models.IntegerField(choices=ESCALA_CID, validators=[MinValueValidator(1), MaxValueValidator(5)])
    integridad = models.IntegerField(choices=ESCALA_CID, validators=[MinValueValidator(1), MaxValueValidator(5)])
    disponibilidad = models.IntegerField(choices=ESCALA_CID, validators=[MinValueValidator(1), MaxValueValidator(5)])

    # Valor económico del activo (necesario para estimar PLM en escenarios)
    valor_economico_usd = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['codigo']
        unique_together = [('organizacion', 'codigo')]
        verbose_name = "Activo"
        verbose_name_plural = "Activos"

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    @property
    def valor_activo(self):
        """VA = C + I + D (sección 4.1)"""
        return self.confidencialidad + self.integridad + self.disponibilidad

    @property
    def criticidad(self):
        """Crítico: 7-9 | Importante: 4-6 | Bajo: 3 (sección 4.1)"""
        va = self.valor_activo
        if va >= 7:
            return 'CRITICO'
        elif va >= 4:
            return 'IMPORTANTE'
        else:
            return 'BAJO'


class CatalogoAmenaza(models.Model):
    """Catálogo parametrizable de amenazas (sección 4.2)."""

    ORIGEN_CHOICES = [
        ('EXTERNA', 'Amenaza externa'),
        ('INTERNA', 'Amenaza interna'),
        ('PROCESO', 'Amenaza de proceso y entorno'),
    ]

    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name='amenazas')
    nombre = models.CharField(max_length=200)
    origen = models.CharField(max_length=10, choices=ORIGEN_CHOICES)
    descripcion = models.TextField(blank=True)
    es_generica = models.BooleanField(
        default=False,
        help_text="Si viene del catálogo base de la metodología (no editable por todas las orgs)"
    )

    class Meta:
        ordering = ['origen', 'nombre']
        verbose_name = "Amenaza"
        verbose_name_plural = "Catálogo de Amenazas"

    def __str__(self):
        return f"[{self.get_origen_display()}] {self.nombre}"


class CatalogoVulnerabilidad(models.Model):
    """Catálogo parametrizable de vulnerabilidades (sección 4.3)."""

    CATEGORIA_CHOICES = [
        ('TECNOLOGICA', 'Tecnológica'),
        ('ORGANIZACIONAL', 'Organizacional'),
        ('PROCESOS', 'De procesos'),
        ('TERCEROS', 'De terceros'),
    ]

    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name='vulnerabilidades')
    nombre = models.CharField(max_length=200)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    descripcion = models.TextField(blank=True)
    es_generica = models.BooleanField(default=False)

    class Meta:
        ordering = ['categoria', 'nombre']
        verbose_name = "Vulnerabilidad"
        verbose_name_plural = "Catálogo de Vulnerabilidades"

    def __str__(self):
        return f"[{self.get_categoria_display()}] {self.nombre}"


class ControlExistente(models.Model):
    """
    Controles ya implementados sobre un activo, que reducen la probabilidad
    o impacto de un escenario (mencionados en el flujo de Fase 2 del enunciado:
    'Controles Existentes -> Resultado: Escenarios de Riesgo').
    """

    CATEGORIA_CHOICES = [
        ('ACCESO', 'Control de acceso'),
        ('DATOS', 'Protección de datos'),
        ('CONTINUIDAD', 'Continuidad'),
        ('MONITOREO', 'Monitoreo'),
        ('VULNERABILIDADES', 'Gestión de vulnerabilidades'),
        ('CONCIENTIZACION', 'Concientización'),
        ('CUMPLIMIENTO', 'Cumplimiento LOPDP'),
        ('TERCEROS', 'Terceros'),
    ]

    EFECTIVIDAD_CHOICES = [
        (1, '1 - Baja'),
        (2, '2 - Media'),
        (3, '3 - Alta'),
    ]

    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name='controles')
    activo = models.ForeignKey(Activo, on_delete=models.CASCADE, related_name='controles', null=True, blank=True)
    nombre = models.CharField(max_length=200)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    descripcion = models.TextField(blank=True)
    efectividad = models.IntegerField(choices=EFECTIVIDAD_CHOICES, default=2,
                                       help_text="Qué tanto reduce la probabilidad/impacto del riesgo")

    class Meta:
        ordering = ['categoria', 'nombre']
        verbose_name = "Control Existente"
        verbose_name_plural = "Controles Existentes"

    def __str__(self):
        return f"{self.nombre} ({self.get_categoria_display()})"


class EscenarioRiesgo(models.Model):
    """
    Vincula Activo + Amenaza + Vulnerabilidad (sección 4.4).
    Es la unidad base sobre la que se hace el análisis cuantitativo (Fase 3).
    """

    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name='escenarios')
    codigo = models.CharField(max_length=20, help_text="Ej: R-001")
    activo = models.ForeignKey(Activo, on_delete=models.CASCADE, related_name='escenarios')
    amenaza = models.ForeignKey(CatalogoAmenaza, on_delete=models.CASCADE, related_name='escenarios')
    vulnerabilidad = models.ForeignKey(CatalogoVulnerabilidad, on_delete=models.CASCADE, related_name='escenarios')
    controles_mitigantes = models.ManyToManyField(ControlExistente, blank=True, related_name='escenarios')

    descripcion_resultado = models.TextField(
        blank=True,
        help_text="Ej: 'Cifrado y pérdida de datos de clientes con impacto operativo y legal'"
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['codigo']
        unique_together = [('organizacion', 'codigo')]
        verbose_name = "Escenario de Riesgo"
        verbose_name_plural = "Escenarios de Riesgo"

    def __str__(self):
        return f"{self.codigo} - {self.activo.nombre} / {self.amenaza.nombre}"


# ============================================================
# FASE 3 — ANÁLISIS DE RIESGOS (FAIR + MONTECARLO)
# ============================================================

class AnalisisRiesgo(models.Model):
    """
    Parámetros de entrada cuantitativos por escenario (sección 5.2 y 5.3).
    Guarda tanto el modelo simple R = P x I (matriz de calor, Fase 4)
    como los parámetros FAIR (LEF, PLM, SLM) con rangos min/probable/max
    para alimentar la simulación de Montecarlo.
    """

    ESCALA_1_5 = [(i, str(i)) for i in range(1, 6)]

    escenario = models.OneToOneField(EscenarioRiesgo, on_delete=models.CASCADE, related_name='analisis')

    # --- Modelo simple R = P x I (para la matriz de calor, sección 5.2/6.1) ---
    probabilidad = models.IntegerField(choices=ESCALA_1_5, validators=[MinValueValidator(1), MaxValueValidator(5)])
    impacto = models.IntegerField(choices=ESCALA_1_5, validators=[MinValueValidator(1), MaxValueValidator(5)])

    # --- Parámetros FAIR (sección 5.3) ---
    lef_min = models.DecimalField(max_digits=8, decimal_places=4, help_text="Frecuencia anual mínima")
    lef_probable = models.DecimalField(max_digits=8, decimal_places=4, help_text="Frecuencia anual más probable")
    lef_max = models.DecimalField(max_digits=8, decimal_places=4, help_text="Frecuencia anual máxima")

    plm_min = models.DecimalField(max_digits=14, decimal_places=2)
    plm_probable = models.DecimalField(max_digits=14, decimal_places=2)
    plm_max = models.DecimalField(max_digits=14, decimal_places=2)

    slm_min = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    slm_probable = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    slm_max = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    notas = models.TextField(blank=True)
    fecha_analisis = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Análisis de Riesgo"
        verbose_name_plural = "Análisis de Riesgos"

    def __str__(self):
        return f"Análisis de {self.escenario.codigo}"

    def clean(self):
        for nombre, mn, pr, mx in [
            ('LEF', self.lef_min, self.lef_probable, self.lef_max),
            ('PLM', self.plm_min, self.plm_probable, self.plm_max),
            ('SLM', self.slm_min, self.slm_probable, self.slm_max),
        ]:
            if not (mn <= pr <= mx):
                raise ValidationError(f"{nombre}: se debe cumplir mínimo ≤ probable ≤ máximo.")

    @property
    def riesgo_simple(self):
        """R = P x I (sección 5.3, matriz de calor)"""
        return self.probabilidad * self.impacto

    @property
    def nivel_riesgo_simple(self):
        """Niveles de criticidad según tabla 6.2"""
        r = self.riesgo_simple
        if r >= 20:
            return 'MUY_ALTO'
        elif r >= 12:
            return 'ALTO'
        elif r >= 6:
            return 'MEDIO'
        elif r >= 3:
            return 'BAJO'
        else:
            return 'MUY_BAJO'

    @property
    def ale_estimado(self):
        """ALE = LEF_probable x (PLM_probable + SLM_probable) — estimación puntual, sección 3.3/5.3"""
        return float(self.lef_probable) * (float(self.plm_probable) + float(self.slm_probable))


class ResultadoMontecarlo(models.Model):
    """
    Resultado agregado de ejecutar la simulación de Montecarlo (sección 5.4)
    sobre un AnalisisRiesgo. Se ejecuta "bajo demanda" desde el frontend
    (botón 'Ejecutar simulación'), no automáticamente al guardar.
    """

    analisis = models.OneToOneField(AnalisisRiesgo, on_delete=models.CASCADE, related_name='resultado_montecarlo')

    n_iteraciones = models.IntegerField(default=10000)
    distribucion = models.CharField(
        max_length=20,
        choices=[('PERT', 'PERT'), ('TRIANGULAR', 'Triangular')],
        default='PERT'
    )

    ale_media = models.DecimalField(max_digits=14, decimal_places=2, help_text="Riesgo esperado (media)")
    ale_percentil_95 = models.DecimalField(max_digits=14, decimal_places=2, help_text="Peor caso razonable")
    ale_minimo = models.DecimalField(max_digits=14, decimal_places=2)
    ale_maximo = models.DecimalField(max_digits=14, decimal_places=2)
    desviacion_estandar = models.DecimalField(max_digits=14, decimal_places=2)
    varianza = models.DecimalField(max_digits=18, decimal_places=2, help_text="Indicador de incertidumbre")

    fecha_ejecucion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Resultado de Simulación Montecarlo"
        verbose_name_plural = "Resultados de Simulación Montecarlo"
        ordering = ['-fecha_ejecucion']

    def __str__(self):
        return f"Montecarlo {self.analisis.escenario.codigo} - Media: ${self.ale_media}"


# ============================================================
# FASE 5 — TRATAMIENTO DEL RIESGO
# ============================================================

class TratamientoRiesgo(models.Model):
    """
    Estrategia de tratamiento por escenario (sección VII).
    'Aceptar' solo debería aplicarse a riesgos Muy Bajo/Bajo (regla de negocio
    validada a nivel de serializer/vista, sección 7.1).
    """

    ESTRATEGIA_CHOICES = [
        ('MITIGAR', 'Mitigar'),
        ('TRANSFERIR', 'Transferir'),
        ('EVITAR', 'Evitar'),
        ('ACEPTAR', 'Aceptar'),
    ]

    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('EN_PROCESO', 'En proceso'),
        ('IMPLEMENTADO', 'Implementado'),
        ('VENCIDO', 'Vencido'),
    ]

    escenario = models.OneToOneField(EscenarioRiesgo, on_delete=models.CASCADE, related_name='tratamiento')
    estrategia = models.CharField(max_length=15, choices=ESTRATEGIA_CHOICES)
    descripcion_plan = models.TextField(help_text="Ej: instalar MFA, contratar seguro cibernético, etc.")
    responsable = models.CharField(max_length=150, blank=True)
    plazo_dias = models.IntegerField(
        null=True, blank=True,
        help_text="Plazo en días según nivel: 30 (Alto), 90 (Medio), etc."
    )
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='PENDIENTE')
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_limite = models.DateField(null=True, blank=True)
    fecha_implementacion = models.DateField(null=True, blank=True)

    aprobado_por = models.CharField(max_length=150, blank=True,
                                     help_text="Requerido si estrategia = Aceptar (aprobación documentada, sección 7.1)")

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tratamiento de Riesgo"
        verbose_name_plural = "Tratamientos de Riesgo"

    def __str__(self):
        return f"{self.escenario.codigo} - {self.get_estrategia_display()}"

    def clean(self):
        if self.estrategia == 'ACEPTAR' and not self.aprobado_por:
            raise ValidationError(
                "La estrategia 'Aceptar' requiere aprobación documentada del responsable (sección 7.1)."
            )