import React, { useState, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import IncidentTimeline from './IncidentTimeline';
import ChatInterface from './ChatInterface';
import PatternAnalysis from './PatternAnalysis';
import DeepAnalysis from './BehavioralInsights';
import LegalAssistant from './LegalAssistant';
import UserProfile from './UserProfile';
import DocumentLibrary from './DocumentLibrary';
import CalendarView from './CalendarView';
import EvidencePackageBuilder from './EvidencePackageBuilder';
import Dashboard from './Dashboard';
import AgentChat from './AgentChat';
import Messaging from './Messaging';
import UpgradeModal from './UpgradeModal';
import ConsultationModal from './ConsultationModal';
import { useAuth } from './auth/AuthProvider';
import { 
  useReports, 
  useDocuments, 
  useTemplates, 
  useMessages,
  useCreateReport,
  useCreateDocument,
  useDeleteDocument,
  useCreateTemplate,
  useDeleteTemplate,
  useCreateMessage
} from '../lib/react-query/queries';
import { Report, StoredDocument, View, IncidentTemplate, CoParentMessage, SubscriptionTier } from '../types';
import { TOKEN_LIMITS } from '../constants';
import { SparklesIcon } from './icons';

const AppContent: React.FC = () => {
    const { user, profile } = useAuth();
    const [view, setView] = useState<View>('dashboard');
    
    // Use React Query for data fetching
    const { data: reports = [], isLoading: reportsLoading } = useReports();
    const { data: documents = [], isLoading: documentsLoading } = useDocuments();
    const { data: incidentTemplates = [], isLoading: templatesLoading } = useTemplates();
    const { data: messages = [], isLoading: messagesLoading } = useMessages();
    
    // Mutations
    const createReportMutation = useCreateReport();
    const createDocumentMutation = useCreateDocument();
    const deleteDocumentMutation = useDeleteDocument();
    const createTemplateMutation = useCreateTemplate();
    const deleteTemplateMutation = useDeleteTemplate();
    const createMessageMutation = useCreateMessage();
    
    // Local state for UI interactions
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

    // Get subscription info from profile
    const subscriptionTier = profile?.subscription_tier || 'Free';
    const tokenUsage = { used: 0, resetDate: new Date().toISOString() }; // This will be managed by the backend
    
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
        // This will integrate with Stripe later
        setIsUpgradeModalOpen(false);
    };

    const handleTokensUsed = useCallback((count: number) => {
        // This will be handled by the backend API
        console.log(`Used ${count} tokens`);
    }, []);

    const hasSufficientTokens = useCallback(() => {
        return tokenUsage.used < TOKEN_LIMITS[subscriptionTier];
    }, [tokenUsage, subscriptionTier]);

    const handleReportGenerated = (newReport: Report) => {
        createReportMutation.mutate(newReport);
        setNewReportDate(null);
    };
    
    const handleAddDocument = useCallback((newDocument: StoredDocument) => {
        createDocumentMutation.mutate(newDocument);
    }, [createDocumentMutation]);

    const handleDeleteDocument = useCallback((documentId: string) => {
        deleteDocumentMutation.mutate(documentId);
    }, [deleteDocumentMutation]);
    
    const handleAddTemplate = useCallback((newTemplate: IncidentTemplate) => {
        createTemplateMutation.mutate(newTemplate);
    }, [createTemplateMutation]);

    const handleDeleteTemplate = useCallback((templateId: string) => {
        deleteTemplateMutation.mutate(templateId);
    }, [deleteTemplateMutation]);

    const handleSendMessage = (text: string) => {
        const newMessage: CoParentMessage = {
            id: `msg_${Date.now()}`,
            text,
            senderId: 'user',
            timestamp: new Date().toISOString(),
        };
        createMessageMutation.mutate(newMessage);
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

        // Show loading state while data is being fetched
        if (reportsLoading || documentsLoading || templatesLoading || messagesLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            );
        }

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
                            templates={incidentTemplates}
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
                            onSave={() => handleViewChange('dashboard')} 
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

export default AppContent;