import React, { useState } from 'react';
import { HelpCircle, Plus, Minus } from 'lucide-react';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    { question: 'How do I search for destinations?', answer: 'Use the search bar to enter a city, country, or destination name. You can also filter by category and adjust dates and budget.' },
    { question: 'How do I create an account?', answer: 'Open the account modal from the top bar and sign up with your email. After logging in, your preferences and wishlist are saved to your profile.' },
    { question: 'How do I save a destination to my wishlist?', answer: 'Click the heart icon on a destination card. You can view and manage your wishlist in your profile later.' },
    { question: 'Can I edit my profile and preferences?', answer: 'Yes. Go to your profile to update details and adjust travel preferences so recommendations better match your style.' }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white" id="faq">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-4">
            <HelpCircle className="text-purple-600 mr-2" size={18} />
            <span className="text-sm font-semibold text-purple-900">FAQ</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Tips for getting the most out of TripLink</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-purple-50 transition-colors"
              >
                <span className="font-bold text-lg pr-4">{faq.question}</span>
                {openIndex === idx ? <Minus className="text-primary" /> : <Plus className="text-primary" />}
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-5 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;