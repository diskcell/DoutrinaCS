import React, { useState, useEffect } from 'react';
import { Menu, X, Crosshair, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
  session: Session | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage, session, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', value: 'home' },
    { name: 'O Curso', value: 'course' },
    { name: 'Sobre', value: 'about' }, // <--- ADICIONEI AQUI
    { name: 'Planos', value: 'plans' },
  ];

  const handleNavClick = (pageValue: string) => {
    onNavigate(pageValue);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Extrair o primeiro nome do usuário para exibição
  const userName = session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Aluno';

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0F1012]/95 backdrop-blur-md border-b border-white/5 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <Crosshair className="h-8 w-8 text-[#eeb32d]" />
            <span className="text-2xl font-bold font-display uppercase tracking-wider text-white">
              Doutrina <span className="text-[#eeb32d]">CS</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.value)}
                className={`text-sm uppercase font-bold tracking-widest transition-colors relative group ${
                  activePage === link.value ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#eeb32d] transition-all duration-300 ${
                  activePage === link.value ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
            ))}
            
            {/* Link para FAQ na Home */}
            <button
               onClick={() => {
                 onNavigate('home');
                 setTimeout(() => {
                   document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                 }, 100);
               }}
               className="text-sm uppercase font-bold tracking-widest text-gray-400 hover:text-white transition-colors relative group"
            >
              FAQ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#eeb32d] transition-all duration-300 group-hover:w-full"></span>
            </button>

            {/* Condicional de Login/Logout */}
            {session ? (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 bg-[#eeb32d]/10 hover:bg-[#eeb32d] text-[#eeb32d] hover:text-black border border-[#eeb32d]/20 hover:border-[#eeb32d] font-bold py-1.5 px-3 rounded transition-all text-xs uppercase tracking-wider group"
                >
                  <LayoutDashboard size={14} className="group-hover:stroke-black" />
                  Acessar QG
                </button>

                <div className="flex items-center gap-2 text-right max-w-[150px]">
                  <div className="w-8 h-8 rounded bg-[#eeb32d]/10 flex items-center justify-center border border-[#eeb32d]/30 shrink-0">
                    <User className="w-4 h-4 text-[#eeb32d]" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">Operador</span>
                    <span className="text-sm text-white font-bold leading-none truncate">{userName}</span>
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Iniciando logout via Navbar...");
                    onLogout();
                  }}
                  className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-full transition-all text-gray-400 hover:text-red-500 cursor-pointer group active:scale-90 border border-transparent hover:border-red-500/20"
                  title="Sair da Conta"
                >
                  <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform pointer-events-none" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => handleNavClick('login')}
                className="bg-[#eeb32d] hover:bg-[#dca020] text-black font-bold py-2 px-6 skew-x-[-12deg] transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(238,179,45,0.3)]"
              >
                <span className="block skew-x-[12deg] uppercase text-sm tracking-wider">
                  Login
                </span>
              </button>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-[#eeb32d] transition-colors"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-[#0F1012] z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: '70px' }}
      >
        <div className="flex flex-col p-8 space-y-6">
          {session && (
             <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                <div className="w-10 h-10 rounded bg-[#eeb32d]/10 flex items-center justify-center border border-[#eeb32d]/30">
                  <User className="w-5 h-5 text-[#eeb32d]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Bem-vindo,</p>
                  <p className="text-xl font-bold text-white">{userName}</p>
                </div>
             </div>
          )}

          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.value)}
              className={`text-xl font-display font-bold text-left ${
                activePage === link.value ? 'text-[#eeb32d]' : 'text-white hover:text-[#eeb32d]'
              }`}
            >
              {link.name}
            </button>
          ))}
          
          {session ? (
            <>
              <button 
                onClick={() => {
                  onNavigate('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#eeb32d] text-black font-bold py-3 mt-4 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={18} />
                Acessar QG do Operador
              </button>

              <button 
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-bold py-3 mt-2 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Sair da Conta
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleNavClick('login')}
              className="w-full bg-[#eeb32d] text-black font-bold py-3 mt-4 uppercase tracking-widest"
            >
              Acessar Plataforma
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;