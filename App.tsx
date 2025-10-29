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
import Auth from './src/components/Auth';
import { Report, UserProfile as UserProfileType, StoredDocument, View, IncidentTemplate, CoParentMessage } from './types';
import { SparklesIcon } from './components/icons';
import { supabase, getUserSubscriptionId } from './src/lib/supabase';

const App: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>('dashboard');
    
    const [reports, setReports] = useState<Report[]>([]);
    
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
    const [incidentTemplates, setIncidentTemplates] = useState<IncidentTemplate[]>([]);
    const [messages, setMessages] = useState<CoParentMessage[]>([]);
    
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

    // Check auth session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load data from Supabase
    useEffect(() => {
        if (!session?.user) return;

        const loadData = async () => {
            try {
                const subscriptionId = await getUserSubscriptionId();
                if (!subscriptionId) {
                    // No subscription yet - user just signed up, will be created on profile save
                    return;
                }

                // Load user profile
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUserProfile({
                        name: profile.name,
                        role: profile.role as 'Mother' | 'Father' | '',
                        children: profile.children || [],
                    });
                }

                // Load reports
                const { data: reportsData } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('subscription_id', subscriptionId)
                    .order('incident_date', { ascending: false });

                if (reportsData) {
                    setReports(reportsData.map(r => ({
                        id: r.id,
                        content: r.content,
                        category: r.category as any,
                        tags: r.tags,
                        legalContext: r.legal_context || '',
                        images: r.images,
                        createdAt: r.incident_date,
                    })));
                }

                // Load documents
                const { data: docsData } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('subscription_id', subscriptionId);

                if (docsData) {
                    setDocuments(docsData.map(d => ({
                        id: d.id,
                        name: d.name,
                        mimeType: d.mime_type,
                        data: d.data,
                        folder: d.folder as any,
                        createdAt: d.created_at,
                        structuredData: d.structured_data as any,
                    })));
                }

                // Load templates
                const { data: templatesData } = await supabase
                    .from('incident_templates')
                    .select('*')
                    .eq('subscription_id', subscriptionId);

                if (templatesData) {
                    setIncidentTemplates(templatesData.map(t => ({
                        id: t.id,
                        title: t.title,
                        content: t.content,
                        category: t.category as any,
                        tags: t.tags,
                        legalContext: t.legal_context || '',
                    })));
                }

                // Load messages
                const { data: messagesData } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('subscription_id', subscriptionId)
                    .order('created_at', { ascending: true });

                if (messagesData) {
                    setMessages(messagesData.map(m => ({
                        id: m.id,
                        text: m.text,
                        senderId: m.sender_id === session.user.id ? 'user' : 'other_parent',
                        timestamp: m.created_at,
                    })));
                }

                // Subscribe to real-time updates
                const channel = supabase
                    .channel('db-changes')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'messages',
                            filter: `subscription_id=eq.${subscriptionId}`,
                        },
                        (payload) => {
                            if (payload.eventType === 'INSERT') {
                                const newMessage = payload.new as any;
                                setMessages(prev => [...prev, {
                                    id: newMessage.id,
                                    text: newMessage.text,
                                    senderId: newMessage.sender_id === session.user.id ? 'user' : 'other_parent',
                                    timestamp: newMessage.created_at,
                                }]);
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    channel.unsubscribe();
                };
            } catch (error: any) {
                console.error('Error loading data:', error);
                // If tables don't exist yet, that's okay - migrations need to be run
                if (error?.message?.includes('does not exist') || error?.code === '42P01') {
                    console.warn('Database tables not found. Please run migrations first.');
                }
            }
        };

        loadData();
    }, [session]);

    const handleProfileSave = async (profile: UserProfileType) => {
        try {
            if (!session?.user) return;
            
            await supabase
                .from('user_profiles')
                .update({
                    name: profile.name,
                    role: profile.role,
                    children: profile.children,
                })
                .eq('id', session.user.id);
            
            setUserProfile(profile);
            setView('dashboard');
        } catch (error) {
            console.error("Failed to save user profile", error);
        }
    };

    const handleReportGenerated = async (newReport: Report) => {
        try {
            if (!session?.user) return;
            
            const subscriptionId = await getUserSubscriptionId();
            if (!subscriptionId) return;

            const { data, error } = await supabase
                .from('reports')
                .insert({
                    subscription_id: subscriptionId,
                    created_by: session.user.id,
                    content: newReport.content,
                    category: newReport.category,
                    tags: newReport.tags,
                    legal_context: newReport.legalContext,
                    images: newReport.images,
                    incident_date: newReport.createdAt,
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setReports(prev => [...prev, {
                    ...newReport,
                    id: data.id,
                }]);
            }
            setNewReportDate(null);
        } catch (error) {
            console.error("Failed to save report", error);
        }
    };
    
    const handleAddDocument = useCallback(async (newDocument: StoredDocument) => {
        try {
            if (!session?.user) return;
            
            const subscriptionId = await getUserSubscriptionId();
            if (!subscriptionId) return;

            const { data, error } = await supabase
                .from('documents')
                .insert({
                    subscription_id: subscriptionId,
                    created_by: session.user.id,
                    name: newDocument.name,
                    mime_type: newDocument.mimeType,
                    data: newDocument.data,
                    folder: newDocument.folder,
                    structured_data: newDocument.structuredData as any,
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setDocuments(prev => [...prev, {
                    ...newDocument,
                    id: data.id,
                }]);
            }
        } catch (error) {
            console.error("Failed to save document", error);
        }
    }, [session]);

    const handleDeleteDocument = useCallback(async (documentId: string) => {
        try {
            await supabase
                .from('documents')
                .delete()
                .eq('id', documentId);
            
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        } catch (error) {
            console.error("Failed to delete document", error);
        }
    }, []);
    
    const handleAddTemplate = useCallback(async (newTemplate: IncidentTemplate) => {
        try {
            if (!session?.user) return;
            
            const subscriptionId = await getUserSubscriptionId();
            if (!subscriptionId) return;

            const { data, error } = await supabase
                .from('incident_templates')
                .insert({
                    subscription_id: subscriptionId,
                    created_by: session.user.id,
                    title: newTemplate.title,
                    content: newTemplate.content,
                    category: newTemplate.category,
                    tags: newTemplate.tags,
                    legal_context: newTemplate.legalContext,
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setIncidentTemplates(prev => [...prev, {
                    ...newTemplate,
                    id: data.id,
                }]);
            }
        } catch (error) {
            console.error("Failed to save template", error);
        }
    }, [session]);

    const handleDeleteTemplate = useCallback(async (templateId: string) => {
        try {
            await supabase
                .from('incident_templates')
                .delete()
                .eq('id', templateId);
            
            setIncidentTemplates(prev => prev.filter(t => t.id !== templateId));
        } catch (error) {
            console.error("Failed to delete template", error);
        }
    }, []);

    const handleSendMessage = async (text: string) => {
        try {
            if (!session?.user) return;
            
            const subscriptionId = await getUserSubscriptionId();
            if (!subscriptionId) return;

            await supabase
                .from('messages')
                .insert({
                    subscription_id: subscriptionId,
                    sender_id: session.user.id,
                    text,
                });
        } catch (error) {
            console.error("Failed to send message", error);
        }
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
    
    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show auth if not logged in
    if (!session) {
        return <Auth onAuthSuccess={() => setLoading(true)} />;
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
