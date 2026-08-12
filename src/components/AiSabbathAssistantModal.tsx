import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Compass, 
  Calendar, 
  HeartHandshake, 
  Church, 
  Utensils, 
  CheckCircle2, 
  Loader2, 
  Bot,
  User,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  sender: 'AI' | 'USER';
  text: string;
  time: string;
}

export const AiSabbathAssistantModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { listings } = useApp();
  const [activeTab, setActiveTab] = useState<'CONCIERGE' | 'ITINERARY' | 'HOST_DRAFTER'>('CONCIERGE');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;
  
  // Concierge Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'AI',
      text: "Peace be with you! I am your AdventistStay AI Sabbath Concierge. Tell me where you are traveling or your family's preferences (e.g. plant-based meals, young kids, SDA church within walking distance), and I'll help you find the best host match or plan your Sabbath!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Itinerary Planner State
  const [itineraryDestination, setItineraryDestination] = useState('');
  const [itineraryResult, setItineraryResult] = useState('');
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  // Host Drafter State
  const [hostFamilyName, setHostFamilyName] = useState('');
  const [hostLocation, setHostLocation] = useState('');
  const [hostHighlights, setHostHighlights] = useState('');
  const [draftedListing, setDraftedListing] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userText = chatInput.trim();
    const newMsg: Message = {
      sender: 'USER',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONCIERGE',
          prompt: userText,
          context: {
            availableHosts: listings.map(l => ({ title: l.title, city: l.city, country: l.country, hostName: l.hostName }))
          }
        })
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'AI',
          text: data.text || "Thank you for asking! I recommend browsing our verified hosts in your target city for warm Christian fellowship.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'AI',
          text: "I am ready to help you plan your travel! You can search destinations or request stay directly with our verified host families.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateItinerary = async () => {
    if (!itineraryDestination.trim() || isGeneratingItinerary) return;
    setIsGeneratingItinerary(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ITINERARY',
          prompt: `Create a detailed Friday Sunset to Saturday Sunset Sabbath itinerary for a Christian traveler visiting ${itineraryDestination}. Include local Seventh-day Adventist church worship, potluck ideas, sunset nature walks, and host family fellowship.`,
          context: { destination: itineraryDestination }
        })
      });

      const data = await res.json();
      setItineraryResult(data.text);
    } catch (err) {
      setItineraryResult(`### 🌅 Sabbath Itinerary for ${itineraryDestination}\n\n**Friday Evening**\n- Sunset worship and warm soup with host family.\n\n**Saturday Day**\n- 9:30 AM Sabbath School\n- 11:00 AM Divine Worship Service at local SDA Church\n- 1:00 PM Church Fellowship Lunch\n- 3:30 PM Sunset nature walk`);
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const handleDraftListing = async () => {
    if (!hostFamilyName.trim() || isDrafting) return;
    setIsDrafting(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LISTING_ASSISTANT',
          prompt: `Draft a warm, welcoming AdventistStay host bio and listing for the ${hostFamilyName} in ${hostLocation || 'our city'}. Special highlights: ${hostHighlights || 'Vegetarian meals, close to local SDA church, quiet Sabbath environment'}.`
        })
      });

      const data = await res.json();
      setDraftedListing(data.text);
    } catch (err) {
      setDraftedListing(`Welcome to the ${hostFamilyName} home! We offer a peaceful room for traveling Sabbath keepers, wholesome plant-based meals, and easy access to our local Seventh-day Adventist church. May your visit bring spiritual rest and fellowship!`);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftedListing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">AI Sabbath Travel Assistant</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-400 text-amber-950 rounded-full uppercase tracking-wider">
                  Gemini 3.6
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Smart host matching, Sabbath itineraries & host listing generator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6">
          <button
            onClick={() => setActiveTab('CONCIERGE')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'CONCIERGE'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" /> AI Sabbath Concierge
          </button>
          <button
            onClick={() => setActiveTab('ITINERARY')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ITINERARY'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" /> Sabbath Itinerary Planner
          </button>
          <button
            onClick={() => setActiveTab('HOST_DRAFTER')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'HOST_DRAFTER'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4" /> AI Listing Assistant
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: CONCIERGE CHAT */}
          {activeTab === 'CONCIERGE' && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'USER' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.sender === 'USER'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {msg.sender === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'USER'
                          ? 'bg-amber-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className="block text-[10px] mt-1 opacity-60 text-right">{msg.time}</span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 font-semibold italic">
                    <Loader2 className="w-4 h-4 animate-spin" /> AI Concierge is thinking...
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              <div className="flex gap-2 overflow-x-auto py-2 my-2 scrollbar-none">
                {[
                  'Recommend hosts with plant-based/vegan meals',
                  'Find families suitable for young children',
                  'Which hosts are closest to local SDA churches?',
                  'How does Sabbath hospitality work?'
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setChatInput(prompt);
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-slate-700 dark:text-slate-300 hover:text-amber-600 text-[11px] font-medium rounded-xl border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask about host preferences, dietary needs, or destinations..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !chatInput.trim()}
                  className="px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ITINERARY PLANNER */}
          {activeTab === 'ITINERARY' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enter your destination city or host location to generate a blessed Friday Sunset to Saturday Sunset itinerary tailored to Adventist travel.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={itineraryDestination}
                  onChange={e => setItineraryDestination(e.target.value)}
                  placeholder="e.g. Berrien Springs, MI or London, UK or São Paulo, Brazil"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleGenerateItinerary}
                  disabled={isGeneratingItinerary || !itineraryDestination.trim()}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0"
                >
                  {isGeneratingItinerary ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Itinerary
                </button>
              </div>

              {itineraryResult && (
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-xs text-slate-800 dark:text-slate-200 space-y-2 whitespace-pre-wrap leading-relaxed">
                  {itineraryResult}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LISTING ASSISTANT */}
          {activeTab === 'HOST_DRAFTER' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you an Adventist host family? Fill in a few details and let AI draft a inspiring host profile bio and Sabbath guidelines for you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Family / Host Name
                  </label>
                  <input
                    type="text"
                    value={hostFamilyName}
                    onChange={e => setHostFamilyName(e.target.value)}
                    placeholder="e.g. Miller Family"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City & Country
                  </label>
                  <input
                    type="text"
                    value={hostLocation}
                    onChange={e => setHostLocation(e.target.value)}
                    placeholder="e.g. Loma Linda, CA, USA"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Unique Highlights & Amenities
                </label>
                <textarea
                  value={hostHighlights}
                  onChange={e => setHostHighlights(e.target.value)}
                  placeholder="e.g. 5 minutes from Loma Linda University Church, organic garden, vegan cooking lessons, peaceful guest room..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleDraftListing}
                disabled={isDrafting || !hostFamilyName.trim()}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Draft Christian Host Profile
              </button>

              {draftedListing && (
                <div className="relative bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-100"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  {draftedListing}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Powered by Gemini 3.6 & AdventistStay Hospitality Protocol
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
