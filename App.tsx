import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { supabase, isConfigured } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import CourseCurriculum from './components/CourseCurriculum';
import MissionBriefing from './components/MissionBriefing';
import Testimonials from './components/Testimonials';
import EvolutionCTA from './components/EvolutionCTA';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Plans from './components/Plans';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

type PageType = 'home' | 'course' | 'plans' | 'login' | 'signup' | 'dashboard' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  const recoveryModeRef = useRef(false);
  const currentPageRef = useRef<PageType>('home');
  const profileFetchedRef = useRef(false);

  useEffect(() => {
    currentPageRef.current = currentPage;
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    recoveryModeRef.current = isRecoveryMode;
  }, [isRecoveryMode]);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (currentSession) {
          setSession(currentSession);
          // Primeiro carregamento é o único que pode ser bloqueante se necessário
          await fetchUserProfile(currentSession.user.id, true);
          
          const hash = window.location.hash;
          if (hash === '#admin') handlePageChange('admin');
          else if (hash === '#dashboard') handlePageChange('dashboard');
        }
      } catch (err) {
        console.error("Erro na sessão:", err);
        setConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // Evita resets de estado desnecessários ao trocar de aba (eventos repetidos)
      if (event === 'INITIAL_SESSION' && session) return;

      setSession(currentSession);
      
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsApproved(false);
        profileFetchedRef.current = false;
        handlePageChange('home');
      } else if (currentSession && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        // Se já temos o perfil, não precisamos travar a tela
        fetchUserProfile(currentSession.user.id, !profileFetchedRef.current);
        
        if (!recoveryModeRef.current && (currentPageRef.current === 'login' || currentPageRef.current === 'signup')) {
          handlePageChange('dashboard');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    currentPageRef.current = page;
  };

  const fetchUserProfile = async (userId: string, shouldShowLoading: boolean = false) => {
    // Só mostramos loading se explicitamente pedido (ex: primeira carga ou troca crítica de página)
    if (shouldShowLoading) setIsProfileLoading(true);
    
    try {
      const { data, error } = await supabase.from('profiles').select('role, has_purchased').eq('id', userId).single();
      
      if (error && error.code === 'PGRST116') {
        // Retry rápido para novos usuários
        await new Promise(res => setTimeout(res, 500));
        const { data: retryData } = await supabase.from('profiles').select('role, has_purchased').eq('id', userId).single();
        if (retryData) {
          setIsAdmin(retryData.role === 'admin');
          setIsApproved(retryData.role === 'admin' ? true : !!retryData.has_purchased);
          profileFetchedRef.current = true;
          return;
        }
      }
      
      if (data) {
        setIsAdmin(data.role === 'admin');
        setIsApproved(data.role === 'admin' ? true : !!data.has_purchased);
        profileFetchedRef.current = true;
      }
    } catch (err) {
      console.error("Erro perfil:", err);
    } finally {
      if (shouldShowLoading) setIsProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setSession(null);
      setIsAdmin(false);
      setIsApproved(false);
      profileFetchedRef.current = false;
      await supabase.auth.signOut();
      handlePageChange('home');
    } catch (err) {
      window.location.reload();
    }
  };

  const navigateToDashboard = async () => {
    handlePageChange('dashboard');
    if (session) fetchUserProfile(session.user.id, !profileFetchedRef.current);
  };

  // isLoading só é true no PRIMEIRO carregamento da página
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1012] flex flex-col items-center justify-center text-[#eeb32d] p-6">
        <div className="relative">
          <Loader2 className="animate-spin w-16 h-16 opacity-80" />
          <div className="absolute inset-0 bg-[#eeb32d]/20 blur-2xl rounded-full animate-pulse"></div>
        </div>
        <div className="mt-10 text-center space-y-3">
          <p className="font-display font-bold uppercase tracking-[0.3em] text-sm animate-pulse">Sincronizando com o QG</p>
          <p className="text-gray-500 text-xs uppercase tracking-widest opacity-60">Autenticando credenciais...</p>
        </div>
      </div>
    );
  }

  // Se estivermos no dashboard/admin e o perfil AINDA não foi pego NENHUMA vez, mostramos loading
  // Mas se profileFetchedRef for true, não bloqueamos mais, mesmo que isProfileLoading seja true (atualização em background)
  if (!profileFetchedRef.current && isProfileLoading && (currentPage === 'dashboard' || currentPage === 'admin')) {
    return (
      <div className="min-h-screen bg-[#0F1012] flex flex-col items-center justify-center text-[#eeb32d] p-6">
        <Loader2 className="animate-spin w-16 h-16 mb-10" />
        <p className="font-display font-bold uppercase tracking-[0.3em] text-sm">Validando Licença...</p>
      </div>
    );
  }

  if (connectionError && currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#0F1012] flex flex-col items-center justify-center text-center p-6">
        <WifiOff size={64} className="text-gray-700 mb-8" />
        <h2 className="text-2xl font-display font-bold uppercase text-white mb-3">Erro de Conexão</h2>
        <button onClick={() => window.location.reload()} className="bg-[#eeb32d] text-black font-bold px-10 py-4 rounded uppercase text-sm tracking-widest transition-transform shadow-lg shadow-[#eeb32d]/20">Tentar Novamente</button>
      </div>
    );
  }

  if (currentPage === 'admin' && session && isAdmin) return <AdminPanel onLogout={handleLogout} onBack={() => handlePageChange('dashboard')} />;
  if (currentPage === 'dashboard' && session) return <Dashboard session={session} onLogout={handleLogout} isAdmin={isAdmin} isApproved={isApproved} onNavigateToAdmin={() => handlePageChange('admin')} onNavigateToPlans={() => handlePageChange('plans')} />;

  return (
    <div className="min-h-screen bg-[#0F1012] text-white selection:bg-[#eeb32d] selection:text-black overflow-x-hidden flex flex-col">
      <Navbar onNavigate={(page) => { setIsRecoveryMode(false); if (page === 'dashboard') navigateToDashboard(); else handlePageChange(page as PageType); }} activePage={currentPage} session={isRecoveryMode ? null : session} onLogout={handleLogout} />
      <main className="flex-grow">
        {currentPage === 'home' && <div className="animate-fade-in"><Hero onNavigate={(page) => { if (page === 'dashboard') navigateToDashboard(); else handlePageChange(page as PageType); }} /><StatsBar /><Testimonials /><EvolutionCTA onNavigate={(page) => handlePageChange(page as PageType)} /><FAQ /></div>}
        {currentPage === 'course' && <div className="animate-fade-in-up pt-10"><MissionBriefing /><CourseCurriculum onNavigate={(page) => handlePageChange(page as PageType)} /></div>}
        {currentPage === 'plans' && <div className="animate-fade-in-up pt-20"><Plans /></div>}
        {currentPage === 'login' && <div className="animate-fade-in-up pt-20"><Login onNavigate={(page) => { if (page === 'dashboard') navigateToDashboard(); else handlePageChange(page as PageType); }} onRecoveryModeChange={setIsRecoveryMode} /></div>}
        {currentPage === 'signup' && <div className="animate-fade-in-up pt-20"><Signup onNavigate={(page) => handlePageChange(page as PageType)} /></div>}
      </main>
      <Footer />
    </div>
  );
}

export default App;