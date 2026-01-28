import React from 'react';
import { Check, TrendingUp, Trophy } from 'lucide-react';

interface HeroProps {
  onNavigate: (page: string) => void;
}

const featuresList = [
  "Comunidade exclusiva no Discord",
  "Turma fechada: Apenas 20 vagas",
  "3 Campeonatos Internos",
  "15 Meses de Acesso",
  "Do Prata ao Global",
  "Reembolso garantido em 7 dias"
];

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen cs2-bg flex items-center pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">Vagas Abertas - Season 4</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold uppercase italic leading-none text-white drop-shadow-lg">
                Treinamento <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eeb32d] to-[#ff8e25]">
                  Counter-Strike 2
                </span>
              </h1>
              <p className="mt-4 text-lg text-gray-400 max-w-lg leading-relaxed border-l-4 border-[#eeb32d] pl-4">
                Deixe de ser carregado. Aprimore suas habilidades, entenda a economia, domine as smokes e conquiste o Global com nossa metodologia comprovada.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuresList.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div className="bg-[#eeb32d]/10 p-1 rounded">
                    <Check className="w-4 h-4 text-[#eeb32d]" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => onNavigate('course')}
                className="flex-1 bg-gradient-to-r from-[#eeb32d] to-[#dca020] text-black font-bold font-display text-xl py-4 px-8 skew-x-[-12deg] hover:translate-y-[-2px] transition-all shadow-[0_0_30px_rgba(238,179,45,0.4)] flex items-center justify-center group"
              >
                <span className="skew-x-[12deg] flex items-center gap-2">
                  INICIAR JORNADA 
                  <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button 
                onClick={() => onNavigate('course')}
                className="flex-1 border border-white/20 hover:border-[#eeb32d] bg-white/5 hover:bg-white/10 text-white font-bold font-display text-xl py-4 px-8 skew-x-[-12deg] transition-all flex items-center justify-center"
              >
                <span className="skew-x-[12deg]">VER EMENTA</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              *Promoção por tempo limitado. Junte-se a mais de 5.000 alunos.
            </p>
          </div>

          {/* Right Column: Visual Representation of Progression */}
          <div className="relative hidden lg:block h-full min-h-[500px]">
             {/* Abstract Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#eeb32d]/5 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col justify-center h-full space-y-6">
              {/* Card 1: Beginner */}
              <div className="relative transform translate-x-4 bg-[#18181b] border border-white/10 p-4 rounded-lg flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity duration-500">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-400">1</div>
                <div>
                  <h3 className="font-display font-bold text-lg text-gray-300">Nível 1: Fundamentos</h3>
                  <p className="text-xs text-gray-500">Aim, Crosshair Placement, Config</p>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="w-1 h-8 bg-gray-800 ml-10"></div>

              {/* Card 2: Intermediate */}
              <div className="relative bg-[#18181b] border border-white/10 p-5 rounded-lg flex items-center gap-4 opacity-80 shadow-lg">
                <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center font-bold text-white border-2 border-gray-500">10</div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white">Intermediário: Gamesense</h3>
                  <p className="text-sm text-gray-400">Utilitários, Entry Fragger, Trade</p>
                </div>
              </div>

              {/* Connecting Line Active */}
              <div className="w-1 h-8 bg-gradient-to-b from-gray-800 to-[#eeb32d] ml-11"></div>

              {/* Card 3: Pro (Active) */}
              <div className="relative transform -translate-x-4 bg-gradient-to-r from-[#2a2a2e] to-[#1a1a1c] border border-[#eeb32d] p-6 rounded-lg flex items-center gap-5 shadow-[0_0_20px_rgba(238,179,45,0.15)]">
                <div className="absolute -right-3 -top-3 bg-[#eeb32d] text-black text-xs font-bold px-2 py-1 rounded skew-x-[-10deg]">
                  OBJETIVO
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#eeb32d] to-[#dca020] rounded-full flex items-center justify-center text-black">
                   <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-white uppercase italic">Nível 20: Pro Player</h3>
                  <p className="text-sm text-[#eeb32d]">Teamplay, IGL, Clutch Master</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">FACEIT LVL 10</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">GC LVL 20</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;