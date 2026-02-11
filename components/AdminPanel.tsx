
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Plus, Trash2, Video, 
  ChevronDown, Loader2, AlertTriangle, ArrowLeft, LogOut, Users, RefreshCcw, Search, Pencil, X, Shield, Bell, Info, Calendar, UserCheck, AlertCircle, Settings, Lock, Unlock, CheckSquare,
  FileText, Megaphone, Flame, Link as LinkIcon, HardDrive, Folder, FileVideo, CornerUpLeft, Image as ImageIcon, Gavel, GripVertical
} from 'lucide-react';
import { ModuleStatus, LessonStatus, Notice, UserProfile } from '../types';
import CustomModal from './CustomModal';

interface AdminPanelProps {
  onLogout: () => void;
  onBack?: () => void;
}

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onBack }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'notices' | 'users'>('content');
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Drag and Drop States
  const [draggedLesson, setDraggedLesson] = useState<LessonStatus | null>(null);
  
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userEditForm, setUserEditForm] = useState<{
    has_purchased: boolean;
    accessible_modules: string[];
  }>({ has_purchased: false, accessible_modules: [] });
  
  const isFetching = useRef(false);

  const [newModule, setNewModule] = useState({ id: '', title: '', order: 0 });
  const [isEditingModule, setIsEditingModule] = useState(false);

  const [newLesson, setNewLesson] = useState({ title: '', duration: '', video_id: '', cover_url: '', description: '', order: 0, module_id: '' });
  const [editingLesson, setEditingLesson] = useState<LessonStatus | null>(null);

  const [newNotice, setNewNotice] = useState('');
  const [newNoticeType, setNewNoticeType] = useState<'info' | 'patch' | 'alert' | 'meta'>('info');
  const [newNoticeLink, setNewNoticeLink] = useState('');
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [driveIsLoading, setDriveIsLoading] = useState(false);
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  
  const ROOT_FOLDER_ID = '1tHADfuie45UoPcrP4OAY9Kahn28x9ZA_';
  const [driveCurrentFolder, setDriveCurrentFolder] = useState<string>(ROOT_FOLDER_ID); 
  const [driveBreadcrumbs, setDriveBreadcrumbs] = useState<{id: string, name: string}[]>([{id: ROOT_FOLDER_ID, name: 'Doutrina CS (Root)'}]);
  
  const [driveError, setDriveError] = useState<string | null>(null);

  const [modal, setModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info'}>({ 
    isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'info' 
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (isFetching.current) return;
    try {
      isFetching.current = true;
      let shouldShowLoader = false;
      if (activeTab === 'users' && users.length === 0) shouldShowLoader = true;
      if (activeTab === 'content' && modules.length === 0) shouldShowLoader = true;
      if (activeTab === 'notices' && notices.length === 0) shouldShowLoader = true;

      if (shouldShowLoader) setIsLoading(true);
      setFetchError(null);

      const { data: mData, error: mError } = await supabase
        .from('modules')
        .select(`*, lessons (*)`)
        .order('order', { ascending: true });
      if (mError) console.error("Erro Módulos:", mError);
      if (mData) {
        // Garantir que as aulas venham ordenadas dentro do módulo
        const sortedModules = mData.map((m: any) => ({
          ...m,
          lessons: m.lessons.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        }));
        setModules(sortedModules as any);
      }

      const { data: nData, error: nError } = await supabase
        .from('notices')
        .select('*')
        .order('id', { ascending: false });
      if (nData) setNotices(nData);

      const { data: uData, error: uError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (uError) setFetchError(uError.message);
      if (uData) setUsers(uData as UserProfile[]);
      
    } catch (err) {
      console.error("Erro crítico no fetch do Admin:", err);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  // --- DRAG AND DROP LOGIC ---
  const handleDragStart = (lesson: LessonStatus) => {
    setDraggedLesson(lesson);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  const handleDrop = async (targetLesson: LessonStatus, moduleId: string) => {
    if (!draggedLesson || draggedLesson.id === targetLesson.id) return;

    const currentModule = modules.find(m => m.id === moduleId);
    if (!currentModule) return;

    const moduleLessons = [...currentModule.lessons];
    const draggedIdx = moduleLessons.findIndex(l => l.id === draggedLesson.id);
    const targetIdx = moduleLessons.findIndex(l => l.id === targetLesson.id);

    // Reordena no array local
    moduleLessons.splice(draggedIdx, 1);
    moduleLessons.splice(targetIdx, 0, draggedLesson);

    // Atualiza a propriedade 'order' de todos para refletir a nova posição
    const updatedLessons = moduleLessons.map((l, index) => ({
      ...l,
      order: index + 1
    }));

    // Atualiza o estado visual imediatamente
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: updatedLessons } : m));
    setDraggedLesson(null);

    // Persiste no banco de dados (Batch Update)
    try {
      const updates = updatedLessons.map(l => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        video_id: (l as any).video_id || l.video_url,
        cover_url: l.cover_url,
        description: l.description,
        module_id: l.module_id,
        order: l.order
      }));

      const { error } = await supabase.from('lessons').upsert(updates);
      if (error) throw error;
      console.log("Ordem das aulas salva com sucesso.");
    } catch (err) {
      console.error("Erro ao salvar nova ordem:", err);
      alert("Erro ao salvar ordem das aulas no servidor.");
      fetchData(); // Recarrega para voltar ao estado anterior em caso de erro
    }
  };

  // --- GOOGLE DRIVE LOGIC ---
  const fetchDriveFiles = async (folderId: string) => {
    setDriveIsLoading(true);
    setDriveError(null);
    try {
      const { data, error } = await supabase.functions.invoke('google-drive', {
        method: 'POST',
        body: { action: 'list', folderId: folderId }
      });
      if (error) throw new Error(error.message);
      if (data && data.files) setDriveItems(data.files);
    } catch (err: any) {
      setDriveError(err.message);
    } finally {
      setDriveIsLoading(false);
    }
  };

  const handleOpenDrive = () => {
    setIsDrivePickerOpen(true);
    fetchDriveFiles(driveCurrentFolder);
  };

  const handleDriveFolderClick = (folderId: string, folderName: string) => {
    setDriveCurrentFolder(folderId);
    setDriveBreadcrumbs([...driveBreadcrumbs, { id: folderId, name: folderName }]);
    fetchDriveFiles(folderId);
  };

  const handleDriveBack = () => {
    if (driveBreadcrumbs.length <= 1) return;
    const newBreadcrumbs = [...driveBreadcrumbs];
    newBreadcrumbs.pop();
    const prevFolder = newBreadcrumbs[newBreadcrumbs.length - 1];
    setDriveCurrentFolder(prevFolder.id);
    setDriveBreadcrumbs(newBreadcrumbs);
    fetchDriveFiles(prevFolder.id);
  };

  const handleSelectDriveVideo = (fileId: string) => {
    setNewLesson({ ...newLesson, video_id: fileId });
    setIsDrivePickerOpen(false);
  };

  const detectPlan = (user: UserProfile) => {
    if (user.role === 'admin') return { label: 'ADMIN', color: 'text-red-500', border: 'border-red-500/20 bg-red-500/10' };
    if (user.has_purchased) return { label: 'PRO (FULL)', color: 'text-[#eeb32d]', border: 'border-[#eeb32d]/20 bg-[#eeb32d]/10' };
    const mods = user.accessible_modules || [];
    if (mods.length === 4 && ['m1','m2','m3','m4'].every(m => mods.includes(m))) return { label: 'START', color: 'text-blue-400', border: 'border-blue-400/20 bg-blue-400/10' };
    if (mods.length > 0) return { label: 'CUSTOM', color: 'text-purple-400', border: 'border-purple-400/20 bg-purple-400/10' };
    return { label: 'SEM ACESSO', color: 'text-gray-500', border: 'border-white/5 bg-white/5' };
  };

  const handleOpenUserEdit = (user: UserProfile) => {
    setEditingUser(user);
    setUserEditForm({ has_purchased: user.has_purchased || false, accessible_modules: user.accessible_modules || [] });
  };

  const handleSaveUserAccess = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        has_purchased: userEditForm.has_purchased,
        accessible_modules: userEditForm.accessible_modules
      }).eq('id', editingUser.id);
      if (error) throw error;
      setEditingUser(null);
      fetchData(); 
    } catch (err) {
      alert("Erro ao atualizar usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveModule = async () => {
    if (!newModule.id || !newModule.title) return;
    setIsSaving(true);
    try {
      const { error } = isEditingModule 
        ? await supabase.from('modules').update({ title: newModule.title, order: newModule.order }).eq('id', newModule.id)
        : await supabase.from('modules').insert(newModule);
      if (error) throw error;
      setNewModule({ id: '', title: '', order: 0 });
      setIsEditingModule(false);
      setExpandedModule(null);
      await fetchData();
    } catch (err: any) {
      alert("Erro ao salvar módulo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!newLesson.title || !newLesson.module_id) return;
    setIsSaving(true);
    try {
      const { error } = editingLesson 
        ? await supabase.from('lessons').update(newLesson).eq('id', editingLesson.id)
        : await supabase.from('lessons').insert({ ...newLesson, order: (modules.find(m => m.id === newLesson.module_id)?.lessons.length || 0) + 1 });
      if (error) throw error;
      setNewLesson({ title: '', duration: '', video_id: '', cover_url: '', description: '', order: 0, module_id: newLesson.module_id });
      setEditingLesson(null);
      await fetchData();
    } catch (err: any) {
      alert("Erro ao salvar aula.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotice = async () => {
    if (!newNotice.trim()) return;
    setIsSaving(true);
    let error;
    if (editingNotice) {
      const { error: ue } = await supabase.from('notices').update({ text: newNotice, type: newNoticeType, link: newNoticeLink || null }).eq('id', editingNotice.id);
      error = ue;
    } else {
      const { error: ie } = await supabase.from('notices').insert({ text: newNotice, date: new Date().toLocaleDateString('pt-BR'), type: newNoticeType, link: newNoticeLink || null });
      error = ie;
    }
    if (!error) {
      setEditingNotice(null); setNewNotice(''); setNewNoticeType('info'); setNewNoticeLink('');
      await fetchData(); 
    }
    setIsSaving(false);
  };

  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    return (u.email || '').toLowerCase().includes(search) || (u.name || '').toLowerCase().includes(search);
  });

  return (
    <div className="min-h-screen bg-[#0F1012] text-white flex flex-col md:flex-row relative">
      <CustomModal isOpen={modal.isOpen} title={modal.title} message={modal.message} variant={modal.variant} onConfirm={modal.onConfirm} onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))} />

      {/* --- MODAL DRIVE PICKER --- */}
      {isDrivePickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsDrivePickerOpen(false)} />
           <div className="relative w-full max-w-3xl bg-[#131315] border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[600px]">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#18181b]">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#eeb32d]/10 flex items-center justify-center rounded-lg border border-[#eeb32d]/20 text-[#eeb32d]"><HardDrive size={20} /></div>
                    <div>
                      <h3 className="font-display font-bold text-white uppercase tracking-wide">Google Drive</h3>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                         {driveBreadcrumbs.length > 1 && (<button onClick={handleDriveBack} className="hover:text-white flex items-center gap-1 mr-1"><CornerUpLeft size={10} /> Voltar</button>)}
                         <span className="opacity-50">/</span><span className="font-bold text-[#eeb32d]">{driveBreadcrumbs[driveBreadcrumbs.length - 1].name}</span>
                      </div>
                    </div>
                 </div>
                 <button onClick={() => setIsDrivePickerOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                 {driveIsLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500"><Loader2 className="animate-spin mb-3 text-[#eeb32d]" size={32} /><p className="text-xs font-bold uppercase tracking-widest">Acessando Nuvem...</p></div>
                 ) : driveError ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-500 p-8 text-center"><AlertCircle size={48} className="mb-4 opacity-50" /><p className="font-bold uppercase tracking-widest text-sm mb-2">Falha na Conexão</p></div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                       {driveItems.map((item) => (
                          <button key={item.id} onClick={() => item.mimeType === 'application/vnd.google-apps.folder' ? handleDriveFolderClick(item.id, item.name) : handleSelectDriveVideo(item.id)} className={`flex flex-col items-center p-4 rounded-xl border transition-all group ${item.mimeType === 'application/vnd.google-apps.folder' ? 'bg-[#18181b] border-white/5 hover:bg-white/5' : 'bg-[#18181b] border-white/5 hover:border-[#eeb32d]/50 hover:bg-[#eeb32d]/5'}`}>
                             <div className="mb-3">{item.mimeType === 'application/vnd.google-apps.folder' ? <Folder size={32} className="text-gray-500 group-hover:text-white" /> : <FileVideo size={32} className="text-[#eeb32d] group-hover:scale-110" />}</div>
                             <span className="text-[10px] text-center font-bold text-gray-400 group-hover:text-white line-clamp-2 w-full">{item.name}</span>
                          </button>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#131315] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 text-red-500 mb-2"><Shield size={18} /><span className="font-display font-bold uppercase tracking-tighter text-base italic">Command Center</span></div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[ { id: 'content', label: 'Arsenal', icon: <Video size={16} /> }, { id: 'notices', label: 'Informações', icon: <Info size={16} /> }, { id: 'users', label: 'Operadores', icon: <Users size={16} /> } ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-[10px] font-bold uppercase tracking-widest ${activeTab === tab.id ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-gray-500 hover:text-white'}`}>{tab.icon} {tab.label}</button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5"><button onClick={onBack} className="w-full flex items-center justify-center gap-2 py-2 rounded bg-white/5 text-gray-400 border border-white/5 text-[9px] font-bold uppercase">Voltar ao QG</button></div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4"><Loader2 className="animate-spin text-red-500 w-8 h-8 opacity-40" /><p className="text-[9px] font-black uppercase text-red-500 tracking-widest">Acessando Arquivos...</p></div>
        ) : (
          <div className="animate-fade-in max-w-5xl mx-auto">
            {activeTab === 'content' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                  <div><h2 className="text-3xl font-display font-bold uppercase italic tracking-tighter">Gerenciar <span className="text-red-500">Arsenal</span></h2></div>
                  <button onClick={() => {setNewModule({ id: '', title: '', order: modules.length + 1 }); setIsEditingModule(false); setExpandedModule('new');}} className="bg-red-600 text-white px-6 py-3 rounded text-[9px] font-black uppercase tracking-widest">Novo Módulo</button>
                </div>

                <div className="space-y-3">
                  {modules.map(mod => (
                    <div key={mod.id} className="bg-[#131315] border border-white/5 rounded-xl overflow-hidden group">
                      <div className="p-4 flex items-center justify-between bg-[#18181b]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center font-black text-red-500 text-sm">{mod.order}</div>
                          <div><h4 className="font-display font-bold text-lg uppercase">{mod.title}</h4></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => {setNewLesson({...newLesson, module_id: mod.id}); setExpandedModule(expandedModule === mod.id ? null : mod.id)}} className="p-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded"><Plus size={16}/></button>
                          <button onClick={() => {setNewModule({ id: mod.id, title: mod.title, order: mod.order || 0 }); setIsEditingModule(true); setExpandedModule('new');}} className="p-2 bg-white/5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 rounded"><Pencil size={16}/></button>
                        </div>
                      </div>
                      
                      {expandedModule === mod.id && (
                        <div className="p-6 bg-black/40 border-t border-white/5 animate-fade-in space-y-6">
                           {/* Formulário de Aula */}
                           <div className="bg-[#131315] p-5 rounded-lg border border-red-500/10 space-y-4">
                              <h5 className="text-[9px] font-black uppercase text-red-500">{editingLesson ? 'Editando Aula' : 'Nova Aula'}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input placeholder="Título" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} className="w-full bg-black border border-white/5 p-2.5 rounded text-xs"/>
                                <input placeholder="Duração" value={newLesson.duration} onChange={e => setNewLesson({...newLesson, duration: e.target.value})} className="w-full bg-black border border-white/5 p-2.5 rounded text-xs"/>
                                <div className="col-span-2 flex gap-2">
                                  <input placeholder="ID ou URL do Vídeo" value={newLesson.video_id} onChange={e => setNewLesson({...newLesson, video_id: e.target.value})} className="w-full bg-black border border-white/5 p-2.5 rounded text-xs"/>
                                  <button onClick={handleOpenDrive} className="px-3 bg-white/5 text-gray-400 border border-white/10 rounded flex items-center justify-center"><HardDrive size={16} /></button>
                                </div>
                                <input placeholder="URL da Capa" value={newLesson.cover_url} onChange={e => setNewLesson({...newLesson, cover_url: e.target.value})} className="w-full bg-black border border-white/5 p-2.5 rounded text-xs col-span-2"/>
                                <textarea placeholder="Descrição" value={newLesson.description} onChange={e => setNewLesson({...newLesson, description: e.target.value})} className="w-full bg-black border border-white/5 p-2.5 rounded text-xs min-h-[60px] col-span-2"/>
                              </div>
                              <div className="flex gap-2">
                                <button disabled={isSaving} onClick={handleSaveLesson} className="flex-1 bg-red-600 py-2.5 rounded font-black text-[9px] uppercase">{isSaving ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Lançar Missão'}</button>
                                {editingLesson && <button onClick={() => {setEditingLesson(null); setNewLesson({title:'', duration:'', video_id:'', cover_url:'', description:'', order:0, module_id: mod.id});}} className="px-6 bg-white/5 rounded text-[9px] font-black">Cancelar</button>}
                              </div>
                           </div>

                           {/* Lista de Aulas com DRAG AND DROP */}
                           <div className="space-y-1">
                             <p className="text-[8px] text-gray-600 font-bold uppercase mb-2 flex items-center gap-2"><GripVertical size={10}/> Arraste para reordenar as missões</p>
                             {mod.lessons?.map((lesson) => (
                               <div 
                                  key={lesson.id} 
                                  draggable
                                  onDragStart={() => handleDragStart(lesson)}
                                  onDragOver={handleDragOver}
                                  onDrop={() => handleDrop(lesson, mod.id)}
                                  className={`py-2.5 px-4 flex items-center justify-between group/item hover:bg-white/[0.03] rounded border border-transparent transition-all cursor-grab active:cursor-grabbing ${draggedLesson?.id === lesson.id ? 'opacity-30 border-red-500/30 bg-red-500/5' : ''}`}
                               >
                                  <div className="flex items-center gap-4">
                                    <GripVertical size={14} className="text-gray-700 group-hover/item:text-red-500/50" />
                                    <div className="text-[9px] font-black text-gray-600">{(lesson.order || 0).toString().padStart(2, '0')}</div>
                                    <p className="text-xs font-bold uppercase text-gray-300">{lesson.title}</p>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100">
                                     <button onClick={() => { setEditingLesson(lesson); setNewLesson({ title: lesson.title, duration: lesson.duration, video_id: (lesson as any).video_id || lesson.video_url || '', cover_url: lesson.cover_url || '', description: lesson.description || '', order: lesson.order || 0, module_id: mod.id }); }} className="p-1.5 text-gray-500 hover:text-blue-500"><Pencil size={14}/></button>
                                     <button onClick={async () => { if(confirm('Excluir aula?')) { await supabase.from('lessons').delete().eq('id', lesson.id); fetchData(); } }} className="p-1.5 text-gray-500 hover:text-red-500"><Trash2 size={14}/></button>
                                  </div>
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                    <div><h2 className="text-3xl font-display font-bold uppercase italic tracking-tighter">Lista de <span className="text-red-500">Operadores</span></h2></div>
                    <div className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} /><input type="text" placeholder="Buscar por e-mail..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#131315] border border-white/5 p-3 pl-10 rounded-lg text-xs outline-none focus:border-red-500/30"/></div>
                 </div>
                 <div className="bg-[#131315] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left min-w-[700px]">
                       <thead className="bg-[#18181b] text-[9px] text-gray-500 uppercase font-bold border-b border-white/5">
                          <tr><th className="p-5">Nome / E-mail</th><th className="p-5">Plano / Status</th><th className="p-5 text-right">Ação</th></tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {filteredUsers.map(u => {
                            const p = detectPlan(u);
                            return (
                              <tr key={u.id} className="hover:bg-white/[0.01]">
                                 <td className="p-5"><div className="text-xs font-bold text-white">{u.name}</div><div className="text-[10px] text-gray-500">{u.email}</div></td>
                                 <td className="p-5"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${p.border} ${p.color}`}>{p.label}</span></td>
                                 <td className="p-5 text-right"><button onClick={() => handleOpenUserEdit(u)} className="p-2 rounded transition-all border text-gray-400 border-white/5 hover:text-white"><Settings size={14}/></button></td>
                              </tr>
                            );
                          })}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
