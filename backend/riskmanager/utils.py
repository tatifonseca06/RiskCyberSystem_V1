def porcentaje(valor, total):

    if total == 0:
        return 0

    return round((valor / total) * 100, 2)