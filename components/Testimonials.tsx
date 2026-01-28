import React from 'react';
import { Star, Quote, ShieldCheck } from 'lucide-react';

const testimonials = [
  {
    name: "Gabriel 'Fallen' S.",
    rank: "Global Elite",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel&backgroundColor=b6e3f4",
    text: "O curso mudou minha visão de jogo. Eu era prata e só corria e atirava. Hoje entendo rotações, timings e como ser um IGL de verdade. Valeu cada centavo!",
    achievement: "Subiu 12 Patentes"
  },
  {
    name: "Lucas 'Kscerato' M.",
    rank: "GC Level 20",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas&backgroundColor=ffdfbf",
    text: "A didática sobre utilitários é absurda. Aprendi smokes que nunca vi nem em campeonato tier 1. Se você quer levar o CS a sério, esse é o lugar.",
    achievement: "Top 100 Regional"
  },
  {
    name: "Ana 'Pan' C.",
    rank: "Faceit Lvl 10",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=c0aede",
    text: "O ambiente da comunidade no Discord é incrível. Todo mundo focado em evoluir, sem toxicidade. Fiz meu time lá e hoje jogamos campeonatos amadores.",
    achievement: "Ganhou 1º Camp"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-[#0F1012] relative overflow-hidden" id="mentors">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#eeb32d]/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#eeb32d]/10 border border-[#eeb32d]/20 rounded-full px-4 py-1 mb-4">
            <ShieldCheck className="w-4 h-4 text-[#eeb32d]" />
            <span className="text-xs font-bold tracking-widest text-[#eeb32d] uppercase">Resultados Reais</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase italic">
            Quem treina, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eeb32d] to-[#ff8e25]">Evolui</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Junte-se à elite. Veja o que nossos alunos estão conquistando nos servidores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-[#18181b] border border-white/5 p-8 rounded-lg relative group hover:border-[#eeb32d]/30 transition-all duration-300 hover:-translate-y-2">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-100 transition-opacity">
                <Quote className="w-12 h-12 text-[#eeb32d]" />
              </div>

              {/* Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-full border-2 border-[#eeb32d] p-0.5">
                   <img src={testimonial.image} alt={testimonial.name} className="w-full h-full rounded-full bg-gray-800" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-white">{testimonial.name}</h4>
                  <span className="text-xs font-bold text-[#eeb32d] bg-[#eeb32d]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    {testimonial.rank}
                  </span>
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Footer */}
              <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#eeb32d] fill-[#eeb32d]" />
                  ))}
                </div>
                <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                   {testimonial.achievement}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;