import React, { useState } from 'react';
import { Search, Book, HelpCircle, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import SEO from '../Component/SEO';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: Book,
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click on "Sign Up" in the top right corner, fill in your details, verify your email, and you\'re ready to start planning your trips!'
        },
        {
          question: 'How do I search for destinations?',
          answer: 'Use the search bar on the homepage or navigate to the Destinations page. You can filter by price, country, category, and tags to find exactly what you\'re looking for.'
        },
        {
          question: 'How do I book a trip?',
          answer: 'Browse destinations, click "Book Now" on any destination, fill in your travel dates and guest information, and complete the payment process. For complex trips, our intelligent system will route you to an agent for personalized assistance.'
        }
      ]
    },
    {
      title: 'Bookings',
      icon: Book,
      faqs: [
        {
          question: 'How do I view my bookings?',
          answer: 'Click on "My Bookings" in the navigation menu or visit your profile page and go to the "Bookings" tab. You\'ll see all your current and past bookings there.'
        },
        {
          question: 'Can I modify my booking?',
          answer: 'Yes! Go to "My Bookings", find the booking you want to modify, and click "Edit". You can change dates, number of guests, and special requests. Note that changes may affect pricing.'
        },
        {
          question: 'How do I cancel a booking?',
          answer: 'Go to "My Bookings", find the booking you want to cancel, and click "Cancel". You\'ll be asked to provide a reason. Refunds will be processed according to our cancellation policy.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit and debit cards through our secure Stripe payment system. Payment is processed securely and you\'ll receive a confirmation email once payment is complete.'
        },
        {
          question: 'When will I receive my booking confirmation?',
          answer: 'You\'ll receive a confirmation email immediately after your booking is confirmed. The email includes all booking details, a QR code for check-in, and important travel information.'
        }
      ]
    },
    {
      title: 'Account & Profile',
      icon: HelpCircle,
      faqs: [
        {
          question: 'How do I update my profile?',
          answer: 'Go to your profile page and click "Edit Profile". You can update your personal information, travel preferences, and profile picture.'
        },
        {
          question: 'How do I change my password?',
          answer: 'Go to Settings, then click "Change Password". Enter your current password and your new password. Make sure your new password is strong and secure.'
        },
        {
          question: 'What are travel preferences?',
          answer: 'Travel preferences help us recommend destinations that match your interests. You can set your personality profile (8 axes) and preferences across 16 categories to get personalized recommendations.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'Go to Settings, scroll to the bottom, and click "Delete Account". Please note that this action is permanent and cannot be undone.'
        }
      ]
    },
    {
      title: 'Agents',
      icon: MessageCircle,
      faqs: [
        {
          question: 'How do I become a travel agent?',
          answer: 'Click on "Apply as Agent" in the signup or login page, fill out the application form with your experience and qualifications, and submit. Our admin team will review your application and get back to you.'
        },
        {
          question: 'What can agents do?',
          answer: 'Agents can manage client bookings, create custom travel packages, communicate with clients, track commissions, and access specialized tools for travel planning.'
        },
        {
          question: 'How do I access my agent dashboard?',
          answer: 'Once approved as an agent, you\'ll see an "Agent Dashboard" link in the navigation menu. Click it to access all your agent tools and manage your bookings.'
        }
      ]
    }
  ];

  const allFaqs = faqCategories.flatMap(category => 
    category.faqs.map(faq => ({ ...faq, category: category.title }))
  );

  const filteredFaqs = searchQuery
    ? allFaqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allFaqs;

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <SEO 
        title="Help Center - TripLink | Get Support & Answers"
        description="Find answers to common questions about TripLink. Get help with bookings, account management, and more. Contact our support team 24/7."
        keywords="help, support, FAQ, questions, travel booking help, customer service"
      />
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions and get the support you need
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
              />
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Need More Help?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <Mail className="text-blue-600" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-sm text-gray-600">support@triplink.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <Phone className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                <p className="text-sm text-gray-600">1-800-TRIPLINK</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <MessageCircle className="text-purple-600" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                <p className="text-sm text-gray-600">Available 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Sections */}
        {!searchQuery ? (
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                  <div className="flex items-center space-x-3">
                    <category.icon className="text-white" size={24} />
                    <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = faqCategories.slice(0, categoryIndex).reduce((sum, cat) => sum + cat.faqs.length, 0) + faqIndex;
                    const isExpanded = expandedFaq === globalIndex;
                    return (
                      <div key={faqIndex} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                        >
                          <span className="font-semibold text-gray-900">{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="text-gray-400" size={20} />
                          ) : (
                            <ChevronDown className="text-gray-400" size={20} />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-6 pb-4 text-gray-600">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Search Results ({filteredFaqs.length})
            </h2>
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 font-medium">
                      {faq.category}
                    </div>
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      {isExpanded ? (
                        <ChevronUp className="text-gray-400" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-400" size={20} />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-6 pb-4 text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;

