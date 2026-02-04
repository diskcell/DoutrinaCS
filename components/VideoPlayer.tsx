import React, { useEffect, useRef, useState } from 'react'
import { Loader2, WifiOff, Play } from 'lucide-react' // Adicionei Play para icone se quiser
import { useSecureVideo } from '../hooks/useSecureVideo'

// Declaração para o TypeScript não reclamar da lib externa
declare global {
  interface Window {
    Artplayer: any
  }
}

interface VideoPlayerProps {
  videoId: string
  poster?: string
  autoplay?: boolean
}

const ARTPLAYER_CDN = 'https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js'

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  poster,
  autoplay = false,
}) => {
  const artRef = useRef<HTMLDivElement>(null)
  const playerInstance = useRef<any>(null)
  const [isLibLoaded, setIsLibLoaded] = useState(false)

  // 🔥 Hook seguro que criamos (o anti-memory leak)
  const { blobUrl, loading, progress, error } = useSecureVideo(videoId)

  // 1. Carrega a biblioteca ArtPlayer via CDN
  useEffect(() => {
    if (window.Artplayer) {
      setIsLibLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = ARTPLAYER_CDN
    script.async = true
    script.onload = () => setIsLibLoaded(true)
    script.onerror = () => console.error('Erro ao carregar ArtPlayer')
    document.body.appendChild(script)
  }, [])

  // 2. Inicializa ou Atualiza o Player
  useEffect(() => {
    // Só roda se tiver tudo pronto: Lib carregada, URL do Blob gerada e Elemento HTML renderizado
    if (!isLibLoaded || !blobUrl || !artRef.current) return

    // Se o player ainda não existe, cria um novo
    if (!playerInstance.current) {
      const art = new window.Artplayer({
        container: artRef.current,
        url: blobUrl,
        poster: poster,
        autoplay: autoplay,
        
        // Configurações Visuais
        volume: 0.7,
        isLive: false,
        muted: false,
        autoSize: true,
        autoMini: true,
        fullscreen: true,
        fullscreenWeb: true,
        playbackRate: true,
        aspectRatio: true,
        miniProgressBar: true,
        setting: true,
        pip: true, // Picture in Picture

        // Proteções e Travas
        contextmenu: [], // Remove menu do botão direito
        hotkey: true,    // Atalhos de teclado (Espaço, F, etc)
        lock: true,      // Botão de bloquear controles no mobile
        fastForward: true, // Toque duplo pra avançar no mobile

        // Configurações HTML5 Video
        moreVideoAttr: {
          controlsList: 'nodownload',
          playsInline: true,
          preload: 'auto',
          onContextMenu: (e: Event) => e.preventDefault(),
        },

        // Tradução manual simples para PT-BR
        lang: 'pt',
        icons: {
            loading: '<img src="/assets/loading.svg" width="50" />' // Pode personalizar se quiser
        },
        theme: '#eeb32d', // Sua cor amarela da marca
      })

      // Trava extra de botão direito
      art.on('contextmenu', (e: Event) => {
        e.preventDefault()
        return false
      })

      playerInstance.current = art
      return
    }

    // Se o player JÁ existe e o vídeo mudou, apenas troca a URL (Mais rápido)
    if (playerInstance.current.url !== blobUrl) {
      console.log("Trocando fonte do vídeo no player...")
      playerInstance.current.switchUrl(blobUrl)
      if(poster) playerInstance.current.poster = poster
    }

    // Cleanup: Destroi o player se o componente sair da tela
    return () => {
      if (playerInstance.current?.destroy) {
        playerInstance.current.destroy(false)
        playerInstance.current = null
      }
    }
  }, [isLibLoaded, blobUrl, poster, autoplay])

  // --- RENDERIZAÇÃO ---

  // 1. Erro
  if (error) {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center bg-black border border-red-500/30 text-red-500 rounded-xl">
        <WifiOff className="w-8 h-8 mb-2" />
        <p className="text-xs font-bold uppercase tracking-widest">
          Erro de Conexão
        </p>
        <button onClick={() => window.location.reload()} className="mt-2 text-[10px] underline">Tentar Recarregar</button>
      </div>
    )
  }

  // 2. Carregando (Descriptografando)
  if (!isLibLoaded || loading) {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center bg-black border border-[#eeb32d]/20 rounded-xl gap-4 relative overflow-hidden">
        {poster && <img src={poster} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />}
        
        <div className="relative z-10 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-[#eeb32d] animate-spin" />
            
            <div className="text-[#eeb32d] text-xs font-mono uppercase tracking-widest mt-4">
            Descriptografando Stream... {progress}%
            </div>

            <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
            <div
                className="h-full bg-[#eeb32d] transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
            </div>
        </div>
      </div>
    )
  }

  // 3. Player Pronto (Artplayer)
  return (
    <div
      className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#eeb32d]/20 shadow-2xl relative"
      onContextMenu={(e) => {
        e.preventDefault()
        return false
      }}
    >
      <div
        ref={artRef}
        className="w-full h-full artplayer-app"
      />
    </div>
  )
}

export default VideoPlayer