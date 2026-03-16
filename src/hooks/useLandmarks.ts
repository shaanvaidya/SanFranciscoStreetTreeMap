import { useState, useEffect } from 'react'
import { LandmarkInfo } from '../types/landmark'

export type LandmarksState = {
  landmarks: LandmarkInfo[]
  landmarksByTreeId: Map<number, LandmarkInfo>
  loading: boolean
}

export function useLandmarks(enabled = true): LandmarksState {
  const [landmarks, setLandmarks] = useState<LandmarkInfo[]>([])
  const [landmarksByTreeId, setLandmarksByTreeId] = useState<Map<number, LandmarkInfo>>(new Map())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) return
    setLoading(true)
    fetch(`${import.meta.env.BASE_URL}landmarks.json`)
      .then(r => r.json())
      .then((data: Omit<LandmarkInfo, 'index'>[]) => {
        const indexed = data.map((l, i) => ({ ...l, index: i }))
        const byTreeId = new Map<number, LandmarkInfo>()
        indexed.forEach(l => {
          if (l.tree_id > 0) byTreeId.set(l.tree_id, l)
        })
        setLandmarks(indexed)
        setLandmarksByTreeId(byTreeId)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading landmarks:', err)
        setLoading(false)
      })
  }, [])

  return { landmarks, landmarksByTreeId, loading }
}
