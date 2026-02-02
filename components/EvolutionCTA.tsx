import React from 'react';
import { Check, ShieldCheck, Award, ArrowRight } from 'lucide-react';

interface EvolutionCTAProps {
  onNavigate: (page: string) => void;
}

const EvolutionCTA: React.FC<EvolutionCTAProps> = ({ onNavigate }) => {
  return (
    <section className="py-32 relative overflow-hidden bg-[#0F1012]">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0F1012] to-[#0F1012]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#eeb32d]/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
        
        <div className="inline-block mb-6">
           <span className="bg-white/5 border border-white/10 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
             Vagas Limitadas
           </span>
        </div>

        {/* Main Typography */}
        <h2 className="text-5xl md:text-7xl font-display font-black uppercase italic leading-[0.9] tracking-tighter text-white">
          Sua Evolução <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eeb32d] via-[#f5d061] to-[#ff8e25]">
            Não Pode Esperar
          </span>
        </h2>

        {/* Subtext */}
        <p className="mt-8 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          Pare de perder tempo em partidas aleatórias. Entre para a comunidade que forma a elite do CS brasileiro.
        </p>

        {/* Button */}
        <div className="mt-12">
          <button
            onClick={() => onNavigate('course')}
            className="group relative inline-flex items-center justify-center bg-[#eeb32d] hover:bg-[#ffaa00] text-black font-bold font-display text-2xl py-6 px-16 rounded skew-x-[-12deg] transition-all duration-300 hover:scale-105 shadow-[0_0_60px_rgba(238,179,45,0.4)] hover:shadow-[0_0_80px_rgba(238,179,45,0.6)]"
          >
            <span className="skew-x-[12deg] flex items-center gap-3">
              GARANTIR ACESSO VIP
              <ArrowRight className="w-6 h-6 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-xs font-bold uppercase tracking-widest text-gray-500">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded border border-white/5">
            <Award className="w-5 h-5 text-[#eeb32d]" />
            <span>Certificado Profissional</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded border border-white/5">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>Risco Zero (7 Dias)</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default EvolutionCTA;