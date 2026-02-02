import React, { useState } from 'react';
import { Target, Map, Brain, Users, ChevronDown, Lock, MonitorPlay, Settings, Shield, MousePointer2, Trophy, Star, Zap } from 'lucide-react';

interface Lesson {
  title: string;
  duration: string;
}

interface Module {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  lessons: Lesson[];
  level: string;
}

const modules: Module[] = [
  {
    id: "m1",
    title: "1. Configurações e Ambiente",
    subtitle: "Performance vem de setup",
    icon: <Settings className="w-8 h-8 text-[#eeb32d]" />,
    description: "Aprenda a extrair cada gota de performance do seu hardware. Do Windows às binds ocultas dos profissionais.",
    level: "Setup de Elite",
    lessons: [
      { title: "Aula 1: Configurações do Jogo (Vídeo, Áudio, Crosshair, VM, Binds)", duration: "25:40" },
      { title: "Aula 2: Setup Físico (Monitor Hz, Mouse, Teclado, Headset)", duration: "12:15" },
      { title: "Aula 3: Sistema e Latência (Otimização, Input Lag, Rede, FPS)", duration: "18:30" }
    ]
  },
  {
    id: "m2",
    title: "2. Fundamentos do CS2",
    subtitle: "A base obrigatória",
    icon: <Shield className="w-8 h-8 text-[#eeb32d]" />,
    description: "Aqui nasce o jogador competitivo. Entenda o fluxo financeiro e o ritmo de jogo que separa os amadores dos veteranos.",
    level: "Base Sólida",
    lessons: [
      { title: "Aula 4: Economia (Eco, Half, Force, Full Buy e Resets)", duration: "22:00" },
      { title: "Aula 5: Leitura de Economia e Game Sense (Round Feeling)", duration: "19:45" }
    ]
  },
  {
    id: "m3",
    title: "3. Mecânica e Mira",
    subtitle: "Transformando decisão em kill",
    icon: <MousePointer2 className="w-8 h-8 text-[#eeb32d]" />,
    description: "Domine a memória muscular. Aprenda a diferença entre Tap, Burst e Spray, e como treinar como um profissional.",
    level: "Mecânica Pura",
    lessons: [
      { title: "Aula 6: Fundamentos de Mira (Sensibilidade, eDPI e Placement)", duration: "15:20" },
      { title: "Aula 7: Teoria do Aim (Taps, Bursts, Spray e Recoil Control)", duration: "24:10" },
      { title: "Aula 8: Treinos Práticos (Aimbotz, Prefire, Flicks, Tracking)", duration: "30:00" },
      { title: "Aula 9: Rotina de Treino e Warm-up Diário", duration: "14:50" }
    ]
  },
  {
    id: "m4",
    title: "4. Lógica e Game Sense",
    subtitle: "Vencendo sem precisar atirar",
    icon: <Brain className="w-8 h-8 text-[#eeb32d]" />,
    description: "Entenda o mapa como um tabuleiro. Posicionamento, timings e leitura de comportamento adversário.",
    level: "QI de Jogo",
    lessons: [
      { title: "Aula 10: Estudo de Mapas (Callouts, Controle e Timings)", duration: "28:15" },
      { title: "Aula 11: Posicionamento Inteligente e Trade Kills", duration: "21:30" },
      { title: "Aula 12: Leitura do Inimigo e Antecipação de Jogadas", duration: "19:00" }
    ]
  },
  {
    id: "m5",
    title: "5. Utilitários e Avançado",
    subtitle: "O diferencial tático",
    icon: <Target className="w-8 h-8 text-[#eeb32d]" />,
    description: "Granadas que ganham rounds. Pixels, wallbangs, boosts e as mecânicas que definem o meta atual.",
    level: "Tático Avançado",
    lessons: [
      { title: "Aula 13: Fundamentos de Granadas (Smoke, Flash, HE, Molotov)", duration: "16:40" },
      { title: "Aula 14: Granadas por Mapa (Retakes, Execuções, Anti-rush)", duration: "35:00" },
      { title: "Aula 15: Mecânicas Pro (Pixels, Wallbangs, Boosts, One-ways)", duration: "24:20" }
    ]
  },
  {
    id: "m6",
    title: "6. Evolução Real (Demos)",
    subtitle: "A ciência da autocrítica",
    icon: <MonitorPlay className="w-8 h-8 text-[#eeb32d]" />,
    description: "Analise seu jogo como um coach. Identifique padrões, corrija erros recorrentes e estude os melhores do mundo.",
    level: "Analítico",
    lessons: [
      { title: "Aula 16: Como assistir Demos Corretamente (O que analisar)", duration: "15:10" },
      { title: "Aula 17: Análise da Própria Demo (Lista de Erros)", duration: "27:30" },
      { title: "Aula 18: Estudo de Demos de Profissionais (O que copiar)", duration: "22:15" }
    ]
  },
  {
    id: "m7",
    title: "7. Psicológico e Mentalidade",
    subtitle: "Mente blindada",
    icon: <Users className="w-8 h-8 text-[#eeb32d]" />,
    description: "Não tilte. Aprenda a manter o foco, liderar seu time e tomar decisões sob pressão extrema.",
    level: "Mindset Profissional",
    lessons: [
      { title: "Aula 19: Foco Máximo e Consistência Mental", duration: "18:00" },
      { title: "Aula 20: Controle Emocional (Ansiedade, Stress e Tilt)", duration: "23:45" },
      { title: "Aula 21: Comunicação, Liderança e Calls em Clutch", duration: "20:10" },
      { title: "Aula 22: Controle do Cérebro e Decisão sob Pressão", duration: "16:30" }
    ]
  },
  {
    id: "m8",
    title: "8. Caminho para o PRO",
    subtitle: "O ouro do diferencial",
    icon: <Trophy className="w-8 h-8 text-[#eeb32d]" />,
    description: "O guia final para quem quer viver de CS. De como subir na Faceit até entrar em organizações profissionais.",
    level: "Carreira & Elite",
    lessons: [
      { title: "Aula 23: Rotina Competitiva, Scrims e Campeonatos", duration: "45:00" }
    ]
  }
];

interface CourseCurriculumProps {
  onNavigate: (page: string) => void;
}

const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ onNavigate }) => {
  const [activeModule, setActiveModule] = useState<string | null>("m1");

  const toggleModule = (id: string) => {
    setActiveModule(activeModule === id ? null : id);
  };

  return (
    <section id="course" className="py-24 bg-[#0F1012] relative">
      {/* Background Tech Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(238, 179, 45, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(238, 179, 45, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
           <div className="inline-flex items-center space-x-2 bg-[#eeb32d]/10 border border-[#eeb32d]/20 rounded-full px-4 py-1 mb-4">
            <Zap className="w-4 h-4 text-[#eeb32d]" />
            <span className="text-xs font-bold tracking-widest text-[#eeb32d] uppercase">Conteúdo Programático</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white uppercase italic">
            O Arsenal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eeb32d] to-[#ff8e25]">Completo</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            Mais de 40 horas de conteúdo focado em transformar você em um jogador Tier 1. Uma biblioteca tática sem precedentes no Brasil.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Module List (Left Side) */}
          <div className="lg:col-span-7 space-y-4">
            {modules.map((module) => (
              <div 
                key={module.id}
                className={`border rounded-lg transition-all duration-300 overflow-hidden group ${
                  activeModule === module.id 
                    ? 'bg-[#18181b] border-[#eeb32d] shadow-[0_0_20px_rgba(238,179,45,0.1)]' 
                    : 'bg-[#131315] border-white/5 hover:border-white/20'
                }`}
              >
                <button 
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-6 flex items-start sm:items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-md transition-colors ${activeModule === module.id ? 'bg-[#eeb32d]/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      {module.icon}
                    </div>
                    <div>
                      <h3 className={`font-display font-bold text-xl uppercase ${activeModule === module.id ? 'text-white' : 'text-gray-300'}`}>
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">{module.subtitle}</p>
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-300 ${activeModule === module.id ? 'rotate-180 text-[#eeb32d]' : 'text-gray-500'}`}>
                    <ChevronDown size={24} />
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeModule === module.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 border-t border-white/5">
                    <p className="text-gray-400 mb-6 mt-4 text-sm leading-relaxed border-l-2 border-[#eeb32d] pl-4">
                      {module.description}
                    </p>
                    <div className="bg-black/30 rounded-lg p-1">
                      {module.lessons.map((lesson, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0 group/lesson">
                           <div className="flex items-center gap-3">
                             <div className="w-6 h-6 rounded-full bg-[#eeb32d]/10 flex items-center justify-center text-[#eeb32d] text-xs font-bold">
                               {idx + 1}
                             </div>
                             <span className="text-gray-300 text-sm group-hover/lesson:text-white transition-colors">{lesson.title}</span>
                           </div>
                           <span className="text-xs text-gray-600 font-mono bg-black/50 px-2 py-1 rounded">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                       <span className="text-[10px] uppercase font-bold tracking-widest text-[#eeb32d] bg-[#eeb32d]/10 px-3 py-1 rounded-full">
                         {module.level}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Bonuses & CTA */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#eeb32d] p-1 rounded-lg shadow-[0_0_40px_rgba(238,179,45,0.2)] sticky top-28">
               <div className="bg-[#18181b] p-8 rounded text-center">
                  <div className="flex justify-center mb-6">
                    <Star className="w-12 h-12 text-[#eeb32d] fill-[#eeb32d] animate-pulse" />
                  </div>
                  <h4 className="text-white font-display font-bold text-2xl mb-2">ACESSO IMEDIATO</h4>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">Libere agora as 23 aulas e comece sua trajetória rumo ao Nível 20 GC / Lvl 10 Faceit.</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-left bg-white/5 p-3 rounded border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-300">Suporte 24/7 via Discord</span>
                    </div>
                    <div className="flex items-center gap-3 text-left bg-white/5 p-3 rounded border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-300">Planilhas de Treino Inclusas</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onNavigate('plans')}
                    className="w-full bg-[#eeb32d] hover:bg-[#ffaa00] text-black font-bold font-display text-xl py-5 uppercase tracking-wider skew-x-[-6deg] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#eeb32d]/20"
                  >
                    <span className="skew-x-[6deg] flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      Escolher Plano
                    </span>
                  </button>
                  <p className="text-gray-600 text-[10px] mt-4 uppercase font-bold tracking-widest">Garantia de 7 dias ou seu dinheiro de volta</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseCurriculum;