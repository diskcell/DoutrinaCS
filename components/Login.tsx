import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, ArrowLeft, Send, CheckCircle2, KeyRound, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onNavigate: (page: string) => void;
  isPasswordResetMode?: boolean; 
  onRecoveryModeChange?: (isRecovering: boolean) => void;
}

// Tipos para os passos da recuperação
type RecoveryStep = 'email' | 'otp' | 'new_password';

const Login: React.FC<LoginProps> = ({ onNavigate, onRecoveryModeChange }) => {
  // Estado Geral
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs para focus
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Campos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  
  // Campos Recuperação
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Sincroniza o estado interno de recuperação com o App.tsx
  useEffect(() => {
    if (onRecoveryModeChange) {
      onRecoveryModeChange(isRecovering);
    }
  }, [isRecovering, onRecoveryModeChange]);

  // Auto-focus no input de OTP
  useEffect(() => {
    if (recoveryStep === 'otp' && otpInputRef.current) {
        otpInputRef.current.focus();
    }
  }, [recoveryStep]);

  // Monitora eventos de autenticação específicos para recuperação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
         setIsRecovering(true);
         setRecoveryStep('new_password');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- LOGIC: LOGIN NORMAL ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(), 
      });

      if (authError) throw authError;
      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Erro no login:', err);
      const errorMessage = err.message || '';
      if (errorMessage === 'Invalid login credentials') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC: RECUPERAÇÃO - PASSO 1: ENVIAR CÓDIGO ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Digite seu e-mail.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // NÃO chamamos signOut() aqui para evitar disparar o listener global do App.tsx prematuramente
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false }
      });

      if (error) throw error;
      setRecoveryStep('otp'); 
    } catch (err: any) {
      console.error("Erro ao enviar código:", err);
      if (err.message.includes("security purposes") || err.message.includes("5 seconds")) {
         setError("Aguarde alguns segundos antes de solicitar um novo código.");
      } else {
         setError(err.message || "Erro ao enviar código.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC: RECUPERAÇÃO - PASSO 2: VERIFICAR CÓDIGO ---
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.replace(/\D/g, '').trim();
    
    if (cleanCode.length < 6) {
        setError('O código deve ter no mínimo 6 dígitos.');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        // A verificação do OTP realiza o login do usuário.
        // Como isRecovering é true, o App.tsx não deve redirecioná-lo.
        let { error } = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: cleanCode,
            type: 'email' 
        });

        if (error) {
            const { error: recoveryError } = await supabase.auth.verifyOtp({
                email: email.trim().toLowerCase(),
                token: cleanCode,
                type: 'recovery'
            });
            if (recoveryError) throw recoveryError;
        }

        // Se chegamos aqui, o usuário está logado mas mantido na tela de troca de senha
        setRecoveryStep('new_password');
    } catch (err: any) {
        console.error("Erro verificação:", err);
        setError("Código inválido ou expirado.");
    } finally {
        setIsLoading(false);
    }
  };

  // --- LOGIC: RECUPERAÇÃO - PASSO 3: SALVAR NOVA SENHA ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres.");
        return;
    }
    if (newPassword !== confirmNewPassword) {
        setError("As senhas não coincidem.");
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;

        alert("Senha atualizada com sucesso!");
        
        // SINALIZA AO APP QUE TERMINOU
        setIsRecovering(false); 
        if (onRecoveryModeChange) onRecoveryModeChange(false);
        
        // Redireciona
        setTimeout(() => {
            onNavigate('dashboard');
        }, 100);

    } catch (err: any) {
        console.error("Erro atualização senha:", err);
        setError("Erro ao salvar: " + err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const toggleRecoveryMode = () => {
      const newState = !isRecovering;
      setIsRecovering(newState);
      setRecoveryStep('email');
      setError('');
      setOtpCode('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative px-4">
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"></div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#eeb32d]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#131315]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white uppercase italic">
              {isRecovering ? (
                <>Recuperar <span className="text-[#eeb32d]">Senha</span></>
              ) : (
                <>Acessar <span className="text-[#eeb32d]">Plataforma</span></>
              )}
            </h2>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm flex items-start gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isRecovering ? (
             <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">E-mail</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-[#eeb32d]" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d]"
                      />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Senha</label>
                        <button type="button" onClick={toggleRecoveryMode} className="text-xs text-[#eeb32d] hover:underline">Esqueceu?</button>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-[#eeb32d]" />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3 pl-10 focus:outline-none focus:border-[#eeb32d]"
                        />
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#eeb32d] hover:bg-[#dca020] disabled:bg-gray-600 text-black font-bold font-display text-lg py-3 rounded flex items-center justify-center gap-2 transition-all"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>ACESSAR CONTA <ArrowRight className="w-5 h-5" /></>}
                </button>
             </form>
          ) : (
             <div className="space-y-4">
                {recoveryStep === 'email' && (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Seu e-mail cadastrado"
                          required
                          className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3 focus:outline-none focus:border-[#eeb32d]"
                        />
                        <button type="submit" disabled={isLoading} className="w-full bg-[#eeb32d] text-black font-bold py-3 rounded">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ENVIAR CÓDIGO"}
                        </button>
                    </form>
                )}

                {recoveryStep === 'otp' && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <input 
                          ref={otpInputRef}
                          type="text" 
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                          placeholder="CÓDIGO DE 6 DÍGITOS"
                          className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3 text-center font-bold text-xl tracking-widest"
                        />
                        <button type="submit" disabled={isLoading} className="w-full bg-[#eeb32d] text-black font-bold py-3 rounded">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "VERIFICAR CÓDIGO"}
                        </button>
                    </form>
                )}

                {recoveryStep === 'new_password' && (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="NOVA SENHA"
                          required
                          className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3"
                        />
                        <input 
                          type="password" 
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="REPETIR NOVA SENHA"
                          required
                          className="w-full bg-[#0a0a0b] border border-white/10 text-white rounded p-3"
                        />
                        <button type="submit" disabled={isLoading} className="w-full bg-[#eeb32d] text-black font-bold py-3 rounded">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "DEFINIR NOVA SENHA"}
                        </button>
                    </form>
                )}

                <button 
                  type="button"
                  onClick={toggleRecoveryMode}
                  className="w-full text-gray-500 hover:text-white py-2 text-xs font-bold uppercase flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} /> Voltar ao Login
                </button>
             </div>
          )}

          {!isRecovering && (
            <div className="mt-8 text-center pt-6 border-t border-white/5">
              <p className="text-gray-400 text-sm">
                Novo por aqui?{' '}
                <button onClick={() => onNavigate('signup')} className="text-[#eeb32d] font-bold hover:underline">Criar Conta</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;