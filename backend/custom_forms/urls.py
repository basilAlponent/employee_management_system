from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import FormViewSet, FormFieldViewSet


router=DefaultRouter()
router.register(r'fields', FormFieldViewSet, basename='form-fields')
router.register(r'', FormViewSet)

urlpatterns=[
    path('',include(router.urls))
]