'use client';

import Link from 'next/link';
import { 
  Brain, 
  Video, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Shield, 
  Lightbulb, 
  BookOpen, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Github,
  Linkedin,
  Mail,
  LogIn,
  UserPlus,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const features = [
    {
      icon: Shield,
      title: "Secure Firebase Authentication",
      description: "Safe and reliable user authentication with Firebase",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Video,
      title: "YouTube Video Processing",
      description: "Transform any YouTube video into structured learning content",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: Brain,
      title: "AI-Powered Content Analysis",
      description: "Advanced AI analysis using Google's Gemini AI technology",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: MessageSquare,
      title: "Interactive Chat Assistant",
      description: "Get instant answers and clarifications about video content",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: FileText,
      title: "Smart Note-Taking",
      description: "Automatically generated notes and summaries",
      color: "from-orange-500 to-amber-600"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your learning progress and achievements",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: Lightbulb,
      title: "Automated Quiz Generation",
      description: "Test your knowledge with AI-generated quizzes",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: BookOpen,
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-200/50 shadow-lg shadow-purple-100/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Mercurious AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              <button className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg">
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
              <Link 
                href="/process"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-purple-200 pt-4">
              <div className="flex flex-col space-y-3">
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:text-purple-600 font-medium transition-colors flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg justify-center">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </button>
                <Link 
                  href="/process"
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600 animate-pulse" />
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
                Mercurious AI
              </h1>
              <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-fuchsia-600 animate-pulse" />
            </div>
            <p className="text-lg sm:text-2xl lg:text-3xl text-gray-800 mb-4 font-light">
              Your AI Learning Assistant 🎓
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              An intelligent learning platform that transforms YouTube videos into interactive learning experiences using cutting-edge AI technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 lg:mb-16 px-4">
              <Link 
                href="/process"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-xl"
              >
                <Video className="w-5 sm:w-6 h-5 sm:h-6" />
                Process Your First Video
              </Link>
              <button className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-purple-400 text-purple-800 hover:border-fuchsia-500 hover:text-fuchsia-600 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3">
                <BookOpen className="w-5 sm:w-6 h-5 sm:h-6" />
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 lg:mb-16 px-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base text-gray-700 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto px-4">
              Everything you need to transform your learning experience with AI-powered tools and insights.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 lg:p-8 bg-white backdrop-blur-sm rounded-2xl hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 border border-purple-200 hover:border-fuchsia-300 shadow-lg hover:shadow-xl hover:shadow-purple-200/50"
              >
                <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto px-4">
              Three simple steps to transform any YouTube video into a comprehensive learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Paste YouTube URL",
                description: "Simply paste any YouTube video URL into our processor",
                icon: Video,
                color: "from-red-500 to-pink-600"
              },
              {
                step: "02", 
                title: "AI Analysis",
                description: "Our AI extracts transcripts and analyzes content using advanced algorithms",
                icon: Brain,
                color: "from-purple-500 to-fuchsia-600"
              },
              {
                step: "03",
                title: "Learn & Engage",
                description: "Access summaries, quizzes, study guides, and interactive chat",
                icon: BookOpen,
                color: "from-violet-500 to-purple-600"
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="relative z-10">
                  <div className={`w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                    <item.icon className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <div className="text-sm font-bold text-fuchsia-600 mb-2">STEP {item.step}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed px-4">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden lg:block absolute top-8 sm:top-10 left-full w-full z-0">
                    <ArrowRight className="w-6 sm:w-8 h-6 sm:h-8 text-fuchsia-400 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg sm:text-xl text-purple-100 mb-8 lg:mb-12 max-w-2xl mx-auto px-4">
              Join thousands of learners who are already using Mercurious AI to accelerate their education and achieve their goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link 
                href="/process"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 hover:bg-gray-100 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-xl"
              >
                <Sparkles className="w-5 sm:w-6 h-5 sm:h-6" />
                Start Learning Now
              </Link>
              <button className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white hover:bg-white hover:text-purple-600 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3">
                <Users className="w-5 sm:w-6 h-5 sm:h-6" />
                Join Community
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 lg:py-12 bg-gray-900 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  Mercurious AI
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Transforming education through intelligent AI-powered learning experiences. 
                Built with cutting-edge technology and designed for learners of all levels.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/mrnithesh/Mercurious.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-purple-600 rounded-lg transition-colors"
                >
                  <Github className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/mrnithesh/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-fuchsia-600 rounded-lg transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
                <a 
                  href="mailto:mr.nithesh.k@gmail.com"
                  className="p-2 bg-gray-800 hover:bg-violet-600 rounded-lg transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/process" className="hover:text-purple-400 transition-colors text-sm sm:text-base">Video Processing</Link></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-sm sm:text-base">AI Chat</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-sm sm:text-base">Quiz Generation</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-sm sm:text-base">Study Guides</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors text-sm sm:text-base">Documentation</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-sm sm:text-base">Help Center</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-sm sm:text-base">Contact</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-sm sm:text-base">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 lg:mt-12 pt-6 lg:pt-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              © 2024 Mercurious AI. Built with ❤️ for learners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
