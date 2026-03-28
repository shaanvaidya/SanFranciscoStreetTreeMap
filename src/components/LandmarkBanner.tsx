import { Star, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LandmarkInfo } from '../types/landmark'

export const LandmarkBanner = ({ landmark }: { landmark: LandmarkInfo }) => {
  const isDark = document.documentElement.classList.contains('dark')

  const goldColor = isDark ? '#FFD700' : '#a07800'
  const bg = isDark ? 'rgba(255, 215, 0, 0.07)' : 'rgba(255, 215, 0, 0.1)'
  const border = isDark ? 'rgba(255, 215, 0, 0.25)' : 'rgba(160, 120, 0, 0.25)'

  const text = landmark.description || landmark.detail

  return (
    <div className="mb-5 p-4 rounded-lg" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-2" style={{ marginBottom: text ? 8 : 0 }}>
        <Star className="h-[17px] w-[17px]" style={{ color: '#FFD700' }} />
        <span className="font-bold text-[0.85rem]" style={{ color: goldColor }}>
          Notable Tree
        </span>
        <Badge
          variant="outline"
          className="text-[0.65rem] h-[18px] px-1.5 py-0"
          style={{
            backgroundColor: isDark ? 'rgba(255,215,0,0.12)' : 'rgba(160,120,0,0.1)',
            color: goldColor,
            borderColor: border,
          }}
        >
          Mike Sullivan's List
        </Badge>
      </div>

      {text && (
        <p className="text-muted-foreground leading-relaxed mb-2 text-[0.85rem]">
          {text}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {landmark.image_url && (
          <a
            href={landmark.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[0.75rem] font-medium hover:underline"
            style={{ color: goldColor }}
          >
            <ExternalLink className="h-3 w-3" />
            View photo
          </a>
        )}
        {landmark.closeup_url && (
          <a
            href={landmark.closeup_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[0.75rem] font-medium hover:underline"
            style={{ color: goldColor }}
          >
            <ExternalLink className="h-3 w-3" />
            Closeup
          </a>
        )}
        <a
          href="https://www.sftrees.com/landmark-trees"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-muted-foreground no-underline hover:underline"
        >
          sftrees.com
        </a>
      </div>
    </div>
  )
}

export default LandmarkBanner
