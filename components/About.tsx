import React from 'react';
import { Target, Brain, Shield, Zap, Users, Crosshair, ChevronRight, BookOpen, Layers } from 'lucide-react';

// Adicionamos a tipagem correta para a navegação
interface AboutProps {
  onNavigate: (page: string) => void;
}

const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0F1012] pt-24 pb-12 relative overflow-hidden selection:bg-[#eeb32d] selection:text-black">
      
      {/* Background Tático Sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
           style={{ backgroundImage: 'linear-gradient(#eeb32d 1px, transparent 1px), linear-gradient(90deg, #eeb32d 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* --- CABEÇALHO --- */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#eeb32d]/30 bg-[#eeb32d]/5 text-[#eeb32d] text-xs font-bold uppercase tracking-[0.2em]">
            <span className="w-2 h-2 bg-[#eeb32d] rounded-full animate-pulse" />
            Briefing da Missão
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase italic tracking-tighter">
            Sobre a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eeb32d] to-[#f5d061]">Doutrina CS</span>
          </h1>
          <div className="h-1 w-24 bg-[#eeb32d] mx-auto rounded-full" />
        </div>

        {/* --- O PROPÓSITO (MANIFESTO) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
            <p className="font-light">
              <strong className="text-white">A Doutrina CS nasceu com um propósito claro:</strong> ensinar Counter-Strike da forma certa, com método, estrutura e progressão real — do básico ao nível profissional.
            </p>
            <p>
              Aqui não trabalhamos com dicas soltas ou atalhos milagrosos. Nosso foco é construir uma base sólida de conhecimento, corrigir erros comuns e guiar o jogador por um caminho claro de evolução.
            </p>
            <div className="pl-4 border-l-4 border-[#eeb32d] italic text-white/80 bg-white/5 p-4 rounded-r">
              "Se você quer apenas 'jogar por jogar', talvez este não seja o lugar certo. Mas se você quer entender o jogo e evoluir com mentalidade competitiva, você está no lugar certo."
            </div>
          </div>
          
          {/* Card Visual "O que Somos" */}
          <div className="bg-[#1a1a1e] border border-[#eeb32d]/20 p-8 rounded-xl relative group hover:border-[#eeb32d]/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target size={100} />
            </div>
            <h3 className="text-2xl font-display font-black text-white uppercase mb-4 flex items-center gap-2">
              <Shield className="text-[#eeb32d]" /> O que Somos
            </h3>
            <p className="text-gray-400 mb-6">
              Somos uma plataforma educacional dedicada ao Counter-Strike, organizada em aulas e módulos progressivos.
            </p>
            <ul className="space-y-3">
              {[
                "Iniciantes buscando base sólida",
                "Jogadores travados no mesmo elo",
                "Competitivos buscando consistência",
                "Foco em método e disciplina"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                  <div className="w-1.5 h-1.5 bg-[#eeb32d] rounded-full" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- METODOLOGIA (GRID) --- */}
        <div className="mb-20">
          <h2 className="text-3xl font-display font-black text-white uppercase italic mb-8 flex items-center gap-3">
            <Layers className="text-[#eeb32d]" /> Como Funciona o Ensino
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#0F1012] border border-white/10 p-6 rounded hover:border-[#eeb32d] transition-all group">
              <div className="w-12 h-12 bg-[#eeb32d]/10 rounded-lg flex items-center justify-center mb-4 text-[#eeb32d] group-hover:bg-[#eeb32d] group-hover:text-black transition-colors">
                <BookOpen size={24} />
              </div>
              <h4 className="text-xl font-bold text-white uppercase mb-2">Do Básico</h4>
              <p className="text-gray-400 text-sm">
                Fundamentos, mecânicas essenciais e configurações corretas. A base que sustenta todo o resto.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0F1012] border border-white/10 p-6 rounded hover:border-[#eeb32d] transition-all group">
              <div className="w-12 h-12 bg-[#eeb32d]/10 rounded-lg flex items-center justify-center mb-4 text-[#eeb32d] group-hover:bg-[#eeb32d] group-hover:text-black transition-colors">
                <Crosshair size={24} />
              </div>
              <h4 className="text-xl font-bold text-white uppercase mb-2">A Evolução</h4>
              <p className="text-gray-400 text-sm">
                Leitura de jogo, posicionamento, noções táticas e funções dentro do time. Onde o jogo vira xadrez.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0F1012] border border-white/10 p-6 rounded hover:border-[#eeb32d] transition-all group">
              <div className="w-12 h-12 bg-[#eeb32d]/10 rounded-lg flex items-center justify-center mb-4 text-[#eeb32d] group-hover:bg-[#eeb32d] group-hover:text-black transition-colors">
                <Brain size={24} />
              </div>
              <h4 className="text-xl font-bold text-white uppercase mb-2">Ao Profissional</h4>
              <p className="text-gray-400 text-sm">
                Mentalidade, otimização de rotina e conceitos de alto nível. Preparação para competir de verdade.
              </p>
            </div>
          </div>
        </div>

        {/* --- ALÉM DA CONFIGURAÇÃO (CHECKLIST) --- */}
        <div className="bg-[#1a1a1e]/50 border-y border-white/5 py-16 mb-20 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-display font-black text-white uppercase italic mb-10">
              Muito Além de Configuração
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 text-left gap-6">
              {[
                "Configurações otimizadas de vídeo e FPS",
                "Ajustes finos de sensibilidade e mira",
                "Como evitar vícios e erros comuns",
                "Como pensar o jogo, não apenas reagir",
                "Jogar com consistência, não só em 'dias bons'",
                "Entendimento profundo, não apenas reflexo"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-black/40 rounded border border-white/5 hover:border-[#eeb32d]/30 transition-colors">
                  <div className="min-w-[20px] h-5 rounded-full bg-[#eeb32d]/20 flex items-center justify-center">
                    <Zap size={12} className="text-[#eeb32d]" />
                  </div>
                  <span className="text-gray-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- MENTALIDADE & CONCLUSÃO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-display font-black text-white uppercase italic flex items-center gap-3">
              <Users className="text-[#eeb32d]" /> Mentalidade Competitiva
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Counter-Strike é um jogo de decisão, disciplina e repetição. Por isso, trabalhamos fortemente o psicológico.
              Ensinamos como evoluir sem se frustrar, como analisar seus próprios erros e manter a consistência.
              <br /><br />
              <span className="text-white font-bold">Evoluir no CS não é sorte. É método.</span>
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-[#eeb32d] to-[#dca020] p-1 rounded-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="bg-[#0F1012] h-full rounded-lg p-6 flex flex-col justify-center items-center text-center">
              <h3 className="text-xl font-black text-white uppercase mb-2">Nosso Objetivo</h3>
              <p className="text-gray-400 text-sm mb-6">
                Criar jogadores melhores, mais conscientes e mais consistentes. Sem promessas vazias, sem atalhos ilusórios.
              </p>
              <button 
                onClick={() => onNavigate('signup')}
                className="w-full py-3 bg-[#eeb32d] hover:bg-[#c99627] text-black font-bold uppercase tracking-widest text-sm rounded transition-colors flex items-center justify-center gap-2"
              >
                Junte-se à Doutrina <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* --- FOOTER DA PÁGINA --- */}
        <div className="text-center border-t border-white/10 pt-12">
          <p className="text-[#eeb32d] font-bold tracking-widest uppercase text-sm mb-2">Doutrina CS</p>
          <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase italic">
            Do básico ao profissional.
          </h2>
          <p className="text-gray-500 mt-4 text-sm">
            Evolução não é improviso — é construção.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;