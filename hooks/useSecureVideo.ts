	import { useEffect, useRef, useState } from 'react'

// URL do seu Worker (confirme se está correta)
const CLOUDFLARE_WORKER_URL = 'https://drive.doutrinacs.site'

// CONFIGURAÇÕES DE RETRY
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

export function useSecureVideo(videoId: string) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Ref para controlar retries sem causar re-render
  const retryCount = useRef(0)

  useEffect(() => {
    let active = true
    let createdUrl: string | null = null // Variável local para garantir a limpeza correta
    const controller = new AbortController()

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const fetchVideoBlob = async () => {
      try {
        // Só reseta loading e erro na primeira tentativa
        if (retryCount.current === 0) {
            setLoading(true)
            setError(null)
            setProgress(1) // Começa com 1% para dar feedback visual
        }

        const response = await fetch(
          `${CLOUDFLARE_WORKER_URL}?videoId=${videoId}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error(`Erro no stream: ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        const contentLength = Number(response.headers.get('Content-Length')) || 0

        let receivedLength = 0
        const chunks: Uint8Array[] = []

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            chunks.push(value)
            receivedLength += value.length

            if (contentLength > 0) {
              // Calcula porcentagem (0 a 100)
              const percent = Math.round((receivedLength / contentLength) * 100)
              setProgress(percent)
            }
          }
        }

        if (!active) return

        // Criação do Blob e URL
        const blob = new Blob(chunks, { type: 'video/mp4' })
        createdUrl = URL.createObjectURL(blob)

        // Sucesso! Reseta contadores e define URL
        retryCount.current = 0
        setBlobUrl(createdUrl)
        setLoading(false)

      } catch (err: any) {
        if (!active) return

        // Se o erro for "AbortError", significa que o usuário saiu da página. Não faz retry.
        if (err.name === 'AbortError') {
            return
        }

        // LÓGICA DE RETRY
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1
          console.warn(`🔄 Tentativa ${retryCount.current}/${MAX_RETRIES} - Reconectando ao vídeo...`)
          
          await sleep(RETRY_DELAY_MS)
          if (active) fetchVideoBlob() // Tenta de novo se ainda estiver na página
          return
        }

        // Se esgotou as tentativas
        console.error("Falha fatal ao carregar vídeo:", err)
        setError('Conexão instável. Não foi possível carregar o vídeo após várias tentativas.')
        setLoading(false)
      }
    }

    fetchVideoBlob()

    // CLEANUP (LIMPEZA DE MEMÓRIA)
    return () => {
      active = false
      controller.abort() // Cancela download em andamento
      
      // Limpa a URL criada nesta execução específica
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
      setBlobUrl(null)
      // Não resetamos retryCount.current aqui para não interferir em lógica de montagem rápida, 
      // mas ele será resetado na próxima chamada do hook pelo useEffect deps.
    }
  }, [videoId])

  return {
    blobUrl,
    loading,
    progress,
    error,
    isRetrying: retryCount.current > 0 && loading, // Útil para mostrar UI de "Reconectando..."
  }
}