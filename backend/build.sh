#!/bin/bash
set -e
python manage.py migrate --no-input
python manage.py collectstatic --no-input
python manage.py shell -c "
from django.contrib.auth.models import User
from riskmanager.models import Organizacion, PerfilUsuario
if not User.objects.filter(username='admin').exists():
    org, _ = Organizacion.objects.get_or_create(nombre='Organización Demo', defaults={'sector': 'TECNOLOGIA', 'apetito_riesgo': 'MODERADO'})
    u = User.objects.create_superuser('admin', 'admin@demo.com', 'admin123')
    PerfilUsuario.objects.create(usuario=u, organizacion=org, rol='ADMIN')
    print('Usuario admin creado')
else:
    print('Usuario admin ya existe')
"
