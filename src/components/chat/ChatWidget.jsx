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
  const [userName, setUserName] = useState("");
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send initial greeting when chat opens for the first time
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

Quick Facts to Know:
- Roof measurement takes 60 seconds using satellite imagery
- Accuracy is ±2-5%
- Most roof replacements take 1-3 days
- We offer financing options
- Same-day emergency service available
- Material options: Asphalt shingles, architectural shingles, metal, tile
- Average roof lifespan: 20-30 years

If user wants to:
- Book inspection: Collect name, phone, email, and preferred date
- Get quote: Explain they can measure their roof for $3 to get instant pricing
- Talk to someone: Give phone number (214) 555-0123
- Learn about process: Explain the 3 steps (measure, inspect, install)

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
      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Create prompt with context
      const systemPrompt = getContextPrompt();
      const fullPrompt = `${systemPrompt}

Conversation so far:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${inputMessage}