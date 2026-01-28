import React from 'react';
import { Check, X, Zap, Crown, Target } from 'lucide-react';

const Plans: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-[#0F1012]">
       {/* Background Effects */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"></div>
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#eeb32d]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#eeb32d]/10 border border-[#eeb32d]/20 rounded-full px-4 py-1 mb-4">
            <Zap className="w-4 h-4 text-[#eeb32d]" />
            <span className="text-xs font-bold tracking-widest text-[#eeb32d] uppercase">Investimento</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white uppercase italic">
            Escolha seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eeb32d] to-[#ff8e25]">Loadout</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
            Do básico ao avançado. Selecione o pacote ideal para o seu momento de jogo.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Plan 1: Starter */}
          <div className="bg-[#131315] border border-white/5 rounded-lg p-8 relative hover:border-white/10 transition-colors">
            <div className="mb-4">
               <Target className="w-10 h-10 text-gray-400 mb-4" />
               <h3 className="text-xl font-bold text-white font-display uppercase">Soldado</h3>
               <p className="text-gray-500 text-sm">Para quem quer começar certo.</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">R$ 97</span>
              <span className="text-gray-500 text-sm"> / único</span>
            </div>
            
            <button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3 rounded uppercase text-sm tracking-wider transition-all mb-8">
              Começar Agora
            </button>

            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#eeb32d]" /> Acesso ao Módulo 1 (Fundamentos)
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#eeb32d]" /> Configs de Pro Players
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#eeb32d]" /> Comunidade Discord (Básico)
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <X className="w-4 h-4 text-red-500" /> Aulas de Utilitários Avançados
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <X className="w-4 h-4 text-red-500" /> Análise de Demos
              </li>
            </ul>
          </div>

          {/* Plan 2: Pro (Best Value) */}
          <div className="bg-[#18181b] border-2 border-[#eeb32d] rounded-lg p-8 relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(238,179,45,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#eeb32d] text-black px-4 py-1 rounded text-xs font-bold uppercase tracking-widest shadow-lg">
              Mais Vendido
            </div>

            <div className="mb-4">
               <Crown className="w-10 h-10 text-[#eeb32d] mb-4" />
               <h3 className="text-2xl font-bold text-white font-display uppercase">Global Elite</h3>
               <p className="text-gray-400 text-sm">O treinamento completo.</p>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                 <span className="text-gray-500 line-through text-sm">R$ 497</span>
                 <span className="bg-[#eeb32d]/10 text-[#eeb32d] text-xs px-2 py-0.5 rounded">-60%</span>
              </div>
              <span className="text-5xl font-bold text-white">R$ 197</span>
              <span className="text-gray-500 text-sm"> / único</span>
            </div>
            
            <button className="w-full bg-[#eeb32d] hover:bg-[#ff9f0a] text-black font-bold py-4 rounded uppercase text-sm tracking-wider transition-all mb-8 shadow-lg hover:shadow-[#eeb32d]/20 hover:scale-105 transform duration-300">
              Garantir Acesso Vitalício
            </button>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-center gap-3">
                <div className="bg-[#eeb32d] rounded-full p-0.5"><Check className="w-3 h-3 text-black" /></div>
                <span className="font-bold text-white">Curso Completo (Módulos 1-4)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-[#eeb32d] rounded-full p-0.5"><Check className="w-3 h-3 text-black" /></div>
                Mapas de Treino Exclusivos
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-[#eeb32d] rounded-full p-0.5"><Check className="w-3 h-3 text-black" /></div>
                Comunidade Discord VIP
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-[#eeb32d] rounded-full p-0.5"><Check className="w-3 h-3 text-black" /></div>
                Atualizações Semanais
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-[#eeb32d] rounded-full p-0.5"><Check className="w-3 h-3 text-black" /></div>
                Certificado de Conclusão
              </li>
            </ul>
          </div>

          {/* Plan 3: Mentoria */}
          <div className="bg-[#131315] border border-white/5 rounded-lg p-8 relative hover:border-white/10 transition-colors">
            <div className="mb-4">
               <Zap className="w-10 h-10 text-purple-500 mb-4" />
               <h3 className="text-xl font-bold text-white font-display uppercase">Mentoria 1:1</h3>
               <p className="text-gray-500 text-sm">Acompanhamento individual.</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">R$ 597</span>
              <span className="text-gray-500 text-sm"> / mês</span>
            </div>
            
            <button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3 rounded uppercase text-sm tracking-wider transition-all mb-8">
              Aplicar para Vaga
            </button>

            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-purple-500" /> Tudo do Plano Global Elite
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-purple-500" /> 4 Sessões ao vivo (Discord)
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-purple-500" /> Análise Profunda de Demos
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-purple-500" /> Plano de Treino Personalizado
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-purple-500" /> Contato Direto no WhatsApp
              </li>
            </ul>
          </div>

        </div>

        {/* Guarantee Badge */}
        <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 bg-[#18181b] border border-white/10 px-6 py-4 rounded-lg">
                <div className="w-12 h-12 bg-[#eeb32d]/10 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#eeb32d]" />
                </div>
                <div className="text-left">
                    <p className="text-white font-bold text-sm uppercase">Garantia Incondicional de 7 Dias</p>
                    <p className="text-gray-500 text-xs">Não gostou? Devolvemos 100% do seu dinheiro.</p>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

// Helper Icon for the guarantee section
import { ShieldCheck } from 'lucide-react';

export default Plans;