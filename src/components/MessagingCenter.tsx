import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  UserCheck, 
  Sun, 
  Car, 
  Clock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MessagingCenter: React.FC = () => {
  const { messages, sendMessage, currentUser, stayRequests } = useApp();
  const [activePartnerId, setActivePartnerId] = useState<string>('user-host-1');
  const [inputContent, setInputContent] = useState('');

  // Extract unique conversation partners
  const conversationPartners = Array.from(
    new Set(
      (messages || []).flatMap(m => [m.senderId, m.receiverId]).filter(id => id !== currentUser?.id)
    )
  );

  const activeMessages = (messages || []).filter(
    m => (m.senderId === currentUser?.id && m.receiverId === activePartnerId) ||
         (m.senderId === activePartnerId && m.receiverId === currentUser?.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;
    sendMessage(activePartnerId, inputContent);
    setInputContent('');
  };

  const insertTemplate = (text: string) => {
    setInputContent(text);
  };

  return (
    <div id="messaging-center-view" className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            Hospitality Messaging Channel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct secure communication between Seventh-day Adventist hosts & guests
          </p>
        </div>

        {/* Safety Warning */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Keep all communications within AdventistStay for safety</span>
        </div>
      </div>

      {/* Chat Container Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        
        {/* Left Partner Threads List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 overflow-y-auto space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Conversations ({conversationPartners.length})
          </h3>

          {conversationPartners.map(partnerId => {
            const partnerMsg = messages.find(m => m.senderId === partnerId || m.receiverId === partnerId);
            const isSelected = partnerId === activePartnerId;
            const partnerName = partnerMsg?.senderId === partnerId ? partnerMsg.senderName : 'Elder Marcus Vance';

            return (
              <button
                key={partnerId}
                id={`chat-thread-${partnerId}`}
                onClick={() => setActivePartnerId(partnerId)}
                className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
                  isSelected 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-900 dark:text-white'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {partnerName.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{partnerName}</p>
                  <p className={`text-[11px] truncate ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                    {partnerMsg?.content || 'Click to open thread...'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Active Conversation Area */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Thread Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Active Thread</p>
              <p className="text-xs text-slate-500">End-to-end encrypted Adventist hospitality channel</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
              Protected
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 px-2">
            {activeMessages.map(msg => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
                    isMe 
                      ? 'bg-amber-600 text-white rounded-br-none shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}>
                    <p className="font-bold text-[10px] opacity-80">{msg.senderName}</p>
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className="text-[9px] opacity-60 text-right pt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Hospitality Templates */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
              <span className="font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
                <Sparkles className="w-3 h-3 text-amber-500" /> Templates:
              </span>
              <button
                onClick={() => insertTemplate("Happy Sabbath! We would love to invite you to join our family Friday sunset vespers and dinner.")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-900 flex-shrink-0"
              >
                🌅 Sunset Vespers Invite
              </button>
              <button
                onClick={() => insertTemplate("Can you please confirm what time you plan to arrive on Friday? Check-in window is 3:00 PM - 6:00 PM.")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-900 flex-shrink-0"
              >
                🕒 Arrival Time Request
              </button>
              <button
                onClick={() => insertTemplate("We can provide a ride to divine service at 11:00 AM on Sabbath morning.")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-900 flex-shrink-0"
              >
                🚗 Church Ride Offer
              </button>
            </div>

            {/* Input & Send Form */}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                id="message-input-text"
                type="text"
                placeholder="Type your message..."
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                id="send-message-btn"
                type="submit"
                className="p-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
