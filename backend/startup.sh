#!/bin/bash
set -e

python manage.py migrate --no-input
python manage.py collectstatic --no-input --clear

python manage.py shell << 'PYEOF'
from django.contrib.auth.models import User
from riskmanager.models import Organizacion, PerfilUsuario

if not User.objects.filter(username='admin').exists():
    org, _ = Organizacion.objects.get_or_create(
        nombre='Organizacion Demo',
        defaults={'sector': 'TECNOLOGIA', 'apetito_riesgo': 'MODERADO'}
    )
    u = User.objects.create_superuser('admin', 'admin@demo.com', 'admin123')
    PerfilUsuario.objects.create(usuario=u, organizacion=org, rol='ADMIN')
    print('Admin creado')
else:
    print('Admin ya existe')
PYEOF

exec gunicorn riskcyber_api.wsgi --bind 0.0.0.0:$PORT --workers 2
