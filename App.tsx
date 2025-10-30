import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import IncidentTimeline from './components/IncidentTimeline';
import ChatInterface from './components/ChatInterface';
import PatternAnalysis from './components/PatternAnalysis';
import DeepAnalysis from './components/BehavioralInsights';
import LegalAssistant from './components/LegalAssistant';
import UserProfile from './components/UserProfile';
import DocumentLibrary from './components/DocumentLibrary';
import CalendarView from './components/CalendarView';
import EvidencePackageBuilder from './components/EvidencePackageBuilder';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import AgentChat from './components/AgentChat';
import Messaging from './components/Messaging';
import { Report, UserProfile as UserProfileType, StoredDocument, View, IncidentTemplate, CoParentMessage } from './types';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    
    const [reports, setReports] = useState<Report[]>(() => {
        try {
            const savedReports = localStorage.getItem('reports');
            return savedReports ? JSON.parse(savedReports) : [];
        } catch (error) {
            console.error("Failed to load reports from localStorage", error);
            return [];
        }
    });
    
    const [documents, setDocuments] = useState<StoredDocument[]>(() => {
        try {
            const savedDocuments = localStorage.getItem('documents');
            return savedDocuments ? JSON.parse(savedDocuments) : [];
        } catch (error) {
            console.error("Failed to load documents from localStorage", error);
            return [];
        }
    });

    const [userProfile, setUserProfile] = useState<UserProfileType | null>(() => {
        try {
            const savedProfile = localStorage.getItem('userProfile');
            return savedProfile ? JSON.parse(savedProfile) : null;
        } catch (error) {
            console.error("Failed to load user profile from localStorage", error);
            return null;
        }
    });

    const [incidentTemplates, setIncidentTemplates] = useState<IncidentTemplate[]>(() => {
        try {
            const saved = localStorage.getItem('incidentTemplates');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to load incident templates from localStorage", error);
            return [];
        }
    });

    const [messages, setMessages] = useState<CoParentMessage[]>(() => {
        try {
            const savedMessages = localStorage.getItem('coParentingMessages');
            return savedMessages ? JSON.parse(savedMessages) : [];
        } catch (error) {
            console.error("Failed to load messages from localStorage", error);
            return [];
        }
    });
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAgentOpen, setIsAgentOpen] = useState(false);
    const [activeReportContext, setActiveReportContext] = useState<Report | null>(null);
    const [activeInsightContext, setActiveInsightContext] = useState<Report | null>(null);
    const [initialLegalQuery, setInitialLegalQuery] = useState<string | null>(null);
    const [activeAnalysisContext, setActiveAnalysisContext] = useState<string | null>(null);
    const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());
    const [isEvidenceBuilderOpen, setIsEvidenceBuilderOpen] = useState(false);
    const [newReportDate, setNewReportDate] = useState<Date | null>(null);
    const [isConfigError, setIsConfigError] = useState(false);

    useEffect(() => {
        if (!process.env.API_KEY) {
            console.error("Configuration Error: API_KEY is not defined in the environment. AI features will be disabled.");
            setIsConfigError(true);
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('reports', JSON.stringify(reports));
        } catch (error) {
            console.error("Failed to save reports to localStorage", error);
        }
    }, [reports]);

    useEffect(() => {
        try {
            localStorage.setItem('incidentTemplates', JSON.stringify(incidentTemplates));
        } catch (error) {
            console.error("Failed to save incident templates to localStorage", error);
        }
    }, [incidentTemplates]);

    useEffect(() => {
        try {
            localStorage.setItem('coParentingMessages', JSON.stringify(messages));
        } catch (error) {
            console.error("Failed to save messages to localStorage", error);
        }
    }, [messages]);

    const handleProfileSave = (profile: UserProfileType) => {
        try {
            localStorage.setItem('userProfile', JSON.stringify(profile));
            setUserProfile(profile);
            setView('dashboard');
        } catch (error) {
            console.error("Failed to save user profile to localStorage", error);
        }
    };

    const handleReportGenerated = (newReport: Report) => {
        setReports(prev => [...prev, newReport]);
        setNewReportDate(null); // Clear date after generation
    };
    
    const handleAddDocument = useCallback((newDocument: StoredDocument) => {
        setDocuments(prevDocuments => {
            const updatedDocuments = [...prevDocuments, newDocument];
            try {
                localStorage.setItem('documents', JSON.stringify(updatedDocuments));
            } catch (error) {
                console.error("Failed to save documents to localStorage", error);
            }
            return updatedDocuments;
        });
    }, []);

    const handleDeleteDocument = useCallback((documentId: string) => {
        setDocuments(prevDocuments => {
            const updatedDocuments = prevDocuments.filter(doc => doc.id !== documentId);
            try {
                localStorage.setItem('documents', JSON.stringify(updatedDocuments));
            } catch (error) {
                console.error("Failed to save documents to localStorage", error);
            }
            return updatedDocuments;
        });
    }, []);
    
    const handleAddTemplate = useCallback((newTemplate: IncidentTemplate) => {
        setIncidentTemplates(prev => [...prev, newTemplate]);
    }, []);

    const handleDeleteTemplate = useCallback((templateId: string) => {
        setIncidentTemplates(prev => prev.filter(t => t.id !== templateId));
    }, []);

    const handleSendMessage = (text: string) => {
        const userMessage: CoParentMessage = {
            id: `msg_${Date.now()}`,
            text,
            senderId: 'user',
            timestamp: new Date().toISOString(),
        };
        
        // In a real app with Firebase, this would be a call to Firestore to add the message to a 'messages' collection.
        // The other user's app would listen for changes to this collection to receive the message in real-time.
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
    
        // Simulate a response from the other parent for demonstration purposes.
        setTimeout(() => {
            const otherParentResponse: CoParentMessage = {
                id: `msg_${Date.now() + 1}`,
                text: `Received: "${text}". I will review this shortly.`,
                senderId: 'other_parent',
                timestamp: new Date().toISOString(),
            };
            // In a real app, this part would be replaced by a listener to the messages collection in Firestore,
            // which would add new messages from the other parent to the state.
            setMessages(prev => [...prev, otherParentResponse]);
        }, 1500 + Math.random() * 1000); // Add a realistic delay
    };

    const handleViewChange = useCallback((newView: View) => {
        if (newView !== 'new_report') setNewReportDate(null);
        setView(newView);
        setIsSidebarOpen(false);
    }, []);


    const handleDiscussIncident = (reportId: string) => {
        const reportToDiscuss = reports.find(r => r.id === reportId);
        if (reportToDiscuss) {
            setActiveReportContext(reportToDiscuss);
            setActiveAnalysisContext(null); // Clear analysis context
            handleViewChange('assistant');
        }
    };

    const handleAnalyzeIncident = (reportId: string) => {
        const reportToAnalyze = reports.find(r => r.id === reportId);
        if (reportToAnalyze) {
            setActiveInsightContext(reportToAnalyze);
            handleViewChange('insights');
        }
    };
    
    const handleGenerateDraftFromInsight = (analysisText: string, motionType: string) => {
        const query = `Based on the provided deep analysis, please draft a "${motionType}".`;
        setActiveAnalysisContext(analysisText);
        setActiveReportContext(null); // Clear report context
        setInitialLegalQuery(query);
        setView('assistant');
        setActiveInsightContext(null); // clear insight context
    };

    const handleBackToTimeline = () => {
        setView('timeline');
        setActiveInsightContext(null);
    };

    const handleToggleReportSelection = (reportId: string) => {
        setSelectedReportIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reportId)) {
                newSet.delete(reportId);
            } else {
                newSet.add(reportId);
            }
            return newSet;
        });
    };

    const handleCalendarDayClick = (date: Date) => {
        setNewReportDate(date);
        setView('new_report');
    };

    const handleClearSelection = () => {
        setSelectedReportIds(new Set());
    };

    const handleGetStarted = () => {
        setView('profile');
    };

    const handleAgentClick = () => {
        setIsAgentOpen(true);
    };

    const handleBuildPackageClick = () => {
        setIsEvidenceBuilderOpen(true);
    };
    
    const renderView = () => {
        const selectionProps = {
            selectedReportIds,
            onToggleReportSelection: handleToggleReportSelection,
        };
        switch (view) {
            case 'dashboard':
                return <Dashboard 
                            userProfile={userProfile}
                            reports={reports}
                            onViewChange={handleViewChange}
                            onAnalyzeIncident={handleAnalyzeIncident}
                        />;
            case 'new_report':
                return <ChatInterface 
                            onReportGenerated={handleReportGenerated} 
                            userProfile={userProfile}
                            initialDate={newReportDate} 
                            templates={incidentTemplates}
                            onAddTemplate={handleAddTemplate}
                            onDeleteTemplate={handleDeleteTemplate}
                            onNavToTimeline={() => handleViewChange('timeline')}
                        />;
            case 'messaging':
                return <Messaging 
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            userProfile={userProfile}
                        />;
            case 'patterns':
                return <PatternAnalysis reports={reports} />;
            case 'insights':
                return <DeepAnalysis 
                            reports={reports} 
                            userProfile={userProfile}
                            activeInsightContext={activeInsightContext}
                            onBackToTimeline={handleBackToTimeline}
                            onGenerateDraft={handleGenerateDraftFromInsight}
                            onAddDocument={handleAddDocument}
                        />;
            case 'documents':
                return <DocumentLibrary 
                            documents={documents}
                            onAddDocument={handleAddDocument}
                            onDeleteDocument={handleDeleteDocument}
                        />;
            case 'assistant':
                return <LegalAssistant 
                            reports={reports} 
                            documents={documents}
                            userProfile={userProfile}
                            activeReportContext={activeReportContext}
                            clearActiveReportContext={() => setActiveReportContext(null)}
                            initialQuery={initialLegalQuery}
                            clearInitialQuery={() => setInitialLegalQuery(null)}
                            activeAnalysisContext={activeAnalysisContext}
                            clearActiveAnalysisContext={() => setActiveAnalysisContext(null)}
                            onAddDocument={handleAddDocument}
                        />;
            case 'profile':
                return <UserProfile 
                            onSave={handleProfileSave} 
                            onCancel={() => handleViewChange('dashboard')}
                            currentProfile={userProfile}
                        />;
            case 'calendar':
                return <CalendarView 
                            reports={reports}
                            onDiscussIncident={handleDiscussIncident}
                            onAnalyzeIncident={handleAnalyzeIncident}
                            onDayClick={handleCalendarDayClick}
                            {...selectionProps}
                        />;
            case 'timeline':
            default:
                return <IncidentTimeline 
                            reports={reports} 
                            onDiscussIncident={handleDiscussIncident}
                            onAnalyzeIncident={handleAnalyzeIncident}
                            {...selectionProps}
                        />;
        }
    };
    
    if (isConfigError) {
        return (
            <div className="bg-red-50 min-h-screen flex items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200 max-w-md">
                    <h1 className="text-2xl font-bold text-red-800">Configuration Error</h1>
                    <p className="mt-2 text-red-700">The application is not configured correctly, and AI services are unavailable.</p>
                    <p className="mt-4 text-sm text-gray-600">Please contact the administrator to ensure the API key is correctly set up in the deployment environment.</p>
                </div>
            </div>
        );
    }

    const isUserOnboarded = !!userProfile;
    const isInitialSetup = !isUserOnboarded && view === 'profile';

    if (!isUserOnboarded && view !== 'profile') {
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
    
    if (isInitialSetup) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
                 <UserProfile 
                    onSave={handleProfileSave} 
                    onCancel={() => setView('dashboard')} // Takes them back to landing page
                    currentProfile={null}
                    isInitialSetup={true}
                />
            </div>
        );
    }

    const isChatView = view === 'new_report' || view === 'assistant' || view === 'messaging';

    return (
        <div className="h-screen bg-gray-100 flex flex-col">
            <Header 
                onMenuClick={() => setIsSidebarOpen(prev => !prev)} 
                onProfileClick={() => handleViewChange('profile')}
                onAgentClick={handleAgentClick}
            />
            <div className="flex flex-1 pt-16 overflow-hidden">
                 {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden="true"
                    ></div>
                )}
                <Sidebar 
                    activeView={view} 
                    onViewChange={handleViewChange} 
                    reportCount={reports.length}
                    isOpen={isSidebarOpen}
                />
                <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${isChatView ? 'flex flex-col' : 'overflow-y-auto'}`}>
                    <div className={`mx-auto max-w-7xl w-full ${isChatView ? 'flex-1 min-h-0' : ''}`}>
                        {renderView()}
                    </div>
                </main>
            </div>
             {selectedReportIds.size > 0 && (view === 'timeline' || view === 'calendar') && (
                <div className="fixed bottom-6 right-6 z-30 flex items-center gap-3 no-print">
                    <button
                        onClick={handleClearSelection}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Clear Selection ({selectedReportIds.size})
                    </button>
                    <button
                        onClick={handleBuildPackageClick}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-950 rounded-full shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-transform"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Build Evidence Package
                    </button>
                </div>
            )}
            <AgentChat
                isOpen={isAgentOpen}
                onClose={() => setIsAgentOpen(false)}
                onNavigate={(newView) => {
                    handleViewChange(newView);
                    setIsAgentOpen(false); // Close agent after navigation
                }}
                userProfile={userProfile}
            />
            <EvidencePackageBuilder
                isOpen={isEvidenceBuilderOpen}
                onClose={() => setIsEvidenceBuilderOpen(false)}
                selectedReports={reports.filter(r => selectedReportIds.has(r.id))}
                allDocuments={documents}
                userProfile={userProfile}
                onPackageCreated={() => {
                    setIsEvidenceBuilderOpen(false);
                    setSelectedReportIds(new Set());
                }}
                onAddDocument={handleAddDocument}
            />
        </div>
    );
};

export default App;
