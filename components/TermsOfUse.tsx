
import React from 'react';
import { Shield, FileText, AlertCircle, Scale, Lock, Info, ChevronLeft } from 'lucide-react';

interface TermsOfUseProps {
  onNavigate: (page: any) => void;
}

const TermsOfUse: React.FC<TermsOfUseProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0F1012] pt-24 pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#eeb32d] transition-colors mb-8 uppercase text-[10px] font-bold tracking-[0.2em]"
        >
          <ChevronLeft size={16} /> Voltar ao Início
        </button>

        <div className="bg-[#131315] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 md:p-12 border-b border-white/5 bg-gradient-to-r from-[#eeb32d]/5 to-transparent">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#eeb32d]/10 rounded-lg flex items-center justify-center text-[#eeb32d] border border-[#eeb32d]/20">
                <Scale size={24} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase italic tracking-tighter">
                  Termos de <span className="text-[#eeb32d]">Uso</span>
                </h1>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Doutrina CS • Protocolo Jurídico</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm italic">Última atualização: 04 de fevereiro de 2026</p>
          </div>

          <div className="p-8 md:p-12 space-y-12 text-gray-300 leading-relaxed text-sm">
            <section className="bg-white/5 p-6 rounded-lg border border-white/5">
              <p>Bem-vindo à <strong>Doutrina CS</strong>. Ao acessar, cadastrar-se ou utilizar qualquer funcionalidade da plataforma, você declara que leu, compreendeu e concorda integralmente com estes Termos de Uso. Caso não concorde, não utilize nossos serviços.</p>
            </section>

            <div className="space-y-10">
              <section>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  <Info className="text-[#eeb32d]" size={18} /> 1. Sobre a Plataforma
                </h2>
                <p>A Doutrina CS é uma plataforma educacional digital voltada ao ensino de táticas, mecânicas, estratégias e conceitos aplicados ao jogo Counter-Strike 2, por meio de vídeos, textos, materiais complementares e ambientes de comunidade.</p>
                <p className="mt-2 text-gray-400">O acesso à plataforma exige cadastro prévio. Determinados conteúdos e funcionalidades estão disponíveis apenas mediante pagamento, conforme o plano contratado.</p>
              </section>

              <section>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  <Lock className="text-[#eeb32d]" size={18} /> 2. Elegibilidade e Conta
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-400">
                  <li>O acesso é pessoal, individual e intransferível.</li>
                  <li>O usuário é responsável por manter a confidencialidade de seus dados de acesso.</li>
                  <li>É proibido permitir que terceiros utilizem sua conta, total ou parcialmente.</li>
                  <li>A Doutrina CS se reserva o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio.</li>
                </ul>
              </section>

              <section className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-red-500/50 rounded-full"></div>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  <Shield className="text-red-500" size={18} /> 3. Propriedade Intelectual
                </h2>
                <p className="mb-4">Todo o conteúdo disponibilizado na plataforma (vídeos, aulas, textos, métodos, logotipos e materiais didáticos) é de <strong>propriedade exclusiva da Doutrina CS</strong>.</p>
                
                <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-lg">
                  <p className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-3">É EXPRESSAMENTE PROIBIDO:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <li className="flex items-start gap-2"><span className="text-red-500">•</span> Baixar, copiar ou gravar as aulas</li>
                    <li className="flex items-start gap-2"><span className="text-red-500">•</span> Compartilhar ou revender o conteúdo</li>
                    <li className="flex items-start gap-2"><span className="text-red-500">•</span> Uso comercial não autorizado</li>
                    <li className="flex items-start gap-2"><span className="text-red-500">•</span> Compartilhar acesso à conta</li>
                  </ul>
                  <p className="mt-4 text-[10px] text-red-500/70 italic uppercase font-bold">📌 Qualquer violação resultará em banimento imediato sem direito a reembolso.</p>
                </div>
              </section>

              <section>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  <FileText className="text-[#eeb32d]" size={18} /> 4. Conduta do Usuário
                </h2>
                <p className="mb-4">Ao utilizar a plataforma e comunidades associadas (Discord), o usuário concorda em:</p>
                <ul className="space-y-3">
                  {[
                    "Manter comportamento respeitoso com todos os membros",
                    "Não praticar assédio, ódio, racismo ou toxicidade",
                    "Não divulgar ou comercializar cheats, hacks ou softwares ilegais",
                    "Não utilizar a plataforma para fins ilícitos"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/5 text-xs">
                      <CheckCircleIcon /> {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  <AlertCircle className="text-[#eeb32d]" size={18} /> 5. Pagamentos e Reembolsos
                </h2>
                <p>O acesso é liberado após a confirmação do pagamento. Os valores e planos são descritos no momento da contratação.</p>
                <div className="mt-4 bg-[#eeb32d]/5 border border-[#eeb32d]/20 p-5 rounded-lg">
                  <h4 className="text-[#eeb32d] font-bold text-xs uppercase mb-2">Direito de Arrependimento</h4>
                  <p className="text-xs text-gray-400">Solicitação de reembolso em até <strong>7 (sete) dias</strong> corridos após a compra, desde que:</p>
                  <ul className="mt-2 list-disc pl-5 text-[11px] text-gray-500">
                    <li>Não tenha consumido mais de 20% do conteúdo total</li>
                    <li>Não seja constatado uso de má-fé</li>
                  </ul>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-2">6. Limitação de Resultados</h4>
                  <p className="text-xs text-gray-500">Fornecemos metodologia, mas não garantimos patentes específicas ou carreira profissional. Os resultados dependem da dedicação individual.</p>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-2">7. Disponibilidade</h4>
                  <p className="text-xs text-gray-500">A plataforma pode passar por manutenções. Não garantimos disponibilidade ininterrupta decorrente de falhas de terceiros.</p>
                </div>
              </section>

              <div className="pt-12 border-t border-white/5 text-center">
                <p className="text-gray-500 text-xs mb-4">Em caso de dúvidas, entre em contato:</p>
                <a href="mailto:suporte@doutrinacs.site" className="text-[#eeb32d] font-black uppercase tracking-[0.2em] hover:underline">
                  suporte@doutrinacs.site
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <div className="w-1.5 h-1.5 bg-[#eeb32d] rounded-full" />
);

export default TermsOfUse;
