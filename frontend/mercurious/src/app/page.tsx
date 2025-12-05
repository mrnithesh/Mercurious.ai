'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  FaBrain,
  FaYoutube,
  FaComments,
  FaFileAlt,
  FaChartLine,
  FaLightbulb,
  FaArrowRight,
  FaUsers,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaSignInAlt,
  FaUserPlus,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { 
  MdVideoLibrary,
  MdSecurity,
  MdLibraryBooks
} from 'react-icons/md';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal, RegisterModal, UserMenu } from '@/components/Auth';

export default function Home() {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  const features = [
    {
      icon: MdSecurity,
      title: "Secure Firebase Authentication",
      description: "Safe and reliable user authentication with Firebase",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: FaYoutube,
      title: "YouTube Video Processing",
      description: "Transform any YouTube video into structured learning content",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: FaBrain,
      title: "AI-Powered Content Analysis",
      description: "Advanced AI analysis using Google's Gemini AI technology",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: FaComments,
      title: "Interactive Chat Assistant",
      description: "Get instant answers and clarifications about video content",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: FaFileAlt,
      title: "Smart Note-Taking",
      description: "Automatically generated notes and summaries",
      color: "from-orange-500 to-amber-600"
    },
    {
      icon: FaChartLine,
      title: "Progress Tracking",
      description: "Monitor your learning progress and achievements",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: FaLightbulb,
      title: "Automated Quiz Generation",
      description: "Test your knowledge with AI-generated quizzes",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: MdLibraryBooks,
      title: "Study Guide Creation",
      description: "Comprehensive study guides tailored to video content",
      color: "from-teal-500 to-cyan-600"
    }
  ];

  const stats = [
    { value: "100%", label: "AI-Powered" },
    { value: "24/7", label: "Available" },
    { value: "∞", label: "Learning Potential" },
    { value: "0", label: "Limits" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="Mercurious AI Logo" width={40} height={40} className="w-10 h-10" />
              <span className="text-xl font-bold text-slate-900">
                Mercurious AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link 
                        href="/dashboard"
                        className="px-4 py-2 text-gray-700 hover:text-slate-900 font-medium transition-colors flex items-center gap-2"
                      >
                        Dashboard
                      </Link>
                      
                      <UserMenu />
                      <Link 
                        href="/process"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
                      >
                        Process Video
                        <FaArrowRight className="w-4 h-4" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={openLoginModal}
                        className="px-4 py-2 text-gray-700 hover:text-slate-900 font-medium transition-colors flex items-center gap-2"
                      >
                        <FaSignInAlt className="w-4 h-4" />
                        Login
                      </button>
                      <button 
                        onClick={openRegisterModal}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
                      >
                        <FaUserPlus className="w-4 h-4" />
                        Sign Up
                      </button>
                      <Link 
                        href="/process"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
                      >
                        Get Started
                        <FaArrowRight className="w-4 h-4" />
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <div className="flex flex-col space-y-3">
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <Link 
                          href="/dashboard"
                          className="px-4 py-2 text-gray-700 hover:text-slate-900 font-medium transition-colors flex items-center gap-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          href="/library"
                          className="px-4 py-2 text-gray-700 hover:text-slate-900 font-medium transition-colors flex items-center gap-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Library
                        </Link>
                        <div className="px-4 py-2">
                          <UserMenu />
                        </div>
                        <Link 
                          href="/process"
                          className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm justify-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Process Video
                          <FaArrowRight className="w-4 h-4" />
                        </Link>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            openLoginModal();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:text-slate-900 font-medium transition-colors flex items-center gap-2"
                        >
                          <FaSignInAlt className="w-4 h-4" />
                          Login
                        </button>
                        <button 
                          onClick={() => {
                            openRegisterModal();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm justify-center"
                        >
                          <FaUserPlus className="w-4 h-4" />
                          Sign Up
                        </button>
                        <Link 
                          href="/process"
                          className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm justify-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Get Started
                          <FaArrowRight className="w-4 h-4" />
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-white">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Asymmetrical Layout */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column - Content */}
              <div className="lg:pr-8">
                {/* Small badge - less perfect */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md mb-6 text-xs font-medium text-blue-700">
                  <span>✨</span>
                  <span>Powered by Google Gemini</span>
                </div>

                {/* Main Heading - More human feel */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 text-slate-900 leading-tight">
                  Stop watching.
                  <br />
                  <span className="text-blue-600">Start learning.</span>
                </h1>
                
                {/* More conversational copy */}
                <p className="text-lg sm:text-xl text-slate-700 mb-6 leading-relaxed max-w-xl">
                  You know that feeling when you watch a tutorial but can't remember what you learned 5 minutes later? We fix that. Turn any YouTube video into an actual learning experience.
                </p>
                
                {/* Secondary copy */}
                <p className="text-base text-slate-600 mb-8 leading-relaxed">
                  Get summaries, generate quizzes, chat with the content, and build your personal learning library. No more passive watching.
                </p>
                
                {/* CTA Buttons - Left aligned */}
                <div className="flex flex-col sm:flex-row gap-3 mb-12">
                  <Link 
                    href="/process"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors text-base"
                  >
                    <MdVideoLibrary className="w-5 h-5" />
                    Try it free
                  </Link>
                  <button
                    onClick={() => {
                      const element = document.getElementById('how-it-works');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition-colors text-base bg-white"
                  >
                    See how it works
                  </button>
                </div>

                {/* Stats - More realistic presentation */}
                <div className="flex flex-wrap gap-6 sm:gap-8 pt-6 border-t border-slate-200">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-600">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Visual Element */}
              <div className="relative lg:pl-8">
                {/* Card-like visual with organic shapes */}
                <div className="relative">
                  {/* Main card */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 sm:p-12 border border-blue-100 shadow-lg">
                    <div className="space-y-6">
                      {/* Video placeholder */}
                      <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
                        <FaYoutube className="w-16 h-16 text-slate-400" />
                      </div>
                      
                      {/* Features list */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">AI Summary</div>
                            <div className="text-xs text-slate-600">Key points extracted</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded bg-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">Smart Quiz</div>
                            <div className="text-xs text-slate-600">Test your understanding</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">Study Guide</div>
                            <div className="text-xs text-slate-600">Personalized notes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements - organic shapes */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-2xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cyan-200 rounded-full opacity-20 blur-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Left aligned */}
          <div className="mb-12 lg:mb-16 max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              What makes it different?
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We built this because we were frustrated with passive learning. Here's what actually helps you retain information.
            </p>
          </div>

          {/* Features Grid - Varied layouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              // Vary the card styles for more authentic feel
              const isLarge = index === 0 || index === 4;
              const isHighlighted = index === 2;
              
              return (
                <div 
                  key={index}
                  className={`group p-6 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all ${
                    isLarge ? 'md:col-span-2' : ''
                  } ${isHighlighted ? 'lg:border-blue-300 lg:bg-blue-50/30' : ''}`}
                >
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${
                    isHighlighted ? 'bg-blue-600' : `bg-gradient-to-r ${feature.color}`
                  }`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Right aligned for variation */}
          <div className="mb-12 lg:mb-16 max-w-2xl ml-auto text-right lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              It's simpler than you think. Three steps, zero hassle.
            </p>
          </div>

          {/* Steps - Horizontal layout with numbers */}
          <div className="space-y-8 max-w-4xl">
            {[
              {
                step: "1",
                title: "Paste the URL",
                description: "Grab any YouTube video link and drop it in. That's it. No signup required to try it.",
                icon: FaYoutube,
              },
              {
                step: "2", 
                title: "We do the heavy lifting",
                description: "Our AI extracts the transcript, analyzes the content, and breaks it down into digestible chunks. Takes about 30 seconds.",
                icon: FaBrain,
              },
              {
                step: "3",
                title: "Start learning",
                description: "Browse summaries, take quizzes, ask questions via chat, or save it to your library for later. Your call.",
                icon: MdLibraryBooks,
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start group">
                {/* Step number - larger, more prominent */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 transition-colors">
                    {item.step}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className="w-5 h-5 text-slate-600" />
                    <h3 className="text-xl font-semibold text-slate-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-base text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 lg:mb-12 max-w-2xl mx-auto px-4">
              Join thousands of learners who are already using Mercurious AI to accelerate their education and achieve their goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link 
                href="/process"
                className="px-8 py-4 bg-white text-slate-900 hover:bg-gray-100 text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
              >
                <MdVideoLibrary className="w-5 sm:w-6 h-5 sm:h-6" />
                Start Learning Now
              </Link>
              <button className="px-8 py-4 border-2 border-gray-700 text-white hover:bg-gray-800 text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-3">
                <FaUsers className="w-5 sm:w-6 h-5 sm:h-6" />
                Join Community
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 lg:py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="Mercurious AI Logo" width={40} height={40} className="w-10 h-10" />
                <span className="text-xl font-bold text-white">
                  Mercurious AI
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Transforming education through intelligent AI-powered learning experiences. 
                Built with cutting-edge technology and designed for learners of all levels.
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://github.com/mrnithesh/Mercurious.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <FaGithub className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/mrnithesh/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <FaLinkedin className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
                <a 
                  href="mailto:mr.nithesh.k@gmail.com"
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <FaEnvelope className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/process" className="hover:text-white transition-colors text-sm sm:text-base">Video Processing</Link></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">AI Chat</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Quiz Generation</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Study Guides</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              © 2025 Mercurious AI. Built with ❤️ for learners everywhere by Nithesh.
            </p>
          </div>
        </div>
      </footer>

      {/* Authentication Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeModals} 
        onSwitchToRegister={openRegisterModal} 
      />
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={closeModals} 
        onSwitchToLogin={openLoginModal} 
      />
    </div>
  );
}
