
import React, { useState, useRef, useEffect } from 'react';
import { generateBoardLayout } from '../services/geminiService';
import { BoardData } from '../types';

interface AIChatProps {
  currentBoard: BoardData;
  onApplyLayout: (newData: BoardData) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AIChat: React.FC<AIChatProps> = ({ currentBoard, onApplyLayout, isExpanded, onToggle }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Olá! Sou seu parceiro de criação. Quer trocar algumas ideias ou já quer que eu comece a organizar algo no seu quadro?' }
  ]);
  
  const chatHistory = useRef<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMsg = input.trim();
    if (!userMsg || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await generateBoardLayout(userMsg, currentBoard, chatHistory.current);
      
      if (response && response.chatResponse) {
        // SÓ aplica o layout se a IA realmente enviou elementos (evita limpar o quadro ou agir sem necessidade)
        if (response.boardData && response.boardData.elements && response.boardData.elements.length > 0) {
          onApplyLayout(response.boardData);
        }

        setMessages(prev => [...prev, { role: 'ai', text: response.chatResponse }]);

        chatHistory.current.push({ role: 'user', parts: [{ text: userMsg }] });
        // Salvamos apenas o texto da resposta no histórico para economizar tokens e manter o foco no diálogo
        chatHistory.current.push({ role: 'model', parts: [{ text: response.chatResponse }] });

        if (chatHistory.current.length > 12) {
          chatHistory.current = chatHistory.current.slice(-12);
        }
      }
    } catch (err: any) {
      console.error("Erro no chat:", err);
      setMessages(prev => [...prev, { role: 'ai', text: 'Ops, me perdi um pouco aqui. Pode repetir a ideia?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <button 
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_15px_35px_rgba(59,130,246,0.4)] hover:bg-blue-500 transition-all z-50 text-white animate-bounce-slow hover:scale-110 active:scale-95 group"
      >
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-4 border-[#050505] animate-pulse" />
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[650px] max-h-[85vh] bg-neutral-900/98 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-300">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest text-white">Consultor IA</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Online</span>
            </div>
          </div>
        </div>
        <button onClick={onToggle} className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-white/40 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-gradient-to-b from-transparent to-black/10">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] p-5 rounded-3xl text-sm leading-relaxed shadow-xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-none flex flex-col gap-4 w-[280px]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Analisando intenção</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-8 border-t border-white/5 bg-black/40 flex gap-4">
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Diga algo ou peça para organizar..."
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-white/20 text-white"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </form>
    </div>
  );
};

export default AIChat;
