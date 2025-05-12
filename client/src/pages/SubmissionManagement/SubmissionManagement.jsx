


import React, { useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import SubmissionForm from './SubmissionForm';
import SubmissionList from './SubmissionList';

const SubmissionManagement = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // State to track active tab
    const [activeTab, setActiveTab] = useState(
        location.pathname.includes('submissions') ? 'list' : 'form'
    );

    if (!assignmentId) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-center text-error">
                    Error: No assignment ID provided
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90"
                >
                    Back to Assignments
                </button>
            </div>
        );
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Update URL without reloading the page
        navigate(`/submitManagement/${assignmentId}/${tab === 'form' ? '' : 'submissions'}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary/90"
                >
                    Back to Assignments
                </button>
            </div>
            
            <h2 className="text-2xl font-semibold text-primary mb-6">
                Submission Management for Assignment #{assignmentId}
            </h2>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => handleTabChange('form')}
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                        activeTab === 'form'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Submission Form
                </button>
                <button
                    onClick={() => handleTabChange('list')}
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                        activeTab === 'list'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Submission List
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow p-6">
                {activeTab === 'form' ? (
                    <SubmissionForm assignmentId={assignmentId} />
                ) : (
                    <SubmissionList assignmentId={assignmentId} />
                )}
            </div>
        </div>
    );
};

export default SubmissionManagement;