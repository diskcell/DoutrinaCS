import React, { useState, useEffect } from 'react';
import { 
  Trophy, TrendingUp, Target, Brain, Shield, MousePointer2, 
  Settings, Users, MonitorPlay, Crosshair, Terminal, Zap 
} from 'lucide-react';

interface HeroProps {
  onNavigate: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [text, setText] = useState('');
  const fullText = "DOMINE O SERVIDOR";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      index++;
      if (index > fullText.length) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const modulesTree = [
    { id: 'm1', label: 'SETUP & CONFIG', icon: Settings, x: '50%', y: '90%', color: '#eeb32d', size: 64 },
    { id: 'm2', label: 'FUNDAMENTOS', icon: Shield, x: '25%', y: '75%', color: '#eeb32d', size: 56 },
    { id: 'm3', label: 'MIRA & AIM', icon: MousePointer2, x: '75%', y: '75%', color: '#f97316', size: 56 },
    { id: 'm4', label: 'GAME SENSE', icon: Brain, x: '20%', y: '55%', color: '#eeb32d', size: 48 },
    { id: 'm5', label: 'UTILITÁRIOS', icon: Target, x: '40%', y: '55%', color: '#eeb32d', size: 48 },
    { id: 'm6', label: 'LEITURA DE JOGO', icon: MonitorPlay, x: '60%', y: '55%', color: '#f97316', size: 48 },
    { id: 'm7', label: 'MENTALIDADE', icon: Users, x: '80%', y: '55%', color: '#f97316', size: 48 },
  ];

  return (
    <div className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden bg-[#0F1012] selection:bg-[#eeb32d] selection:text-black">
      
      {/* BACKGROUND TÁTICO */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: 'linear-gradient(#eeb32d 1px, transparent 1px), linear-gradient(90deg, #eeb32d 1px, transparent 1px)', 
               backgroundSize: '50px 50px' 
             }}>
        </div>
        <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[700px] h-[700px] border border-[#eeb32d]/5 rounded-full animate-[ping_3s_linear_infinite] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0F1012_90%)]" />
      </div>

      {/* HUD DECORATION */}
      <div className="absolute top-24 left-6 w-8 h-8 border-t-2 border-l-2 border-[#eeb32d]/30 pointer-events-none hidden md:block" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#eeb32d]/30 pointer-events-none hidden md:block" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#eeb32d]/5 to-transparent h-[10px] w-full animate-[scan_4s_linear_infinite] pointer-events-none opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 relative h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full">
          
          {/* COLUNA ESQUERDA */}
          <div className="space-y-10 relative z-20 text-center lg:text-left pt-10 lg:pt-0">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#0F1012] border border-[#eeb32d]/30 rounded text-[#eeb32d] font-mono text-xs uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(238,179,45,0.15)] animate-fade-in-up">
              <span className="w-2 h-2 bg-[#eeb32d] rounded-full animate-pulse" />
              <span>System_Ready: <span className="text-white">v2.1</span></span>
            </div>
            
            <div className="relative">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black italic leading-[0.85] text-white tracking-tighter drop-shadow-2xl">
                {text}
                <span className="animate-blink ml-1 text-[#eeb32d]">_</span>
              </h1>
              <div className="h-1 w-24 bg-[#eeb32d] mt-6 mx-auto lg:mx-0" />
            </div>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed font-light mx-auto lg:mx-0">
              Não é apenas mira. É <strong className="text-white">inteligência de combate</strong>. 
              Acesse o protocolo de treinamento completo, do setup ao profissional.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <button onClick={() => onNavigate('plans')} className="group relative px-8 py-4 bg-[#eeb32d] hover:bg-[#dca020] text-black font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 clip-path-slant" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
                <div className="flex items-center justify-center gap-3">
                  <Crosshair className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
                  <span>Iniciar Operação</span>
                </div>
              </button>
              <button onClick={() => document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })} className="group px-8 py-4 bg-transparent border border-white/20 hover:border-[#eeb32d] hover:bg-[#eeb32d]/5 text-white font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
                <Terminal className="w-5 h-5 text-gray-400 group-hover:text-[#eeb32d]" />
                <span>Ver Briefing</span>
              </button>
            </div>
          </div>

          {/* COLUNA DIREITA: SKILL TREE */}
          <div className="relative h-[600px] lg:h-[800px] w-full flex items-center justify-center select-none scale-[0.65] sm:scale-[0.8] md:scale-90 lg:scale-100 origin-center lg:origin-top-right perspective-1000 mt-10 lg:mt-0">
             <div className="absolute inset-0 z-0">
               <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="gradTree" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#eeb32d" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
                    </linearGradient>
                    <filter id="glowTree"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                  
                  <g filter="url(#glowTree)" strokeLinecap="round" fill="none" strokeWidth="3">
                    <path d="M 50% 90% L 25% 75%" stroke="#eeb32d" opacity="0.4" />
                    <path d="M 50% 90% L 75% 75%" stroke="#f97316" opacity="0.4" />
                    <path d="M 25% 75% L 20% 55%" stroke="#eeb32d" opacity="0.3" />
                    <path d="M 25% 75% L 40% 55%" stroke="#eeb32d" opacity="0.3" />
                    <path d="M 75% 75% L 60% 55%" stroke="#f97316" opacity="0.3" />
                    <path d="M 75% 75% L 80% 55%" stroke="#f97316" opacity="0.3" />
                    <path d="M 20% 55% L 20% 35%" stroke="#eeb32d" opacity="0.2" strokeDasharray="5,5" />
                    <path d="M 80% 55% L 80% 35%" stroke="#f97316" opacity="0.2" strokeDasharray="5,5" />
                    <path d="M 50% 90% L 50% 15%" stroke="url(#gradTree)" strokeWidth="2" strokeDasharray="10,10" className="animate-[dash_30s_linear_infinite]" />
                  </g>
               </svg>
             </div>

             {modulesTree.map((mod) => (
                <div key={mod.id} className="absolute z-20 group hover:-translate-y-2 transition-transform duration-300 cursor-default" style={{ left: mod.x, top: mod.y, transform: 'translate(-50%, -50%)' }}>
                   <div className="bg-[#0F1012] border border-white/10 rounded-xl flex items-center justify-center shadow-lg relative z-10 group-hover:border-white/50 group-hover:bg-white/5 transition-colors" style={{ width: mod.size, height: mod.size, borderColor: `${mod.color}40` }}>
                     <mod.icon size={mod.size * 0.5} color={mod.color} />
                     {mod.id === 'm1' && <div className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-[#eeb32d]" />}
                   </div>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center whitespace-nowrap">
                      <span className="block text-[8px] font-black uppercase text-gray-600 tracking-widest leading-none mb-1 opacity-0 group-hover:opacity-100 transition-opacity">Módulo {mod.id.replace('m','')}</span>
                      <span className="block text-[10px] md:text-xs font-bold uppercase tracking-wider bg-[#0F1012]/80 px-2 py-1 rounded border border-white/10 backdrop-blur-sm" style={{ color: mod.color }}>{mod.label}</span>
                   </div>
                </div>
             ))}

             {/* PLATAFORMAS FLUTUANTES */}
             <div className="absolute top-[30%] left-[10%] z-30 flex items-center gap-3 animate-[float_6s_ease-in-out_infinite]">
                <div className="w-12 h-12 bg-[#eeb32d]/10 border border-[#eeb32d] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(238,179,45,0.3)]"><Trophy size={20} className="text-[#eeb32d]" /></div>
                <div className="text-left"><p className="text-[9px] font-black text-[#eeb32d] uppercase tracking-widest">GC Lvl 20</p><div className="h-0.5 w-8 bg-[#eeb32d] rounded-full"></div></div>
             </div>

             <div className="absolute top-[30%] right-[10%] z-30 flex flex-row-reverse items-center gap-3 animate-[float_6s_ease-in-out_infinite] delay-1000">
                <div className="w-12 h-12 bg-[#f97316]/10 border border-[#f97316] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]"><TrendingUp size={20} className="text-[#f97316]" /></div>
                <div className="text-right"><p className="text-[9px] font-black text-[#f97316] uppercase tracking-widest">Faceit Lvl 10</p><div className="h-0.5 w-8 bg-[#f97316] ml-auto rounded-full"></div></div>
             </div>

             <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-40 text-center">
                <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-500">
                   <div className="absolute -inset-8 bg-[#eeb32d] opacity-10 blur-2xl rounded-full group-hover:opacity-30 transition-opacity"></div>
                   <Zap size={64} className="text-[#eeb32d] drop-shadow-[0_0_15px_rgba(238,179,45,1)] relative z-10 fill-[#eeb32d]" />
                   <div className="mt-4 bg-[#eeb32d] text-black px-4 py-1 rounded skew-x-[-12deg] shadow-lg"><span className="block text-xl font-black italic uppercase skew-x-[12deg]">PRO PLAYER</span></div>
                </div>
             </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } } @keyframes dash { to { stroke-dashoffset: -1000; } } @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } } @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } } .animate-blink { animation: blink 1s step-end infinite; }`}</style>
    </div>
  );
};

export default Hero;