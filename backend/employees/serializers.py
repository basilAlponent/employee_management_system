from rest_framework import serializers
from .models import Employee
from custom_forms.models import Form
import re
from datetime import datetime

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

    def validate(self, attrs):
        form = attrs.get('form')
        data = attrs.get('data', {})

        if self.instance:
            form = attrs.get('form', self.instance.form)
            data = attrs.get('data', self.instance.data)

        if form is None:
            return attrs

        fields = form.fields.all()
        errors = {}
        valid_labels = set()

        for field in fields:
            valid_labels.add(field.label)
            value = data.get(field.label)
            
            if value in [None, ""]:
                errors[field.label] = 'This field is required.'
                continue

            if field.field_type == 'Number':
                try:
                    float(value)
                except ValueError:
                    errors[field.label] = 'Must be a number.'
            elif field.field_type == 'Email':
                email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
                if not re.match(email_regex, str(value)):
                    errors[field.label] = 'Must be a valid email.'
            elif field.field_type == 'Date':
                try:
                    datetime.strptime(str(value), '%Y-%m-%d')
                except ValueError:
                    errors[field.label] = 'Must be a valid date in YYYY-MM-DD format.'
        
        for key in data.keys():
            if key not in valid_labels:
                errors[key] = f"Field '{key}' is not defined in the form."

        if errors:
            raise serializers.ValidationError({"data": errors})

        return attrs
