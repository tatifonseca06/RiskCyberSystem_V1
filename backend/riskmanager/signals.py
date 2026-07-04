from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Activo


@receiver(post_save, sender=Activo)
def actualizar_activo(sender, instance, created, **kwargs):
    pass