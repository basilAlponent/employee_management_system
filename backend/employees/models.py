from django.db import models
from custom_forms.models import Form
from django.contrib.auth.models import User

class Employee(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    data = models.JSONField(default=dict)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Employee {self.id} for Form {self.form.form_name}"