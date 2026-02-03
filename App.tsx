import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Loader2, RefreshCw } from 'lucide-react';
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
import Checkout from './components/Checkout';
import CustomModal from './components/CustomModal';
import About from './components/About'; // Importa a página Sobre

type PageType = 'home' | 'course' | 'plans' | 'login' | 'signup' | 'dashboard' | 'admin' | 'checkout' | 'about';

// VERSÃO SEGURA: O Admin é definido pelo Banco de Dados, não por e-mail fixo aqui.

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  const [isAppReady, setIsAppReady] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<{id: string, price: number, name: string} | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleAppReset = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await supabase.auth.signOut();
    } catch (e) { console.error(e); }
    window.location.reload();
  };

  useEffect(() => {
    let mounted = true;

    const safetyTimer = setTimeout(() => {
      if (!isAppReady) setShowResetOption(true);
    }, 5000);

    const init = async () => {
      if (!isConfigured) {
        if (mounted) setIsAppReady(true);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
           setSession(initialSession);
           await checkUserProfile(initialSession);
           if (mounted) setCurrentPage('dashboard');
        }
      } catch (err) {
        console.error("Erro no boot:", err);
      } finally {
        if (mounted) setIsAppReady(true);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsApproved(false);
        setCurrentPage('home');
      } 
      else if (newSession) {
        checkUserProfile(newSession);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const checkUserProfile = async (currentSession: Session) => {
    try {
      // PERGUNTA AO BANCO: "Quem é esse usuário?"
      const { data, error } = await supabase
        .from('profiles')
        .select('role, has_purchased, accessible_modules')
        .eq('id', currentSession.user.id)
        .single();
      
      // Se não existir, cria perfil básico
      if (error && error.code === 'PGRST116') {
         await supabase.from('profiles').upsert({
            id: currentSession.user.id,
            email: currentSession.user.email,
            name: currentSession.user.user_metadata?.full_name || 'Operador',
            role: 'student',
            has_purchased: false
         });
         return checkUserProfile(currentSession);
      }

      if (data) {
        // Se o banco disser que a role é 'admin', libera o painel
        const userIsAdmin = data.role === 'admin';
        setIsAdmin(userIsAdmin);
        setIsApproved(userIsAdmin || data.has_purchased === true || (data.accessible_modules && data.accessible_modules.length > 0));
      }
    } catch (err) {
      console.error("Erro check profile:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSelectPlan = (planId: string, price: number, name: string) => {
    if (!session) { setCurrentPage('login'); return; }
    setSelectedPlan({ id: planId, price, name });
    setCurrentPage('checkout');
  };

  const handlePaymentSuccess = async () => {
    if (!session || !selectedPlan) return;
    
    try {
      let updatePayload = selectedPlan.id === 'start' 
        ? { has_purchased: false, accessible_modules: ['m1', 'm2', 'm3', 'm4'] }
        : { has_purchased: true, accessible_modules: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'] };

      await supabase.from('profiles').update(updatePayload).eq('id', session.user.id);
      await checkUserProfile(session);
      setRefreshKey(p => p + 1);
      setShowSuccessModal(true);
      setCurrentPage('dashboard');
    } catch (err) {
      console.error("Erro pagamento:", err);
    }
  };

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-[#0F1012] flex flex-col items-center justify-center text-[#eeb32d] p-4 text-center">
        <Loader2 className="animate-spin w-8 h-8 mb-4 opacity-50" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          Iniciando Sistema...
        </p>
        
        {showResetOption && (
          <div className="mt-8 animate-fade-in-up">
            <button 
              onClick={handleAppReset}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 px-6 py-3 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
            >
              <RefreshCw size={14} /> Reiniciar Aplicação
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentPage === 'admin' && session && isAdmin) {
    return <AdminPanel onLogout={handleLogout} onBack={() => { setCurrentPage('dashboard'); window.scrollTo(0,0); }} />;
  }

  if (currentPage === 'dashboard' && session) {
    return (
      <>
        <CustomModal 
          isOpen={showSuccessModal}
          title="ACESSO CONCEDIDO"
          message="Arsenal tático atualizado com sucesso."
          confirmLabel="ENTRAR"
          variant="info"
          onConfirm={() => setShowSuccessModal(false)}
          onCancel={() => setShowSuccessModal(false)}
        />
        <Dashboard 
          session={session} 
          onLogout={handleLogout} 
          isAdmin={isAdmin} 
          isApproved={isApproved} 
          refreshKey={refreshKey}
          onNavigateToAdmin={() => setCurrentPage('admin')} 
          onNavigateToPlans={() => setCurrentPage('plans')} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1012] text-white selection:bg-[#eeb32d] selection:text-black flex flex-col">
      <Navbar 
        onNavigate={(p) => { setCurrentPage(p as PageType); window.scrollTo(0,0); }} 
        activePage={currentPage} 
        session={session} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-grow">
        {currentPage === 'home' && <div className="animate-fade-in"><Hero onNavigate={(p) => { setCurrentPage(p as PageType); window.scrollTo(0,0); }} /><StatsBar /><Testimonials /><EvolutionCTA onNavigate={(p) => { setCurrentPage(p as PageType); window.scrollTo(0,0); }} /><FAQ /></div>}
        {currentPage === 'course' && <div className="pt-20"><CourseCurriculum onNavigate={(p) => { setCurrentPage(p as PageType); window.scrollTo(0,0); }} /><MissionBriefing /></div>}
        {currentPage === 'plans' && <div className="pt-20"><Plans onSelectPlan={handleSelectPlan} /></div>}
        {currentPage === 'login' && <div className="pt-20"><Login onNavigate={(p) => { setCurrentPage(p as PageType); window.scrollTo(0,0); }} /></div>}
        {currentPage === 'signup' && <div className="pt-20"><Signup onNavigate={(p) => { setCurrentPage(p as PageType); window.scrollTo(0,0); }} /></div>}
        {currentPage === 'checkout' && selectedPlan && session && (
          <Checkout planId={selectedPlan.id} planName={selectedPlan.name} price={selectedPlan.price} session={session} onBack={() => setCurrentPage('plans')} onSuccess={handlePaymentSuccess} />
        )}
        
        {currentPage === 'about' && (
           <div className="animate-fade-in">
             <About onNavigate={(p) => { setCurrentPage(p as PageType); window.scrollTo(0,0); }} />
           </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;