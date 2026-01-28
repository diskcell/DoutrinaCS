import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  LayoutDashboard, Plus, Trash2, Save, Video, 
  MessageSquare, BookOpen, ChevronDown, ChevronRight, Loader2, AlertTriangle, ArrowLeft, Link, LogOut, Users, CheckCircle, XCircle, RefreshCcw, Database, AlertCircle, Search
} from 'lucide-react';
import { ModuleStatus, LessonStatus, Notice, UserProfile } from '../types';

interface AdminPanelProps {
  onLogout: () => void;
  onBack?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onBack }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'notices' | 'users'>('content');
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Form States
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newNoticeText, setNewNoticeText] = useState('');
  
  // Estado para cadastro de aula
  const [isSaving, setIsSaving] = useState(false);

  const [newLesson, setNewLesson] = useState<{
    moduleId: string;
    title: string;
    duration: string;
    description: string;
    video_url: string;
  }>({ moduleId: '', title: '', duration: '', description: '', video_url: '' });

  useEffect(() => {
    window.location.hash = 'admin';
    fetchData();

    let subscription: any;
    
    if (activeTab === 'users') {
      subscription = supabase
        .channel('public:profiles')
        .on(
          'postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' }, 
          (payload) => {
            console.log('Realtime update:', payload);
            fetchData(); 
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [activeTab]); 

  const fetchData = async (forceRefresh = false) => {
    if (!forceRefresh) {
        if (activeTab === 'users' && users.length === 0) setIsLoading(true);
        else if (activeTab !== 'users' && modules.length === 0) setIsLoading(true);
    }

    setError(null);
    try {
      if (activeTab === 'content') {
        const { data: modulesData, error: modError } = await supabase
          .from('modules')
          .select(`*, lessons (*)`)
          .order('order', { ascending: true });
        
        if (modError) throw modError;

        if (modulesData) {
          modulesData.forEach(m => {
            m.lessons.sort((a: any, b: any) => a.order - b.order);
          });
          setModules(modulesData as any);
        }
      }

      if (activeTab === 'notices') {
        const { data: noticesData, error: notError } = await supabase
          .from('notices')
          .select('*')
          .order('id', { ascending: false });
        
        if (notError) throw notError;
        if (noticesData) setNotices(noticesData);
      }

      if (activeTab === 'users') {
        // Tenta buscar TODOS os perfis
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (usersError) throw usersError;
        
        console.log("Dados recebidos do Supabase (Users):", usersData);

        if (usersData && usersData.length > 0) {
          setUsers(usersData as UserProfile[]);
          setShowSqlHelp(false);
        } else {
            // Se voltou vazio e não deu erro, é quase certeza que é RLS bloqueando ou tabela vazia
            setUsers([]);
            setShowSqlHelp(true);
        }
      }

    } catch (err: any) {
      console.error("Erro no AdminPanel:", err);
      // Detecção específica de erro 404 (Tabela não encontrada na API)
      if (err.status === 404 || (err.message && err.message.includes("404"))) {
         setError("ERRO CRÍTICO (404): A API não encontrou a tabela 'profiles'. É necessário rodar o script de correção.");
         setShowSqlHelp(true);
      } else {
         setError(err.message || "Erro ao carregar dados.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === 'users') setUsers([]);
    await fetchData(true);
    setIsRefreshing(false);
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    const order = modules.length + 1;
    const { error } = await supabase.from('modules').insert({ title: newModuleTitle, order });
    if (!error) {
      setNewModuleTitle('');
      fetchData();
    } else {
      alert("Erro ao criar módulo: " + error.message);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!window.confirm('ATENÇÃO: Isso apagará o módulo e TODAS as aulas. Continuar?')) return;
    
    const { error: lessonsError } = await supabase.from('lessons').delete().eq('module_id', id);
    if (lessonsError) {
        alert("Erro ao limpar aulas: " + lessonsError.message);
        return;
    }

    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (!error) {
        fetchData();
        if (expandedModule === id) setExpandedModule(null);
    } else {
        alert("Erro ao apagar módulo: " + error.message);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title || !newLesson.moduleId || !newLesson.video_url) {
      alert("Preencha o título, selecione um módulo e insira a URL do vídeo.");
      return;
    }

    try {
      setIsSaving(true);

      const currentModule = modules.find(m => m.id === newLesson.moduleId);
      const order = (currentModule?.lessons.length || 0) + 1;

      // Salvar no Banco
      const { error: dbError } = await supabase.from('lessons').insert({
        module_id: newLesson.moduleId,
        title: newLesson.title,
        duration: newLesson.duration || '00:00',
        video_url: newLesson.video_url, // URL direta do Bunny
        description: newLesson.description,
        order: order
      });

      if (dbError) throw dbError;

      setNewLesson({ ...newLesson, title: '', duration: '', description: '', video_url: '' });
      fetchData();
      alert("Aula adicionada com sucesso!");

    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao adicionar aula: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Apagar esta aula permanentemente?')) return;
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (!error) {
        fetchData();
    } else {
        alert("Erro ao apagar aula: " + error.message);
    }
  };

  const handleAddNotice = async () => {
    if (!newNoticeText.trim()) return;
    const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const { error } = await supabase.from('notices').insert({ text: newNoticeText, date });
    if (!error) {
      setNewNoticeText('');
      fetchData();
    } else {
      alert("Erro ao criar aviso: " + error.message);
    }
  };

  // Alterada para atualização otimista (Instantânea)
  const handleDeleteNotice = async (id: number) => {
    if (!window.confirm('Apagar este aviso?')) return;

    console.log("Tentando deletar aviso ID:", id);

    // Remove localmente primeiro (Feedback instantâneo)
    setNotices(prevNotices => prevNotices.filter(n => n.id !== id));

    const { error } = await supabase.from('notices').delete().eq('id', id);
    
    if (error) {
        console.error("Erro Supabase:", error);
        alert("Erro ao apagar aviso: " + error.message + "\n\nVerifique se rodou o script de correção na aba 'Alunos'.");
        // Se der erro, recarrega para voltar o item
        fetchData();
    }
  };

  const toggleUserApproval = async (userId: string, currentStatus: boolean | undefined) => {
      const newStatus = !currentStatus;
      
      const { error } = await supabase
        .from('profiles')
        .update({ has_purchased: newStatus })
        .eq('id', userId);
        
      if (!error) {
          setUsers(users.map(u => u.id === userId ? {...u, has_purchased: newStatus} : u));
      } else {
          alert("Erro ao atualizar usuário: " + error.message);
      }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      (user.name?.toLowerCase() || '').includes(term) ||
      (user.email?.toLowerCase() || '').includes(term) ||
      (user.id?.toLowerCase() || '').includes(term)
    );
  });

  const copySqlToClipboard = () => {
    const sql = `
-- === SCRIPT DE CORREÇÃO NUCLEAR ===
-- Rode este script completo no 'SQL Editor' do Supabase para corrigir tabelas, permissões e cache da API.

BEGIN;

-- 1. Garante tabela PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  role text DEFAULT 'student',
  has_purchased boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Garante tabela NOTICES
CREATE TABLE IF NOT EXISTS public.notices (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  text text,
  date text,
  created_at timestamptz DEFAULT now()
);

-- 3. Habilita RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 4. Limpa Policies antigas
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Self update" ON public.profiles;
DROP POLICY IF EXISTS "Public notices read" ON public.notices;
DROP POLICY IF EXISTS "Admin notices all" ON public.notices;

-- 5. Cria Policies permissivas para PROFILES
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Self insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Cria Policies para NOTICES (Importante para o delete funcionar)
CREATE POLICY "Public notices read" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Admin notices all" ON public.notices FOR ALL USING (true) WITH CHECK (true);

-- 7. Garante permissões de API
GRANT ALL ON TABLE public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.notices TO postgres, anon, authenticated, service_role;

-- 8. Trigger para Novos Usuários
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, has_purchased)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'student', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;

-- 9. RECARREGAR CACHE DA API
NOTIFY pgrst, 'reload config';
`.trim();
    navigator.clipboard.writeText(sql);
    alert("Script 'Nuclear' atualizado copiado! Inclui correção para AVISOS e PERFIS. Cole no SQL Editor.");
  };

  if (isLoading && users.length === 0 && modules.length === 0) return <div className="min-h-screen bg-[#0F1012] flex items-center justify-center text-[#eeb32d]"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0F1012] text-white font-sans flex flex-col">
      <header className="bg-[#131315] border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
           {onBack && (
             <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
               <ArrowLeft size={20} />
             </button>
           )}
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">AD</div>
              <div>
                <h1 className="font-display font-bold text-xl uppercase leading-none">Painel <span className="text-red-500">Admin</span></h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Controle de Conteúdo</p>
              </div>
           </div>
        </div>
        <button onClick={onLogout} className="md:hidden text-xs font-bold uppercase hover:text-red-500 bg-white/5 px-4 py-2 rounded transition-colors">Sair</button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-[#131315] border-r border-white/5 hidden md:flex flex-col">
           <div className="flex-1 p-4 overflow-y-auto">
             <nav className="space-y-2">
               <button 
                 onClick={() => setActiveTab('content')}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-bold uppercase transition-all ${activeTab === 'content' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                 <Video size={18} /> Aulas & Módulos
               </button>
               <button 
                 onClick={() => setActiveTab('notices')}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-bold uppercase transition-all ${activeTab === 'notices' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                 <MessageSquare size={18} /> Quadro de Avisos
               </button>
               <button 
                 onClick={() => setActiveTab('users')}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-bold uppercase transition-all ${activeTab === 'users' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                 <Users size={18} /> Alunos & Contas
               </button>
             </nav>
           </div>
           
           <div className="p-4 border-t border-white/5">
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <LogOut size={16} />
                Desconectar
              </button>
           </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-[#0F1012]">
          
          {error && (
             <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 flex items-start gap-4 text-red-500 animate-pulse-slow mb-6 shadow-lg shadow-red-500/10">
                <AlertTriangle size={28} className="shrink-0 mt-1" />
                <div className="flex-1">
                   <h4 className="font-bold uppercase text-lg mb-1">Erro de Conexão (Código 404/RLS)</h4>
                   <p className="text-sm mb-3 opacity-90">{error}</p>
                   <p className="text-xs bg-black/40 p-2 rounded border border-red-500/20">
                     Isso acontece quando a tabela 'profiles' existe no banco, mas a API do Supabase ainda não a detectou. Rode o script de correção abaixo.
                   </p>
                </div>
             </div>
          )}
          
          {activeTab === 'content' && (
            <div className="max-w-4xl mx-auto space-y-8">
              
              <div className="bg-[#18181b] border border-white/5 p-6 rounded-lg shadow-lg">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                  <BookOpen size={14} /> Novo Módulo
                </h3>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="Título do Módulo (ex: Módulo 1: Fundamentos)"
                    className="flex-1 bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors"
                  />
                  <button 
                    onClick={handleAddModule}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold uppercase text-sm flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Plus size={18} /> Criar
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {modules.map(module => (
                  <div key={module.id} className="border border-white/10 rounded-lg overflow-hidden bg-[#131315] hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between p-4 bg-white/5 cursor-pointer" onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}>
                      <div className="flex items-center gap-3 font-bold text-lg hover:text-red-500 transition-colors select-none">
                         {expandedModule === module.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                         {module.title}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }} 
                        className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded"
                        title="Excluir Módulo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {expandedModule === module.id && (
                      <div className="p-4 bg-black/20 border-t border-white/5 animate-fade-in-up">
                        <div className="mb-6 p-5 border border-white/10 rounded bg-[#18181b] shadow-inner">
                           <h4 className="font-bold text-xs text-gray-500 uppercase mb-4 flex items-center gap-2">
                             <Video size={14} /> Adicionar Aula neste Módulo
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                             <div className="md:col-span-2">
                               <input 
                                 placeholder="Título da Aula"
                                 value={newLesson.moduleId === module.id ? newLesson.title : ''}
                                 onChange={e => setNewLesson({...newLesson, moduleId: module.id, title: e.target.value})}
                                 className="w-full bg-black border border-white/10 p-3 rounded text-sm text-white focus:border-red-500 outline-none"
                               />
                             </div>
                             
                             <div className="md:col-span-2">
                               <div className="relative group">
                                 <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                 <input 
                                   type="text"
                                   placeholder="URL do Vídeo (Bunny.net Direct Play ou Embed URL)"
                                   value={newLesson.moduleId === module.id ? newLesson.video_url : ''}
                                   onChange={e => setNewLesson({...newLesson, moduleId: module.id, video_url: e.target.value})}
                                   className="w-full bg-black border border-white/10 p-3 pl-10 rounded text-sm text-white focus:border-red-500 outline-none"
                                 />
                               </div>
                               <p className="text-[10px] text-gray-600 mt-1 pl-1">Cole a "Direct Play URL" (mp4/m3u8) ou "Embed URL" do Bunny.net</p>
                             </div>

                             <input 
                               placeholder="Duração (ex: 12:00)"
                               value={newLesson.moduleId === module.id ? newLesson.duration : ''}
                               onChange={e => setNewLesson({...newLesson, moduleId: module.id, duration: e.target.value})}
                               className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:border-red-500 outline-none"
                             />
                             <div className="md:col-span-2">
                               <textarea 
                                 placeholder="Descrição curta da aula..."
                                 value={newLesson.moduleId === module.id ? newLesson.description : ''}
                                 onChange={e => setNewLesson({...newLesson, moduleId: module.id, description: e.target.value})}
                                 className="w-full bg-black border border-white/10 p-3 rounded text-sm text-white focus:border-red-500 outline-none h-20 resize-none"
                               />
                             </div>
                           </div>
                           <button 
                             onClick={handleAddLesson}
                             disabled={isSaving}
                             className={`w-full border border-white/10 text-gray-300 hover:text-white py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors flex justify-center gap-2 items-center
                                ${isSaving ? 'bg-white/5 cursor-wait' : 'bg-white/5 hover:bg-white/10'}
                             `}
                           >
                             {isSaving ? (
                               <>
                                 <Loader2 size={14} className="animate-spin" /> Salvando...
                               </>
                             ) : (
                               <>
                                 <Save size={14} /> Salvar Aula
                               </>
                             )}
                           </button>
                        </div>

                        <div className="space-y-2">
                          {module.lessons.map(lesson => (
                            <div key={lesson.id} className="flex justify-between items-center p-3 bg-white/5 rounded hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded bg-black/50 flex items-center justify-center text-gray-500 group-hover:text-[#eeb32d] transition-colors">
                                    <Video size={16} />
                                 </div>
                                 <div className="overflow-hidden">
                                   <p className="text-sm font-bold text-gray-200 truncate">{lesson.title}</p>
                                   <p className="text-xs text-gray-500 group-hover:text-gray-400">{lesson.duration}</p>
                                 </div>
                               </div>
                               <button 
                                 onClick={() => handleDeleteLesson(lesson.id)} 
                                 className="text-gray-600 hover:text-red-500 p-2 hover:bg-red-500/10 rounded transition-colors"
                                 title="Remover Aula"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                          ))}
                          {module.lessons.length === 0 && <p className="text-xs text-gray-600 text-center py-4 border border-dashed border-white/10 rounded">Nenhuma aula cadastrada neste módulo.</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
              
              <div className="bg-[#18181b] border border-white/5 p-6 rounded-lg shadow-lg">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                  <MessageSquare size={14} /> Novo Aviso
                </h3>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={newNoticeText}
                    onChange={(e) => setNewNoticeText(e.target.value)}
                    placeholder="Escreva um aviso para os alunos (ex: Manutenção na Steam hoje às 18h)"
                    className="flex-1 bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors"
                  />
                  <button 
                    onClick={handleAddNotice}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold uppercase text-sm flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Plus size={18} /> Publicar
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {notices.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-gray-500 bg-[#131315] border border-dashed border-white/10 rounded-lg">
                        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Nenhum aviso publicado ainda.</p>
                    </div>
                )}
                {notices.map(notice => (
                  <div key={notice.id} className="bg-[#131315] border border-white/5 p-5 rounded-lg flex justify-between items-center group hover:border-white/20 transition-all">
                     <div className="flex gap-4 items-start">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]"></div>
                        <div>
                           <p className="text-white text-base leading-relaxed">{notice.text}</p>
                           <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest flex items-center gap-1">
                             <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                             {notice.date}
                           </p>
                        </div>
                     </div>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         e.preventDefault();
                         handleDeleteNotice(notice.id);
                       }}
                       className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded transition-colors"
                       title="Excluir Aviso"
                     >
                       <Trash2 size={18} />
                     </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
             <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                   <div className="flex flex-col">
                     <h3 className="font-display font-bold text-xl uppercase italic">Gestão de Alunos</h3>
                     <p className="text-xs text-gray-500">Gerencie permissões e acessos.</p>
                   </div>
                   
                   <div className="flex items-center gap-2">
                     {/* Search Input */}
                     <div className="relative group flex-1 min-w-[250px]">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-[#eeb32d] transition-colors" />
                       <input 
                         type="text" 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="Buscar por nome, email ou ID..."
                         className="w-full bg-black border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm focus:border-[#eeb32d] focus:outline-none transition-colors"
                       />
                     </div>

                     <button 
                       onClick={handleRefresh}
                       disabled={isRefreshing}
                       className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded text-gray-300 hover:text-white transition-colors uppercase font-bold tracking-wide"
                       title="Recarregar Lista"
                     >
                        {isRefreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                     </button>
                     <span className="text-xs bg-white/5 px-3 py-2 rounded text-gray-400 font-mono">{filteredUsers.length}</span>
                   </div>
                </div>

                {showSqlHelp && (
                  <div className="bg-[#eeb32d]/10 border border-[#eeb32d]/30 rounded-lg p-6 mb-6 animate-fade-in-up">
                     <div className="flex items-start gap-4">
                       <div className="bg-[#eeb32d]/20 p-2 rounded-full text-[#eeb32d]">
                         <Database size={24} />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-[#eeb32d] font-bold text-lg mb-2">Atenção: A lista está vazia por segurança (RLS)</h4>
                          <p className="text-gray-300 text-sm mb-4">
                            O Supabase bloqueia a leitura de usuários por padrão. Para ver a lista aqui, você precisa rodar um comando SQL no painel do Supabase.
                          </p>
                          <button 
                            onClick={copySqlToClipboard}
                            className="bg-[#eeb32d] hover:bg-[#dca020] text-black font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(238,179,45,0.2)]"
                          >
                            Copiar Código SQL de Correção
                          </button>
                          <p className="text-[10px] text-gray-500 mt-2">
                            Copie e cole no "SQL Editor" do seu projeto Supabase.
                          </p>
                       </div>
                     </div>
                  </div>
                )}

                <div className="bg-[#131315] border border-white/5 rounded-lg overflow-hidden">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-white/5 text-xs text-gray-500 uppercase tracking-widest">
                         <th className="p-4 font-bold">Aluno</th>
                         <th className="p-4 font-bold">Status</th>
                         <th className="p-4 font-bold">Role</th>
                         <th className="p-4 font-bold text-right">Ação</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {filteredUsers.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    {searchTerm ? `Nenhum aluno encontrado para "${searchTerm}"` : "Nenhum aluno cadastrado."}
                                </td>
                            </tr>
                        )}
                        {filteredUsers.map((user) => (
                           <tr key={user.id} className="hover:bg-white/5 transition-colors">
                             <td className="p-4">
                               <p className="font-bold text-white text-sm">{user.name || 'Sem nome'}</p>
                               <p className="text-xs text-gray-500">{user.email || 'Email oculto'}</p>
                               <p className="text-[10px] text-gray-600 font-mono mt-1 select-all">{user.id}</p>
                             </td>
                             <td className="p-4">
                                {user.role === 'admin' ? (
                                   <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-500 px-2 py-1 rounded text-xs font-bold uppercase">
                                     Admin
                                   </span>
                                ) : user.has_purchased ? (
                                   <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold uppercase">
                                     <CheckCircle size={12} /> Ativo
                                   </span>
                                ) : (
                                   <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold uppercase">
                                     <XCircle size={12} /> Bloqueado
                                   </span>
                                )}
                             </td>
                             <td className="p-4 text-sm text-gray-400 uppercase font-bold text-xs">{user.role}</td>
                             <td className="p-4 text-right">
                                {user.role !== 'admin' && (
                                   <button 
                                     onClick={() => toggleUserApproval(user.id, user.has_purchased)}
                                     className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                                        user.has_purchased 
                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
                                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20'
                                     }`}
                                   >
                                     {user.has_purchased ? 'Bloquear Acesso' : 'Aprovar Conta'}
                                   </button>
                                )}
                             </td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
             </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminPanel;