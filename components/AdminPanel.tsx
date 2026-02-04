
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Plus, Trash2, Video, 
  ChevronDown, Loader2, AlertTriangle, ArrowLeft, LogOut, Users, RefreshCcw, Search, Pencil, X, Shield, Bell, Info, Calendar, UserCheck, AlertCircle, Settings, Lock, Unlock, CheckSquare,
  FileText, Megaphone, Flame, Link as LinkIcon, HardDrive, Folder, FileVideo, CornerUpLeft, Image as ImageIcon, Gavel
} from 'lucide-react';
import { ModuleStatus, LessonStatus, Notice, UserProfile } from '../types';
import CustomModal from './CustomModal';

interface AdminPanelProps {
  onLogout: () => void;
  onBack?: () => void;
}

// Interface para itens do Drive
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
  
  // Estado para Edição de Usuário (Permissões)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userEditForm, setUserEditForm] = useState<{
    has_purchased: boolean;
    accessible_modules: string[];
  }>({ has_purchased: false, accessible_modules: [] });
  
  const isFetching = useRef(false);

  // States para Formulários de Conteúdo
  const [newModule, setNewModule] = useState({ id: '', title: '', order: 0 });
  const [isEditingModule, setIsEditingModule] = useState(false);

  const [newLesson, setNewLesson] = useState({ title: '', duration: '', video_id: '', cover_url: '', description: '', order: 0, module_id: '' });
  const [editingLesson, setEditingLesson] = useState<LessonStatus | null>(null);

  // State para Avisos
  const [newNotice, setNewNotice] = useState('');
  const [newNoticeType, setNewNoticeType] = useState<'info' | 'patch' | 'alert' | 'meta'>('info');
  const [newNoticeLink, setNewNoticeLink] = useState('');
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // --- GOOGLE DRIVE STATES ---
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [driveIsLoading, setDriveIsLoading] = useState(false);
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  
  // CONFIGURAÇÃO INICIAL DA PASTA
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

      // 1. Carregar Módulos
      const { data: mData, error: mError } = await supabase
        .from('modules')
        .select(`*, lessons (*)`)
        .order('order', { ascending: true });
      if (mError) console.error("Erro Módulos:", mError);
      if (mData) setModules(mData as any);

      // 2. Carregar Avisos/Informações
      const { data: nData, error: nError } = await supabase
        .from('notices')
        .select('*')
        .order('id', { ascending: false });
      if (nError) console.error("Erro Avisos:", nError);
      if (nData) setNotices(nData);

      // 3. Carregar Usuários (Operadores)
      const { data: uData, error: uError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (uError) {
        console.error("Erro Usuários (RLS ou Tabela):", uError);
        setFetchError(uError.message);
      }
      
      if (uData) {
        setUsers(uData as UserProfile[]);
      } else {
        setUsers([]);
      }
      
    } catch (err) {
      console.error("Erro crítico no fetch do Admin:", err);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
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

      if (error) throw new Error(error.message || "Erro de conexão com a função.");
      if (data && data.error) throw new Error(data.error);

      if (data && data.files) {
        setDriveItems(data.files);
      } else {
        setDriveItems([]);
      }
    } catch (err: any) {
      console.error("Drive Error Catch:", err);
      setDriveError(err.message || "Erro desconhecido ao acessar o Drive.");
      setDriveItems([]); 
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
    const isStart = mods.length === 4 && ['m1','m2','m3','m4'].every(m => mods.includes(m));
    
    if (isStart) return { label: 'START', color: 'text-blue-400', border: 'border-blue-400/20 bg-blue-400/10' };
    if (mods.length > 0) return { label: 'CUSTOM', color: 'text-purple-400', border: 'border-purple-400/20 bg-purple-400/10' };
    
    return { label: 'SEM ACESSO', color: 'text-gray-500', border: 'border-white/5 bg-white/5' };
  };

  const handleOpenUserEdit = (user: UserProfile) => {
    setEditingUser(user);
    setUserEditForm({
      has_purchased: user.has_purchased || false,
      accessible_modules: user.accessible_modules || []
    });
  };

  const handleToggleModuleAccess = (moduleId: string) => {
    setUserEditForm(prev => {
      const exists = prev.accessible_modules.includes(moduleId);
      let newModules;
      if (exists) {
        newModules = prev.accessible_modules.filter(id => id !== moduleId);
      } else {
        newModules = [...prev.accessible_modules, moduleId];
      }
      return { ...prev, accessible_modules: newModules };
    });
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
      console.error("Erro ao salvar permissões:", err);
      alert("Erro ao atualizar usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- MÓDULOS ---
  const handleEditModule = (mod: any) => {
    setNewModule({ id: mod.id, title: mod.title, order: mod.order || 0 });
    setIsEditingModule(true);
    setExpandedModule('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      console.error("Erro ao salvar módulo:", err);
      alert("Erro ao salvar módulo: " + (err.message || "Tente novamente"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    setModal({
      isOpen: true,
      title: "DESTRUIR MÓDULO?",
      message: "Isso removerá permanentemente o módulo e todas as aulas vinculadas.",
      variant: 'danger',
      onConfirm: async () => {
        await supabase.from('modules').delete().eq('id', id);
        setModal(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    });
  };

  // --- AULAS ---
  const handleEditLesson = (lesson: LessonStatus) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      duration: lesson.duration,
      video_id: (lesson as any).video_id || lesson.video_url || '',
      cover_url: lesson.cover_url || '',
      description: lesson.description || '',
      order: lesson.order || 0,
      module_id: lesson.module_id || ''
    });
  };

  const handleSaveLesson = async () => {
    if (!newLesson.title || !newLesson.module_id) return;
    setIsSaving(true);
    try {
      const { error } = editingLesson 
        ? await supabase.from('lessons').update(newLesson).eq('id', editingLesson.id)
        : await supabase.from('lessons').insert(newLesson);

      if (error) throw error;

      setNewLesson({ title: '', duration: '', video_id: '', cover_url: '', description: '', order: 0, module_id: newLesson.module_id });
      setEditingLesson(null);
      await fetchData();
    } catch (err: any) {
      console.error("Erro ao salvar aula:", err);
      alert("Erro ao salvar aula: " + (err.message || "Tente novamente"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    setModal({
      isOpen: true,
      title: "REMOVER AULA?",
      message: "Esta ação não pode ser desfeita.",
      variant: 'danger',
      onConfirm: async () => {
        await supabase.from('lessons').delete().eq('id', id);
        setModal(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    });
  };

  // --- AVISOS ---
  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setNewNotice(notice.text);
    setNewNoticeType(notice.type || 'info');
    setNewNoticeLink(notice.link || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditNotice = () => {
    setEditingNotice(null);
    setNewNotice('');
    setNewNoticeType('info');
    setNewNoticeLink('');
  };

  const handleSaveNotice = async () => {
    if (!newNotice.trim()) {
      alert("Por favor, escreva o conteúdo do aviso.");
      return;
    }
    setIsSaving(true);
    let error;

    if (editingNotice) {
      const { error: updateError } = await supabase.from('notices').update({
        text: newNotice,
        type: newNoticeType,
        link: newNoticeLink || null
      }).eq('id', editingNotice.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('notices').insert({ 
        text: newNotice, 
        date: new Date().toLocaleDateString('pt-BR'),
        type: newNoticeType,
        link: newNoticeLink || null
      });
      error = insertError;
    }

    if (!error) {
      handleCancelEditNotice();
      await fetchData(); 
    } else {
      console.error("Erro aviso:", error);
      alert("Falha ao salvar aviso no banco de dados.");
    }
    setIsSaving(false);
  };

  const handleDeleteNotice = (id: number) => {
    setModal({
      isOpen: true,
      title: "REMOVER COMUNICADO?",
      message: "Este aviso desaparecerá do dashboard dos alunos imediatamente. Tem certeza?",
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await supabase.from('notices').delete().eq('id', id);
        if (!error) {
           if (editingNotice?.id === id) {
             handleCancelEditNotice();
           }
           fetchData();
           setModal(prev => ({ ...prev, isOpen: false }));
        } else {
           console.error("Erro ao deletar aviso:", error);
        }
      }
    });
  };

  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    const emailMatch = (u.email || '').toLowerCase().includes(search);
    const nameMatch = (u.name || '').toLowerCase().includes(search);
    return emailMatch || nameMatch;
  });

  const totalUsers = users.length;
  const activeStudents = users.filter(u => u.has_purchased || (u.accessible_modules && u.accessible_modules.length > 0)).length;

  const getNoticeIcon = (type: string) => {
    switch(type) {
      case 'patch': return <FileText size={14} className="text-blue-400" />;
      case 'alert': return <Megaphone size={14} className="text-yellow-400" />;
      case 'meta': return <Flame size={14} className="text-orange-500" />;
      default: return <Info size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1012] text-white flex flex-col md:flex-row relative">
      <CustomModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* --- MODAL DRIVE PICKER --- */}
      {isDrivePickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsDrivePickerOpen(false)} />
           <div className="relative w-full max-w-3xl bg-[#131315] border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[600px]">
              {/* Header Drive */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#18181b]">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#eeb32d]/10 flex items-center justify-center rounded-lg border border-[#eeb32d]/20 text-[#eeb32d]">
                       <HardDrive size={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white uppercase tracking-wide">Google Drive</h3>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                         {driveBreadcrumbs.length > 1 && (
                            <button onClick={handleDriveBack} className="hover:text-white flex items-center gap-1 mr-1">
                               <CornerUpLeft size={10} /> Voltar
                            </button>
                         )}
                         <span className="opacity-50">/</span>
                         <span className="font-bold text-[#eeb32d]">{driveBreadcrumbs[driveBreadcrumbs.length - 1].name}</span>
                      </div>
                    </div>
                 </div>
                 <button onClick={() => setIsDrivePickerOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white"><X size={20}/></button>
              </div>

              {/* Body Drive */}
              <div className="flex-1 overflow-y-auto p-4">
                 {driveIsLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                       <Loader2 className="animate-spin mb-3 text-[#eeb32d]" size={32} />
                       <p className="text-xs font-bold uppercase tracking-widest">Acessando Nuvem...</p>
                    </div>
                 ) : driveError ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-500 p-8 text-center">
                       <AlertCircle size={48} className="mb-4 opacity-50" />
                       <p className="font-bold uppercase tracking-widest text-sm mb-2">Falha na Conexão</p>
                       <p className="text-xs text-gray-500 max-w-sm whitespace-pre-wrap">{driveError}</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                       {driveItems.length === 0 ? (
                          <div className="col-span-full py-20 text-center text-gray-600">
                             <Folder size={48} className="mx-auto mb-3 opacity-20" />
                             <p className="text-xs font-bold uppercase tracking-widest">Pasta Vazia</p>
                          </div>
                       ) : (
                          driveItems.map((item) => (
                             <button 
                                key={item.id}
                                onClick={() => item.mimeType === 'application/vnd.google-apps.folder' ? handleDriveFolderClick(item.id, item.name) : handleSelectDriveVideo(item.id)}
                                className={`flex flex-col items-center p-4 rounded-xl border transition-all group ${
                                  item.mimeType === 'application/vnd.google-apps.folder' 
                                    ? 'bg-[#18181b] border-white/5 hover:bg-white/5' 
                                    : 'bg-[#18181b] border-white/5 hover:border-[#eeb32d]/50 hover:bg-[#eeb32d]/5'
                                }`}
                             >
                                <div className="mb-3">
                                   {item.mimeType === 'application/vnd.google-apps.folder' ? (
                                      <Folder size={32} className="text-gray-500 group-hover:text-white transition-colors" />
                                   ) : (
                                      <FileVideo size={32} className="text-[#eeb32d] group-hover:scale-110 transition-transform" />
                                   )}
                                </div>
                                <span className="text-[10px] text-center font-bold text-gray-400 group-hover:text-white line-clamp-2 w-full break-words">
                                   {item.name}
                                </span>
                             </button>
                          ))
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
           <div className="relative w-full max-w-2xl bg-[#131315] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#18181b]">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#eeb32d]/10 flex items-center justify-center border border-[#eeb32d]/20 text-[#eeb32d]">
                       <Settings size={20} />
                    </div>
                    <div>
                       <h3 className="text-white font-bold font-display uppercase tracking-wider">Gerenciar Acesso</h3>
                       <p className="text-gray-500 text-xs">{editingUser.email}</p>
                    </div>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white"><X size={20}/></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8">
                 <div className="bg-[#0a0a0b] border border-white/5 p-4 rounded-lg flex items-center justify-between">
                    <div>
                       <h4 className="text-[#eeb32d] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                          <Shield size={16} /> Acesso Vitalício (PRO)
                       </h4>
                       <p className="text-gray-500 text-xs mt-1">Libera automaticamente todos os módulos presentes e futuros.</p>
                    </div>
                    <button 
                      onClick={() => setUserEditForm(prev => ({ ...prev, has_purchased: !prev.has_purchased }))}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${userEditForm.has_purchased ? 'bg-[#eeb32d]' : 'bg-gray-700'}`}
                    >
                       <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${userEditForm.has_purchased ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                 </div>

                 <div className={`space-y-4 transition-opacity ${userEditForm.has_purchased ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between">
                       <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                          <CheckSquare size={16} /> Módulos Liberados
                       </h4>
                       <span className="text-[10px] text-gray-500 uppercase font-bold bg-white/5 px-2 py-1 rounded">
                          {userEditForm.accessible_modules.length} Selecionados
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {modules.map(mod => {
                         const isSelected = userEditForm.accessible_modules.includes(mod.id);
                         return (
                           <button
                             key={mod.id}
                             onClick={() => handleToggleModuleAccess(mod.id)}
                             className={`flex items-center gap-3 p-3 rounded border text-left transition-all ${
                               isSelected 
                                 ? 'bg-[#eeb32d]/10 border-[#eeb32d]/30 text-white' 
                                 : 'bg-[#131315] border-white/5 text-gray-500 hover:border-white/20'
                             }`}
                           >
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#eeb32d] border-[#eeb32d]' : 'bg-black border-white/20'}`}>
                                 {isSelected && <Users size={12} className="text-black" />}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">ID: {mod.id}</span>
                                 <span className="text-xs font-bold uppercase truncate max-w-[200px]">{mod.title}</span>
                              </div>
                           </button>
                         );
                       })}
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-[#0a0a0b] border-t border-white/5 flex justify-end gap-3">
                 <button onClick={() => setEditingUser(null)} className="px-6 py-3 rounded text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white">Cancelar</button>
                 <button 
                    onClick={handleSaveUserAccess} 
                    disabled={isSaving}
                    className="px-6 py-3 bg-[#eeb32d] hover:bg-[#dca020] text-black rounded text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2"
                 >
                    {isSaving ? <Loader2 className="animate-spin" size={16}/> : 'Salvar Alterações'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#131315] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <Shield size={18} />
            <span className="font-display font-bold uppercase tracking-tighter text-base italic">Command <span className="text-white">Center</span></span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Acesso de Administrador</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'content', label: 'Arsenal', icon: <Video size={16} /> },
            { id: 'notices', label: 'Informações', icon: <Info size={16} /> },
            { id: 'users', label: 'Operadores', icon: <Users size={16} /> },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-[10px] font-bold uppercase tracking-widest ${activeTab === tab.id ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={onBack} className="w-full flex items-center justify-center gap-2 py-2 rounded bg-white/5 text-gray-400 border border-white/5 text-[9px] font-bold uppercase hover:bg-white/10 transition-all">
            <ArrowLeft size={14} /> Voltar ao QG
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        {isLoading && users.length === 0 && modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="animate-spin text-red-500 w-8 h-8 opacity-40" />
            <p className="text-[9px] font-black uppercase text-red-500 tracking-[0.3em] animate-pulse">Acessando Arquivos...</p>
          </div>
        ) : (
          <div className="animate-fade-in max-w-5xl mx-auto">
            {activeTab === 'content' && (
              <div className="space-y-8">
                {/* Header da Seção */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                  <div>
                    <h2 className="text-3xl font-display font-bold uppercase italic tracking-tighter">Gerenciar <span className="text-red-500">Arsenal</span></h2>
                    <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-widest">Edição de módulos e missões</p>
                  </div>
                  <button 
                    onClick={() => {
                      setNewModule({ id: '', title: '', order: modules.length + 1 });
                      setIsEditingModule(false);
                      setExpandedModule('new');
                    }} 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all"
                  >
                    Novo Módulo
                  </button>
                </div>

                {expandedModule === 'new' && (
                  <div className="bg-[#18181b] border border-red-500/30 p-6 rounded-xl space-y-4 shadow-xl animate-fade-in-up">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase text-red-500 tracking-widest">
                        {isEditingModule ? `Editando Módulo: ${newModule.id}` : 'Configurar Novo Módulo'}
                      </h3>
                      <button onClick={() => {setExpandedModule(null); setIsEditingModule(false);}} className="text-gray-500 hover:text-white"><X size={18}/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input 
                        placeholder="ID (ex: m9)" 
                        value={newModule.id} 
                        readOnly={isEditingModule}
                        onChange={e => setNewModule({...newModule, id: e.target.value})} 
                        className={`bg-black border border-white/10 p-3 rounded text-xs focus:border-red-500/50 outline-none ${isEditingModule ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <input 
                        placeholder="Título do Módulo" 
                        value={newModule.title} 
                        onChange={e => setNewModule({...newModule, title: e.target.value})} 
                        className="bg-black border border-white/10 p-3 rounded text-xs col-span-2 focus:border-red-500/50 outline-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        disabled={isSaving}
                        onClick={handleSaveModule} 
                        className="flex-1 bg-red-600 py-3 font-black uppercase text-[10px] tracking-widest rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="animate-spin mx-auto" size={16}/> : (isEditingModule ? 'Atualizar Módulo' : 'Publicar Módulo')}
                      </button>
                      <button onClick={() => {setExpandedModule(null); setIsEditingModule(false);}} className="px-6 bg-white/5 py-3 font-black uppercase text-[10px] tracking-widest rounded">Cancelar</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {modules.map(mod => (
                    <div key={mod.id} className="bg-[#131315] border border-white/5 rounded-xl overflow-hidden group hover:border-red-500/20 transition-all">
                      <div className="p-4 flex items-center justify-between bg-[#18181b]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center font-black text-red-500 border border-white/5 text-sm">{mod.order}</div>
                          <div>
                            <h4 className="font-display font-bold text-lg uppercase tracking-wider">{mod.title}</h4>
                            <p className="text-[9px] text-gray-500 font-bold uppercase">{mod.lessons?.length || 0} Missões</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditModule(mod)} className="p-2 bg-white/5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 rounded transition-all"><Pencil size={16}/></button>
                          <button onClick={() => {setNewLesson({...newLesson, module_id: mod.id}); setEditingLesson(null); setExpandedModule(expandedModule === mod.id ? null : mod.id)}} className="p-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded transition-all"><Plus size={16}/></button>
                          <button onClick={() => handleDeleteModule(mod.id)} className="p-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded transition-all"><Trash2 size={16}/></button>
                        </div>
                      </div>
                      
                      {expandedModule === mod.id && (
                        <div className="p-6 bg-black/40 border-t border-white/5 animate-fade-in space-y-6">
                           <div className="bg-[#131315] p-5 rounded-lg border border-red-500/10 space-y-4">
                              <h5 className="text-[9px] font-black uppercase text-red-500 tracking-widest">
                                {editingLesson ? `Editando Aula: ${editingLesson.title}` : 'Recrutamento de Nova Aula'}
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input placeholder="Título" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} className="w-full bg-black border border-white/5 p-2.5 rounded text-xs"/>
                                <input placeholder="Duração" value={newLesson.duration} onChange={e => setNewLesson({...newLesson, duration: e.target.value})} className="w-full bg-black border border-white/5 p-2.5 rounded text-xs"/>
                                <div className="col-span-2 flex gap-2">
                                  <div className="relative flex-1">
                                    <input placeholder="ID ou URL do Vídeo" value={newLesson.video_id} onChange={e => setNewLesson({...newLesson, video_id: e.target.value})} className="w-full bg-black border border-white/5 p-2.5 pr-10 rounded text-xs"/>
                                    {newLesson.video_id && newLesson.video_id.includes('drive.google.com') && (
                                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"><HardDrive size={14}/></div>
                                    )}
                                  </div>
                                  <button onClick={handleOpenDrive} className="px-3 bg-white/5 hover:bg-[#eeb32d]/20 hover:text-[#eeb32d] text-gray-400 border border-white/10 rounded flex items-center justify-center transition-colors" title="Selecionar do Drive">
                                     <HardDrive size={16} />
                                  </button>
                                </div>
                                <div className="col-span-2 relative">
                                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                  <input 
                                    placeholder="URL da Capa (Thumbnail)" 
                                    value={newLesson.cover_url} 
                                    onChange={e => setNewLesson({...newLesson, cover_url: e.target.value})} 
                                    className="w-full bg-black border border-white/5 p-2.5 pl-10 rounded text-xs"
                                  />
                                </div>
                                <textarea placeholder="Descrição" value={newLesson.description} onChange={e => setNewLesson({...newLesson, description: e.target.value})} className="w-full bg-black border border-white/5 p-2.5 rounded text-xs min-h-[60px] col-span-2"/>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  disabled={isSaving}
                                  onClick={handleSaveLesson} 
                                  className="flex-1 bg-red-600 py-2.5 rounded font-black text-[9px] uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
                                >
                                  {isSaving ? <Loader2 className="animate-spin mx-auto" size={16}/> : (editingLesson ? 'Atualizar Missão' : 'Lançar Missão')}
                                </button>
                                {editingLesson && (
                                  <button onClick={() => {setEditingLesson(null); setNewLesson({title: '', duration: '', video_id: '', cover_url: '', description: '', order: 0, module_id: mod.id});}} className="px-6 bg-white/5 rounded text-[9px] font-black uppercase">Cancelar</button>
                                )}
                              </div>
                           </div>

                           <div className="space-y-1">
                             {mod.lessons?.sort((a,b) => (a.order || 0) - (b.order || 0)).map(lesson => (
                               <div key={lesson.id} className="py-2.5 px-4 flex items-center justify-between group/item hover:bg-white/[0.02] rounded">
                                  <div className="flex items-center gap-4">
                                    <div className={`text-[9px] font-black ${editingLesson?.id === lesson.id ? 'text-red-500' : 'text-gray-600'}`}>{(lesson.order || 0).toString().padStart(2, '0')}</div>
                                    <div className="flex items-center gap-3">
                                      {lesson.cover_url && (
                                        <img src={lesson.cover_url} alt="" className="w-8 h-5 object-cover rounded border border-white/10" />
                                      )}
                                      <p className={`text-xs font-bold uppercase ${editingLesson?.id === lesson.id ? 'text-red-500' : 'text-gray-300'}`}>{lesson.title}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                     <button onClick={() => handleEditLesson(lesson)} className="p-1.5 text-gray-500 hover:text-blue-500"><Pencil size={14}/></button>
                                     <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-gray-500 hover:text-red-500"><Trash2 size={14}/></button>
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
                 {/* Cards de Estatísticas */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#131315] border border-white/5 p-5 rounded-xl flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-red-500">
                          <Users size={24} />
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Total de Contas</p>
                          <p className="text-2xl font-display font-bold text-white leading-none">{totalUsers}</p>
                       </div>
                    </div>
                    <div className="bg-[#131315] border border-white/5 p-5 rounded-xl flex items-center gap-4">
                       <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500">
                          <UserCheck size={24} />
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Arsenal Ativo</p>
                          <p className="text-2xl font-display font-bold text-green-500 leading-none">{activeStudents}</p>
                       </div>
                    </div>
                 </div>

                 {/* Tabela de Usuários */}
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-display font-bold uppercase italic tracking-tighter">Lista de <span className="text-red-500">Operadores</span></h2>
                        <button onClick={fetchData} className="p-2 text-gray-500 hover:text-white transition-colors" title="Sincronizar Lista">
                           <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
                        </button>
                      </div>
                      <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-widest">Monitoramento e controle de acessos</p>
                    </div>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="text" 
                        placeholder="Buscar por e-mail..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[#131315] border border-white/5 p-3 pl-10 rounded-lg text-xs outline-none focus:border-red-500/30"
                      />
                    </div>
                 </div>

                 <div className="bg-[#131315] border border-white/5 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[700px]">
                         <thead className="bg-[#18181b] text-[9px] text-gray-500 uppercase font-bold border-b border-white/5">
                            <tr>
                              <th className="p-5">Nome / Identificação</th>
                              <th className="p-5"><div className="flex items-center gap-2"><Calendar size={12}/> Ingresso</div></th>
                              <th className="p-5">Plano / Status</th>
                              <th className="p-5">Aceite Legal</th>
                              <th className="p-5 text-right">Ação</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5">
                            {filteredUsers.length > 0 ? filteredUsers.map(u => {
                              const planInfo = detectPlan(u);
                              return (
                                <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                                   <td className="p-5">
                                      <div className="text-xs font-bold text-white group-hover:text-red-500 transition-colors">{u.name || 'Sem Nome'}</div>
                                      <div className="text-[10px] text-gray-500">{u.email}</div>
                                   </td>
                                   <td className="p-5">
                                      <div className="text-[10px] text-gray-400 font-medium">
                                         {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '--/--/--'}
                                      </div>
                                   </td>
                                   <td className="p-5">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${planInfo.border} ${planInfo.color}`}>
                                        {planInfo.label}
                                      </span>
                                   </td>
                                   <td className="p-5">
                                      {u.accepted_terms_at ? (
                                        <div className="flex flex-col" title={`Aceitou em: ${new Date(u.accepted_terms_at).toLocaleString('pt-BR')}`}>
                                           <div className="flex items-center gap-1.5 text-green-500 font-black text-[9px] uppercase tracking-tighter">
                                              <Gavel size={12} /> ACEITO
                                           </div>
                                           <span className="text-[8px] text-gray-600 font-mono mt-0.5">
                                              {new Date(u.accepted_terms_at).toLocaleDateString('pt-BR')}
                                           </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 text-gray-700 font-black text-[9px] uppercase tracking-tighter">
                                           <AlertCircle size={12} /> PENDENTE
                                        </div>
                                      )}
                                   </td>
                                   <td className="p-5 text-right">
                                      <button 
                                        onClick={() => handleOpenUserEdit(u)} 
                                        className="p-2 rounded transition-all border text-gray-400 border-white/5 hover:bg-white/5 hover:text-white" 
                                        title="Gerenciar Acesso"
                                      >
                                         <Settings size={14}/>
                                      </button>
                                   </td>
                                </tr>
                              );
                            }) : (
                              <tr>
                                <td colSpan={5} className="p-12 text-center">
                                   <Users size={32} className="mx-auto mb-3 text-gray-700" />
                                   <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest italic">Nenhum operador registrado.</p>
                                </td>
                              </tr>
                            )}
                         </tbody>
                      </table>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'notices' && (
              <div className="max-w-2xl mx-auto space-y-8">
                  <div className="border-b border-white/5 pb-6 text-center">
                    <h2 className="text-3xl font-display font-bold uppercase italic tracking-tighter">Informações <span className="text-red-500">Gerais</span></h2>
                    <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-widest">Broadcast para todos os alunos</p>
                 </div>
                 
                 {/* Card de Criação */}
                 <div className="bg-[#131315] border border-white/10 p-6 rounded-xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                          {editingNotice ? 'Editando Informação' : 'Nova Informação'}
                       </h4>
                       {editingNotice && (
                         <button 
                           onClick={handleCancelEditNotice}
                           className="text-gray-500 hover:text-white text-[10px] uppercase font-bold flex items-center gap-1"
                         >
                           <X size={12} /> Cancelar
                         </button>
                       )}
                    </div>

                    <div className="flex gap-2 mb-2">
                       <button onClick={() => setNewNoticeType('info')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold uppercase transition-all ${newNoticeType === 'info' ? 'bg-white/10 text-white' : 'bg-black/40 text-gray-500 hover:text-white'}`}>
                          <Info size={14} /> Geral
                       </button>
                       <button onClick={() => setNewNoticeType('patch')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold uppercase transition-all ${newNoticeType === 'patch' ? 'bg-blue-500/20 text-blue-400' : 'bg-black/40 text-gray-500 hover:text-blue-400'}`}>
                          <FileText size={14} /> Patch
                       </button>
                       <button onClick={() => setNewNoticeType('alert')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold uppercase transition-all ${newNoticeType === 'alert' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-black/40 text-gray-500 hover:text-yellow-400'}`}>
                          <Megaphone size={14} /> Aviso
                       </button>
                       <button onClick={() => setNewNoticeType('meta')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold uppercase transition-all ${newNoticeType === 'meta' ? 'bg-orange-500/20 text-orange-500' : 'bg-black/40 text-gray-500 hover:text-orange-500'}`}>
                          <Flame size={14} /> Meta
                       </button>
                    </div>

                    <textarea value={newNotice} onChange={e => setNewNotice(e.target.value)} className="w-full bg-black border border-white/5 p-4 rounded-lg text-xs min-h-[100px] outline-none focus:border-red-500/30" placeholder="Digite a mensagem..."/>
                    
                    <div className="flex items-center gap-2">
                       <LinkIcon size={14} className="text-gray-500" />
                       <input 
                         type="text" 
                         value={newNoticeLink} 
                         onChange={e => setNewNoticeLink(e.target.value)} 
                         className="flex-1 bg-black border border-white/5 p-2 rounded text-xs outline-none focus:border-red-500/30" 
                         placeholder="Link opcional (ex: https://valve.com/patch)"
                       />
                    </div>

                    <button 
                      onClick={handleSaveNotice} 
                      disabled={isSaving}
                      className="w-full bg-red-600 py-3 font-black uppercase text-[10px] tracking-widest rounded shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={14} /> : (editingNotice ? 'Atualizar' : 'Publicar')}
                    </button>
                 </div>
                 
                 <div className="space-y-3">
                    <h4 className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Feed Ativo</h4>
                    {notices.map(n => (
                      <div key={n.id} className={`bg-[#131315] p-4 rounded-lg border flex justify-between items-center group transition-all ${editingNotice?.id === n.id ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}>
                         <div className="flex items-start gap-4">
                            <div className="mt-1">
                               {getNoticeIcon(n.type || 'info')}
                            </div>
                            <div>
                               <p className="text-xs text-gray-300 font-medium leading-relaxed whitespace-pre-wrap">{n.text}</p>
                               <div className="flex items-center gap-3 mt-1.5">
                                 <span className="text-[8px] text-gray-600 font-bold uppercase">{n.date}</span>
                                 {n.link && <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-[8px] text-blue-500 hover:underline flex items-center gap-1"><LinkIcon size={8}/> Link</a>}
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditNotice(n)} className="p-2 text-gray-600 hover:text-white transition-colors"><Pencil size={14}/></button>
                            <button onClick={() => handleDeleteNotice(n.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                         </div>
                      </div>
                    ))}
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
