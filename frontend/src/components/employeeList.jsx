import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [forms, setForms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployeesAndForms();
    }, []);

    const fetchEmployeesAndForms = async () => {
        try {
            // Parallel fetching of forms (to get form names) and employees
            const [empResponse, formResponse] = await Promise.all([
                api.get('employees/'),
                api.get('forms/')
            ]);

            setEmployees(empResponse.data);
            setForms(formResponse.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch employee list.');
            setLoading(false);
        }
    };

    const deleteEmployee = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employee record?")) {
            return;
        }

        try {
            await api.delete(`employees/${id}/`);
            setEmployees(employees.filter(emp => emp.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete employee.");
        }
    };

    // Helper map to lookup form names fast
    const formIdToNameMap = forms.reduce((acc, form) => {
        acc[form.id] = form.form_name;
        return acc;
    }, {});

    // Flexible Filter Function targeting dynamic keys inside the JSON data block
    const filteredEmployees = employees.filter((emp) => {
        if (!searchQuery) return true;

        // Loop over the nested data JSON map looking for partial matches
        const matchesData = Object.values(emp.data || {}).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        );

        return matchesData;
    });

    if (loading) return <div>Loading employee records...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>All Employee Records</h2>
                <button
                    onClick={() => navigate('/')}
                    style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Back to Form Dashboard
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search any employee detail (Name, Email, Age, etc.)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
            </div>

            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            {filteredEmployees.length === 0 && !error ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <p>No employee records match your search, or none exist yet!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredEmployees.map((emp) => (
                        <div key={emp.id} style={{
                            padding: '12px 16px',
                            backgroundColor: '#fff',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden', paddingRight: '15px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                                    {formIdToNameMap[emp.form] || 'Unknown Form'}
                                    <span style={{ fontWeight: 'normal', color: 'gray', fontSize: '13px', marginLeft: '10px' }}>
                                        ({new Date(emp.created_at).toLocaleString()})
                                    </span>
                                </div>
                                <div style={{ fontSize: '14px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {Object.entries(emp.data || {})
                                        .map(([label, value]) => `${label}: ${value || '—'}`)
                                        .join('  |  ')}
                                </div>
                            </div>

                            <button
                                onClick={() => deleteEmployee(emp.id)}
                                style={{ backgroundColor: '#dc3545', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
