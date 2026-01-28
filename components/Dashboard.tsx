import React, { useState, useMemo, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { 
  Home, LogOut, 
  Play, Lock, CheckCircle2, Circle, Bell, ChevronDown, ChevronUp, Trophy, Menu, X, Loader2, Terminal, ShieldCheck
} from 'lucide-react';
import { ModuleStatus, LessonStatus, Notice } from '../types';
import Classroom from './Classroom';

interface DashboardProps {
  session: Session;
  onLogout: () => void;
  isAdmin?: boolean;
  isApproved?: boolean;
  onNavigateToAdmin?: () => void;
  onNavigateToPlans?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ session, onLogout, isAdmin = false, isApproved = false, onNavigateToAdmin, onNavigateToPlans }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<LessonStatus | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isApproved && !isAdmin) {
        setIsLoadingData(false);
        return;
    }

    const fetchAllData = async () => {
      try {
        setIsLoadingData(true);
        const [modulesRes, noticesRes, progressRes] = await Promise.all([
          supabase.from('modules').select(`*, lessons (*)`).order('order', { ascending: true }),
          supabase.from('notices').select('*').order('id', { ascending: false }).limit(10),
          supabase.from('user_progress').select('lesson_id').eq('user_id', session.user.id)
        ]);

        if (modulesRes.error) throw modulesRes.error;

        const completedLessonIds = new Set(progressRes.data?.map(item => item.lesson_id) || []);
        
        const processedModules = modulesRes.data ? modulesRes.data.map((mod: any) => {
            mod.lessons.sort((a: any, b: any) => a.order - b.order);
            const processedLessons = mod.lessons.map((lesson: any) => ({
                ...lesson,
                status: 'locked' as 'locked' | 'available' | 'completed'
            }));
            return { ...mod, lessons: processedLessons, progress: 0 };
        }) : [];

        let previousLessonCompleted = true;
        processedModules.forEach((mod: ModuleStatus) => {
            let moduleCompletedCount = 0;
            mod.lessons.forEach((lesson: LessonStatus) => {
                if (completedLessonIds.has(lesson.id)) {
                    lesson.status = 'completed';
                    moduleCompletedCount++;
                    previousLessonCompleted = true;
                } else if (previousLessonCompleted) {
                    lesson.status = 'available';
                    previousLessonCompleted = false;
                } else {
                    lesson.status = 'locked';
                }
            });
            mod.progress = mod.lessons.length > 0 ? Math.round((moduleCompletedCount / mod.lessons.length) * 100) : 0;
        });

        setModules(processedModules);
        if (processedModules.length > 0) setOpenModuleId(processedModules[0].id);
        if (noticesRes.data) setNotices(noticesRes.data);

      } catch (err: any) {
        console.error('Erro dashboard:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAllData();
  }, [session.user.id, isApproved, isAdmin]);

  const handleLessonComplete = async (lessonId: string) => {
    setModules(prev => {
      const newModules = JSON.parse(JSON.stringify(prev));
      const allLessons: LessonStatus[] = [];
      newModules.forEach((m: any) => allLessons.push(...m.lessons));
      const idx = allLessons.findIndex(l => l.id === lessonId);
      if (idx !== -1) {
          allLessons[idx].status = 'completed';
          if (idx + 1 < allLessons.length && allLessons[idx + 1].status === 'locked') {
              allLessons[idx + 1].status = 'available';
          }
      }
      newModules.forEach((mod: any) => {
          const comp = mod.lessons.filter((l: any) => l.status === 'completed').length;
          mod.progress = Math.round((comp / mod.lessons.length) * 100);
      });
      return newModules;
    });
    await supabase.from('user_progress').insert({ user_id: session.user.id, lesson_id: lessonId });
  };

  const stats = useMemo(() => {
    let total = 0, comp = 0;
    modules.forEach(m => m.lessons.forEach(l => { total++; if (l.status === 'completed') comp++; }));
    return { percentage: total === 0 ? 0 : Math.round((comp / total) * 100), comp, total };
  }, [modules]);

  if (!isApproved && !isAdmin && !isLoadingData) {
    return (
      <div className="min-h-screen bg-[#0F1012] flex flex-col items-center justify-center p-6">
        <div className="bg-[#131315] border border-white/10 p-12 rounded-2xl max-w-2xl w-full text-center shadow-2xl animate-fade-in-up">
           <Lock size={64} className="text-red-500 mx-auto mb-8 opacity-90" />
           <h2 className="text-4xl font-display font-bold uppercase text-white mb-6 tracking-tight">Acesso <span className="text-red-500">Restrito</span></h2>
           <p className="text-gray-400 text-lg mb-10 leading-relaxed">Sua credencial ainda não foi autenticada para missões ativas no sistema.</p>
           <div className="flex flex-col gap-4">
              <button onClick={onNavigateToPlans} className="bg-[#eeb32d] hover:bg-[#dca020] text-black font-bold py-5 rounded uppercase tracking-widest transition-all text-sm shadow-lg shadow-[#eeb32d]/10">Adquirir Licença Operacional</button>
              <button onClick={onLogout} className="text-gray-500 hover:text-white text-xs uppercase font-bold py-3 tracking-widest transition-colors">Encerrar Sessão</button>
           </div>
        </div>
      </div>
    );
  }

  if (activeLesson) {
    const currentLessonData = modules.flatMap(m => m.lessons).find(l => l.id === activeLesson.id) || activeLesson;
    return (
      <Classroom 
        key={activeLesson.id} // CRITICAL: Força re-render completo ao trocar de aula
        lesson={currentLessonData} 
        modules={modules} 
        onBack={() => setActiveLesson(null)} 
        onSelectLesson={setActiveLesson} 
        onComplete={() => handleLessonComplete(activeLesson.id)} 
      />
    );
  }

  const nextLesson = modules.flatMap(m => m.lessons).find(l => l.status === 'available') || modules[0]?.lessons[0] || { title: "Nenhuma missão", status: 'locked' };

  return (
    <div className="min-h-screen bg-[#0F1012] flex flex-col md:flex-row text-white font-sans animate-fade-in">
      <aside className={`fixed top-0 left-0 z-50 h-screen w-72 bg-[#131315] border-r border-white/5 flex flex-col md:sticky md:translate-x-0 transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#eeb32d] rounded flex items-center justify-center text-black font-bold font-display text-xl">D</div>
            <span className="font-display font-bold uppercase text-lg tracking-widest">QG <span className="text-[#eeb32d]">Doutrina</span></span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-4 px-5 py-4 rounded text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'home' ? 'bg-[#eeb32d]/10 text-[#eeb32d] border border-[#eeb32d]/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><Home size={20} /> Dashboard</button>
          <button onClick={() => setActiveTab('binds')} className={`w-full flex items-center gap-4 px-5 py-4 rounded text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'binds' ? 'bg-[#eeb32d]/10 text-[#eeb32d] border border-[#eeb32d]/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><Terminal size={20} /> Comandos</button>
          {isAdmin && <button onClick={onNavigateToAdmin} className="w-full flex items-center gap-4 px-5 py-4 rounded text-sm font-bold uppercase text-red-500 hover:bg-red-500/5 mt-8 border border-red-500/10"><ShieldCheck size={20} /> Administração</button>}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-3 rounded bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500/20 text-xs font-bold uppercase tracking-widest transition-all"><LogOut size={16} /> Sair do Sistema</button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-14 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 min-h-[280px] flex items-center px-10 shadow-2xl group transition-all hover:border-[#eeb32d]/30">
             <div className="absolute inset-0 bg-gradient-to-r from-[#0F1012] via-[#0F1012]/70 to-transparent z-10"></div>
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-30 group-hover:scale-105 transition-transform duration-700"></div>
             <div className="relative z-20 space-y-6">
                <span className="text-xs bg-[#eeb32d] text-black px-3 py-1 font-bold uppercase tracking-widest rounded-sm">Objetivo Imediato</span>
                <h2 className="text-5xl md:text-6xl font-display font-bold uppercase italic leading-tight text-white">{nextLesson.title}</h2>
                <button onClick={() => setActiveLesson(nextLesson as any)} disabled={nextLesson.status === 'locked' || isLoadingData} className="bg-[#eeb32d] hover:bg-[#dca020] text-black font-bold px-10 py-5 rounded-sm skew-x-[-12deg] flex items-center gap-3 transition-all disabled:opacity-50 hover:scale-105 shadow-xl shadow-[#eeb32d]/10">
                  <span className="skew-x-[12deg] flex items-center gap-3 uppercase text-sm tracking-widest">{isLoadingData ? 'Sincronizando...' : 'Retomar Treinamento'} <Play size={18} fill="black" /></span>
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
               <div className="bg-[#131315] border border-white/5 p-8 rounded-xl shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs uppercase text-gray-400 font-bold tracking-widest">Status de Carreira</span>
                    <span className="text-base text-[#eeb32d] font-bold font-display">{stats.percentage}% Concluído</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#eeb32d] to-[#ff8e25] transition-all duration-1000 shadow-[0_0_15px_rgba(238,179,45,0.3)]" style={{ width: `${stats.percentage}%` }}></div></div>
               </div>

               <div className="space-y-4">
                  {isLoadingData && modules.length === 0 ? (
                    <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin w-8 h-8 text-[#eeb32d]" />
                      <span className="text-sm uppercase font-bold tracking-widest opacity-60">Baixando Briefings...</span>
                    </div>
                  ) : (
                    modules.map(m => (
                      <div key={m.id} className="border border-white/5 rounded-xl overflow-hidden bg-[#131315] transition-all hover:border-white/20">
                        <button onClick={() => setOpenModuleId(openModuleId === m.id ? null : m.id)} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                           <div className="flex flex-col items-start">
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mb-1">Módulo Operacional</span>
                              <span className="font-display font-bold text-lg uppercase text-white tracking-wide">{m.title}</span>
                           </div>
                           {openModuleId === m.id ? <ChevronUp size={20} className="text-[#eeb32d]" /> : <ChevronDown size={20} className="text-gray-500" />}
                        </button>
                        {openModuleId === m.id && (
                          <div className="bg-black/40 border-t border-white/5">
                            {m.lessons.map(l => (
                              <div key={l.id} className="p-5 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-[#eeb32d]/5 transition-all group">
                                <div className="flex items-center gap-5">
                                  {l.status === 'completed' ? <CheckCircle2 size={20} className="text-green-500" /> : l.status === 'available' ? <Circle size={20} className="text-[#eeb32d]" /> : <Lock size={20} className="text-gray-700" />}
                                  <span className={`text-sm font-medium ${l.status === 'locked' ? 'text-gray-600' : 'text-gray-300 group-hover:text-white'}`}>{l.title}</span>
                                </div>
                                {l.status !== 'locked' && (
                                  <button 
                                    onClick={() => setActiveLesson(l)} 
                                    className="text-[11px] uppercase font-bold text-[#eeb32d] border border-[#eeb32d]/30 px-5 py-2 rounded-sm hover:bg-[#eeb32d] hover:text-black transition-all tracking-widest"
                                  >
                                    {l.status === 'completed' ? 'Rever' : 'Visualizar'}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-[#131315] border border-white/5 p-8 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest"><Bell size={16} className="text-[#eeb32d]" /> Quadro de Comunicados</div>
                  <div className="space-y-6">
                    {notices.length === 0 && !isLoadingData ? <p className="text-sm text-gray-600 italic">Sem novos comunicados no momento.</p> : notices.slice(0, 4).map(n => (
                      <div key={n.id} className="space-y-2 group">
                        <p className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">{n.text}</p>
                        <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                          {n.date}
                        </span>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="bg-gradient-to-br from-[#18181b] to-black border border-white/10 p-10 rounded-xl text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#eeb32d]/5 blur-3xl rounded-full"></div>
                  <Trophy size={48} className="text-[#eeb32d] mx-auto mb-5 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] mb-2">Classificação Atual</p>
                  <h4 className="font-display font-bold text-2xl text-white uppercase italic tracking-tight">Operador Nível {stats.percentage < 50 ? 'Bronze' : 'Prata'}</h4>
                  <div className="mt-4 h-1 w-12 bg-[#eeb32d] mx-auto rounded-full"></div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;