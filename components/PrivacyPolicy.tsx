
import React from 'react';
// Changed FileShield to Shield as FileShield does not exist in lucide-react
import { ShieldCheck, Lock, Eye, Database, Shield, UserCheck, ChevronLeft, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (page: any) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
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
          <div className="p-8 md:p-12 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-transparent">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 border border-blue-500/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase italic tracking-tighter">
                  Política de <span className="text-blue-400">Privacidade</span>
                </h1>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Doutrina CS • Proteção de Dados LGPD</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm italic">Última atualização: 04 de fevereiro de 2026</p>
          </div>

          <div className="p-8 md:p-12 space-y-12 text-gray-300 leading-relaxed text-sm">
            <section className="bg-white/5 p-6 rounded-lg border border-white/5">
              <p>A <strong>Doutrina CS</strong> respeita a sua privacidade e está comprometida com a proteção dos dados pessoais de seus usuários, em conformidade com a Lei nº 13.709/2018 – <strong>Lei Geral de Proteção de Dados (LGPD)</strong>.</p>
            </section>

            <div className="space-y-10">
              <section>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  <Database className="text-[#eeb32d]" size={18} /> 1. Quem Somos
                </h2>
                <p>A Doutrina CS é uma plataforma educacional digital focada no ensino de táticas, mecânicas e estratégias para o jogo Counter-Strike 2, oferecendo conteúdos online mediante cadastro e, em alguns casos, pagamento.</p>
              </section>

              <section>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  <Eye className="text-[#eeb32d]" size={18} /> 2. Dados Pessoais Coletados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                    <h4 className="text-white font-bold text-xs uppercase mb-3 text-[#eeb32d]">Fornecidos pelo Usuário</h4>
                    <ul className="text-xs space-y-2 text-gray-400">
                      <li>• Nome completo</li>
                      <li>• Endereço de e-mail</li>
                      <li>• Senha (criptografada)</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                    <h4 className="text-white font-bold text-xs uppercase mb-3 text-blue-400">Coletados Automaticamente</h4>
                    <ul className="text-xs space-y-2 text-gray-400">
                      <li>• Progresso nas aulas</li>
                      <li>• Horário de acesso e IP</li>
                      <li>• Informações técnicas do dispositivo</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-lg flex items-start gap-3">
                  <Lock className="text-yellow-500 shrink-0" size={16} />
                  <p className="text-[11px] text-gray-400"><strong>Dados de Pagamento:</strong> Não armazenamos dados de cartão. Processamento via Mercado Pago com políticas próprias de segurança.</p>
                </div>
              </section>

              <section>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  {/* Changed FileShield to Shield */}
                  <Shield className="text-[#eeb32d]" size={18} /> 3. Finalidade do Tratamento
                </h2>
                <p className="mb-4">Seus dados são utilizados para gerenciar sua conta, liberar acessos contratados, registrar seu progresso e prevenir fraudes ou compartilhamento indevido de conta.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["Gerenciamento de Conta", "Segurança Tática", "Obrigações Legais"].map((txt, i) => (
                    <div key={i} className="bg-black/40 border border-white/5 p-3 rounded text-[10px] font-bold uppercase text-center text-gray-500">
                      {txt}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  <ShieldCheck className="text-blue-400" size={18} /> 4. Segurança e Compartilhamento
                </h2>
                <p className="mb-4">Não vendemos ou alugamos seus dados. O compartilhamento ocorre apenas com provedores essenciais (Supabase, Cloudflare, Gateways de Pagamento).</p>
                <div className="bg-blue-400/5 border border-blue-400/10 p-5 rounded-lg">
                  <h4 className="text-blue-400 font-bold text-xs uppercase mb-2">Protocolos de Defesa</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">Adotamos criptografia de dados sensíveis, controle de acesso seguro e mecanismos de proteção contra captura indevida de conteúdo.</p>
                </div>
              </section>

              <section>
                <h2 className="text-white font-display font-bold text-xl uppercase italic mb-4 flex items-center gap-3">
                  <UserCheck className="text-[#eeb32d]" size={18} /> 5. Direitos do Titular (LGPD)
                </h2>
                <p className="mb-4">Conforme a LGPD, você pode solicitar a qualquer momento:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Acesso aos dados pessoais",
                    "Correção de dados incompletos",
                    "Exclusão definitiva da conta",
                    "Revogação de consentimento"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/5 text-xs">
                      <div className="w-1.5 h-1.5 bg-[#eeb32d] rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="pt-12 border-t border-white/5 text-center">
                <p className="text-gray-500 text-xs mb-4 flex items-center justify-center gap-2">
                  <Mail size={14} /> Dúvidas ou Assuntos de Privacidade:
                </p>
                <a href="mailto:privacidade@doutrinacs.site" className="text-blue-400 font-black uppercase tracking-[0.2em] hover:underline">
                  privacidade@doutrinacs.site
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
