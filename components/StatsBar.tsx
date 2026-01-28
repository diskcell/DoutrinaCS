import React from 'react';

const StatsBar: React.FC = () => {
  const stats = [
    { value: "+5k", label: "Alunos Treinados" },
    { value: "4.9/5", label: "Avaliação Média" },
    { value: "+10k", label: "Horas de Aula" },
    { value: "TOP 1", label: "Comunidade BR" },
  ];

  return (
    <div className="bg-[#131315] border-y border-white/5 py-8">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {stats.map((stat, index) => (
             <div key={index} className="text-center group cursor-default">
               <div className="text-3xl md:text-4xl font-display font-bold text-white group-hover:text-[#eeb32d] transition-colors duration-300">
                 {stat.value}
               </div>
               <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">
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