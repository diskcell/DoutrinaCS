
import React from 'react';
import { Trophy, TrendingUp, Target, Brain, Shield, MousePointer2, Settings, Users, ChevronRight, MonitorPlay } from 'lucide-react';

interface HeroProps {
  onNavigate: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-[#0F1012]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1012] via-[#0F1012]/95 to-[#0F1012]/90 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
          alt="CS2 Background" 
          className="w-full h-full object-cover opacity-30 scale-110"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20 z-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 relative h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
          
          {/* Left Column: Text & CTA */}
          <div className="space-y-8 animate-fade-in-up relative z-20">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#eeb32d]/10 border border-[#eeb32d]/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eeb32d] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#eeb32d]"></span>
                </span>
                <span className="text-[10px] font-black tracking-[0.2em] text-[#eeb32d] uppercase">Operação Doutrina CS2</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-display font-black uppercase italic leading-[0.85] text-white tracking-tighter mb-6 text-glow">
                Domine o <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eeb32d] via-[#f5d061] to-[#fff]">
                  Servidor
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 max-w-lg leading-relaxed border-l-2 border-[#eeb32d]/50 pl-6">
                O guia tático definitivo para jogadores que buscam o topo da <strong>GamersClub</strong> e <strong>Faceit</strong>. Aprenda com quem vive o jogo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => onNavigate('plans')}
                className="relative overflow-hidden bg-[#eeb32d] hover:bg-[#ffaa00] text-black font-bold font-display text-xl py-5 px-12 skew-x-[-12deg] transition-all hover:scale-105 shadow-[0_0_40px_rgba(238,179,45,0.4)] group"
              >
                <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[12deg]"></div>
                <span className="skew-x-[12deg] flex items-center justify-center gap-3">
                  RECUTRAMENTO IMEDIATO
                  <ChevronRight className="w-6 h-6 stroke-[4]" />
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Skill Tree */}
          <div className="relative h-[850px] w-[700px] mx-auto hidden lg:flex items-center justify-center select-none scale-90 origin-center">
             
             {/* Layer 0: Conexões (Ficam atrás de tudo) */}
             <div className="absolute inset-0 z-0">
               <svg className="w-full h-full" viewBox="0 0 700 850">
                  {/* Base connections */}
                  <path d="M 350 780 Q 350 730 250 730 L 220 730" fill="none" stroke="#eeb32d" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 350 780 Q 350 730 450 730 L 480 730" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />

                  {/* Vertical paths to GC and Faceit (Adjusted for new top pos) */}
                  <path d="M 180 680 L 180 370 Q 180 320 140 320" fill="none" stroke="#eeb32d" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 520 680 L 520 370 Q 520 320 560 320" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
                  
                  {/* Module level paths */}
                  <path d="M 100 480 L 260 480" fill="none" stroke="#eeb32d" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 440 480 L 600 480" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />

                  {/* Top paths toward Objective (Adjusted to be more stretched) */}
                  <path d="M 120 280 Q 120 120 250 120" fill="none" stroke="#eeb32d" strokeWidth="8" strokeLinecap="round" className="opacity-40" />
                  <path d="M 580 280 Q 580 120 450 120" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" className="opacity-40" />
               </svg>
             </div>

             {/* Layer 1: Módulos Inferiores (z-10 a z-40) */}
             <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 z-40">
                <div className="bg-[#eeb32d] text-black px-6 py-3 rounded-lg shadow-[0_0_50px_rgba(238,179,45,0.7)] flex flex-col items-center border-b-4 border-black/30 group hover:scale-105 transition-transform cursor-pointer">
                   <Settings size={28} className="text-black mb-1 animate-spin-slow" />
                   <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">Módulo 1</span>
                   <span className="font-display font-black text-lg uppercase leading-none">Configurações</span>
                </div>
             </div>

             <div className="absolute bottom-[130px] left-[135px] z-30 group flex flex-col items-center">
                <div className="w-22 h-22 bg-[#eeb32d] rounded-full border-4 border-[#0F1012] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer p-5">
                   <Shield size={44} className="text-black" />
                </div>
                <div className="text-center mt-2">
                   <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Módulo 2</span>
                   <span className="block font-display font-black text-white uppercase text-xl leading-none">Fundamentos</span>
                </div>
             </div>

             <div className="absolute bottom-[130px] right-[135px] z-30 group flex flex-col items-center">
                <div className="w-22 h-22 bg-[#f97316] rounded-full border-4 border-[#0F1012] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer p-5">
                   <MousePointer2 size={44} className="text-white" />
                </div>
                <div className="text-center mt-2">
                   <span className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Módulo 3</span>
                   <span className="block font-display font-black text-white uppercase text-xl leading-none">Mecânica</span>
                </div>
             </div>

             <div className="absolute top-[440px] left-[65px] z-40 group text-center">
                <div className="w-16 h-16 bg-[#eeb32d] rounded-xl flex items-center justify-center mb-2 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                   <Brain size={32} className="text-black" />
                </div>
                <div className="bg-[#131315] border border-white/20 px-4 py-1.5 rounded-md">
                   <p className="text-[8px] font-black text-gray-500 uppercase leading-none mb-1">Módulo 4</p>
                   <p className="text-xs font-bold text-white uppercase">Lógica</p>
                </div>
             </div>

             <div className="absolute top-[440px] left-[225px] z-40 group text-center">
                <div className="w-16 h-16 bg-[#eeb32d] rounded-xl flex items-center justify-center mb-2 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                   <Target size={32} className="text-black" />
                </div>
                <div className="bg-[#131315] border border-white/20 px-4 py-1.5 rounded-md">
                   <p className="text-[8px] font-black text-gray-500 uppercase leading-none mb-1">Módulo 5</p>
                   <p className="text-xs font-bold text-white uppercase">Utilitários</p>
                </div>
             </div>

             <div className="absolute top-[440px] right-[225px] z-40 group text-center">
                <div className="w-16 h-16 bg-[#f97316] rounded-xl flex items-center justify-center mb-2 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                   <MonitorPlay size={32} className="text-white" />
                </div>
                <div className="bg-[#131315] border border-white/20 px-4 py-1.5 rounded-md">
                   <p className="text-[8px] font-black text-gray-500 uppercase leading-none mb-1">Módulo 6</p>
                   <p className="text-xs font-bold text-white uppercase">Análise Demos</p>
                </div>
             </div>

             <div className="absolute top-[440px] right-[65px] z-40 group text-center">
                <div className="w-16 h-16 bg-[#f97316] rounded-xl flex items-center justify-center mb-2 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                   <Users size={32} className="text-white" />
                </div>
                <div className="bg-[#131315] border border-white/20 px-4 py-1.5 rounded-md">
                   <p className="text-[8px] font-black text-gray-500 uppercase leading-none mb-1">Módulo 7</p>
                   <p className="text-xs font-bold text-white uppercase">Psicológico</p>
                </div>
             </div>

             {/* Layer 2: GamersClub & Faceit (Z-INDEX 50 - Lowered to increase gap with objective) */}
             <div className="absolute top-[280px] left-[40px] z-50 flex items-center group">
                <div className="w-20 h-20 bg-[#eeb32d] rounded-full border-4 border-[#131315] flex items-center justify-center shadow-[0_0_50px_rgba(238,179,45,0.8)] group-hover:scale-110 transition-transform relative z-20">
                   <Trophy size={36} className="text-black" />
                </div>
                <div className="bg-[#18181b] border border-[#eeb32d]/40 pl-14 pr-8 py-4 -ml-12 rounded-r-xl shadow-2xl relative z-10">
                   <p className="text-sm font-display font-black text-white uppercase leading-none">GAMERSCLUB</p>
                   <p className="text-[10px] font-black text-[#eeb32d] uppercase tracking-widest mt-1">LEVEL 20</p>
                </div>
             </div>

             <div className="absolute top-[280px] right-[40px] z-50 flex flex-row-reverse items-center group">
                <div className="w-20 h-20 bg-[#f97316] rounded-full border-4 border-[#131315] flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.8)] group-hover:scale-110 transition-transform relative z-20">
                   <TrendingUp size={36} className="text-white" />
                </div>
                <div className="bg-[#18181b] border border-[#f97316]/40 pr-14 pl-8 py-4 -mr-12 rounded-l-xl shadow-2xl text-right relative z-10">
                   <p className="text-sm font-display font-black text-white uppercase leading-none">FACEIT</p>
                   <p className="text-[10px] font-black text-[#f97316] uppercase tracking-widest mt-1">LEVEL 10</p>
                </div>
             </div>

             {/* Layer 3: Objetivo Final (Z-INDEX 60 - Pushed higher) */}
             <div className="absolute top-[10px] left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center">
                <div className="relative mb-3">
                   <div className="absolute inset-0 bg-[#eeb32d] blur-3xl opacity-30 animate-pulse"></div>
                   <Trophy size={100} className="text-[#eeb32d] drop-shadow-[0_0_30px_rgba(238,179,45,1)]" />
                </div>
                <div className="bg-[#1a1a1e] border-2 border-[#eeb32d]/50 px-12 py-4 rounded text-center shadow-[0_0_40px_rgba(0,0,0,0.8)] skew-x-[-12deg] relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                   <div className="skew-x-[12deg]">
                      <p className="text-[10px] font-black text-[#eeb32d] uppercase tracking-[0.3em] border-b border-white/10 pb-1 mb-1">Objetivo Final</p>
                      <p className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">Campeonatos</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(238, 179, 45, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Hero;
