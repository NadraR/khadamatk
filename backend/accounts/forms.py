# accounts/forms.py
from django import forms
from .models import ClientProfile

class ClientProfileForm(forms.ModelForm):
    class Meta:
        model = ClientProfile
        fields = '__all__'

    # تحويل أي GIS field إلى حقل نصي
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if 'gis' in str(type(field)):  # لو لسه في GIS field
<<<<<<< HEAD
                field.widget = forms.TextInput()
=======
                field.widget = forms.TextInput()
>>>>>>> cdf5adee20680c4021187124d2966897cb0e740f
