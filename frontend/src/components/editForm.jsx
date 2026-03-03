import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/config';

export default function EditForm() {
    const { id } = useParams(); // Get the form ID from the URL
    const navigate = useNavigate();

    const [formName, setFormName] = useState('');
    const [fields, setFields] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch existing form data on load
    useEffect(() => {
        fetchFormDetails();
    }, [id]);

    const fetchFormDetails = async () => {
        try {
            const response = await api.get(`forms/${id}/`);
            setFormName(response.data.form_name);
            setFields(response.data.fields);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load form details.');
            setLoading(false);
        }
    };

    // 1. Add a new field dynamically to the UI. It won't be saved until "Save" is clicked.
    const addField = () => {
        setFields([
            ...fields,
            { id: `new-field-${Date.now()}`, label: '', field_type: 'Text', isNew: true },
        ]);
        setError('');
    };

    // 2. Update an existing field's values (label or type)
    const updateField = (fieldId, key, value) => {
        const updatedFields = fields.map((field) => {
            if (field.id === fieldId) {
                return { ...field, [key]: value };
            }
            return field;
        });
        setFields(updatedFields);
    };

    // 3. Remove a field dynamically. If it exists in the database, delete it from the API directly.
    const removeField = async (fieldId, isNew) => {
        if (!isNew) {
            if (!window.confirm("Are you sure you want to delete this field permanently?")) {
                return;
            }
            try {
                await api.delete(`forms/fields/${fieldId}/`);
            } catch (err) {
                console.error(err);
                return alert("Failed to delete field from server.");
            }
        }
        setFields(fields.filter((field) => field.id !== fieldId));
    };

    // 4. Submit Form and its Fields to Django Backend
    const saveForm = async () => {
        setError('');
        setSuccess('');

        if (!formName.trim()) {
            return setError('Form name is required');
        }
        if (fields.length === 0) {
            return setError('Please add at least one field');
        }

        // Validate that all fields have a named label
        for (const field of fields) {
            if (!field.label.trim()) {
                return setError('All fields must have a label');
            }
        }

        setIsSubmitting(true);
        try {
            // Step 1: Update the form name
            await api.patch(`forms/${id}/`, {
                form_name: formName
            });

            // Step 2: Loop through fields and either update or create them
            for (const field of fields) {
                if (field.isNew) {
                    // Create newly added field
                    await api.post(`forms/${id}/add-field/`, {
                        label: field.label,
                        field_type: field.field_type
                    });
                } else {
                    // Update existing field
                    await api.patch(`forms/fields/${field.id}/`, {
                        label: field.label,
                        field_type: field.field_type
                    });
                }
            }

            setSuccess('Form updated successfully!');
            // Re-fetch to get real database IDs for any brand new fields we just saved
            await fetchFormDetails();
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.detail || 'Failed to update form.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Form...</div>;

    return (
        <div className="registercontainer" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <h2 style={{ margin: 0 }}>Edit Form</h2>
                <button onClick={() => navigate('/')} style={{ background: '#f8f9fa', color: '#333', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', width: 'auto', fontSize: '14px', marginTop: 0 }}>
                    &larr; Back to Forms
                </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label>Form Name: </label>
                <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Onboarding Form"
                    style={{ padding: '8px', width: '100%' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={addField}
                    style={{ backgroundColor: '#007bff' }}
                >
                    + Add Field
                </button>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'left' }}>
                {fields.map((field) => (
                    <div
                        key={field.id}
                        style={{
                            padding: '16px',
                            margin: '0 0 10px 0',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >

                        <div style={{ flexGrow: 1 }}>
                            <input
                                type="text"
                                placeholder="Input Label (e.g., 'Age')"
                                value={field.label}
                                onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                style={{ width: '100%', marginBottom: '5px' }}
                            />
                            <select
                                value={field.field_type}
                                onChange={(e) => updateField(field.id, 'field_type', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            >
                                <option value="Text">Text</option>
                                <option value="Number">Number</option>
                                <option value="Date">Date</option>
                                <option value="Password">Password</option>
                                <option value="Email">Email</option>
                            </select>
                        </div>

                        <button
                            onClick={() => removeField(field.id, field.isNew)}
                            style={{ backgroundColor: '#dc3545', padding: '8px 12px', width: 'auto' }}
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={saveForm}
                disabled={isSubmitting}
                style={{ backgroundColor: '#28a745', marginTop: '20px' }}
            >
                {isSubmitting ? 'Updating...' : 'Update Complete Form'}
            </button>
        </div>
    );
}
