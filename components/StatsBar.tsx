import React from 'react';

const StatsBar: React.FC = () => {
  const stats = [
    { value: "+5k", label: "Alunos Treinados" },
    { value: "4.9/5", label: "Avaliação Média" },
    { value: "+40h", label: "Conteúdo 4K" },
    { value: "TOP 1", label: "Comunidade BR" },
  ];

  return (
    <div className="bg-[#0F1012] border-y border-white/5 relative z-20">
       <div className="max-w-7xl mx-auto">
         <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
           {stats.map((stat, index) => (
             <div key={index} className="py-8 md:py-10 text-center group cursor-default hover:bg-white/[0.02] transition-colors relative overflow-hidden">
               {/* Hover Shine Effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
               
               <div className="text-4xl md:text-5xl font-display font-black text-white group-hover:text-[#eeb32d] transition-colors duration-300 drop-shadow-lg">
                 {stat.value}
               </div>
               <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mt-2 group-hover:text-gray-300">
                 {stat.label}
               </div>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
}

export default StatsBar;