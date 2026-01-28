import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "O curso serve para quem é total iniciante (Prata)?",
    answer: "Com certeza. Temos o módulo 'Nível 0' focado exclusivamente em fundamentos: configuração de sensibilidade, mecânica de movimento, posicionamento de mira e noções básicas de economia. É a base que falta para você sair do Prata."
  },
  {
    question: "Como funciona o acesso e o suporte?",
    answer: "O acesso à plataforma de aulas é imediato após a confirmação do pagamento e tem duração de 15 meses. O suporte acontece 24/7 no nosso servidor exclusivo do Discord, onde analistas (Global/Lvl 20) tiram dúvidas e analisam demos."
  },
  {
    question: "Preciso ter um PC gamer potente?",
    answer: "Não. Ensinamos inclusive como otimizar o CS2 para rodar com mais FPS em computadores mais modestos. As estratégias de jogo (gamesense) funcionam independente do seu hardware."
  },
  {
    question: "E se eu não evoluir ou não gostar?",
    answer: "Nós confiamos no nosso método. Se em 7 dias você achar que o treinamento não é para você, basta enviar um e-mail e devolvemos 100% do seu investimento, sem letras miúdas."
  },
  {
    question: "O pagamento é mensal?",
    answer: "Não. O valor é único e dá direito a 15 meses de acesso. Você pode parcelar esse valor único em até 12x no cartão de crédito."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#0F1012] relative" id="faq">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#eeb32d]/10 border border-[#eeb32d]/20 rounded-full px-4 py-1 mb-4">
            <HelpCircle className="w-4 h-4 text-[#eeb32d]" />
            <span className="text-xs font-bold tracking-widest text-[#eeb32d] uppercase">Tira Dúvidas</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase italic">
            Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eeb32d] to-[#ff8e25]">Frequentes</span>
          </h2>
          <p className="mt-4 text-gray-400">
            Não fique com dúvida na hora do clutch.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border transition-all duration-300 rounded-sm overflow-hidden ${
                openIndex === index 
                  ? 'bg-[#18181b] border-[#eeb32d] shadow-[0_0_15px_rgba(238,179,45,0.1)]' 
                  : 'bg-[#131315] border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className={`font-bold font-display text-lg uppercase tracking-wide ${openIndex === index ? 'text-white' : 'text-gray-400'}`}>
                  {faq.question}
                </span>
                <div className={`p-1 rounded transition-colors ${openIndex === index ? 'bg-[#eeb32d] text-black' : 'bg-white/5 text-gray-400'}`}>
                  {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;