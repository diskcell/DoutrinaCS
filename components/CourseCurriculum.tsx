import React, { useState } from 'react';
import { Target, Map, Brain, Users, ChevronDown, ChevronUp, Lock, MonitorPlay } from 'lucide-react';

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
    title: "Mecânica de Elite",
    subtitle: "A arte da trocação",
    icon: <Target className="w-8 h-8 text-[#eeb32d]" />,
    description: "Pare de pinar. Aprenda a memória muscular correta para ter uma mira limpa e letal.",
    level: "Fundamento Essencial",
    lessons: [
      { title: "Configurando a Sensibilidade Perfeita (EDPI)", duration: "12:00" },
      { title: "O Segredo do Counter-Strafe", duration: "18:45" },
      { title: "Recoil Control: AK-47 e M4", duration: "22:10" },
      { title: "Pré-fire e Crosshair Placement", duration: "15:30" },
      { title: "Pistol Round: A importância do Glock/USP", duration: "10:20" },
      { title: "AWP: Flick, Quick-scope e Posicionamento", duration: "25:00" }
    ]
  },
  {
    id: "m2",
    title: "Mestre dos Utilitários",
    subtitle: "Domine o mapa",
    icon: <Map className="w-8 h-8 text-[#eeb32d]" />,
    description: "Uma flash bem dada vale mais que uma kill. Aprenda o pixel de cada granada no meta atual.",
    level: "Tático Avançado",
    lessons: [
      { title: "Mirage: Execuções A e B (Smokes)", duration: "20:00" },
      { title: "Inferno: Domínio de Banana e Apps", duration: "24:15" },
      { title: "Nuke: Rotações e Smokes de Outside", duration: "18:30" },
      { title: "Pop-flashes que cegam 100%", duration: "12:45" },
      { title: "Molotovs para tirar posições fortes", duration: "14:20" },
      { title: "Granadas de One-way (O segredo)", duration: "16:10" }
    ]
  },
  {
    id: "m3",
    title: "QI de Jogo (Gamesense)",
    subtitle: "Pense como um Pro",
    icon: <Brain className="w-8 h-8 text-[#eeb32d]" />,
    description: "Entenda o que o inimigo vai fazer antes dele fazer. Leitura de jogo, timing e economia.",
    level: "Estratégia Pura",
    lessons: [
      { title: "Economia: Quando forçar e quando economizar", duration: "15:00" },
      { title: "Lurker vs Entry Fragger: Funções", duration: "20:30" },
      { title: "Leitura de Mapa e Rotações", duration: "22:00" },
      { title: "Pós-plant: Como garantir o round", duration: "18:00" },
      { title: "Clutch Master: Jogando 1v2, 1v3", duration: "25:45" },
      { title: "Análise de Demos: Identificando erros", duration: "30:00" }
    ]
  },
  {
    id: "m4",
    title: "Teamplay & Mentalidade",
    subtitle: "Rumo ao Global",
    icon: <Users className="w-8 h-8 text-[#eeb32d]" />,
    description: "Como se comunicar, evitar tilt e liderar seu time para a vitória dentro do servidor.",
    level: "Liderança",
    lessons: [
      { title: "Comunicação Limpa (Callouts)", duration: "12:00" },
      { title: "Trade Kill: A matemática do CS", duration: "14:00" },
      { title: "Controle Emocional: Não tilte", duration: "18:00" },
      { title: "Como treinar em time", duration: "15:30" },
      { title: "Rotina de Aquecimento Pro", duration: "10:00" }
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
            <MonitorPlay className="w-4 h-4 text-[#eeb32d]" />
            <span className="text-xs font-bold tracking-widest text-[#eeb32d] uppercase">Conteúdo Programático</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white uppercase italic">
            O Arsenal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eeb32d] to-[#ff8e25]">Completo</span>
          </h2>
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            Mais de 40 horas de conteúdo gravado em 4K. Uma biblioteca de conhecimento tático que separa os amadores dos profissionais.
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

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeModule === module.id ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                         Nível: {module.level}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Bonuses & CTA */}
          <div className="lg:col-span-5 space-y-8">
            {/* Sticky Call to Action */}
            <div className="bg-[#eeb32d] p-1 rounded-lg shadow-[0_0_40px_rgba(238,179,45,0.2)]">
               <div className="bg-[#18181b] p-6 rounded text-center">
                  <h4 className="text-white font-display font-bold text-xl mb-1">PRONTO PARA SUBIR DE PATENTE?</h4>
                  <p className="text-gray-400 text-xs mb-4">Acesso imediato a todas as 40+ aulas</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-gray-500 line-through text-sm">R$ 497</span>
                    <span className="text-3xl font-bold text-white">R$ 197</span>
                  </div>

                  <button 
                    onClick={() => onNavigate('plans')}
                    className="w-full bg-[#eeb32d] hover:bg-[#dca020] text-black font-bold font-display text-xl py-4 uppercase tracking-wider skew-x-[-6deg] transition-transform hover:scale-105 active:scale-95"
                  >
                    <span className="skew-x-[6deg] flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      Destravar Acesso
                    </span>
                  </button>
                  <p className="text-gray-600 text-[10px] mt-3">Pagamento único • Acesso vitalício ao conteúdo base</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseCurriculum;