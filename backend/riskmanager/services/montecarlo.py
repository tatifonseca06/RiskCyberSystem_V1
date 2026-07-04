import numpy as np
from decimal import Decimal


class MonteCarloEngine:
    """
    Motor de simulación Monte Carlo para riesgos FAIR.
    Usa distribución PERT aproximada con beta.
    """

    @staticmethod
    def pert(minimo, probable, maximo, size=10000, lamb=4):
        minimo = float(minimo)
        probable = float(probable)
        maximo = float(maximo)

        if minimo == maximo:
            return np.full(size, minimo)

        alpha = 1 + lamb * ((probable - minimo) / (maximo - minimo))
        beta = 1 + lamb * ((maximo - probable) / (maximo - minimo))

        muestras = np.random.beta(alpha, beta, size)
        return minimo + muestras * (maximo - minimo)

    @staticmethod
    def ejecutar(analisis, iteraciones=10000):
        lef = MonteCarloEngine.pert(
            analisis.lef_min,
            analisis.lef_probable,
            analisis.lef_max,
            iteraciones
        )

        plm = MonteCarloEngine.pert(
            analisis.plm_min,
            analisis.plm_probable,
            analisis.plm_max,
            iteraciones
        )

        slm = MonteCarloEngine.pert(
            analisis.slm_min,
            analisis.slm_probable,
            analisis.slm_max,
            iteraciones
        )

        resultados = lef * (plm + slm)

        return {
            "n_iteraciones": iteraciones,
            "distribucion": "PERT",
            "ale_media": Decimal(str(round(float(np.mean(resultados)), 2))),
            "ale_percentil_95": Decimal(str(round(float(np.percentile(resultados, 95)), 2))),
            "ale_minimo": Decimal(str(round(float(np.min(resultados)), 2))),
            "ale_maximo": Decimal(str(round(float(np.max(resultados)), 2))),
            "desviacion_estandar": Decimal(str(round(float(np.std(resultados)), 2))),
            "varianza": Decimal(str(round(float(np.var(resultados)), 2))),
        }