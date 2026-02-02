import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const CustomModal: React.FC<CustomModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = "Confirmar", 
  cancelLabel = "Cancelar", 
  onConfirm, 
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      text: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
    },
    warning: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/50',
      text: 'text-orange-500',
      button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
    },
    info: {
      bg: 'bg-[#eeb32d]/10',
      border: 'border-[#eeb32d]/50',
      text: 'text-[#eeb32d]',
      button: 'bg-[#eeb32d] hover:bg-[#dca020] text-black shadow-[#eeb32d]/20'
    }
  };

  const activeColor = colors[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" 
        onClick={onCancel}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#131315] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div className={`p-6 border-b border-white/5 flex items-center gap-4 ${activeColor.bg}`}>
          <div className={`p-2 rounded-lg ${activeColor.bg} ${activeColor.border} border`}>
            <AlertTriangle className={`w-6 h-6 ${activeColor.text}`} />
          </div>
          <h3 className="text-xl font-display font-bold text-white uppercase italic tracking-wide">
            {title}
          </h3>
          <button 
            onClick={onCancel}
            className="ml-auto text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8">
          <p className="text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-6 bg-[#0a0a0b] border-t border-white/5 flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${activeColor.button}`}
          >
            <Check size={16} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;