import { Star, MapPin, TreePine, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LandmarkInfo } from '../types/landmark'

export const LandmarkDetails = ({
  landmark,
  onClose,
}: {
  landmark: LandmarkInfo
  onClose: () => void
}) => {
  const isDark = document.documentElement.classList.contains('dark')

  const goldColor = isDark ? '#FFD700' : '#a07800'
  const goldBg = isDark ? 'rgba(255, 215, 0, 0.07)' : 'rgba(255, 215, 0, 0.1)'
  const goldBorder = isDark ? 'rgba(255, 215, 0, 0.25)' : 'rgba(160, 120, 0, 0.25)'
  const headingColor = 'var(--heading)'
  const italicColor = isDark ? '#a5d6a7' : '#4caf50'
  const cardBg = 'var(--card-bg)'
  const cardBorder = 'var(--card-border)'
  const dividerColor = 'var(--divider)'
  const accentColor = isDark ? '#4caf50' : '#2e7d32'

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-6" style={{ borderBottom: `1px solid ${dividerColor}` }}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-[18px] w-[18px]" style={{ color: '#FFD700' }} />
            <Badge
              variant="outline"
              className="font-semibold text-[0.75rem]"
              style={{ backgroundColor: goldBg, color: goldColor, borderColor: goldBorder }}
            >
              Notable Tree
            </Badge>
          </div>

          <h2 className="font-bold text-2xl sm:text-[2rem] leading-tight mb-1" style={{ color: headingColor }}>
            {landmark.common_name || landmark.scientific_name}
          </h2>

          <div className="flex items-center gap-1 mb-2">
            <TreePine className="h-[18px] w-[18px]" style={{ color: italicColor }} />
            <span className="italic text-base sm:text-lg" style={{ color: italicColor }}>
              {landmark.scientific_name}
            </span>
          </div>

          <span className="text-xs text-muted-foreground">
            Private or park tree — not in the city street tree dataset
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 text-primary"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Cards */}
      <div className="grid gap-5">
        {/* Location */}
        <div className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
          <div className="flex items-start gap-3">
            <MapPin className="h-[18px] w-[18px] mt-0.5 text-secondary shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">Location</span>
              <p className="font-semibold mt-1" style={{ color: headingColor }}>
                {landmark.address || 'See description below'}
              </p>
              {landmark.latitude && (
                <a
                  href={`https://www.google.com/maps?q=${landmark.latitude},${landmark.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[0.75rem] font-medium mt-1 hover:underline"
                  style={{ color: accentColor }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View on Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Mike's notes */}
        {(landmark.description || landmark.detail) && (
          <div className="rounded-xl p-5" style={{ backgroundColor: goldBg, border: `1px solid ${goldBorder}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4" style={{ color: '#FFD700' }} />
              <h3 className="text-[0.8rem] font-semibold tracking-wide" style={{ color: goldColor }}>
                MIKE'S NOTES
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {landmark.description || landmark.detail}
            </p>
          </div>
        )}

        {/* Photos */}
        {(landmark.image_url || landmark.closeup_url) && (
          <div className="rounded-xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
            <h3
              className="text-[0.8rem] font-semibold tracking-wide mb-3"
              style={{ color: accentColor }}
            >
              PHOTOS
            </h3>
            <div className="flex gap-2 flex-wrap">
              {landmark.image_url && (
                <a
                  href={landmark.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium hover:opacity-80"
                  style={{ borderColor: goldBorder, color: goldColor }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View photo
                </a>
              )}
              {landmark.closeup_url && (
                <a
                  href={landmark.closeup_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium hover:opacity-80"
                  style={{ borderColor: goldBorder, color: goldColor }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Closeup
                </a>
              )}
            </div>
          </div>
        )}

        {/* Credit */}
        <div className="rounded-lg p-4" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
          <span className="text-xs text-muted-foreground leading-relaxed">
            Curated by{' '}
            <a
              href="https://www.sftrees.com/landmark-trees"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline hover:underline"
              style={{ color: accentColor }}
            >
              Mike Sullivan / sftrees.com
            </a>
            {' '}— an independent list of notable SF trees. This tree is not in the city's official street tree dataset.
          </span>
        </div>
      </div>
    </div>
  )
}

export default LandmarkDetails
