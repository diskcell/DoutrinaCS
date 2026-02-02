
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { 
  Home, LogOut, Play, Lock, CheckCircle2, Bell, ChevronDown, Menu, X, 
  Clock, BookOpen, Zap, Crosshair, Target, Settings, Loader2, Trophy, 
  TrendingUp, Shield, Star, Award, Medal, MousePointer2, Brain, MonitorPlay, ChevronRight, Info,
  Flame, Calendar, Activity, Timer, FileText, Megaphone, ExternalLink
} from 'lucide-react';
import { ModuleStatus, LessonStatus, Notice, UserProfile } from '../types';
import Classroom from './Classroom';

interface DashboardProps {
  session: Session;
  onLogout: () => void;
  isAdmin?: boolean;
  isApproved?: boolean;
  refreshKey?: number;
  onNavigateToAdmin?: () => void;
  onNavigateToPlans?: () => void;
}

const MODULE_METADATA: Record<string, { subtitle: string; icon: React.ReactNode; description: string }> = {
  "m1": { subtitle: "Performance vem de setup", icon: <Settings size={20} />, description: "Aprenda a extrair cada gota de performance do seu hardware. Do Windows às binds ocultas." },
  "m2": { subtitle: "A base obrigatória", icon: <Shield size={20} />, description: "Aqui nasce o jogador competitivo. Entenda o fluxo financeiro e o ritmo de jogo." },
  "m3": { subtitle: "Transformando decisão em kill", icon: <MousePointer2 size={20} />, description: "Domine a memória muscular. Aprenda a diferença entre Tap, Burst e Spray." },
  "m4": { subtitle: "Vencendo sem precisar atirar", icon: <Brain size={20} />, description: "Entenda o mapa como um tabuleiro. Posicionamento, timings e leitura." },
  "m5": { subtitle: "O diferencial tático", icon: <Target size={20} />, description: "Granadas que ganham rounds. Pixels, wallbangs, boosts e mecânicas." },
  "m6": { subtitle: "A ciência da autocrítica", icon: <MonitorPlay size={20} />, description: "Analise seu jogo como um coach. Identifique padrões e estude os melhores." },
  "m7": { subtitle: "Mente blindada", icon: <Zap size={20} />, description: "Não tilte. Aprenda a manter o foco e tomar decisões sob pressão extrema." },
  "m8": { subtitle: "O ouro do diferencial", icon: <Trophy size={20} />, description: "O guia final para quem quer viver de CS. De como subir até entrar em orgs." }
};

const getNoticeStyle = (type?: string) => {
  switch(type) {
    case 'patch': 
      return { 
        border: 'border-blue-500/30', 
        text: 'text-blue-400', 
        icon: <FileText size={12} />, 
        label: 'PATCH' 
      };
    case 'alert': 
      return { 
        border: 'border-yellow-500/30', 
        text: 'text-yellow-400', 
        icon: <Megaphone size={12} />, 
        label: 'AVISO' 
      };
    case 'meta': 
      return { 
        border: 'border-orange-500/30', 
        text: 'text-orange-500', 
        icon: <Flame size={12} />, 
        label: 'META' 
      };
    default: 
      return { 
        border: 'border-white/10', 
        text: 'text-gray-400', 
        icon: <Info size={12} />, 
        label: 'INFO' 
      };
  }
};

const Dashboard: React.FC<DashboardProps> = ({ session, onLogout, isAdmin = false, isApproved = false, refreshKey = 0, onNavigateToAdmin, onNavigateToPlans }) => {
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<LessonStatus | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [rawModulesData, setRawModulesData] = useState<any[]>([]);
  
  const [streakDays, setStreakDays] = useState(1);
  const [memberSince, setMemberSince] = useState<string>('');
  const [lastActivityTime, setLastActivityTime] = useState<string>('Agora mesmo');

  const dataLoadedRef = useRef(false);

  const stats = useMemo(() => {
    const allLessons = modules.flatMap(m => m.lessons);
    const completed = allLessons.filter(l => l.status === 'completed').length;
    const total = allLessons.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let rank = "Recruta";
    let icon = <Shield size={16} />;
    let color = "text-gray-400";
    if (progress >= 100) { rank = "Global Elite"; icon = <Trophy size={16} />; color = "text-yellow-400"; }
    else if (progress >= 80) { rank = "Supremo"; icon = <Award size={16} />; color = "text-purple-400"; }
    else if (progress >= 60) { rank = "Xerife"; icon = <Medal size={16} />; color = "text-blue-400"; }
    else if (progress >= 40) { rank = "AK Cruzada"; icon = <Crosshair size={16} />; color = "text-orange-400"; }
    else if (progress >= 20) { rank = "Ouro Mestre"; icon = <Star size={16} />; color = "text-yellow-600"; }
    return { progress, completed, total, rank, icon, color };
  }, [modules]);

  const processData = (rawData: any[], profile: UserProfile | null, doneIds: Set<string>) => {
    const hasFullAccess = profile?.has_purchased === true;
    const isMasterAdmin = isAdmin || profile?.role === 'admin' || session.user.email === 'jefersonjjjj24@gmail.com';
    const accessibleModules = profile?.accessible_modules || [];

    let previousLessonFinished = true;
    const safeData = Array.isArray(rawData) ? rawData : [];

    return safeData.map((mod: any) => {
      const userHasPlanForModule = hasFullAccess || accessibleModules.includes(mod.id);
      const isModulePlanUnlocked = isMasterAdmin || userHasPlanForModule;

      const rawLessons = Array.isArray(mod.lessons) ? mod.lessons : [];
      
      const lessons = rawLessons
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((l: any) => {
          // Garantia de comparação como String para evitar divergência de tipos (int vs string)
          const isCompleted = doneIds.has(String(l.id));
          let status: 'locked' | 'completed' | 'available' = 'locked';

          // Prioridade absoluta para o status concluído se estiver no Set doneIds
          if (isCompleted) {
            status = 'completed';
            previousLessonFinished = true;
          } else if (isMasterAdmin) {
            status = 'available';
          } else if (!isModulePlanUnlocked) {
            status = 'locked';
          } else if (previousLessonFinished) {
            status = 'available';
            previousLessonFinished = false;
          } else {
            status = 'locked';
          }

          return { ...l, status };
        });

      return {
        ...mod,
        lessons,
        isLocked: !isModulePlanUnlocked,
        progress: lessons.length ? Math.round((lessons.filter((l: any) => l.status === 'completed').length / lessons.length) * 100) : 0
      };
    });
  };

  const loadDashboardData = async () => {
    if (!dataLoadedRef.current) setIsLoadingData(true);

    try {
      const [profileRes, modulesRes, noticesRes, progressRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('modules').select(`*, lessons (*)`).order('order', { ascending: true }),
        supabase.from('notices').select('*').order('id', { ascending: false }).limit(5),
        supabase.from('user_progress').select('lesson_id, created_at').eq('user_id', session.user.id)
      ]);

      const profile = profileRes.data || { role: 'student', has_purchased: false, accessible_modules: [], created_at: new Date().toISOString() };
      setUserProfile(profile as UserProfile);

      if (profile.created_at) {
        const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)); 
        setMemberSince(`${diffDays} dias`);
      }

      if (noticesRes.data) setNotices(noticesRes.data);

      const rawProgress = (progressRes.data as any[]) || [];
      // Mapeia todos os IDs para String para garantir consistência na comparação
      const doneIds = new Set<string>(rawProgress.map((i: any) => String(i.lesson_id)));
      setCompletedLessonIds(doneIds);

      if (rawProgress.length > 0) {
        const latest = [...rawProgress].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        setLastActivityTime(formatTimeAgo(latest.created_at));
      }

      const rawModules = modulesRes.data || [];
      setRawModulesData(rawModules);
      
      const processedModules = processData(rawModules, profile as UserProfile, doneIds);
      setModules(processedModules);

      if (processedModules.length > 0 && !openModuleId) {
        const firstUnlock = processedModules.find(m => !m.isLocked);
        if (firstUnlock) setOpenModuleId(firstUnlock.id);
      }

      dataLoadedRef.current = true;
    } catch (err) {
      console.error("Erro dashboard:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [session.user.id, refreshKey]);

  const handleLessonComplete = async (lessonId: string) => {
    const stringId = String(lessonId);
    
    // 1. Atualização imediata do estado local (Otimista)
    setCompletedLessonIds((prev: Set<string>) => {
      const next = new Set<string>(prev);
      next.add(stringId);
      
      // Atualiza os módulos para refletir a conclusão e liberar a próxima visualmente
      setModules(currentModules => {
        return processData(rawModulesData, userProfile, next);
      });
      
      return next;
    });

    // 2. Persistência no Supabase
    try {
      // Simplificamos o payload para apenas as chaves necessárias, garantindo compatibilidade com o esquema
      const { error } = await supabase.from('user_progress').upsert({ 
        user_id: session.user.id, 
        lesson_id: stringId
      }, { onConflict: 'user_id,lesson_id' });
      
      if (error) {
        console.warn("Aviso ao salvar progresso (tentando fallback de inserção simples):", error);
        // Fallback: Tenta insert direto caso o upsert falhe por falta de restrição unique
        await supabase.from('user_progress').insert({ 
          user_id: session.user.id, 
          lesson_id: stringId
        });
      }
    } catch (e) {
      console.error("Erro crítico de persistência no banco:", e);
    }

    setLastActivityTime("Agora mesmo");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  };

  const handleLessonChange = (lesson: LessonStatus) => {
    if (lesson.status !== 'locked') {
      setActiveLesson(lesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (activeLesson) {
    return <Classroom 
      lesson={activeLesson} 
      modules={modules} 
      onBack={() => setActiveLesson(null)} 
      onSelectLesson={handleLessonChange} 
      onComplete={() => handleLessonComplete(activeLesson.id)} 
    />;
  }

  const isUserAdmin = isAdmin || userProfile?.role === 'admin' || session.user.email === 'jefersonjjjj24@gmail.com';
  const displayName = userProfile?.name || session.user.user_metadata?.full_name || 'Operador';
  const nextLesson = modules.filter(m => !m.isLocked).flatMap(m => m.lessons).find(l => l.status === 'available') || null;

  return (
    <div className="min-h-screen bg-[#0F1012] text-white flex flex-col md:flex-row animate-fade-in overflow-x-hidden">
      {/* Sidebar Fina */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#131315] border-r border-white/5 flex flex-col md:sticky md:translate-x-0 transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair className="text-[#eeb32d]" size={20} />
            <span className="font-display font-bold uppercase text-base tracking-widest leading-none">DOUTRINA <span className="text-[#eeb32d]">CENTRAL</span></span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400"><X size={20} /></button>
        </div>

        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded bg-[#eeb32d]/10 flex items-center justify-center border border-[#eeb32d]/20">{stats.icon}</div>
              <div>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none">Patente</p>
                <p className={`text-xs font-black uppercase italic ${stats.color}`}>{stats.rank}</p>
              </div>
           </div>
           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#eeb32d] shadow-[0_0_8px_#eeb32d50] transition-all duration-1000" style={{ width: `${stats.progress}%` }}></div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {isUserAdmin && (
            <button onClick={onNavigateToAdmin} className="w-full flex items-center gap-3 px-4 py-3 rounded bg-red-600/10 text-red-500 font-black border border-red-500/20 mb-4 hover:bg-red-600 hover:text-white transition-all text-[10px] uppercase tracking-widest">
              <Settings size={16} /> Admin Panel
            </button>
          )}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded bg-[#eeb32d]/10 text-[#eeb32d] border border-[#eeb32d]/20 text-[10px] font-bold uppercase tracking-widest"><Home size={16} /> Dashboard</button>
          {!isApproved && !isUserAdmin && (
             <button onClick={onNavigateToPlans} className="w-full flex items-center gap-3 px-4 py-3 rounded bg-green-600/10 text-green-500 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse"><Zap size={16} /> Ativar Arsenal</button>
          )}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded bg-red-500/5 text-red-500 border border-red-500/10 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors"><LogOut size={14} /> Desconectar</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full space-y-8 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="md:hidden"><button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-[#131315] rounded border border-white/5"><Menu size={20} /></button></div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-display font-black uppercase italic tracking-tighter leading-none">Operador: <span className="text-[#eeb32d]">{displayName}</span></h1>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
               <span className="flex items-center gap-1.5"><TrendingUp size={12} className="text-green-500" /> Operação Ativa</span>
               <div className="h-2 w-px bg-white/10"></div>
               <span className="flex items-center gap-1.5">{stats.icon} {stats.rank}</span>
            </div>
          </div>

          <div className="flex gap-3">
             <div className="bg-[#131315] border border-white/5 p-4 rounded-xl text-center min-w-[110px]">
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Missões</p>
                <p className="text-2xl font-display font-bold text-white leading-none">{stats.completed}<span className="text-gray-600 text-xs">/{stats.total}</span></p>
             </div>
             <div className="bg-[#131315] border border-white/5 p-4 rounded-xl text-center min-w-[110px]">
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Evolução</p>
                <p className="text-2xl font-display font-bold text-[#eeb32d] leading-none">{stats.progress}%</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-8 space-y-8">
            {!isApproved && !isUserAdmin ? (
               <div className="relative rounded-2xl overflow-hidden border border-red-500/20 p-8 md:p-10 bg-gradient-to-r from-red-600/5 to-[#131315] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-4 relative z-10">
                     <div className="inline-block bg-red-600 text-white text-[8px] font-black uppercase px-3 py-0.5 rounded-full">Acesso Negado</div>
                     <h2 className="text-3xl md:text-5xl font-display font-black uppercase italic text-white leading-none tracking-tighter">Arsenal <br/>Bloqueado.</h2>
                     <button onClick={onNavigateToPlans} className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3 rounded-lg transition-all hover:scale-105 flex items-center gap-3 uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20">
                       Liberar Arsenal <ChevronRight size={16} />
                     </button>
                  </div>
                  <Lock size={120} className="text-white/5 absolute right-4 bottom-4 md:relative opacity-20" />
               </div>
            ) : (
              nextLesson && (
                <div className="relative rounded-2xl overflow-hidden border border-[#eeb32d]/20 p-8 md:p-12 bg-[#131315] shadow-xl group">
                   <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#eeb32d]/5 to-transparent pointer-events-none"></div>
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                         <span className="inline-block text-[8px] bg-[#eeb32d] text-black px-4 py-0.5 font-black uppercase rounded-full">Próxima Missão</span>
                         <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> {nextLesson.duration}</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-display font-black uppercase italic text-white leading-none tracking-tighter max-w-xl">
                         {nextLesson.title}
                      </h2>
                      <button onClick={() => handleLessonChange(nextLesson)} className="bg-[#eeb32d] hover:bg-[#ffaa00] text-black font-black px-10 py-4 rounded-lg transition-all hover:scale-105 flex items-center gap-3 uppercase text-[10px] tracking-widest shadow-xl shadow-[#eeb32d]/10">
                          Iniciar Treino <Play size={16} fill="black" />
                      </button>
                   </div>
                   <Target size={180} className="absolute bottom-[-40px] right-[-40px] text-[#eeb32d]/5 hidden lg:block" />
                </div>
              )
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <BookOpen size={20} className="text-[#eeb32d]" />
                <h3 className="text-xl font-display font-black uppercase tracking-tighter italic">Roadmap do <span className="text-[#eeb32d]">Operador</span></h3>
              </div>

              <div className="relative">
                <div className="absolute left-[24px] md:left-[44px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#eeb32d]/30 via-white/5 to-transparent z-0"></div>

                <div className="space-y-6">
                  {isLoadingData ? (
                     <div className="p-10 text-center bg-[#131315] rounded-2xl border border-white/5">
                        <Loader2 className="animate-spin text-[#eeb32d] mx-auto mb-3" size={30} />
                        <p className="text-gray-500 text-[8px] uppercase font-black tracking-widest">Sincronizando Dados...</p>
                     </div>
                  ) : modules.length === 0 ? (
                    <div className="p-10 text-center bg-[#131315] rounded-2xl border border-white/5 border-dashed">
                      <p className="text-gray-500 text-sm">Nenhum módulo encontrado.</p>
                      <p className="text-gray-600 text-xs mt-2">Acesse o painel administrativo para criar conteúdo.</p>
                    </div>
                  ) : (
                    modules.map((m) => {
                      const meta = MODULE_METADATA[m.id] || { subtitle: "Operacional", icon: <Zap size={20}/>, description: "Protocolo padrão." };
                      const isOpen = openModuleId === m.id;
                      const locked = m.isLocked && !isUserAdmin;

                      return (
                        <div key={m.id} className="relative z-10">
                          <div className={`transition-all duration-300 ${locked ? 'opacity-40 grayscale pointer-events-none' : isOpen ? 'bg-[#18181b] border-[#eeb32d]/30 shadow-xl' : 'bg-[#131315] border-white/5 hover:border-white/10'} border rounded-xl overflow-hidden`}>
                            <button 
                              onClick={() => !locked && setOpenModuleId(isOpen ? null : m.id)} 
                              className={`w-full p-4 md:p-6 flex items-center justify-between text-left`}
                            >
                              <div className="flex items-center gap-5">
                                 <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center border transition-all shrink-0 ${locked ? 'bg-black text-gray-700 border-white/5' : isOpen ? 'bg-[#eeb32d] text-black border-black' : m.progress === 100 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-[#eeb32d] border-white/5'}`}>
                                    {locked ? <Lock size={24} /> : meta.icon}
                                 </div>
                                 <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                       <h4 className={`font-display font-black text-lg md:text-xl uppercase tracking-tighter ${locked ? 'text-gray-600' : 'text-white'}`}>{m.title}</h4>
                                       {locked && <span className="bg-red-500/10 text-red-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/20">Locked</span>}
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{meta.subtitle}</p>
                                    
                                    {!locked && (
                                      <div className="flex items-center gap-3 mt-2">
                                         <div className="w-20 md:w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${m.progress === 100 ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-[#eeb32d]'}`} style={{width: `${m.progress}%`}}></div>
                                         </div>
                                         <span className="text-[8px] font-black uppercase text-gray-600">{m.progress}%</span>
                                      </div>
                                    )}
                                 </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full border border-white/5 flex items-center justify-center transition-all ${locked ? 'opacity-0' : isOpen ? 'bg-[#eeb32d] text-black rotate-180 border-none' : 'text-gray-600'}`}>
                                 <ChevronDown size={20} />
                              </div>
                            </button>

                            {isOpen && !locked && (
                              <div className="bg-black/20 border-t border-white/5 p-4 md:p-8 animate-fade-in-up">
                                 <div className="mb-6 border-l-2 border-[#eeb32d] pl-4">
                                    <p className="text-gray-400 text-sm leading-relaxed">{meta.description}</p>
                                 </div>

                                 <div className="grid grid-cols-1 gap-2">
                                    {m.lessons.map((l, i) => {
                                      const isLessonLocked = l.status === 'locked';
                                      return (
                                        <div key={l.id} className={`bg-[#131315]/50 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between transition-all group/lesson ${isLessonLocked ? 'opacity-50' : 'hover:bg-[#18181b] hover:border-[#eeb32d]/20'}`}>
                                           <div className="flex items-center gap-4 mb-3 md:mb-0">
                                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${l.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : isLessonLocked ? 'bg-black text-gray-700 border-white/5' : 'bg-black text-gray-500 border-white/5'}`}>
                                                 {l.status === 'completed' ? <CheckCircle2 size={16} /> : isLessonLocked ? <Lock size={12} /> : (i + 1).toString().padStart(2, '0')}
                                              </div>
                                              <div>
                                                 <p className={`text-sm font-bold uppercase tracking-tight ${l.status === 'completed' ? 'text-gray-500' : 'text-gray-200'}`}>{l.title}</p>
                                                 <span className="text-[9px] text-gray-600 font-bold uppercase flex items-center gap-1 tracking-widest"><Clock size={10}/> {l.duration}</span>
                                              </div>
                                           </div>
                                           <button 
                                              disabled={isLessonLocked}
                                              onClick={() => handleLessonChange(l)} 
                                              className={`font-black px-6 py-2 rounded text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isLessonLocked ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#eeb32d] hover:bg-white text-black'}`}
                                            >
                                              {isLessonLocked ? 'Bloqueado' : <>Assistir <ChevronRight size={14} /></>}
                                           </button>
                                        </div>
                                      );
                                    })}
                                 </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6 sticky top-28">
             <div className="bg-[#131315] border border-white/5 p-6 rounded-2xl relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#eeb32d]/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-1000"></div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                   <Info size={16} className="text-[#eeb32d]" /> Informações
                </h4>
                <div className="space-y-4">
                  {notices.length > 0 ? notices.map(n => {
                    const style = getNoticeStyle(n.type);
                    const Component = n.link ? 'a' : 'div';
                    const linkProps = n.link ? { href: n.link, target: "_blank", rel: "noopener noreferrer" } : {};

                    return (
                      <Component key={n.id} {...linkProps} className={`block relative pl-4 border-l-2 ${style.border} ${n.link ? 'cursor-pointer hover:bg-white/[0.02] transition-colors rounded-r' : ''}`}>
                        <div className="flex items-start justify-between">
                           <div>
                              <div className={`text-[8px] font-black uppercase mb-1 flex items-center gap-2 ${style.text}`}>
                                 {style.icon} {style.label}
                              </div>
                              <p className="text-[11px] text-gray-400 leading-relaxed italic whitespace-pre-wrap">"{n.text}"</p>
                              <span className="text-[8px] text-gray-600 font-bold uppercase mt-2 block tracking-widest">{n.date}</span>
                           </div>
                           {n.link && <ExternalLink size={12} className="text-gray-600 mt-1" />}
                        </div>
                      </Component>
                    );
                  }) : (
                    <p className="text-gray-600 text-[9px] uppercase font-black text-center py-4">Sem notificações.</p>
                  )}
                </div>
             </div>

             <div className="bg-gradient-to-br from-[#eeb32d]/5 to-[#131315] border border-[#eeb32d]/10 p-6 rounded-2xl flex flex-col gap-6 shadow-xl">
                <div>
                  <h4 className="text-[10px] font-black text-[#eeb32d] uppercase tracking-widest mb-3 italic">Suporte Especializado</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">Conecte-se com o QG no Discord. Nossos analistas estão online para revisar suas demos e táticas.</p>
                </div>
                <button className="w-full bg-[#eeb32d] hover:bg-white text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#eeb32d]/5">
                   <Zap size={16} fill="black" /> Entrar no Discord
                </button>
             </div>

             <div className="bg-[#18181b] border border-white/5 p-0 rounded-2xl overflow-hidden shadow-2xl relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#eeb32d] to-transparent"></div>
                <div className="p-6 pb-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#0F1012] border border-white/10 flex items-center justify-center relative shrink-0">
                     <Crosshair className="text-[#eeb32d]" size={28} />
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#18181b]"></div>
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-white uppercase leading-tight">{displayName}</h3>
                     <p className="text-[10px] text-[#eeb32d] font-bold uppercase tracking-widest mt-1">Operador Verificado</p>
                     <p className="text-[9px] text-gray-600 font-mono mt-1">ID: {session.user.id.slice(0,8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="px-6 py-2">
                   <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 bg-[#0F1012] rounded border border-white/5 hover:border-[#eeb32d]/20 transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-500">
                               <Flame size={16} fill="currentColor" className="animate-pulse" />
                            </div>
                            <div>
                               <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Sequência</p>
                               <p className="text-xs font-bold text-white">{streakDays} Dias Seguidos</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#0F1012] rounded border border-white/5 hover:border-[#eeb32d]/20 transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500">
                               <Calendar size={16} />
                            </div>
                            <div>
                               <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Tempo de QG</p>
                               <p className="text-xs font-bold text-white">{memberSince || "Recruta"}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#0F1012] rounded border border-white/5 hover:border-[#eeb32d]/20 transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-500">
                               <Activity size={16} />
                            </div>
                            <div>
                               <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Último Treino</p>
                               <p className="text-xs font-bold text-white">{lastActivityTime}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-3 bg-[#0F1012] border-t border-white/5 text-center">
                   <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Status Operacional: Ativo</span>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
