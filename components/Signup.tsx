import React, { useState } from 'react';
import { Mail, Lock, User, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
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

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    let isValid = true;
    const newErrors = { fullName: '', email: '', password: '', confirmPassword: '' };

    // Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
      isValid = false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Insira um e-mail válido';
      isValid = false;
    }

    // Password: Min 6 chars, starts with special char
    const specialCharRegex = /^[^a-zA-Z0-9]/;
    if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 dígitos';
      isValid = false;
    } else if (!specialCharRegex.test(formData.password)) {
      newErrors.password = 'A senha deve COMEÇAR com um caractere especial (!, @, #, etc)';
      isValid = false;
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
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

        if (error) {
          throw error;
        }

        // --- CORREÇÃO: Inserir manualmente no profiles para garantir visualização no Admin ---
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert([
            {
              id: data.user.id,
              email: formData.email.trim(),
              name: formData.fullName.trim(),
              role: 'student',
              has_purchased: false
            }
          ]);

          if (profileError) {
            console.warn("Aviso: Falha ao criar perfil manual (pode já existir via trigger ou erro de permissão):", profileError);
          }
        }
        // -----------------------------------------------------------------------------------

        alert('Conta criada com sucesso! Se necessário, verifique seu e-mail para confirmar o cadastro.');
        onNavigate('login');

      } catch (error: any) {
        console.error('Erro no cadastro:', error);
        setGeneralError(error.message || 'Erro ao criar conta. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center relative px-4 py-10">
       {/* Background Effects */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"></div>
       <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-[#eeb32d]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-[#131315]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white uppercase italic">
              Criar <span className="text-[#eeb32d]">Conta</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Junte-se à elite do CS2 e comece sua evolução.
            </p>
          </div>

          {generalError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm text-center">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome Completo</label>
              <div className="relative group">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.fullName ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#eeb32d]'}`} />
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className={`w-full bg-[#0a0a0b] border ${errors.fullName ? 'border-red-500/50' : 'border-white/10'} text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d] transition-colors placeholder:text-gray-600`}
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">E-mail</label>
              <div className="relative group">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#eeb32d]'}`} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className={`w-full bg-[#0a0a0b] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d] transition-colors placeholder:text-gray-600`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Senha <span className="text-[10px] text-gray-500 normal-case font-normal">(Mín. 6 dígitos, iniciar com caractere especial)</span>
              </label>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#eeb32d]'}`} />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="!Senha123"
                  className={`w-full bg-[#0a0a0b] border ${errors.password ? 'border-red-500/50' : 'border-white/10'} text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d] transition-colors placeholder:text-gray-600`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Repetir Senha</label>
              <div className="relative group">
                <CheckCircle2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.confirmPassword ? 'text-red-500' : 'text-gray-500 group-focus-within:text-[#eeb32d]'}`} />
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repita a senha anterior"
                  className={`w-full bg-[#0a0a0b] border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d] transition-colors placeholder:text-gray-600`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirmPassword}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#eeb32d] hover:bg-[#dca020] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold font-display text-lg py-3 rounded mt-4 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(238,179,45,0.2)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  REGISTRANDO...
                </>
              ) : (
                <>
                  REGISTRAR
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-gray-400 text-sm">
              Já possui uma conta?{' '}
              <button 
                onClick={() => onNavigate('login')}
                className="text-[#eeb32d] font-bold hover:underline decoration-[#eeb32d] underline-offset-4"
              >
                Fazer Login
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;