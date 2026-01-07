import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, Paperclip } from 'lucide-react';
import * as agentService from '../services/agentService';
import { useErrorToast } from './ErrorToast';

const ClientMessaging = ({ clientId, clientName, bookingId = null }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const messagesEndRef = useRef(null);
  const { showToast, ToastContainer } = useErrorToast();

  useEffect(() => {
    if (clientId) {
      loadConversation();
    }
  }, [clientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    setLoading(true);
    try {
      const data = await agentService.getConversation(clientId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load messages';
      showToast(errorMsg, 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast('Please enter both subject and message', 'warning', 3000);
      return;
    }

    setSending(true);
    try {
      await agentService.sendMessage(clientId, subject, message, bookingId);
      setSubject('');
      setMessage('');
      setShowForm(false);
      showToast('Message sent successfully!', 'success', 3000);
      loadConversation();
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to send message. Please try again.';
      showToast(errorMsg, 'error', 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={24} className="text-purple-600" />
          Messages with {clientName}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          {showForm ? 'Cancel' : 'New Message'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSend} className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Message
              </>
            )}
          </button>
        </form>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="mx-auto animate-spin text-purple-600" size={32} />
            <p className="mt-2 text-gray-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-lg ${
                msg.direction === 'TO_CLIENT'
                  ? 'bg-purple-50 border border-purple-200 ml-8'
                  : 'bg-gray-50 border border-gray-200 mr-8'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{msg.subject}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {msg.direction === 'TO_CLIENT' ? 'You' : clientName} • {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
                {!msg.read && msg.direction === 'FROM_CLIENT' && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">New</span>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
    </>
  );
};

export default ClientMessaging;


