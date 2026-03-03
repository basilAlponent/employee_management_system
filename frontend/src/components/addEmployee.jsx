import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/config';

export default function AddEmployee() {
    const { id } = useParams(); // Target form ID
    const navigate = useNavigate();

    const [formConfig, setFormConfig] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFormStructure = async () => {
            try {
                const response = await api.get(`forms/${id}/`);
                setFormConfig(response.data);

                // Initialize empty state for all form fields
                const initialData = {};
                response.data.fields.forEach(field => {
                    initialData[field.label] = '';
                });
                setFormData(initialData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch the requested dynamic form.');
                setLoading(false);
            }
        };
        fetchFormStructure();
    }, [id]);

    const handleInputChange = (label, value) => {
        setFormData({
            ...formData,
            [label]: value
        });
        // Clear errors for this field specifically if it exists
        if (fieldErrors[label]) {
            setFieldErrors({
                ...fieldErrors,
                [label]: null
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setSuccess('');
        setIsSubmitting(true);

        const payload = {
            form: id,
            data: formData
        };

        try {
            await api.post('employees/', payload);
            setSuccess('Employee carefully created successfully!');
            // Reset form UI to empty strings
            const resetData = {};
            Object.keys(formData).forEach(key => resetData[key] = '');
            setFormData(resetData);

            // Redirect after 1.5 seconds so user reads success message
            setTimeout(() => {
                navigate('/employee-list');
            }, 1500);

        } catch (error) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.data) {
                // Set precise field errors sent by Django serializer validation
                setFieldErrors(error.response.data.data);
            } else if (error.response && error.response.data.detail) {
                setError(error.response.data.detail);
            } else {
                setError('Failed to save employee data. Unknown error.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading dynamic form...</div>;
    if (!formConfig) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;

    return (
        <div className="registercontainer" style={{ maxWidth: '600px', marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                <h2 style={{ margin: 0, fontSize: '24px' }}>Add Employee ({formConfig.form_name})</h2>
                <button onClick={() => navigate('/')} style={{ background: '#f8f9fa', color: '#333', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', width: 'auto', fontSize: '14px', marginTop: 0 }}>
                    &larr; Back to Forms
                </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '15px' }}>{success}</div>}

            <form onSubmit={handleSubmit}>
                {formConfig.fields && formConfig.fields.map((field) => (
                    <div key={field.id} style={{ marginBottom: '15px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            {field.label}: {field.field_type === 'Number' ? '(Number)' : ''}
                        </label>
                        <input
                            type={
                                field.field_type === 'Number' ? 'number' :
                                    field.field_type === 'Password' ? 'password' :
                                        field.field_type === 'Email' ? 'email' :
                                            field.field_type === 'Date' ? 'date' : 'text'
                            }
                            value={formData[field.label] || ''}
                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                            style={{
                                padding: '10px',
                                width: '100%',
                                border: fieldErrors[field.label] ? '1px solid red' : '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                            required
                        />
                        {fieldErrors[field.label] && (
                            <span style={{ color: 'red', fontSize: '13px', marginTop: '5px', display: 'inline-block' }}>
                                {fieldErrors[field.label]}
                            </span>
                        )}
                    </div>
                ))}

                {formConfig.fields.length === 0 && (
                    <p style={{ color: 'gray' }}>This form has no fields configured to fill out yet.</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || formConfig.fields.length === 0}
                    style={{
                        backgroundColor: '#007bff',
                        width: '100%',
                        marginTop: '10px',
                        padding: '12px',
                        fontSize: '16px'
                    }}
                >
                    {isSubmitting ? 'Saving...' : 'Save Employee Details'}
                </button>
            </form>
        </div>
    );
}
