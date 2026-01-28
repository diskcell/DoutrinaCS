import React from 'react';
import { Crosshair, Monitor, TrendingUp, Brain, BookOpen, Zap } from 'lucide-react';

const briefingItems = [
  {
    icon: <Crosshair className="w-8 h-8 text-[#eeb32d]" />,
    title: "MIRA E REFLEXOS",
    points: [
      "Controle de Recoil Profissional",
      "Pré-aim e Posicionamento de Crosshair",
      "Flick Shots e Tracking de Alvos"
    ]
  },
  {
    icon: <Monitor className="w-8 h-8 text-[#eeb32d]" />,
    title: "TÁTICAS DE MAPA",
    points: [
      "Smokes Essenciais na Mirage e Inferno",
      "Pop-flashes para dominar bombs",
      "Wallbangs e Spots secretos"
    ]
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-[#eeb32d]" />,
    title: "ECONÔMICO E ESTRATÉGIA",
    points: [
      "Gestão de Economia de Time",
      "Leitura de Mid-round",
      "Estratégias de Pistol e Forçados"
    ]
  },
  {
    icon: <Brain className="w-8 h-8 text-[#eeb32d]" />,
    title: "PSICOLOGIA DE JOGO",
    points: [
      "Controle de Stress e Tilt",
      "Comunicação Eficiente",
      "Liderança e Clutches 1vX"
    ]
  },
  {
    icon: <BookOpen className="w-8 h-8 text-[#eeb32d]" />,
    title: "ANÁLISE DE DEMOS",
    points: [
      "Como analisar seus próprios erros",
      "Estudo de jogadas dos Pro Players",
      "Identificação de padrões inimigos"
    ]
  },
  {
    icon: <Zap className="w-8 h-8 text-[#eeb32d]" />,
    title: "CONFIGURAÇÕES DE ELITE",
    points: [
      "Sensibilidade e DPI ideais",
      "Configurações de Lançamento",
      "Scripts de Treino e Warmup"
    ]
  }
];

const MissionBriefing: React.FC = () => {
  return (
    <section className="py-20 bg-[#0F1012] relative overflow-hidden">
      {/* Background Decor - Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white uppercase italic tracking-wide">
            BRIEFING DA <span className="text-[#eeb32d] border-b-4 border-[#eeb32d]">MISSÃO</span>
          </h2>
          <div className="w-24 h-1 bg-[#eeb32d] mx-auto mt-2 rounded-full hidden"></div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {briefingItems.map((item, index) => (
            <div 
              key={index}
              className="bg-[#131315] border border-white/5 rounded-lg p-8 hover:border-[#eeb32d]/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] group"
            >
              <div className="mb-6 p-3 bg-black/40 w-fit rounded-lg border border-white/5 group-hover:border-[#eeb32d]/20 transition-colors">
                {item.icon}
              </div>
              
              <h3 className="text-xl font-display font-bold text-white uppercase italic mb-6 tracking-wide group-hover:text-[#eeb32d] transition-colors">
                {item.title}
              </h3>
              
              <ul className="space-y-3">
                {item.points.map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-gray-400 text-sm">
                    <span className="w-1.5 h-1.5 bg-[#eeb32d] rounded-full mt-1.5 shrink-0"></span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionBriefing;