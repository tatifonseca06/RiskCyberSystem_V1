from decimal import Decimal


class FairCalculator:
    """
    Motor FAIR básico.
    Centraliza todos los cálculos relacionados con el riesgo.
    """

    @staticmethod
    def calcular_riesgo_simple(probabilidad, impacto):
        """
        R = P x I
        """
        return probabilidad * impacto

    @staticmethod
    def calcular_valor_activo(confidencialidad, integridad, disponibilidad):
        """
        VA = C + I + D
        """
        return confidencialidad + integridad + disponibilidad

    @staticmethod
    def calcular_ale(lef, plm, slm):
        """
        ALE = LEF × (PLM + SLM)
        """
        return Decimal(lef) * (Decimal(plm) + Decimal(slm))

    @staticmethod
    def clasificar_riesgo(valor):
        """
        Clasificación del riesgo simple.
        """
        if valor >= 20:
            return "MUY_ALTO"
        elif valor >= 12:
            return "ALTO"
        elif valor >= 6:
            return "MEDIO"
        elif valor >= 3:
            return "BAJO"
        else:
            return "MUY_BAJO"