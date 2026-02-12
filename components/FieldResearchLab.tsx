import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

const FieldResearchLab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Agent 260206 Online. I am ready to conduct deep market analysis, generate visual assets, or simulate video scenarios for AD&I/DDS strategy.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // New State for specific tools
  const [generatedMedia, setGeneratedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
        // Simple command parsing for specific non-chat features for demo
        const lower = userMsg.text.toLowerCase();
        
        if (lower.startsWith('/image')) {
            const prompt = userMsg.text.replace('/image', '').trim();
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Generating 1K image for: "${prompt}"...`, timestamp: new Date() }]);
            const img = await geminiService.generateImage(prompt, '1K');
            if (img) {
                setGeneratedMedia(img);
                setMediaType('image');
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Image generated.`, timestamp: new Date() }]);
            }
        } else if (lower.startsWith('/video')) {
            const prompt = userMsg.text.replace('/video', '').trim();
             setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Generating Veo video for: "${prompt}"... (This may take a moment)`, timestamp: new Date() }]);
            const vid = await geminiService.generateVideo(prompt);
            if (vid) {
                 setGeneratedMedia(vid);
                 setMediaType('video');
                 setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Video generated.`, timestamp: new Date() }]);
            }
        } else {
             // Normal Chat with Streaming
             const stream = await geminiService.chatWithAgent(userMsg.text, 
                messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
             );
             
             let fullText = '';
             const tempId = Date.now().toString();
             
             // Optimistic update
             setMessages(prev => [...prev, { id: tempId, role: 'model', text: '', timestamp: new Date() }]);
             
             for await (const chunk of stream) {
                 const text = chunk.text;
                 if (text) {
                     fullText += text;
                     setMessages(prev => prev.map(m => m.id === tempId ? { ...m, text: fullText } : m));
                 }
             }
        }

    } catch (e) {
        console.error(e);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Error processing request.', timestamp: new Date() }]);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
            <h2 className="font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Field Research Lab
            </h2>
            <p className="text-xs text-gray-400">Powered by Gemini 3 Pro (Thinking) & Veo</p>
        </div>
      </div>

      {/* Main Content Area: Chat + Media Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-gray-50" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
              }`}>
                {msg.role === 'model' && <p className="text-xs font-bold text-gray-400 mb-1">Agent 260206</p>}
                <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
              </div>
            </div>
          ))}
          {isProcessing && (
              <div className="flex justify-start mb-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
              </div>
          )}
        </div>

        {/* Media Preview Panel (Conditional) */}
        {generatedMedia && (
            <div className="w-1/3 bg-gray-900 p-4 border-l border-gray-700 flex flex-col items-center justify-center relative">
                 <button 
                    onClick={() => setGeneratedMedia(null)}
                    className="absolute top-2 right-2 text-white hover:text-red-400"
                 >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <h3 className="text-white mb-4 font-semibold text-sm uppercase tracking-widest">Asset Preview</h3>
                 {mediaType === 'image' && (
                     <img src={generatedMedia} alt="Generated" className="max-w-full rounded shadow-lg border-2 border-gray-700" />
                 )}
                 {mediaType === 'video' && (
                     <video src={generatedMedia} controls autoPlay className="max-w-full rounded shadow-lg border-2 border-gray-700" />
                 )}
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            <span className="text-xs font-mono text-gray-400 px-2 py-1 bg-gray-100 rounded">Commands:</span>
            <button onClick={() => setInput('/image ')} className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 border border-purple-200">/image [prompt]</button>
            <button onClick={() => setInput('/video ')} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200">/video [prompt]</button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask Agent 260206 about the DFW market..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg text-white font-medium ${isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldResearchLab;
