import React from 'react';
import { Check, ShieldCheck, Award } from 'lucide-react';

interface EvolutionCTAProps {
  onNavigate: (page: string) => void;
}

const EvolutionCTA: React.FC<EvolutionCTAProps> = ({ onNavigate }) => {
  return (
    <section className="py-32 relative overflow-hidden bg-[#0F1012]">
      {/* Standard Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"></div>

      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#eeb32d]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
        
        {/* Main Typography */}
        <h2 className="text-5xl md:text-7xl font-display font-bold uppercase italic leading-none tracking-tight">
          <span className="text-white block mb-2 md:mb-4">Sua Evolução</span>
          <span className="text-[#eeb32d] relative inline-block">
            Não Pode Esperar
            <span className="absolute bottom-1 left-0 w-full h-1 bg-[#eeb32d]/50 skew-x-[-20deg]"></span>
          </span>
        </h2>

        {/* Subtext */}
        <p className="mt-8 text-gray-400 text-base md:text-lg max-w-xl mx-auto font-medium">
          Restam poucas vagas com valor promocional. Junte-se a mais de 5.000 alunos agora.
        </p>

        {/* Button */}
        <div className="mt-10">
          <button
            onClick={() => onNavigate('course')}
            className="group relative inline-flex items-center justify-center bg-[#eeb32d] hover:bg-[#ff9f0a] text-black font-bold font-display text-xl py-5 px-16 rounded skew-x-[-6deg] transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(238,179,45,0.3)] hover:shadow-[0_0_60px_rgba(238,179,45,0.5)]"
          >
            <span className="skew-x-[6deg] flex items-center gap-3">
              GARANTIR MINHA VAGA
              <Check className="w-6 h-6 stroke-[3]" />
            </span>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-xs font-bold uppercase tracking-widest text-[#71717a]">
          <div className="flex items-center gap-2 hover:text-[#eeb32d] transition-colors cursor-default">
            <Award className="w-4 h-4" />
            <span>Certificado Incluso</span>
          </div>
          <div className="flex items-center gap-2 hover:text-[#eeb32d] transition-colors cursor-default">
            <ShieldCheck className="w-4 h-4" />
            <span>Compra 100% Segura</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default EvolutionCTA;