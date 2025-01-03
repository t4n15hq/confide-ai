import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Shield, Heart, Brain, 
  ArrowRight, Lock, BarChart, Clock,
  AlertTriangle, FileText, PieChart, Sparkles 
} from 'lucide-react';

const LandingPage = () => {
  const [email, setEmail] = useState('');

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-green-100/40 to-blue-100/40 blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-gray-200/20">
        <div className="container mx-auto px-6 py-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between"
          >
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-blue-600 transition-transform group-hover:scale-110" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-blue-400/30 blur-md"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                Confide.ai
              </span>
            </Link>

            <div className="flex items-center gap-8">
              <Link to="/features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
              <div className="flex items-center gap-4">
                <Link
                  to="/journal"
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Journal
                </Link>
                <Link
                  to="/chat"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </nav>

            {/* Hero Section */}
            <div className="container mx-auto px-6 pt-24 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Private by Design
            </span>
            <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              24/7 Support
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 text-transparent bg-clip-text leading-tight">
            Your AI companion for emotional wellbeing
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Experience empathetic AI-powered support that helps you understand your emotions, 
            track your journey, and grow personally.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/journal"
              className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Start Journaling
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/chat"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-50 transition-all border border-gray-200 hover:border-gray-300 shadow-sm flex items-center justify-center gap-2"
            >
              Begin Chat
              <MessageSquare className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Key Benefits Section */}
      <div className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Key Benefits</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover how Confide.ai can support your emotional wellbeing journey
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Brain,
              title: "AI-Powered Understanding",
              description: "Experience empathetic responses powered by advanced AI technology"
            },
            {
              icon: FileText,
              title: "Structured Self-Reflection",
              description: "Track your moods and journal with guided prompts for deeper insight"
            },
            {
              icon: Shield,
              title: "Privacy & Security",
              description: "Your data is encrypted and stored locally for maximum privacy"
            },
            {
              icon: AlertTriangle,
              title: "Crisis Support",
              description: "Access immediate help and resources when you need them most"
            },
            {
              icon: BarChart,
              title: "Personal Growth",
              description: "Track your progress and gain valuable insights over time"
            },
            {
              icon: Clock,
              title: "Always Available",
              description: "24/7 access to support whenever you need it"
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl transform transition-transform group-hover:scale-105 -z-10" />
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <benefit.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-6 py-24 bg-gradient-to-b from-white to-blue-50/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your journey to better emotional wellbeing in four simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 transform -translate-y-1/2" />

          {[
            {
              icon: MessageSquare,
              title: "Choose Your Path",
              description: "Start with journaling or chat - whatever feels right for you"
            },
            {
              icon: Heart,
              title: "Share Your Thoughts",
              description: "Express yourself freely in a safe, private space"
            },
            {
              icon: Sparkles,
              title: "Receive Insights",
              description: "Get AI-powered understanding and guidance"
            },
            {
              icon: BarChart,
              title: "Track Progress",
              description: "Watch your emotional journey unfold over time"
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative z-10"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -right-2 -top-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{index + 1}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust & Safety Section */}
      <div className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Trust & Safety</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your wellbeing and privacy are our top priorities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: Lock,
              title: "Privacy First",
              description: "Your data never leaves your device without your explicit consent",
              gradient: "from-blue-500 to-blue-600"
            },
            {
              icon: Shield,
              title: "End-to-End Encryption",
              description: "Military-grade encryption for all your personal data",
              gradient: "from-green-500 to-green-600"
            },
            {
              icon: AlertTriangle,
              title: "Crisis Support",
              description: "Immediate access to professional resources when needed",
              gradient: "from-purple-500 to-purple-600"
            },
            {
              icon: Brain,
              title: "Ethical AI",
              description: "Transparent AI practices with clear professional boundaries",
              gradient: "from-indigo-500 to-indigo-600"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

            {/* CTA Section */}
            <div className="container mx-auto px-6 py-24 bg-gradient-to-b from-white to-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
            Start Your Journey Today
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Begin your path to better emotional wellbeing with a free trial. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/journal"
              className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Start Journaling
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/chat"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-50 transition-all border border-gray-200 hover:border-gray-300 shadow-sm flex items-center justify-center gap-2"
            >
              Begin Chat
              <MessageSquare className="h-5 w-5" />
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Instant access. No credit card required.
          </p>
        </motion.div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-center">Stay Updated</h3>
            <p className="text-gray-600 mb-6 text-center">
              Get the latest updates on features and mental wellness tips.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-6 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <span className="font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                  Confide.ai
                </span>
              </Link>
              <p className="text-sm text-gray-600">
                Your trusted companion for emotional wellbeing and personal growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2">
                <li><Link to="/chat" className="text-gray-600 hover:text-gray-900">AI Chat Support</Link></li>
                <li><Link to="/journal" className="text-gray-600 hover:text-gray-900">Journaling</Link></li>
                <li><Link to="/mood" className="text-gray-600 hover:text-gray-900">Mood Tracking</Link></li>
                <li><Link to="/analytics" className="text-gray-600 hover:text-gray-900">Progress Analytics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
                <li><Link to="/help" className="text-gray-600 hover:text-gray-900">Help Center</Link></li>
                <li><Link to="/crisis" className="text-gray-600 hover:text-gray-900">Crisis Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Twitter</span>
                  {/* Add social icons here */}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 Confide.ai. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500" /> for mental wellness
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;