
import React, { useState } from 'react';
import { Mail, Lock, User, CheckCircle2, AlertCircle, ArrowRight, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SignupProps {
  onNavigate: (page: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: ''
  });

  const validate = () => {
    let isValid = true;
    const newErrors = { fullName: '', email: '', password: '', confirmPassword: '', terms: '' };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Insira um e-mail válido';
      isValid = false;
    }

    const specialCharRegex = /^[^a-zA-Z0-9]/;
    if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 dígitos';
      isValid = false;
    } else if (!specialCharRegex.test(formData.password)) {
      newErrors.password = 'Inicie com caractere especial';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas diferentes';
      isValid = false;
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Aceite os termos para prosseguir';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (validate()) {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName.trim(),
            },
          },
        });

        if (error) throw error;

        // REGISTRO JURÍDICO: Gravamos o aceite no perfil do usuário
        if (data.user) {
          await supabase.from('profiles').upsert([
            {
              id: data.user.id,
              email: formData.email.trim(),
              name: formData.fullName.trim(),
              role: 'student',
              has_purchased: false,
              accepted_terms_at: new Date().toISOString() // PROVA DIGITAL
            }
          ]);
        }

        alert('Conta criada com sucesso! Arsenal preparado.');
        onNavigate('login');

      } catch (error: any) {
        setGeneralError(error.message || 'Erro ao criar conta.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOpenLegal = (page: string) => {
    // Abre em uma nova aba usando o sistema de rotas por Hash que configuramos no App.tsx
    // Garantindo que a URL inclua o pathname correto para ambientes de subdiretório (como GH Pages)
    const baseUrl = window.location.origin + window.location.pathname;
    const url = baseUrl.endsWith('/') ? `${baseUrl}#/${page}` : `${baseUrl}/#/${page}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center relative px-4 py-10">
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-[#131315]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white uppercase italic tracking-tighter">
              Criar <span className="text-[#eeb32d]">Conta</span>
            </h2>
            <p className="text-gray-500 text-xs mt-2 uppercase font-bold tracking-widest">Recrutamento para a Elite do CS2</p>
          </div>

          {generalError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded mb-6 text-[10px] font-bold text-center uppercase tracking-widest animate-pulse">
              <AlertCircle className="inline mr-2" size={14} /> {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Nome Completo</label>
                  <div className="relative group">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.fullName ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#eeb32d]'}`} />
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d] transition-all text-sm" placeholder="Ex: Gabriel Toledo" />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-tighter">{errors.fullName}</p>}
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">E-mail de Acesso</label>
                  <div className="relative group">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.email ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#eeb32d]'}`} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d] transition-all text-sm" placeholder="seu@email.com" />
                  </div>
                  {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-tighter">{errors.email}</p>}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Senha</label>
                    <div className="relative group">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.password ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#eeb32d]'}`} />
                      <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d] transition-all text-sm" placeholder="!Senha123" />
                    </div>
                    {errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-tighter leading-none">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Confirmar</label>
                    <div className="relative group">
                      <CheckCircle2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.confirmPassword ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#eeb32d]'}`} />
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d] transition-all text-sm" placeholder="••••••••" />
                    </div>
                  </div>
               </div>
            </div>

            {/* CHECKBOX JURÍDICO */}
            <div className="py-4 bg-white/5 px-4 rounded-lg border border-white/5">
               <label className="flex items-start gap-4 cursor-pointer select-none group">
                  <div className="relative mt-1">
                     <input 
                        type="checkbox" 
                        checked={acceptedTerms}
                        onChange={() => {
                          setAcceptedTerms(!acceptedTerms);
                          setErrors(prev => ({ ...prev, terms: '' }));
                        }}
                        className="sr-only" 
                     />
                     <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${acceptedTerms ? 'bg-[#eeb32d] border-[#eeb32d]' : 'bg-black border-white/20 group-hover:border-[#eeb32d]/50'}`}>
                        {acceptedTerms && <ShieldCheck size={14} className="text-black" />}
                     </div>
                  </div>
                  <div className="flex-1">
                     <p className="text-[11px] text-gray-400 leading-tight">
                        Li e concordo com os{' '}
                        <button type="button" onClick={() => handleOpenLegal('terms')} className="text-[#eeb32d] font-bold hover:underline inline-flex items-center gap-1">Termos de Uso <ExternalLink size={10}/></button>
                        {' '}e a{' '}
                        <button type="button" onClick={() => handleOpenLegal('privacy')} className="text-[#eeb32d] font-bold hover:underline inline-flex items-center gap-1">Política de Privacidade <ExternalLink size={10}/></button>.
                     </p>
                  </div>
               </label>
               {errors.terms && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-widest flex items-center gap-2"><AlertCircle size={12}/> {errors.terms}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#eeb32d] hover:bg-[#dca020] disabled:opacity-50 text-black font-black font-display text-xl py-4 rounded-xl mt-4 flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#eeb32d]/10"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>CRIAR CONTA <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              Já é um Operador?{' '}
              <button onClick={() => onNavigate('login')} className="text-[#eeb32d] hover:underline">Fazer Login</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
