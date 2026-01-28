
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BoardElement, Connection, BoardData, Viewport, Side } from './types';
import { INITIAL_VIEWPORT } from './constants';
import Background from './components/Background';
import ElementCard from './components/ElementCard';
import ConnectionLine from './components/ConnectionLine';
import AIChat from './components/AIChat';

const STORAGE_KEY = 'intelliboard_v3_session';

const App: React.FC = () => {
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingBoard = useRef(false);
  const isDraggingElement = useRef<string | null>(null);
  const isResizingElement = useRef<string | null>(null); 
  const lastMousePos = useRef({ x: 0, y: 0 });
  const zoomTimeout = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Estados para criação de links
  const [linkSource, setLinkSource] = useState<{ id: string; side: Side } | null>(null);
  const [tempLinkEnd, setTempLinkEnd] = useState<{ x: number; y: number } | null>(null);

  // 1. Carregamento da Sessão (Whiteboard + Viewport)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setElements(data.elements || []);
        setConnections(data.connections || []);
        if (data.viewport) setViewport(data.viewport);
      } catch (e) {
        console.error("Erro ao carregar sessão:", e);
      }
    }
  }, []);

  // 2. Persistência Robusta & Auto-save
  const saveToLocal = useCallback(() => {
    setIsSaving(true);
    const data = JSON.stringify({ elements, connections, viewport });
    localStorage.setItem(STORAGE_KEY, data);
    // Delay para feedback visual
    setTimeout(() => setIsSaving(false), 800);
  }, [elements, connections, viewport]);

  useEffect(() => {
    const timer = setTimeout(saveToLocal, 1000);
    return () => clearTimeout(timer);
  }, [saveToLocal]);

  // Garantir salvamento ao fechar
  useEffect(() => {
    const handleBeforeUnload = () => {
      const data = JSON.stringify({ elements, connections, viewport });
      localStorage.setItem(STORAGE_KEY, data);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [elements, connections, viewport]);

  // Handler de Deleção
  const handleDeleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  // 3. Atalho de Teclado (Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se não houver seleção, ignora
      if (!selectedId) return;

      // Se o usuário estiver digitando em um input ou textarea, ignora o delete
      const activeTag = document.activeElement?.tagName;
      const isEditing = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;

      if (isEditing) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteElement(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, handleDeleteElement]);


  // Handlers do Canvas
  const handleAnchorMouseDown = useCallback((elementId: string, side: Side, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setLinkSource({ id: elementId, side });
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTempLinkEnd({
        x: (e.clientX - rect.left - viewport.x) / viewport.scale,
        y: (e.clientY - rect.top - viewport.y) / viewport.scale
      });
    }
  }, [viewport]);

  const handleAnchorContextMenu = useCallback((elementId: string, side: Side, e: React.MouseEvent) => {
    setConnections(prev => prev.filter(c => 
      !( (c.fromId === elementId && (c.fromSide === side || !c.fromSide)) || 
         (c.toId === elementId && (c.toSide === side || !c.toSide)) )
    ));
  }, []);

  const handleUpdateElement = useCallback((id: string, updates: Partial<BoardElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  const handleApplyAILayout = useCallback((data: BoardData) => {
    setElements(prev => {
      const newIds = new Set(data.elements.map(e => e.id));
      const filteredPrev = prev.filter(e => !newIds.has(e.id));
      return [...filteredPrev, ...data.elements];
    });
    setConnections(prev => {
      const newIds = new Set(data.connections.map(c => c.id));
      const filteredPrev = prev.filter(c => !newIds.has(c.id));
      return [...filteredPrev, ...data.connections];
    });
  }, []);

  const addElement = (type: BoardElement['type']) => {
    const newEl: BoardElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: (-viewport.x + (window.innerWidth / 2 - 125)) / viewport.scale,
      y: (-viewport.y + (window.innerHeight / 2 - 90)) / viewport.scale,
      width: type === 'sticky' ? 200 : 280,
      height: type === 'sticky' ? 200 : 220,
      content: '',
      title: type === 'card' ? 'Nova Ideia' : undefined,
      status: type === 'card' ? 'idea' : undefined,
      zIndex: elements.length + 1,
      color: type === 'sticky' ? '#fef08a' : undefined
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.0015;
    const delta = -e.deltaY;
    const zoomChange = Math.exp(delta * zoomSpeed);
    const nextScale = Math.min(Math.max(viewport.scale * zoomChange, 0.05), 5);
    
    if (nextScale !== viewport.scale) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const newX = mouseX - (mouseX - viewport.x) * (nextScale / viewport.scale);
      const newY = mouseY - (mouseY - viewport.y) * (nextScale / viewport.scale);
      setViewport({ x: newX, y: newY, scale: nextScale });
      setShowZoomIndicator(true);
      if (zoomTimeout.current) window.clearTimeout(zoomTimeout.current);
      zoomTimeout.current = window.setTimeout(() => setShowZoomIndicator(false), 800);
    }
  }, [viewport]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const onMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (target.closest('.anchor-point') || target.closest('.resize-handle')) return;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;
    if (target.id === 'board-canvas' || target.id === 'main-container' || target.tagName === 'svg') {
      isDraggingBoard.current = true;
      setSelectedId(null);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (linkSource) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTempLinkEnd({
            x: (e.clientX - rect.left - viewport.x) / viewport.scale,
            y: (e.clientY - rect.top - viewport.y) / viewport.scale
          });
        }
      }
      if (isDraggingBoard.current) {
        setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      }
      if (isDraggingElement.current) {
        const elementId = isDraggingElement.current;
        setElements(prev => prev.map(el => el.id === elementId ? { ...el, x: el.x + dx / viewport.scale, y: el.y + dy / viewport.scale } : el));
      }
      if (isResizingElement.current) {
        const elementId = isResizingElement.current;
        setElements(prev => prev.map(el => {
          if (el.id === elementId) {
            const minW = el.type === 'sticky' ? 120 : 180;
            const minH = el.type === 'sticky' ? 120 : 120;
            return {
              ...el,
              width: Math.max(minW, el.width + dx / viewport.scale),
              height: Math.max(minH, el.height + dy / viewport.scale)
            };
          }
          return el;
        }));
      }
    });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (linkSource) {
      const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
      const anchor = dropTarget?.closest('.anchor-point');
      if (anchor) {
        const toId = anchor.getAttribute('data-element-id');
        const toSide = anchor.getAttribute('data-side') as Side;
        if (toId && toId !== linkSource.id) {
          const newConn: Connection = {
            id: Math.random().toString(36).substr(2, 9),
            fromId: linkSource.id, toId, fromSide: linkSource.side, toSide, style: 'curved', color: '#3b82f6'
          };
          setConnections(prev => [...prev, newConn]);
        }
      }
      setLinkSource(null); setTempLinkEnd(null);
    }
    isDraggingBoard.current = false; isDraggingElement.current = null; isResizingElement.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const isAnyActionActive = !!(isDraggingBoard.current || isDraggingElement.current || isResizingElement.current || linkSource);

  return (
    <div 
      ref={containerRef}
      id="main-container"
      className="relative w-screen h-screen overflow-hidden select-none bg-[#0a0a0c]"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Background />

      <div 
        id="board-canvas"
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
          transition: isAnyActionActive ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {connections.map(c => {
            const from = elements.find(e => e.id === c.fromId);
            const to = elements.find(e => e.id === c.toId);
            return from && to ? <ConnectionLine key={c.id} connection={c} from={from} to={to} isActive={isAnyActionActive} /> : null;
          })}

          {linkSource && tempLinkEnd && (() => {
            const fromEl = elements.find(e => e.id === linkSource.id);
            if (!fromEl) return null;
            const startX = linkSource.side === 'left' ? fromEl.x : linkSource.side === 'right' ? fromEl.x + fromEl.width : fromEl.x + fromEl.width / 2;
            const startY = linkSource.side === 'top' ? fromEl.y : linkSource.side === 'bottom' ? fromEl.y + fromEl.height : fromEl.y + fromEl.height / 2;
            return <path d={`M ${startX} ${startY} L ${tempLinkEnd.x} ${tempLinkEnd.y}`} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" fill="none" className="opacity-50" />;
          })()}
        </svg>

        {elements.map(el => (
          <ElementCard
            key={el.id}
            element={el}
            onUpdate={handleUpdateElement}
            onDelete={handleDeleteElement}
            isSelected={selectedId === el.id}
            isLinking={!!linkSource}
            onSelect={setSelectedId}
            onAnchorMouseDown={handleAnchorMouseDown}
            onAnchorContextMenu={handleAnchorContextMenu}
            onDragStart={(e, id) => { isDraggingElement.current = id; lastMousePos.current = { x: e.clientX, y: e.clientY }; }}
            onResizeStart={(e, id) => { isResizingElement.current = id; lastMousePos.current = { x: e.clientX, y: e.clientY }; }}
          />
        ))}
      </div>

      {/* Interface de Persistência e Segurança */}
      <div className="fixed top-6 right-6 z-40 flex flex-col items-end gap-3">
         {/* Status de Sincronização */}
         <div className={`flex items-center gap-3 px-5 py-2.5 bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl transition-all duration-500 ${isSaving ? 'opacity-100 scale-105 border-blue-500/30' : 'opacity-80 scale-100'}`}>
            <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
              {isSaving ? "Sincronizando..." : "Alterações Salvas"}
            </span>
         </div>
         
         {/* Mensagem Informativa sobre o Sistema de Salvamento */}
         <div className="flex items-center gap-3 bg-blue-600/10 backdrop-blur-md border border-blue-500/20 px-4 py-2 rounded-xl max-w-[280px] shadow-lg group">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" className="flex-shrink-0"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="text-[9px] font-bold text-blue-400/80 leading-tight uppercase tracking-tighter">
              Seu progresso é identificado e salvo automaticamente nesta sessão do navegador.
            </span>
         </div>
      </div>

      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2 bg-blue-600/90 backdrop-blur-xl text-white rounded-full text-sm font-black shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-opacity duration-300 pointer-events-none z-50 ${showZoomIndicator ? 'opacity-100' : 'opacity-0'}`}>
        {Math.round(viewport.scale * 100)}%
      </div>

      {!isFocusMode && (
        <>
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-neutral-900/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-3xl flex items-center gap-6 z-40 shadow-2xl">
            <button onClick={() => addElement('card')} className="p-2 hover:bg-blue-600/20 rounded-2xl transition-all flex items-center gap-3 group">
              <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center text-[10px] font-bold shadow-lg shadow-blue-600/30 group-active:scale-90 transition-transform">+</div>
              <span className="text-xs font-black tracking-tighter uppercase">Cartão</span>
            </button>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => addElement('sticky')} className="p-2 hover:bg-yellow-500/20 rounded-2xl transition-all flex items-center gap-3 group">
              <div className="w-7 h-7 bg-yellow-400 rounded-xl flex items-center justify-center text-[10px] font-bold shadow-lg shadow-yellow-400/30 group-active:scale-90 transition-transform"></div>
              <span className="text-xs font-black tracking-tighter uppercase">Nota</span>
            </button>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => setViewport(INITIAL_VIEWPORT)} className="p-2 hover:bg-white/10 rounded-2xl transition-all text-xs font-black uppercase tracking-tighter">Reset</button>
          </div>

          <div className="fixed top-6 left-6 z-40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3">
                <span className="font-black text-xl italic">I</span>
              </div>
              <div>
                <h1 className="font-black text-sm tracking-tighter uppercase italic">IntelliBoard</h1>
                <p className="text-[10px] text-blue-500/80 font-bold uppercase tracking-widest">IA Brasileira</p>
              </div>
            </div>
          </div>
        </>
      )}

      {isFocusMode && (
        <button onClick={() => setIsFocusMode(false)} className="fixed top-8 right-8 bg-blue-600/30 border border-blue-500/40 backdrop-blur-2xl px-6 py-3 rounded-2xl text-xs font-bold z-50 hover:bg-blue-600/50 transition-all shadow-2xl">Sair do Modo Foco</button>
      )}

      <AIChat 
        currentBoard={{ elements, connections }} 
        onApplyLayout={handleApplyAILayout}
        isExpanded={isChatExpanded}
        onToggle={() => setIsChatExpanded(!isChatExpanded)}
      />
    </div>
  );
};

export default App;
