import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Home, 
  Phone,
  Calendar,
  DollarSign,
  Minimize2,
  User
} from "lucide-react";

export default function ChatWidget({ currentPage, measurement }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greetingMessage = {
        role: "assistant",
        content: "Hi! I'm Aroof's AI assistant. I'm here to help you with roof measurements, pricing, scheduling inspections, or any questions about our services. How can I help you today?",
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted]);

  const getContextPrompt = () => {
    let context = `You are Aroof's AI assistant, helping customers with roofing services in the Dallas-Fort Worth area. 

Company Information:
- Name: Aroof
- Service Area: Dallas, Plano, Frisco, McKinney, Allen, and surrounding DFW areas
- Phone: (214) 555-0123
- Email: info@aroof.build
- Hours: Monday-Friday 8am-6pm, Saturday 9am-4pm
- Services: Roof replacement, repair, inspection, and measurements
- Pricing: Homeowner measurements $3, Professional roofer measurements $5
- Special: Free roof inspections for homeowners
- Warranty: 10-year workmanship warranty
- Rating: 4.9/5 stars from 500+ customers
- Licensed and insured in Texas

Current Context:
- User is on page: ${currentPage || "homepage"}`;

    if (measurement) {
      context += `
- User has measured their roof: ${measurement.property_address}
- Roof area: ${measurement.total_sqft?.toLocaleString() || "N/A"} sq ft`;
      
      if (measurement.total_sqft) {
        const lowEst = Math.round(measurement.total_sqft * 4 * 0.9);
        const highEst = Math.round(measurement.total_sqft * 4 * 1.1);
        context += `
- Estimated project cost: $${lowEst.toLocaleString()} - $${highEst.toLocaleString()}`;
      }
    }

    context += `

Your Guidelines:
1. Be friendly, professional, and helpful
2. Keep responses concise (2-3 sentences max unless explaining something complex)
3. For appointment booking, collect: name, phone, email, preferred date/time
4. For quotes, explain what affects pricing (roof size, material type, pitch, complexity)
5. If asked about scheduling, mention our free inspection service
6. If user wants to talk to a person, give them the phone number
7. Answer questions about the measurement tool, process, pricing
8. Help guide users through the website if they're confused
9. For technical questions about roofing, provide helpful information
10. Always be positive about Aroof's services

Quick Facts:
- Roof measurement takes 60 seconds using satellite imagery
- Accuracy is ±2-5%
- Most roof replacements take 1-3 days
- We offer financing options
- Same-day emergency service available
- Material options: Asphalt shingles, architectural shingles, metal, tile
- Average roof lifespan: 20-30 years

Be conversational and helpful!`;

    return context;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const systemPrompt = getContextPrompt();
      const fullPrompt = `${systemPrompt}

Conversation history:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${inputMessage}

Respond as Aroof's AI assistant:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: false
      });

      const aiMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check if user is trying to book or get quote
      const lowerMessage = inputMessage.toLowerCase();
      if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || 
          lowerMessage.includes('appointment') || lowerMessage.includes('inspection')) {
        // Track interest in booking
        console.log("User interested in booking:", inputMessage);
      }

    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = {
        role: "assistant",
        content: "I apologize, I'm having trouble responding right now. Please call us at (214) 555-0123 or try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (message) => {
    setInputMessage(message);
  };

  const quickReplies = [
    { icon: Home, text: "How does the measurement work?", message: "How does your roof measurement tool work?" },
    { icon: DollarSign, text: "How much does it cost?", message: "How much does a roof replacement cost?" },
    { icon: Calendar, text: "Schedule inspection", message: "I'd like to schedule a free inspection" },
    { icon: Phone, text: "Talk to someone", message: "I want to talk to a person" }
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group animate-pulse hover:animate-none"
        >
          <MessageCircle className="w-8 h-8 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">Aroof Assistant</p>
                <p className="text-xs text-blue-100">Typically replies instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setMessages([]);
                  setHasGreeted(false);
                }}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-900 shadow-sm rounded-bl-sm border border-slate-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-900 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Typing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="bg-white border-t border-slate-200 p-3">
              <p className="text-xs text-slate-600 mb-2 font-medium">Quick options:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply.message)}
                    className="flex items-center gap-2 text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 transition-colors"
                  >
                    <reply.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-700">{reply.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Powered by AI • Available 24/7
            </p>
          </div>
        </div>
      )}
    </>
  );
}