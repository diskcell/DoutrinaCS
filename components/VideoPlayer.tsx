import React, { useEffect, useRef, useState } from 'react'
import { Loader2, WifiOff } from 'lucide-react'
import { useSecureVideo } from '../hooks/useSecureVideo'

declare global {
  interface Window {
    Artplayer: any
    webkitAudioContext: typeof AudioContext
  }
}

interface VideoPlayerProps {
  videoId: string
  poster?: string
  autoplay?: boolean
}

const ARTPLAYER_CDN = 'https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js'
const MAX_BOOST = 5; // 500% de volume máximo

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  poster,
  autoplay = false,
}) => {
  const artRef = useRef<HTMLDivElement>(null)
  const playerInstance = useRef<any>(null)
  
  // Refs de Áudio
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const [isLibLoaded, setIsLibLoaded] = useState(false)
  const { blobUrl, loading, progress, error } = useSecureVideo(videoId)

  useEffect(() => {
    if (window.Artplayer) {
      setIsLibLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = ARTPLAYER_CDN
    script.async = true
    script.onload = () => setIsLibLoaded(true)
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!isLibLoaded || !blobUrl || !artRef.current) return

    if (!playerInstance.current) {
      console.log("Inicializando Player...")
      
      const art = new window.Artplayer({
        container: artRef.current,
        url: blobUrl,
        poster: poster,
        autoplay: autoplay,
        volume: 0.2, // Começa em 20% (que equivale a 100% real na nossa lógica)
        muted: false,
        autoSize: true,
        autoMini: true,
        fullscreen: true,
        fullscreenWeb: true,
        playbackRate: true,
        aspectRatio: true,
        miniProgressBar: true,
        setting: true,
        pip: true,
        
        contextmenu: [],
        hotkey: true,
        lock: true,
        fastForward: true,

        moreVideoAttr: {
          controlsList: 'nodownload',
          playsInline: true,
          preload: 'auto',
          onContextMenu: (e: Event) => e.preventDefault(),
          crossOrigin: 'anonymous',
        },

        lang: 'pt',
        theme: '#eeb32d',
      })

      // --- SISTEMA DE SUPER VOLUME ---
      art.on('ready', () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            // Limpa contexto anterior se houver
            if (audioCtxRef.current) audioCtxRef.current.close();

            const ctx = new AudioContext();
            const gainNode = ctx.createGain();
            const video = art.video;

            const source = ctx.createMediaElementSource(video);
            source.connect(gainNode);
            gainNode.connect(ctx.destination);

            audioCtxRef.current = ctx;
            gainNodeRef.current = gainNode;

            // Aplica volume inicial (0.2 * 5 = 1.0 Normal)
            gainNode.gain.value = art.volume * MAX_BOOST;

            // Intercepta mudança de volume do player
            art.on('video:volumechange', () => {
                if (gainNodeRef.current) {
                    // Mapeia 0-1 (Slider) para 0-5 (Ganho Real)
                    // Slider 0.2 (20%) -> Ganho 1.0 (100%)
                    // Slider 1.0 (100%) -> Ganho 5.0 (500%)
                    const currentVol = art.video.muted ? 0 : art.volume;
                    gainNodeRef.current.gain.value = currentVol * MAX_BOOST;
                    
                    // Resume contexto se estiver suspenso
                    if (audioCtxRef.current?.state === 'suspended') {
                        audioCtxRef.current.resume();
                    }
                }
            });

        } catch (e) {
            console.error("Erro no Audio Boost:", e);
        }
      });

      art.on('destroy', () => {
         if (audioCtxRef.current) {
             audioCtxRef.current.close();
             audioCtxRef.current = null;
         }
      });

      art.on('contextmenu', (e: Event) => {
        e.preventDefault()
        return false
      })

      playerInstance.current = art
      return
    }

    if (playerInstance.current && playerInstance.current.url !== blobUrl) {
      playerInstance.current.switchUrl(blobUrl)
      if (poster) playerInstance.current.poster = poster
    }

    return () => {
      if (playerInstance.current?.destroy) {
        playerInstance.current.destroy(false)
        playerInstance.current = null
      }
    }
  }, [isLibLoaded, blobUrl, poster, autoplay])

  if (error) {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center bg-black border border-red-500/30 text-red-500 rounded-xl">
        <WifiOff className="w-8 h-8 mb-2" />
        <p className="text-xs font-bold uppercase tracking-widest">Erro de Conexão</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-[10px] underline">Tentar Recarregar</button>
      </div>
    )
  }

  if (!isLibLoaded || loading) {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center bg-black border border-[#eeb32d]/20 rounded-xl gap-4 relative overflow-hidden">
        {poster && <img src={poster} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" alt="Carregando" />}
        <div className="relative z-10 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-[#eeb32d] animate-spin" />
            <div className="text-[#eeb32d] text-xs font-mono uppercase tracking-widest mt-4">
            Descriptografando Stream... {progress}%
            </div>
            <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[#eeb32d] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#eeb32d]/20 shadow-2xl relative"
      onContextMenu={(e) => {
        e.preventDefault()
        return false
      }}
    >
      <div ref={artRef} className="w-full h-full artplayer-app" />
    </div>
  )
}

export default VideoPlayer