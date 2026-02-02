import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, WifiOff } from 'lucide-react';

declare global {
  interface Window {
    Artplayer: any;
  }
}

interface VideoPlayerProps {
  videoId: string;
  poster?: string;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, poster, autoplay = false }) => {
  const artRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<any>(null);
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null); // URL ofuscada
  const [isLoadingBlob, setIsLoadingBlob] = useState(true); // Loading do download
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0); // Progresso visual
  
  const CLOUDFLARE_WORKER_URL = "https://drive.doutrinacs.site"; 

  // 1. Carrega a lib Artplayer
  useEffect(() => {
    if (!window.Artplayer) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js";
      script.async = true;
      script.onload = () => setIsLibLoaded(true);
      script.onerror = () => setError("Falha ao carregar reprodutor.");
      document.body.appendChild(script);
    } else {
      setIsLibLoaded(true);
    }
  }, []);

  // 2. O GRANDE TRUQUE: Baixa o vídeo via AJAX e cria um Blob local
  useEffect(() => {
    let active = true;
    const originalUrl = `${CLOUDFLARE_WORKER_URL}?videoId=${videoId}`;

    const fetchVideoBlob = async () => {
      try {
        setIsLoadingBlob(true);
        setError(null);
        setDownloadProgress(10); // Começou

        const response = await fetch(originalUrl);
        if (!response.ok) throw new Error("Erro no stream");

        // Leitura do corpo para calcular progresso (opcional, mas bom pra UX)
        const reader = response.body?.getReader();
        const contentLength = +response.headers.get('Content-Length')!;
        let receivedLength = 0;
        const chunks = [];

        if (reader) {
          while(true) {
            const {done, value} = await reader.read();
            if (done) break;
            chunks.push(value);
            receivedLength += value.length;
            if (contentLength) {
               setDownloadProgress(Math.round((receivedLength / contentLength) * 100));
            }
          }
        }
        
        if (!active) return;

        const blob = new Blob(chunks, { type: 'video/mp4' });
        const localUrl = URL.createObjectURL(blob);
        setBlobUrl(localUrl); // Agora temos um link "blob:http://..."
        setIsLoadingBlob(false);

      } catch (err) {
        if (active) setError("Falha ao carregar vídeo seguro.");
        setIsLoadingBlob(false);
      }
    };

    fetchVideoBlob();

    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl); // Limpa a memória
      setBlobUrl(null);
    };
  }, [videoId]);


  // 3. Inicializa o Player apenas quando o Blob e a Lib existem
  useEffect(() => {
    if (isLibLoaded && blobUrl && artRef.current && !playerInstance.current) {
      
      const art = new window.Artplayer({
        container: artRef.current,
        url: blobUrl, // O IDM não entende links que começam com "blob:"
        poster: poster,
        volume: 0.7,
        isLive: false,
        muted: false,
        autoplay: autoplay,
        autoSize: true,
        autoMini: true,
        setting: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        miniProgressBar: true,
        
        // Proteções mantidas
        contextmenu: [], 
        autoPlayback: true, 
        hotkey: true,
        lock: true, 
        moreVideoAttr: {
          controlsList: 'nodownload',
          playsInline: true,
          preload: 'auto',
          onContextMenu: (e: any) => e.preventDefault(), 
        },
        lang: 'pt',
      });

      art.on('contextmenu', (event: Event) => {
        event.preventDefault();
        return false;
      });

      playerInstance.current = art;
    }

    // Se mudar o blob (outro vídeo), troca a URL
    if (playerInstance.current && blobUrl && playerInstance.current.url !== blobUrl) {
      playerInstance.current.switchUrl(blobUrl);
    }

    return () => {
      if (playerInstance.current && playerInstance.current.destroy) {
        playerInstance.current.destroy(false);
        playerInstance.current = null;
      }
    };
  }, [isLibLoaded, blobUrl, poster]);

  // UI de Erro
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black border border-red-500/30 text-red-500 rounded-xl p-4">
        <WifiOff className="mb-2 w-8 h-8" />
        <p className="text-xs font-bold uppercase tracking-widest">Erro de Carregamento</p>
      </div>
    );
  }

  // UI de Loading (Agora mostra progresso do download)
  if (!isLibLoaded || isLoadingBlob) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black border border-[#eeb32d]/20 rounded-xl gap-4">
        <Loader2 className="w-10 h-10 text-[#eeb32d] animate-spin" />
        <div className="text-[#eeb32d] text-xs font-mono uppercase tracking-widest">
           Descriptografando Stream... {downloadProgress}%
        </div>
        {/* Barra de progresso fake/real */}
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
           <div className="h-full bg-[#eeb32d] transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full bg-black rounded-xl overflow-hidden border border-[#eeb32d]/20 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative group"
      onContextMenu={(e) => { e.preventDefault(); return false; }} 
    >
      <div ref={artRef} className="w-full h-full artplayer-app" />
    </div>
  );
};

export default VideoPlayer;