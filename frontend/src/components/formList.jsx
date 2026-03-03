import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

export default function FormList() {
    const [forms, setForms] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const response = await api.get('forms/');
            setForms(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch forms.');
            setLoading(false);
        }
    };

    const deleteForm = async (id) => {
        if (!window.confirm("Are you sure you want to delete this form? All associated employee records will also be deleted.")) {
            return;
        }

        try {
            await api.delete(`forms/${id}/`);
            // Update UI by removing the deleted form from state
            setForms(forms.filter(form => form.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete form.");
        }
    };

    if (loading) return <div>Loading your forms...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>My Forms</h2>
                <button
                    onClick={() => navigate('/create-form')}
                    style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    + Create New Form
                </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            {forms.length === 0 && !error ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <p>You haven't created any forms yet!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {forms.map((form) => (
                        <div key={form.id} style={{
                            padding: '12px 16px',
                            backgroundColor: '#fff',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{form.form_name}</div>
                                <div style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                                    Created By: {form.created_by} | Fields: {form.fields.length}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => navigate(`/edit-form/${form.id}`)}
                                    style={{ backgroundColor: '#ffc107', color: 'black', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Edit Form
                                </button>
                                <button
                                    onClick={() => navigate(`/add-employee/${form.id}`)}
                                    style={{ backgroundColor: '#007bff', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Add Employee Info
                                </button>
                                <button
                                    onClick={() => deleteForm(form.id)}
                                    style={{ backgroundColor: '#dc3545', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

