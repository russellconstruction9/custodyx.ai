import React, { useState, useCallback, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, withAuth } from './components/auth/AuthProvider';
import { QueryProvider } from './lib/react-query/QueryProvider';
import { useAppStore } from './lib/store/appStore';

// Import existing components
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
import UpgradeModal from './components/UpgradeModal';
import ConsultationModal from './components/ConsultationModal';

import { Report, View, SubscriptionTier } from './types';
import { SparklesIcon } from './components/icons';

// Main App Component (Protected)
const AppContent: React.FC = () => {
    const { profile, updateProfile } = useAuth();
    
    // Zustand store
    const {
        reports,
        documents,
        templates,
        messages,
        tokenUsage,
        subscriptionTier,
        isLoading,
        loadAllData,
        addReport,
        deleteReport,
        addDocument,
        deleteDocument,
        addTemplate,
        deleteTemplate,
        addMessage,
        incrementTokenUsage,
        updateSubscriptionTier,
        hasSufficientTokens
    } = useAppStore();

    // Local state for UI
    const [view, setView] = useState<View>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAgentOpen, setIsAgentOpen] = useState(false);
    const [activeReportContext, setActiveReportContext] = useState<Report | null>(null);
    const [activeInsightContext, setActiveInsightContext] = useState<Report | null>(null);
    const [initialLegalQuery, setInitialLegalQuery] = useState<string | null>(null);
    const [activeAnalysisContext, setActiveAnalysisContext] = useState<string | null>(null);
    const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());
    const [isEvidenceBuilderOpen, setIsEvidenceBuilderOpen] = useState(false);
    const [newReportDate, setNewReportDate] = useState<Date | null>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [upgradeFeatureContext, setUpgradeFeatureContext] = useState<string | undefined>(undefined);
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

    // Load all data when component mounts
    useEffect(() => {
        if (profile) {
            loadAllData();
        }
    }, [profile, loadAllData]);

    const promptUpgrade = useCallback((featureName: string) => {
        setUpgradeFeatureContext(featureName);
        setIsUpgradeModalOpen(true);
    }, []);

    const handleUpgradeClick = () => {
        setUpgradeFeatureContext('your subscription');
        setIsUpgradeModalOpen(true);
    };
    
    const handlePromptConsultation = useCallback(() => {
        setIsConsultationModalOpen(true);
    }, []);

    const handleSwitchPlan = (tier: SubscriptionTier) => {
        updateSubscriptionTier(tier);
        setIsUpgradeModalOpen(false);
    };

    const handleTokensUsed = useCallback((count: number) => {
        incrementTokenUsage(count);
    }, [incrementTokenUsage]);

    const handleReportGenerated = (newReport: Report) => {
        addReport(newReport);
        setNewReportDate(null);
    };
    
    const handleAddDocument = useCallback((newDocument: any) => {
        addDocument(newDocument);
    }, [addDocument]);

    const handleDeleteDocument = useCallback((documentId: string) => {
        deleteDocument(documentId);
    }, [deleteDocument]);
    
    const handleAddTemplate = useCallback((newTemplate: any) => {
        addTemplate(newTemplate);
    }, [addTemplate]);

    const handleDeleteTemplate = useCallback((templateId: string) => {
        deleteTemplate(templateId);
    }, [deleteTemplate]);

    const handleSendMessage = (text: string) => {
        const userMessage = {
            text,
            senderId: 'user' as const,
            timestamp: new Date().toISOString(),
        };
        addMessage(userMessage);
        
        // Simulate other parent response (this would be real in production)
        setTimeout(() => {
            const otherParentResponse = {
                text: `Received: "${text}". I will review this shortly.`,
                senderId: 'other_parent' as const,
                timestamp: new Date().toISOString(),
            };
            addMessage(otherParentResponse);
        }, 1500 + Math.random() * 1000);
    };

    const handleViewChange = useCallback((newView: View) => {
        const tierRequired: Partial<Record<View, SubscriptionTier>> = {
            'patterns': 'Plus',
            'documents': 'Plus',
            'assistant': 'Plus',
            'insights': 'Pro',
        };

        const requiredTier = tierRequired[newView];
        if (requiredTier) {
            const tierLevels: Record<SubscriptionTier, number> = { 'Free': 0, 'Plus': 1, 'Pro': 2 };
            if (tierLevels[subscriptionTier] < tierLevels[requiredTier]) {
                const featureNameMap: Partial<Record<View, string>> = {
                    'patterns': 'Pattern Analysis',
                    'documents': 'Document Library',
                    'assistant': 'Legal Assistant',
                    'insights': 'Deep Analysis',
                };
                promptUpgrade(featureNameMap[newView] || 'this feature');
                return;
            }
        }

        if (newView !== 'new_report') setNewReportDate(null);
        setView(newView);
        setIsSidebarOpen(false);
    }, [subscriptionTier, promptUpgrade]);

    const handleDiscussIncident = (reportId: string) => {
        if (subscriptionTier === 'Free') {
            promptUpgrade('Legal Assistant');
            return;
        }
        const reportToDiscuss = reports.find(r => r.id === reportId);
        if (reportToDiscuss) {
            setActiveReportContext(reportToDiscuss);
            setActiveAnalysisContext(null);
            handleViewChange('assistant');
        }
    };

    const handleAnalyzeIncident = (reportId: string) => {
        if (subscriptionTier !== 'Pro') {
            promptUpgrade('Deep Analysis');
            return;
        }
        const reportToAnalyze = reports.find(r => r.id === reportId);
        if (reportToAnalyze) {
            setActiveInsightContext(reportToAnalyze);
            handleViewChange('insights');
        }
    };
    
    const handleGenerateDraftFromInsight = (analysisText: string, motionType: string) => {
        const query = `Based on the provided deep analysis, please draft a "${motionType}".`;
        setActiveAnalysisContext(analysisText);
        setActiveReportContext(null);
        setInitialLegalQuery(query);
        setView('assistant');
        setActiveInsightContext(null);
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

    const handleAgentClick = () => {
        if (subscriptionTier !== 'Pro') {
            promptUpgrade('AI Voice Agent');
            return;
        }
        setIsAgentOpen(true);
    };

    const handleBuildPackageClick = () => {
        setIsEvidenceBuilderOpen(true);
    };

    const handleProfileSave = async (newProfile: any) => {
        await updateProfile(newProfile);
        setView('dashboard');
    };

    const renderView = () => {
        const selectionProps = {
            selectedReportIds,
            onToggleReportSelection: handleToggleReportSelection,
        };
        const commonAiProps = {
            subscriptionTier,
            hasSufficientTokens,
            handleTokensUsed,
            promptUpgrade,
        };
        
        switch (view) {
            case 'dashboard':
                return <Dashboard 
                            userProfile={profile}
                            reports={reports}
                            onViewChange={handleViewChange}
                            onAnalyzeIncident={handleAnalyzeIncident}
                        />;
            case 'new_report':
                return <ChatInterface 
                            onReportGenerated={handleReportGenerated} 
                            userProfile={profile}
                            initialDate={newReportDate} 
                            templates={templates}
                            onAddTemplate={handleAddTemplate}
                            onDeleteTemplate={handleDeleteTemplate}
                            onNavToTimeline={() => handleViewChange('timeline')}
                            {...commonAiProps}
                        />;
            case 'messaging':
                return <Messaging 
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            userProfile={profile}
                        />;
            case 'patterns':
                return <PatternAnalysis reports={reports} {...commonAiProps} />;
            case 'insights':
                return <DeepAnalysis 
                            reports={reports} 
                            userProfile={profile}
                            activeInsightContext={activeInsightContext}
                            onBackToTimeline={handleBackToTimeline}
                            onGenerateDraft={handleGenerateDraftFromInsight}
                            onAddDocument={handleAddDocument}
                            {...commonAiProps}
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
                            userProfile={profile}
                            activeReportContext={activeReportContext}
                            clearActiveReportContext={() => setActiveReportContext(null)}
                            initialQuery={initialLegalQuery}
                            clearInitialQuery={() => setInitialLegalQuery(null)}
                            activeAnalysisContext={activeAnalysisContext}
                            clearActiveAnalysisContext={() => setActiveAnalysisContext(null)}
                            onAddDocument={handleAddDocument}
                            onPromptConsultation={handlePromptConsultation}
                            {...commonAiProps}
                        />;
            case 'profile':
                return <UserProfile 
                            onSave={handleProfileSave} 
                            onCancel={() => handleViewChange('dashboard')}
                            currentProfile={profile}
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

    // Show loading state while data is loading
    if (isLoading.reports || isLoading.documents || isLoading.templates) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your data...</p>
                </div>
            </div>
        );
    }

    // Check if user needs to complete profile setup
    if (!profile || !profile.name) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
                <UserProfile 
                    onSave={handleProfileSave} 
                    onCancel={() => setView('dashboard')}
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
                    subscriptionTier={subscriptionTier}
                    tokenUsage={tokenUsage}
                    onUpgradeClick={handleUpgradeClick}
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
                    setIsAgentOpen(false);
                }}
                userProfile={profile}
                {...{subscriptionTier, hasSufficientTokens, handleTokensUsed, promptUpgrade}}
            />
            <EvidencePackageBuilder
                isOpen={isEvidenceBuilderOpen}
                onClose={() => setIsEvidenceBuilderOpen(false)}
                selectedReports={reports.filter(r => selectedReportIds.has(r.id))}
                allDocuments={documents}
                userProfile={profile}
                onPackageCreated={() => {
                    setIsEvidenceBuilderOpen(false);
                    setSelectedReportIds(new Set());
                }}
                onAddDocument={handleAddDocument}
                {...{subscriptionTier, hasSufficientTokens, handleTokensUsed, promptUpgrade}}
            />
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onSwitchPlan={handleSwitchPlan}
                currentTier={subscriptionTier}
                featureName={upgradeFeatureContext}
            />
            <ConsultationModal 
                isOpen={isConsultationModalOpen}
                onClose={() => setIsConsultationModalOpen(false)}
            />
        </div>
    );
};

// Wrap the main app with authentication
const ProtectedApp = withAuth(AppContent);

// Root App Component with Providers
const App: React.FC = () => {
    return (
        <QueryProvider>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
                <ProtectedApp />
            </AuthProvider>
        </QueryProvider>
    );
};

export default App;