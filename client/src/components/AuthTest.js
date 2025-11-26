import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AuthTest = () => {
    const { user, loading, checkAuth } = useAuth();
    const [testResults, setTestResults] = useState([]);
    const [testing, setTesting] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const runAuthTests = async () => {
        setTesting(true);
        setTestResults([]);
        
        const results = [];
        
        // Test 1: Check current auth status
        results.push({
            test: 'Current User Status',
            status: user ? 'Logged In' : 'Not Logged In',
            details: user ? `User: ${user.name} (${user.email})` : 'No user data',
            success: true
        });

        // Test 2: Test protected endpoint without auth
        try {
            const response = await axios.get(`${API_URL}/events`, { withCredentials: true });
            results.push({
                test: 'Public Events Endpoint',
                status: 'Success',
                details: `${response.data.length} events loaded`,
                success: true
            });
        } catch (error) {
            results.push({
                test: 'Public Events Endpoint',
                status: 'Failed',
                details: error.message,
                success: false
            });
        }

        // Test 3: Test registration check endpoint
        if (user) {
            try {
                const response = await axios.get(`${API_URL}/registrations/check/test`, { 
                    withCredentials: true 
                });
                results.push({
                    test: 'Registration Check (Auth)',
                    status: 'Success',
                    details: 'Registration endpoint accessible',
                    success: true
                });
            } catch (error) {
                results.push({
                    test: 'Registration Check (Auth)',
                    status: error.response?.status === 404 ? 'Endpoint Not Found' : 'Failed',
                    details: error.response?.data?.error || error.message,
                    success: error.response?.status === 404 // 404 is OK for this test
                });
            }
        }

        // Test 4: Test admin endpoint
        if (user && user.role === 'admin') {
            try {
                const response = await axios.get(`${API_URL}/events/mine`, { 
                    withCredentials: true 
                });
                results.push({
                    test: 'Admin Events Endpoint',
                    status: 'Success',
                    details: `${response.data.length} admin events`,
                    success: true
                });
            } catch (error) {
                results.push({
                    test: 'Admin Events Endpoint',
                    status: 'Failed',
                    details: error.response?.data?.error || error.message,
                    success: false
                });
            }
        }

        // Test 5: Check session status
        try {
            const response = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
            results.push({
                test: 'Session Check',
                status: 'Success',
                details: response.data.user ? `Session active for ${response.data.user.name}` : 'No active session',
                success: true
            });
        } catch (error) {
            results.push({
                test: 'Session Check',
                status: error.response?.status === 401 ? 'Not Authenticated' : 'Failed',
                details: error.response?.data?.error || error.message,
                success: error.response?.status === 401 // 401 is expected if not logged in
            });
        }

        setTestResults(results);
        setTesting(false);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px 0' }}>
            <h3>🔍 Authentication Test Panel</h3>
            <div style={{ marginBottom: '15px' }}>
                <strong>Current Status:</strong> {loading ? 'Loading...' : user ? `Logged in as ${user.name}` : 'Not logged in'}
            </div>
            
            <button 
                onClick={runAuthTests} 
                disabled={testing}
                style={{
                    padding: '10px 20px',
                    backgroundColor: testing ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: testing ? 'not-allowed' : 'pointer'
                }}
            >
                {testing ? 'Running Tests...' : 'Run Authentication Tests'}
            </button>

            {testResults.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Test Results:</h4>
                    {testResults.map((result, index) => (
                        <div key={index} style={{ 
                            padding: '10px', 
                            margin: '5px 0', 
                            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                            borderRadius: '4px'
                        }}>
                            <strong>{result.test}:</strong> {result.status}
                            <br />
                            <small>{result.details}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuthTest;