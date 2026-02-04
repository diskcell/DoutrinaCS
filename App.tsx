
// ==============================
// IMPORTS
// ==============================
import React, { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { Loader2, RefreshCw } from 'lucide-react'

// Supabase
import { supabase, isConfigured } from './lib/supabaseClient'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Páginas públicas
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import Testimonials from './components/Testimonials'
import EvolutionCTA from './components/EvolutionCTA'
import FAQ from './components/FAQ'
import About from './components/About'
import TermsOfUse from './components/TermsOfUse'
import PrivacyPolicy from './components/PrivacyPolicy'

// Curso
import CourseCurriculum from './components/CourseCurriculum'
import MissionBriefing from './components/MissionBriefing'

// Auth
import Login from './components/Login'
import Signup from './components/Signup'

// Sistema
import Dashboard from './components/Dashboard'
import AdminPanel from './components/AdminPanel'
import Plans from './components/Plans'
import Checkout from './components/Checkout'
import CustomModal from './components/CustomModal'

// ==============================
// TYPES
// ==============================
type PageType =
  | 'home'
  | 'course'
  | 'plans'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'admin'
  | 'checkout'
  | 'about'
  | 'terms'
  | 'privacy'

// ==============================
// APP
// ==============================
function App() {
  // ------------------------------
  // ESTADO DE NAVEGAÇÃO
  // ------------------------------
  const [currentPage, setCurrentPage] = useState<PageType>('home')

  // ------------------------------
  // AUTENTICAÇÃO / PERFIL
  // ------------------------------
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

  // ------------------------------
  // CONTROLE DA APLICAÇÃO
  // ------------------------------
  const [isAppReady, setIsAppReady] = useState(false)
  const [showResetOption, setShowResetOption] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // ------------------------------
  // PAGAMENTO
  // ------------------------------
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string
    price: number
    name: string
  } | null>(null)

  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // ==============================
  // [NOVO] PERSISTÊNCIA DE PÁGINA
  // ==============================
  // Salva a página atual no navegador sempre que ela mudar
  useEffect(() => {
    if (currentPage && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'home') {
      localStorage.setItem('doutrina_last_page', currentPage)
    }
  }, [currentPage])

  // ==============================
  // HELPERS
  // ==============================
  const navigate = (page: PageType) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const handleAppReset = async () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      await supabase.auth.signOut()
    } catch (err) {
      console.error(err)
    }
    window.location.reload()
  }

  const handleLogout = async () => {
    // [NOVO] Limpa a memória ao sair para não bugar o próximo login
    localStorage.removeItem('doutrina_last_page')
    localStorage.removeItem('doutrina_active_lesson')
    await supabase.auth.signOut()
  }

  // ==============================
  // PERFIL DO USUÁRIO
  // ==============================
  const checkUserProfile = async (currentSession: Session) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, has_purchased, accessible_modules')
        .eq('id', currentSession.user.id)
        .single()

      // Cria perfil se não existir
      if (error && error.code === 'PGRST116') {
        await supabase.from('profiles').upsert({
          id: currentSession.user.id,
          email: currentSession.user.email,
          name:
            currentSession.user.user_metadata?.full_name || 'Operador',
          role: 'student',
          has_purchased: false,
        })
        return checkUserProfile(currentSession)
      }

      if (data) {
        const admin = data.role === 'admin'
        setIsAdmin(admin)

        setIsApproved(
          admin ||
            data.has_purchased === true ||
            (data.accessible_modules &&
              data.accessible_modules.length > 0)
        )
      }
    } catch (err) {
      console.error('Erro check profile:', err)
    }
  }

  // ==============================
  // BOOTSTRAP DA APLICAÇÃO
  // ==============================
  useEffect(() => {
    let mounted = true

    const safetyTimer = setTimeout(() => {
      if (!isAppReady) setShowResetOption(true)
    }, 5000)

    const init = async () => {
      if (!isConfigured) {
        if (mounted) setIsAppReady(true)
        return
      }

      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (initialSession) {
          setSession(initialSession)
          await checkUserProfile(initialSession)
          
          // [MODIFICADO] Lógica de Restauração Segura
          // Em vez de forçar 'dashboard', tenta recuperar a última página
          const savedPage = localStorage.getItem('doutrina_last_page') as PageType
          if (savedPage && savedPage !== 'login' && savedPage !== 'signup' && savedPage !== 'home') {
             navigate(savedPage)
          } else {
             navigate('dashboard')
          }
        }
      } catch (err) {
        console.error('Erro no boot:', err)
      } finally {
        if (mounted) setIsAppReady(true)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        setSession(newSession)

        if (event === 'SIGNED_OUT') {
          setIsAdmin(false)
          setIsApproved(false)
          navigate('home')
        }

        if (newSession) {
          checkUserProfile(newSession)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  // ==============================
  // PAGAMENTO
  // ==============================
  const handleSelectPlan = (
    planId: string,
    price: number,
    name: string
  ) => {
    if (!session) {
      navigate('login')
      return
    }

    setSelectedPlan({ id: planId, price, name })
    navigate('checkout')
  }

  const handlePaymentSuccess = async () => {
    if (!session || !selectedPlan) return

    try {
      const payload =
        selectedPlan.id === 'start'
          ? {
              has_purchased: false,
              accessible_modules: ['m1', 'm2', 'm3', 'm4'],
            }
          : {
              has_purchased: true,
              accessible_modules: [
                'm1',
                'm2',
                'm3',
                'm4',
                'm5',
                'm6',
                'm7',
                'm8',
              ],
            }

      await supabase
        .from('profiles')
        .update(payload)
        .eq('id', session.user.id)

      await checkUserProfile(session)

      setRefreshKey((p) => p + 1)
      setShowSuccessModal(true)
      navigate('dashboard')
    } catch (err) {
      console.error('Erro pagamento:', err)
    }
  }

  // ==============================
  // LOADING
  // ==============================
  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-[#0F1012] flex flex-col items-center justify-center text-[#eeb32d] p-4 text-center">
        <Loader2 className="animate-spin w-8 h-8 mb-4 opacity-50" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          Iniciando Sistema...
        </p>

        {showResetOption && (
          <button
            onClick={handleAppReset}
            className="mt-8 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 px-6 py-3 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
          >
            <RefreshCw size={14} />
            Reiniciar Aplicação
          </button>
        )}
      </div>
    )
  }

  // ==============================
  // ROTAS PRIVADAS
  // ==============================
  if (currentPage === 'admin' && session && isAdmin) {
    return (
      <AdminPanel
        onLogout={handleLogout}
        onBack={() => navigate('dashboard')}
      />
    )
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
          onNavigateToAdmin={() => navigate('admin')}
          onNavigateToPlans={() => navigate('plans')}
        />
      </>
    )
  }

  // ==============================
  // PÁGINAS PÚBLICAS
  // ==============================
  return (
    <div className="min-h-screen bg-[#0F1012] text-white flex flex-col">
      <Navbar
        activePage={currentPage}
        session={session}
        onLogout={handleLogout}
        onNavigate={(p) => navigate(p as PageType)}
      />

      <main className="flex-grow">
        {currentPage === 'home' && (
          <>
            <Hero onNavigate={(p) => navigate(p as PageType)} />
            <StatsBar />
            <Testimonials />
            <EvolutionCTA
              onNavigate={(p) => navigate(p as PageType)}
            />
            <FAQ />
          </>
        )}

        {currentPage === 'course' && (
          <div className="pt-20">
            <CourseCurriculum
              onNavigate={(p) => navigate(p as PageType)}
            />
            <MissionBriefing />
          </div>
        )}

        {currentPage === 'plans' && (
          <div className="pt-20">
            <Plans onSelectPlan={handleSelectPlan} />
          </div>
        )}

        {currentPage === 'login' && (
          <div className="pt-20">
            <Login
              onNavigate={(p) => navigate(p as PageType)}
            />
          </div>
        )}

        {currentPage === 'signup' && (
          <div className="pt-20">
            <Signup
              onNavigate={(p) => navigate(p as PageType)}
            />
          </div>
        )}

        {currentPage === 'checkout' &&
          selectedPlan &&
          session && (
            <Checkout
              planId={selectedPlan.id}
              planName={selectedPlan.name}
              price={selectedPlan.price}
              session={session}
              onBack={() => navigate('plans')}
              onSuccess={handlePaymentSuccess}
            />
          )}

        {currentPage === 'about' && (
          <About onNavigate={(p) => navigate(p as PageType)} />
        )}

        {currentPage === 'terms' && (
          <TermsOfUse onNavigate={(p) => navigate(p as PageType)} />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPolicy onNavigate={(p) => navigate(p as PageType)} />
        )}
      </main>

      <Footer onNavigate={(p) => navigate(p as PageType)} />
    </div>
  )
}

export default App
