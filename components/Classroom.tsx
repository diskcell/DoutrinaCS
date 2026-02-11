
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Play, CheckCircle2, Lock, Circle, ChevronDown, ChevronUp, Menu, X, ArrowRight, ExternalLink } from 'lucide-react';
import { ModuleStatus, LessonStatus } from '../types';
import VideoPlayer from './VideoPlayer'; 

interface ClassroomProps {
  lesson: LessonStatus;
  modules: ModuleStatus[];
  onBack: () => void;
  onSelectLesson: (lesson: LessonStatus) => void;
  onComplete: () => void;
}

const Classroom: React.FC<ClassroomProps> = ({ lesson, modules, onBack, onSelectLesson, onComplete }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);
  
  const initialModuleId = useMemo(() => {
    return modules.find(m => m.lessons.some(l => l.id === lesson.id))?.id || null;
  }, [lesson.id, modules]);

  const [openModuleId, setOpenModuleId] = useState<string | null>(initialModuleId);
  const [isLocalCompleted, setIsLocalCompleted] = useState(lesson.status === 'completed');

  useEffect(() => {
    setIsLocalCompleted(lesson.status === 'completed');
  }, [lesson.id, lesson.status]);

  const currentModule = modules.find(m => m.lessons.some(l => l.id === lesson.id));
  const isCompleted = isLocalCompleted || lesson.status === 'completed';

  const handleMarkComplete = () => {
    setIsLocalCompleted(true);
    onComplete();
  };

  const nextLesson = useMemo(() => {
    const allLessons = modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  }, [lesson.id, modules]);

  // Função para renderizar texto com links clicáveis
  const renderDescription = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#eeb32d] hover:text-white underline font-bold inline-flex items-center gap-1 break-all"
          >
            {part} <ExternalLink size={12} />
          </a>
        );
      }
      return part;
    });
  };

  const videoSource = (lesson as any).video_id || lesson.video_url;
  const isSimpleId = videoSource && !videoSource.includes('/') && !videoSource.includes('.'); 
  const isDriveUrl = videoSource && videoSource.includes('drive.google.com');
  const isEmbed = videoSource && (videoSource.includes('iframe') || videoSource.includes('embed'));
  const shouldUseCustomPlayer = isSimpleId || isDriveUrl;

  const handleLessonChange = (newLesson: LessonStatus) => {
    if (newLesson.status !== 'locked') {
      onSelectLesson(newLesson);
      if (window.innerWidth < 1024) setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0F1012] text-white">
      
      <header className="h-16 bg-[#131315] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <ChevronLeft size={20} />
            <span className="hidden md:inline">Voltar ao QG</span>
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <div className="overflow-hidden">
            <h1 className="font-display font-bold text-lg md:text-xl text-white truncate max-w-[200px] md:max-w-md">
              {lesson.title}
            </h1>
            <p className="text-[10px] text-[#eeb32d] uppercase font-bold tracking-widest hidden md:block">
              {currentModule?.title}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-[#eeb32d] transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="flex flex-1 relative">
        
        <div className="flex-1 bg-[#0F1012] flex flex-col">
           <div className="w-full bg-black border-b border-white/5 flex justify-center z-10">
               <div className="w-full max-w-6xl relative aspect-video bg-black flex items-center justify-center">
                  {videoSource ? (
                    shouldUseCustomPlayer ? (
                      <VideoPlayer 
                        key={`drive-${lesson.id}`}
                        videoId={videoSource.match(/[-\w]{25,}/)?.[0] || videoSource} 
                        poster={lesson.cover_url}
                        autoplay={false}
                      />
                    ) : isEmbed ? (
                      <iframe 
                        key={`embed-${lesson.id}`}
                        src={videoSource}
                        className="w-full h-full border-0"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
                        allowFullScreen={true}
                      />
                    ) : (
                      <video
                        key={`native-${lesson.id}`}
                        className="w-full h-full"
                        src={videoSource}
                        poster={lesson.cover_url}
                        controls
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        Seu navegador não suporta a tag de vídeo.
                      </video>
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-[#0F1012]">
                      <Play size={48} className="mb-4 opacity-50" />
                      <p className="text-xs uppercase tracking-widest font-bold">Vídeo não disponível nesta aula.</p>
                    </div>
                  )}
               </div>
           </div>

           <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8 pb-10 border-b border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                      <span className="bg-[#eeb32d]/10 text-[#eeb32d] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded">Objetivo em Curso</span>
                      <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">{lesson.duration} de Treinamento</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-bold uppercase italic text-white tracking-tight">Descrição da Missão</h2>
                  <div className="text-gray-400 text-base leading-relaxed max-w-3xl whitespace-pre-wrap">
                    {renderDescription(lesson.description || "Nesta fase do treinamento, focaremos em táticas específicas e mecânicas avançadas para consolidar sua evolução como operador de elite. Estude cada detalhe visualizado.")}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 shrink-0">
                  <button 
                    onClick={handleMarkComplete}
                    disabled={isCompleted}
                    className={`flex items-center justify-center gap-3 px-8 py-5 rounded font-bold text-sm uppercase transition-all shadow-xl tracking-[0.1em] ${
                      isCompleted 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                        : 'bg-[#eeb32d] text-black hover:bg-[#dca020] hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 size={20} />
                        Missão Cumprida
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        Marcar Concluído
                      </>
                    )}
                  </button>

                  {nextLesson && (
                    <button 
                      onClick={() => handleLessonChange(nextLesson)}
                      disabled={nextLesson.status === 'locked'}
                      className={`flex items-center justify-center gap-3 px-8 py-4 rounded border font-bold text-[11px] uppercase tracking-[0.15em] transition-all ${
                        nextLesson.status === 'locked' 
                          ? 'bg-white/5 text-gray-600 border-white/5 cursor-not-allowed'
                          : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                      }`}
                    >
                      {nextLesson.status === 'locked' ? (
                        <>Bloqueado <Lock size={14} /></>
                      ) : (
                        <>Próxima Aula <ArrowRight size={16} /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
           </div>
        </div>

        <aside 
          className={`
            fixed lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] right-0 top-0 h-full w-full lg:w-[400px] bg-[#131315] border-l border-white/5 transition-all duration-300 ease-in-out z-50 flex flex-col
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}
          `}
        >
           <div className="p-6 bg-[#18181b] border-b border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-xs uppercase tracking-[0.2em] text-[#eeb32d]">Ementa do Curso</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Sincronizado com o Servidor</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500"><X size={24} /></button>
           </div>

           <div className="flex-1 overflow-y-auto">
             {modules.map((module) => (
               <div key={module.id} className="border-b border-white/5">
                 <button 
                   onClick={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}
                   className={`w-full p-6 flex items-center justify-between transition-colors text-left group ${openModuleId === module.id ? 'bg-white/[0.02]' : 'hover:bg-white/5'}`}
                 >
                   <div className="flex flex-col items-start">
                     <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Módulo Operacional</span>
                     <h4 className={`font-bold font-display text-base uppercase tracking-wider transition-colors ${openModuleId === module.id ? 'text-[#eeb32d]' : 'text-gray-300 group-hover:text-white'}`}>
                       {module.title}
                     </h4>
                   </div>
                   {openModuleId === module.id ? <ChevronUp size={20} className="text-[#eeb32d]" /> : <ChevronDown size={20} className="text-gray-500" />}
                 </button>

                 {openModuleId === module.id && (
                   <div className="bg-black/30 animate-fade-in">
                     {module.lessons.map((l) => {
                       const isActive = l.id === lesson.id;
                       const isLessonComplete = l.status === 'completed' || (isActive && isLocalCompleted);

                       return (
                         <button 
                           key={l.id}
                           disabled={l.status === 'locked'}
                           onClick={() => handleLessonChange(l)}
                           className={`w-full flex items-start gap-4 p-5 transition-all text-left relative group/item ${
                             isActive 
                               ? 'bg-[#eeb32d]/10 border-l-4 border-[#eeb32d]' 
                               : 'hover:bg-[#eeb32d]/5 border-l-4 border-transparent'
                           } ${l.status === 'locked' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                         >
                           <div className="mt-0.5 shrink-0 transition-transform group-hover/item:scale-110">
                             {isLessonComplete && <CheckCircle2 size={18} className="text-green-500" />}
                             {!isLessonComplete && l.status === 'available' && <Circle size={18} className={isActive ? "text-[#eeb32d] fill-[#eeb32d]/20" : "text-gray-600"} />}
                             {l.status === 'locked' && <Lock size={18} className="text-gray-700" />}
                           </div>
                           
                           <div className="flex-1">
                             <p className={`text-sm font-bold leading-relaxed mb-1 tracking-wide transition-colors ${isActive ? 'text-[#eeb32d]' : 'text-gray-400 group-hover/item:text-white'}`}>
                               {l.title}
                             </p>
                             <div className="flex items-center gap-3">
                               <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                 <Play size={10} className="fill-current" /> {l.duration}
                               </span>
                               {isActive && <span className="text-[9px] bg-[#eeb32d] text-black px-2 py-0.5 rounded-sm font-black uppercase tracking-tighter">Em Execução</span>}
                             </div>
                           </div>
                         </button>
                       );
                     })}
                   </div>
                 )}
               </div>
             ))}
           </div>
        </aside>

      </div>
    </div>
  );
};

export default Classroom;
