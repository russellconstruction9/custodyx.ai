import React from 'react';
import { BookOpenIcon, SparklesIcon, DocumentTextIcon, ChartBarIcon, ScaleIcon, CheckIcon, ShieldCheckIcon } from './icons';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <div className="bg-white text-gray-800">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <BookOpenIcon className="h-7 w-7 text-blue-950" />
                            <span className="ml-3 text-xl font-semibold text-gray-900 tracking-tight">CustodyX<span className="text-blue-600 font-medium">.ai</span></span>
                        </div>
                        <button 
                            onClick={onGetStarted}
                            className="px-6 py-2 text-sm font-semibold text-white bg-blue-950 rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                            Get Started
                        </button>
                    </div>
                </nav>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36 bg-gray-50 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                            A calm, factual approach to co-parenting.
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
                            CustodyX.AI helps you create neutral, court-ready documentation of co-parenting incidents, reducing conflict and providing clarity when you need it most.
                        </p>
                        <div className="mt-10">
                            <button 
                                onClick={onGetStarted}
                                className="px-10 py-4 text-lg font-semibold text-white bg-blue-950 rounded-lg shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
                            >
                                Get Started for Free
                            </button>
                            <p className="mt-4 text-sm text-gray-500">Your privacy is paramount. All data is stored locally on your device.</p>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 sm:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-base font-semibold text-blue-700 tracking-wide uppercase">Features</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Built for Clarity and Peace of Mind
                            </p>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                                Powerful tools to help you navigate co-parenting challenges with confidence.
                            </p>
                        </div>
                        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-800 mx-auto">
                                    <SparklesIcon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-gray-900">AI-Guided Documentation</h3>
                                <p className="mt-2 text-base text-gray-600">Our AI assistant guides you through documenting incidents, asking clarifying questions to ensure a complete, factual record.</p>
                            </div>
                             {/* Feature 2 */}
                             <div className="text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-800 mx-auto">
                                    <DocumentTextIcon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-gray-900">Neutral, Court-Ready Reports</h3>
                                <p className="mt-2 text-base text-gray-600">Generate professional, unbiased summaries of events, free of emotional language and speculation, ready for legal review.</p>
                            </div>
                             {/* Feature 3 */}
                             <div className="text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-800 mx-auto">
                                    <ChartBarIcon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-gray-900">Pattern & Behavior Analysis</h3>
                                <p className="mt-2 text-base text-gray-600">Identify recurring themes and behavioral patterns over time, providing valuable insights backed by your own data.</p>
                            </div>
                             {/* Feature 4 */}
                             <div className="text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-800 mx-auto">
                                    <ScaleIcon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-gray-900">AI Legal Assistant</h3>
                                <p className="mt-2 text-base text-gray-600">Ask questions about your documented incidents and get help drafting communications or legal motions based on your records.</p>
                            </div>
                             {/* Feature 5 */}
                             <div className="text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-800 mx-auto">
                                    <CheckIcon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-gray-900">Evidence Package Builder</h3>
                                <p className="mt-2 text-base text-gray-600">Select incidents and documents to compile a single, chronologically-ordered evidence package for your attorney or court filings.</p>
                            </div>
                             {/* Feature 6 */}
                             <div className="text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-800 mx-auto">
                                    <ShieldCheckIcon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-gray-900">Private and Secure</h3>
                                <p className="mt-2 text-base text-gray-600">Your data is yours. All information is stored securely on your local device and is never uploaded to our servers.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* CTA Section */}
                <section className="bg-gray-50">
                    <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            <span className="block">Ready to take control of your co-parenting journey?</span>
                        </h2>
                        <p className="mt-4 text-lg leading-6 text-gray-600">
                            Start documenting incidents today and build a clear, factual record to support your case.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="mt-8 w-full inline-flex items-center justify-center px-8 py-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-950 hover:bg-blue-800 sm:w-auto"
                        >
                            Get started now
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-base text-gray-500">&copy; {new Date().getFullYear()} CustodyX.AI by R² Technologies. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;