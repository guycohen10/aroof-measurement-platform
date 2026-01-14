import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { toast } from "sonner";

export default function AIEstimatorChat({ lead, onDataExtracted }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationData, setConversationData] = useState({
    materialCategory: null,
    specificMaterial: null,
    roofType: null,
    complexity: null,
    pricePerSquare: null
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start conversation
    const totalSqft = lead?.total_sqft || lead?.total_adjusted_sqft || 0;
    const greeting = totalSqft > 0
      ? `Hi! I'm your AI roofing assistant. I see you have a ${Math.round(totalSqft).toLocaleString()} sqft roof to estimate. Let's build a professional quote together.\n\nFirst question: Is this a residential or commercial project?`
      : `Hi! I'm your AI roofing assistant. Let's build a professional quote together.\n\nFirst, what's the total square footage of the roof?`;
    
    setMessages([{
      role: 'assistant',
      content: greeting,
      timestamp: new Date()
    }]);
  }, []);

  const extractDataFromResponse = async (userMessage, aiResponse) => {
    // Use LLM to extract structured data from conversation
    try {
      const prompt = `Analyze this roofing conversation and extract any new information:

User said: "${userMessage}"
AI responded: "${aiResponse}"

Current data: ${JSON.stringify(conversationData)}

Extract and return ONLY the new/updated information in this exact JSON format (return empty object if nothing new):
{
  "materialCategory": "asphalt" | "metal" | "tile" | "flat" | null,
  "specificMaterial": "GAF Timberline HDZ" | "Standing Seam" | etc | null,
  "roofType": "residential" | "commercial" | null,
  "complexity": "simple" | "moderate" | "complex" | null,
  "pricePerSquare": number | null,
  "addOns": ["pipe_boots", "ridge_vent"] | null
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            materialCategory: { type: "string" },
            specificMaterial: { type: "string" },
            roofType: { type: "string" },
            complexity: { type: "string" },
            pricePerSquare: { type: "number" },
            addOns: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Merge extracted data
      const newData = { ...conversationData };
      if (response.materialCategory) newData.materialCategory = response.materialCategory;
      if (response.specificMaterial) newData.specificMaterial = response.specificMaterial;
      if (response.roofType) newData.roofType = response.roofType;
      if (response.complexity) newData.complexity = response.complexity;
      if (response.pricePerSquare) newData.pricePerSquare = response.pricePerSquare;
      if (response.addOns) newData.addOns = response.addOns;

      setConversationData(newData);
      onDataExtracted(newData);
    } catch (err) {
      console.error('Error extracting data:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setLoading(true);

    try {
      // Build context for AI
      const totalSqft = lead?.total_sqft || lead?.total_adjusted_sqft || 0;
      const conversationHistory = messages.map(m => 
        `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`
      ).join('\n\n');

      const systemPrompt = `You are an expert roofing estimator AI assistant helping a contractor build a professional quote. 

Current Project Context:
- Roof Size: ${totalSqft > 0 ? `${Math.round(totalSqft).toLocaleString()} sqft (${(totalSqft/100).toFixed(1)} squares)` : 'Unknown'}
- Address: ${lead?.property_address || 'Not provided'}
- Conversation so far: ${conversationData}

Your job:
1. Ask clarifying questions to understand their needs (material type, complexity, add-ons)
2. Provide expert roofing knowledge when asked
3. Guide them toward a complete estimate
4. Be conversational, helpful, and professional

Pricing Reference (per square):
- Asphalt Shingles: $350-$500
- Metal Standing Seam: $800-$1200
- Metal Corrugated: $600-$900
- Clay Tile: $900-$1400
- Concrete Tile: $700-$1000
- TPO (Flat): $600-$800
- EPDM (Flat): $500-$700

Waste Factors:
- Simple gable: 10-15%
- Hip roof: 15-20%
- Complex/valleys: 20-25%

Conversation History:
${conversationHistory}

User's latest message: "${userMessage}"

Respond naturally and helpfully. If they're asking a question, answer it. If you need more info, ask. Keep responses under 100 words.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: false
      });

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);

      // Extract structured data from conversation
      await extractDataFromResponse(userMessage, response);

    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">AI Roofing Assistant</h3>
            <p className="text-xs text-purple-100">Powered by GPT-4</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 min-h-[400px] max-h-[500px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200 rounded-b-xl">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          💡 Ask anything: "What's standard waste for a hip roof?" or "Should I use TPO or EPDM?"
        </p>
      </div>
    </div>
  );
}