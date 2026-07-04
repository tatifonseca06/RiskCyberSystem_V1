from rest_framework.permissions import BasePermission


class IsSameOrganization(BasePermission):

    def has_object_permission(self, request, view, obj):

        if not hasattr(request.user, "perfilusuario"):
            return False

        perfil = request.user.perfilusuario

        if hasattr(obj, "organizacion"):
            return obj.organizacion == perfil.organizacion

        return True