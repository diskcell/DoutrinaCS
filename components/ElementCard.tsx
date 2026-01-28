
import React, { useMemo } from 'react';
import { BoardElement, Side, TextAlign } from '../types';
import { STATUS_COLORS, CARD_BG_COLORS, STICKY_BG_COLORS, TEXT_COLORS } from '../constants';

interface ElementCardProps {
  element: BoardElement;
  onUpdate: (id: string, updates: Partial<BoardElement>) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
  isSelected: boolean;
  isLinking: boolean;
  onSelect: (id: string) => void;
  onAnchorMouseDown?: (elementId: string, side: Side, e: React.MouseEvent) => void;
  onAnchorContextMenu?: (elementId: string, side: Side, e: React.MouseEvent) => void;
}

const ElementCard: React.FC<ElementCardProps> = ({ 
  element, 
  onUpdate, 
  onDelete, 
  onDragStart,
  onResizeStart,
  isSelected,
  isLinking,
  onSelect,
  onAnchorMouseDown,
  onAnchorContextMenu
}) => {
  const isSticky = element.type === 'sticky';
  
  // Defaults
  const currentScale = element.fontSizeScale || 1;
  const currentAlign = element.textAlign || 'left';
  const defaultTextColor = isSticky ? '#1c1917' : '#ffffff';
  const currentTextColor = element.textColor || defaultTextColor;
  const currentBgColor = element.color || (isSticky ? '#fef08a' : 'rgba(18, 18, 18, 0.9)');

  // Calculate dynamic font sizes based on element dimensions AND user preference multiplier
  const fontSizes = useMemo(() => {
    const minDim = Math.min(element.width, element.height);
    
    const titleBase = isSticky ? 0.12 : 0.09;
    const contentBase = isSticky ? 0.08 : 0.065;

    const titleSize = Math.max(16, minDim * titleBase) * currentScale;
    const contentSize = Math.max(12, minDim * contentBase) * currentScale;
    const tagSize = Math.max(9, minDim * 0.045) * currentScale;

    return { title: titleSize, content: contentSize, tag: tagSize };
  }, [element.width, element.height, isSticky, currentScale]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(element.id, { content: e.target.value });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(element.id, { title: e.target.value });
  };

  const sides: Side[] = ['top', 'right', 'bottom', 'left'];
  const showControls = isSelected || isLinking;

  // Format Toolbar Helpers
  const cycleAlign = () => {
    const map: Record<TextAlign, TextAlign> = { 'left': 'center', 'center': 'right', 'right': 'left' };
    onUpdate(element.id, { textAlign: map[currentAlign] });
  };

  const adjustFontSize = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3, currentScale + delta));
    onUpdate(element.id, { fontSizeScale: newScale });
  };

  const palette = isSticky ? STICKY_BG_COLORS : CARD_BG_COLORS;

  return (
    <div
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
        backgroundColor: currentBgColor,
        color: currentTextColor,
        border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: isSticky ? 'none' : 'blur(24px)',
        boxShadow: isSelected ? '0 0 40px rgba(59, 130, 246, 0.4)' : '0 10px 40px rgba(0,0,0,0.6)',
        transform: 'translate3d(0,0,0)',
      }}
      className={`absolute rounded-3xl transition-shadow duration-200 overflow-visible flex flex-col group cursor-grab active:cursor-grabbing`}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        
        // Garante a seleção ao clicar em qualquer parte do card, exceto botões de ação específicos
        if (!target.closest('.delete-btn')) {
           onSelect(element.id);
        }

        // Impede que o clique propague para o canvas (que limparia a seleção)
        e.stopPropagation();

        if (
          !target.closest('.anchor-point') && 
          !target.closest('.delete-btn') && 
          !target.closest('.resize-handle') &&
          !target.closest('.formatting-toolbar') &&
          target.tagName !== 'INPUT' && 
          target.tagName !== 'TEXTAREA' && 
          target.tagName !== 'BUTTON'
        ) {
          onDragStart(e, element.id);
        }
      }}
    >
      {/* --- FORMATTING TOOLBAR (Only when selected) --- */}
      {isSelected && (
        <div 
          className="formatting-toolbar absolute -top-20 left-1/2 -translate-x-1/2 h-14 bg-[#1a1a1a] border border-white/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 px-5 z-[200] animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap min-w-max"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Group 1: Typography */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => cycleAlign()} 
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors active:scale-95" 
              title="Alinhamento"
            >
              {currentAlign === 'left' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>}
              {currentAlign === 'center' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="10" x2="7" y2="10"/><line x1="19" y1="14" x2="5" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>}
              {currentAlign === 'right' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>}
            </button>
            <div className="flex items-center bg-white/5 rounded-lg border border-white/5">
              <button onClick={() => adjustFontSize(-0.1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-l-lg text-white/70 hover:text-white font-bold active:scale-95 text-xs">A-</button>
              <div className="w-px h-4 bg-white/10" />
              <button onClick={() => adjustFontSize(0.1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-r-lg text-white/70 hover:text-white font-bold active:scale-95 text-xs">A+</button>
            </div>
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* Group 2: Background Colors */}
          <div className="flex items-center gap-2">
            <svg className="text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 11V9h2v2h-2zm-2 7h-2v-2h2v2zm-4-4h-2v-2h2v2zm-4-4H7V9h2v2zm-4-4H3V5h2v2z"/><path d="M21 15v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-4"/><path d="M21 11v-2a2 2 0 0 0-2-2h-2V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v2"/></svg>
            <div className="flex items-center gap-1.5">
              {palette.map((c) => (
                <button
                  key={c}
                  onClick={() => onUpdate(element.id, { color: c })}
                  className={`w-6 h-6 rounded-full border border-white/10 transition-all active:scale-90 hover:scale-110 ${
                    currentBgColor === c 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]' 
                      : 'hover:border-white/50'
                  }`}
                  style={{ backgroundColor: c }}
                  title="Cor de Fundo"
                />
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* Group 3: Text Colors */}
          <div className="flex items-center gap-2">
            <span className="text-white/30 font-serif font-black text-lg leading-none">A</span>
            <div className="flex items-center gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onUpdate(element.id, { textColor: c })}
                  className={`w-6 h-6 rounded-md border border-white/10 transition-all active:scale-90 hover:scale-110 ${
                    currentTextColor === c 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]' 
                      : 'hover:border-white/50'
                  }`}
                  style={{ backgroundColor: c }}
                  title="Cor do Texto"
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {/* --- END TOOLBAR --- */}

      {/* Botão de Apagar para Notas Rápidas (Sticky) */}
      {isSticky && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          className="delete-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-black/5 hover:bg-black/10 rounded-full transition-all text-black/40 hover:text-red-600 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}

      {/* Resize Handle (Canto Inferior Direito) */}
      {isSelected && (
        <div 
          className="resize-handle absolute bottom-2 right-2 w-6 h-6 cursor-nwse-resize flex items-end justify-end opacity-40 hover:opacity-100 transition-opacity z-[110]"
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, element.id);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 10L10 2M6 10L10 6M10 10V10" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Anchor Points */}
      {showControls && sides.map(side => (
        <div
          key={side}
          data-element-id={element.id}
          data-side={side}
          className={`anchor-point absolute w-8 h-8 -m-4 z-[100] flex items-center justify-center cursor-crosshair group/anchor`}
          style={{
            top: side === 'top' ? '0' : side === 'bottom' ? '100%' : '50%',
            left: side === 'left' ? '0' : side === 'right' ? '100%' : '50%',
          }}
          onMouseDown={(e) => {
            if (e.button === 0) {
              e.stopPropagation();
              onAnchorMouseDown?.(element.id, side, e);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAnchorContextMenu?.(element.id, side, e);
          }}
        >
          <div className={`w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg transition-transform ${isLinking ? 'scale-125 animate-pulse' : 'scale-100 group-hover/anchor:scale-150'}`} />
        </div>
      ))}

      {/* Header para Cards normais */}
      {!isSticky && (
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 rounded-t-3xl min-h-[15%]">
          <div className="flex gap-2 overflow-hidden">
            {element.status && (
              <div 
                className="px-2.5 py-1 rounded-full text-[8px] uppercase font-black tracking-widest whitespace-nowrap" 
                style={{ backgroundColor: `${STATUS_COLORS[element.status]}22`, color: STATUS_COLORS[element.status], border: `1px solid ${STATUS_COLORS[element.status]}33` }}
              >
                {element.status}
              </div>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            className="delete-btn opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      {/* Body */}
      <div className={`p-6 flex-1 flex flex-col overflow-hidden ${isSticky ? 'pt-8' : 'gap-2'}`}>
        {!isSticky && (
          <input
            value={element.title || ''}
            onChange={handleTitleChange}
            placeholder="Título..."
            className="bg-transparent border-none outline-none font-black w-full placeholder:text-white/5 tracking-tight focus:placeholder:opacity-0"
            style={{ 
              fontSize: `${fontSizes.title}px`, 
              lineHeight: 1.2,
              textAlign: currentAlign,
              color: currentTextColor 
            }}
          />
        )}
        <textarea
          value={element.content}
          onChange={handleContentChange}
          placeholder="Comece a escrever..."
          className={`bg-transparent border-none outline-none flex-1 resize-none w-full leading-relaxed custom-scrollbar placeholder:opacity-10 focus:placeholder:opacity-0 ${isSticky ? 'font-bold' : 'font-medium'}`}
          style={{ 
            fontSize: `${fontSizes.content}px`, 
            lineHeight: 1.5,
            textAlign: currentAlign,
            color: currentTextColor
          }}
        />
      </div>

      {element.tags && element.tags.length > 0 && !isSticky && element.height > 180 && (
        <div className="px-6 pb-5 flex flex-wrap gap-2 overflow-hidden" style={{ maxHeight: '20%', justifyContent: currentAlign === 'center' ? 'center' : currentAlign === 'right' ? 'flex-end' : 'flex-start' }}>
          {element.tags.map(tag => (
            <span 
              key={tag} 
              className="font-bold px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-white/30 uppercase tracking-widest whitespace-nowrap"
              style={{ fontSize: `${fontSizes.tag}px` }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElementCard;
