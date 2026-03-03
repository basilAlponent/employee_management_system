import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

export default function CreateForm() {
    const navigate = useNavigate();
    const [formName, setFormName] = useState('');
    const [fields, setFields] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Add a new field dynamically
    const addField = () => {
        setFields([
            ...fields,
            { id: `field-${Date.now()}`, label: '', field_type: 'Text' },
        ]);
        setError('');
    };

    // 2. Update an existing field's values (label or type)
    const updateField = (id, key, value) => {
        const updatedFields = fields.map((field) => {
            if (field.id === id) {
                return { ...field, [key]: value };
            }
            return field;
        });
        setFields(updatedFields);
    };

    // 3. Remove a field dynamically
    const removeField = (id) => {
        setFields(fields.filter((field) => field.id !== id));
    };

    // 5. Submit Form and its Fields to Django Backend
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
                return setError('All added fields must have a label');
            }
        }

        setIsSubmitting(true);
        try {
            // Step 1: Create the main form first to get its Django ID
            const formPayload = {
                form_name: formName
            };
            const formResponse = await api.post('forms/', formPayload);
            const newFormId = formResponse.data.id;

            // Step 2: Loop through and attach each dynamic field safely to the new Form
            for (const field of fields) {
                await api.post(`forms/${newFormId}/add-field/`, {
                    label: field.label,
                    field_type: field.field_type
                });
            }

            setSuccess('Form successfully built and saved!');
            setFormName('');
            setFields([]);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.detail || 'Failed to save form. Check your server connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="registercontainer" style={{ maxWidth: '600px', marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <h2 style={{ margin: 0, fontSize: '24px' }}>Design a New Form</h2>
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
                {fields.map((field, index) => (
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
                            onClick={() => removeField(field.id)}
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
                {isSubmitting ? 'Saving...' : 'Save Complete Form'}
            </button>
        </div>
    );
}
