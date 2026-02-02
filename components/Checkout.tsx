
import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, ShieldCheck, LockKeyhole, CreditCard, Loader2, 
  Sparkles, ServerCog, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Session } from '@supabase/supabase-js';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CheckoutProps {
  planId: string;
  planName: string;
  price: number;
  session: Session;
  onBack: () => void;
  onSuccess: () => void | Promise<void>;
}

const Checkout: React.FC<CheckoutProps> = ({
  planName,
  price,
  session,
  onBack,
  onSuccess,
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);
  const initialized = useRef(false);
  const brickController = useRef<any>(null);

  // Extraímos apenas o email para evitar re-renderizações desnecessárias se o objeto session mudar (token refresh)
  const userEmail = session.user.email;

  const initMP = async () => {
    if (initialized.current) return;
    
    setHasError(false);
    setIsInitializing(true);

    try {
      // Timeout de segurança: se em 15 segundos não carregar, algo deu errado
      const timeout = setTimeout(() => {
        if (isInitializing) {
          console.error("Timeout na inicialização do Mercado Pago");
          setIsInitializing(false);
          setHasError(true);
        }
      }, 15000);

      // Esperar o script carregar no window
      let attempts = 0;
      while (!window.MercadoPago && attempts < 20) {
        await new Promise(r => setTimeout(r, 500));
        attempts++;
      }

      if (!window.MercadoPago) {
        clearTimeout(timeout);
        throw new Error("SDK do Mercado Pago não encontrado");
      }

      // CHAVE PÚBLICA FIXA CONFORME SOLICITADO - NÃO ALTERAR
      const mpPublicKey = 'TEST-5a8209d7-54f5-4f3e-961e-0667922e288f';
      
      const mp = new window.MercadoPago(mpPublicKey, { locale: 'pt-BR' });
      const bricksBuilder = mp.bricks();

      const settings = {
        initialization: {
          amount: price,
          payer: { email: userEmail },
        },
        customization: {
          visual: { 
            style: { theme: 'dark' },
            hidePaymentButton: false,
          },
          paymentMethods: {
            creditCard: 'all',
            pix: 'all',
            ticket: 'all',
            bankTransfer: 'all',
          },
        },
        callbacks: {
          onReady: () => {
            console.log("Brick Pronto");
            clearTimeout(timeout);
            setIsInitializing(false);
            initialized.current = true;
          },
          onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
            return new Promise((resolve) => {
              console.log("Processando pagamento...", selectedPaymentMethod);
              // Simulando processamento - aqui você chamaria seu backend
              setTimeout(async () => {
                await onSuccess();
                resolve(null);
              }, 2000);
            });
          },
          onError: (error: any) => {
            console.error("Erro no Brick:", error);
            clearTimeout(timeout);
            setIsInitializing(false);
            setHasError(true);
          },
        },
      };

      // Garantir que o container existe no DOM antes de criar
      const container = document.getElementById('paymentBrick_container');
      
      // Limpa container caso haja lixo de renderizações anteriores
      if (container) container.innerHTML = '';

      if (container) {
        brickController.current = await bricksBuilder.create(
          'payment',
          'paymentBrick_container',
          settings
        );
      } else {
        throw new Error("Container de pagamento não encontrado no DOM");
      }

    } catch (e) {
      console.error("Falha geral no Checkout:", e);
      setIsInitializing(false);
      setHasError(true);
    }
  };

  useEffect(() => {
    // Pequeno delay para garantir que o componente montou e o ID do div existe
    const timer = setTimeout(() => {
      initMP();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      if (brickController.current) {
        try { 
          brickController.current.unmount(); 
        } catch(e) {
          console.warn("Erro ao desmontar brick:", e);
        }
        brickController.current = null;
      }
      // CRÍTICO: Resetar a flag para permitir recriação se as dependências mudarem (ex: refresh de sessão)
      initialized.current = false;
    };
  }, [price, userEmail]); // Depende apenas do preço e email, não do objeto session inteiro

  const handleRetry = () => {
    initialized.current = false;
    setHasError(false);
    setIsInitializing(true);
    // Força limpeza do DOM antes de tentar de novo
    const container = document.getElementById('paymentBrick_container');
    if (container) container.innerHTML = '';
    initMP();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden bg-[#0F1012]">
      <div className="absolute inset-0 cs2-bg opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-[#eeb32d] transition-colors mb-8 group uppercase text-xs font-bold tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retornar ao Arsenal
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#131315] border border-[#eeb32d]/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-display font-bold text-white uppercase italic mb-6 flex items-center gap-3">
                <ServerCog className="text-[#eeb32d]" />
                Briefing da Operação
              </h2>

              <div className="flex justify-between items-center bg-[#18181b] p-4 rounded-lg border border-white/5">
                <div>
                  <span className="text-[10px] text-[#eeb32d] uppercase font-bold block">Loadout</span>
                  <span className="text-white font-bold text-xl uppercase font-display">{planName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Total</span>
                  <p className="text-[#eeb32d] font-bold text-3xl font-display">R$ {price}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#eeb32d]/5 border-l-4 border-[#eeb32d] rounded-r-lg flex gap-4 items-start">
                <Sparkles size={18} className="text-[#eeb32d] mt-1" />
                <p className="text-sm text-gray-300 italic font-medium">ZONA SEGURA. Protocolo de pagamento ativo.</p>
              </div>
            </div>

            <div className="bg-[#18181b] border border-white/5 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={20} className="text-green-500" />
                <span className="text-white font-bold text-sm uppercase font-display">Garantia Blindada</span>
              </div>
              <p className="text-gray-400 text-xs">7 dias de proteção total. Reembolso imediato se necessário.</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#131315] border border-[#eeb32d]/30 rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
              <div className="px-6 py-4 border-b border-[#eeb32d]/20 bg-[#0F1012] flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-white uppercase flex items-center gap-2">
                  <CreditCard className="text-[#eeb32d]" size={20} />
                  Checkout Seguro
                </h3>
                <div className="flex items-center gap-2 text-[9px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded">
                  <LockKeyhole size={10} />
                  SSL 256-BIT
                </div>
              </div>

              <div className="p-6 md:p-8 flex-1 relative flex flex-col">
                {isInitializing && !hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#131315] z-50">
                    <Loader2 className="animate-spin text-[#eeb32d] mb-4" size={48} />
                    <span className="text-xs font-bold text-white uppercase tracking-widest animate-pulse">Estabelecendo Link Seguro...</span>
                    <p className="text-[10px] text-gray-600 mt-4 uppercase font-bold">Verificando Credenciais Mercado Pago</p>
                  </div>
                )}

                {hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#131315] z-50 p-8 text-center">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6">
                      <AlertTriangle size={32} />
                    </div>
                    <h4 className="text-white font-display font-bold text-xl uppercase mb-2">Falha na Conexão</h4>
                    <p className="text-gray-500 text-sm mb-8 max-w-xs">Não foi possível carregar o portal de pagamentos. Verifique sua conexão ou tente novamente.</p>
                    <button 
                      onClick={handleRetry}
                      className="bg-[#eeb32d] hover:bg-white text-black font-black px-8 py-3 rounded-lg flex items-center gap-3 uppercase text-xs tracking-widest transition-all"
                    >
                      <RefreshCw size={16} /> Tentar Reconectar
                    </button>
                  </div>
                )}

                {/* Este container deve estar sempre presente, mas oculto pelo loader se necessário */}
                <div id="paymentBrick_container" className="w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
