from django.shortcuts import render
from .models import Form, FormField
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import FormSerializers,FormFieldSerializers
from rest_framework.permissions import IsAuthenticated

class FormViewSet(viewsets.ModelViewSet):
    queryset= Form.objects.all()
    serializer_class = FormSerializers
    permission_classes = [IsAuthenticated]

    def perform_create(self,serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='add-field')
    def add_field(self, request, pk=None):
        form = self.get_object()
        serializer = FormFieldSerializers(data=request.data)
        if serializer.is_valid():
            serializer.save(form=form)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FormFieldViewSet(viewsets.ModelViewSet):
    queryset = FormField.objects.all()
    serializer_class = FormFieldSerializers
    permission_classes = [IsAuthenticated]
