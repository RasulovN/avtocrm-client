import { useEffect } from 'react'

// Sahifa sarlavhasi va meta-description'ni dinamik o'rnatadi (SEO/UX).
export function useSeo(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const prevDesc = meta?.content ?? ''
    if (meta && description) meta.content = description
    return () => {
      document.title = prevTitle
      if (meta && description) meta.content = prevDesc
    }
  }, [title, description])
}
