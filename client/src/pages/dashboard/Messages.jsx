import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeUserId = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null); // When initiating a new chat
  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await apiClient.get('/messages');
        setConversations(res.data.data);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active conversation messages and target user details
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeUserId) return;
      try {
        const res = await apiClient.get(`/messages/${activeUserId}`);
        setMessages(res.data.data);
        
        // Ensure we have target user data even if no messages yet
        if (res.data.data.length === 0) {
          const userRes = await apiClient.get(`/users/${activeUserId}`);
          setTargetUser(userRes.data.data);
        }
        
        scrollToBottom();
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Fast polling for active chat
    return () => clearInterval(interval);
  }, [activeUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUserId) return;

    try {
      const res = await apiClient.post(`/messages/${activeUserId}`, { content: newMessage });
      setMessages([...messages, res.data.data]);
      setNewMessage('');
      scrollToBottom();
      
      // Update conversations list
      const resConvos = await apiClient.get('/messages');
      setConversations(resConvos.data.data);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Resolve the active user object
  let activeUserObj = conversations.find(c => c.otherUser.id === activeUserId)?.otherUser;
  if (!activeUserObj && targetUser) {
    activeUserObj = targetUser;
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white shadow rounded-lg border border-gray-200 flex overflow-hidden">
      
      {/* Sidebar - Conversations */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No conversations yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map((convo) => (
                <li key={convo.id}>
                  <button
                    onClick={() => setSearchParams({ user: convo.otherUser.id })}
                    className={`w-full text-left p-4 hover:bg-indigo-50 transition-colors flex items-start space-x-3 ${
                      activeUserId === convo.otherUser.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold">
                        {convo.otherUser.firstName[0]}
                      </div>
                      {convo.unreadCount > 0 && activeUserId !== convo.otherUser.id && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                          {convo.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                          {convo.otherUser.firstName} {convo.otherUser.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(convo.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${convo.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                        {convo.latestMessage?.senderId === user.id ? 'You: ' : ''}{convo.latestMessage?.content}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeUserId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {activeUserObj?.firstName?.[0] || <UserIcon className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {activeUserObj ? `${activeUserObj.firstName} ${activeUserObj.lastName}` : 'Loading...'}
                </h3>
                <p className="text-xs text-gray-500">{activeUserObj?.platformRole?.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Say hi to start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                        isMine 
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-indigo-200 text-right' : 'text-gray-400 text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 block w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center justify-center p-2 rounded-full border border-transparent shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
            <MessageSquare className="w-16 h-16 text-indigo-100 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              Select a conversation from the left sidebar to start messaging, or click "Message Applicant" from an application to start a new thread.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
