import { useState, useEffect } from 'react'
import {
  MapPin, Calendar, Ruler, Shield, Map, Copy, ChevronRight, X,
  ExternalLink, AlertTriangle, Droplets, Zap, Wind, Trees, TreePine,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TreeInfo } from '../types/tree'
import { LandmarkInfo } from '../types/landmark'
import { SuggestEdit } from './SuggestEdit'
import { LandmarkBanner } from './LandmarkBanner'
import { calculateEcoBenefits } from '../utils/ecoBenefits'
import { ECO_BENEFITS_ENABLED } from '../flags'

function computeBearing(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
  const toRad = (d: number) => d * Math.PI / 180
  const dLng = toRad(toLng - fromLng)
  const lat1 = toRad(fromLat)
  const lat2 = toRad(toLat)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

function useStreetViewPano(lat: number, lng: number, apiKey: string) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    const fallback = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&heading=0&pitch=10&fov=90`
    setSrc(fallback)
    if (!apiKey) return
    fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&radius=50&key=${apiKey}`)
      .then(r => r.json())
      .then(data => {
        if (data.status !== 'OK') return
        const heading = computeBearing(data.location.lat, data.location.lng, lat, lng)
        setSrc(`https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&pano=${data.pano_id}&heading=${Math.round(heading)}&pitch=10&fov=90`)
      })
      .catch(() => {/* keep fallback src */})
  }, [lat, lng, apiKey])
  return src
}

export const TreeDetails = ({
  selectedTree,
  speciesCounts,
  setSelectedSpecies,
  setSelectedNeighborhood,
  handleDrawerClose,
  setToastMessage,
  landmark,
  birthdayDate,
}: {
  selectedTree: TreeInfo
  speciesCounts: Record<string, number>
  setSelectedSpecies: (val: string) => void
  setSelectedNeighborhood: (val: string) => void
  handleDrawerClose: () => void
  setToastMessage: (message: string) => void
  landmark?: LandmarkInfo
  birthdayDate?: Date | null
}) => {
  const isDark = document.documentElement.classList.contains('dark')

  const headingColor = 'var(--heading)'
  const accentColor = isDark ? '#4caf50' : '#2e7d32'
  const italicColor = isDark ? '#a5d6a7' : '#4caf50'
  const iconColor = '#81c784'
  const cardBg = 'var(--card-bg)'
  const cardBorder = 'var(--card-border)'
  const cardBorderHover = isDark ? 'rgba(76,175,80,0.3)' : 'rgba(46, 125, 50, 0.2)'
  const chipBg = isDark ? 'rgba(76,175,80,0.2)' : 'rgba(46, 125, 50, 0.1)'
  const dividerColor = 'var(--divider)'
  const streetViewBg = isDark ? '#2a2a2a' : '#f5f5f5'

  const ecoBenefits = ECO_BENEFITS_ENABLED ? calculateEcoBenefits(selectedTree.dbh) : null
  const streetViewSrc = useStreetViewPano(
    selectedTree.latitude,
    selectedTree.longitude,
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  )

  const cardClass = "rounded-xl p-5 backdrop-blur-[8px] transition-all duration-300"
  const cardStyle = (hover = true) => ({
    backgroundColor: cardBg,
    border: `1px solid ${cardBorder}`,
    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
    ...(hover ? {} : {}),
  })

  return (
    <div
      className="p-6 h-full flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out"
      style={{ transform: selectedTree ? 'translateX(0)' : 'translateX(100%)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-6" style={{ borderBottom: `1px solid ${dividerColor}` }}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className="font-semibold text-[0.75rem]"
              style={{ backgroundColor: chipBg, color: accentColor }}
            >
              Tree #{selectedTree.id}
            </Badge>
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: selectedTree.color,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                border: `2px solid ${isDark ? '#1e1e1e' : '#ffffff'}`,
              }}
            />
          </div>

          <h2 className="font-bold text-2xl sm:text-[2rem] leading-tight mb-1" style={{ color: headingColor }}>
            {selectedTree.common_name}
          </h2>

          <p className="italic text-base sm:text-lg mb-2" style={{ color: italicColor }}>
            {selectedTree.scientific_name}
          </p>

          <p className="text-sm sm:text-[0.95rem] text-muted-foreground flex items-center gap-1">
            <strong>{speciesCounts[selectedTree.species]?.toLocaleString()}</strong> trees of this species in SF
          </p>

          <div className="flex flex-col gap-1 mt-3">
            <button
              onClick={() => {
                setSelectedSpecies(selectedTree.species)
                if (window.innerWidth < 600) handleDrawerClose()
              }}
              className="flex items-center gap-1 text-sm sm:text-[0.9rem] font-medium bg-transparent border-none p-1 pl-0 cursor-pointer underline decoration-transparent transition-all duration-200 hover:decoration-current"
              style={{ color: accentColor }}
            >
              <TreePine className="h-3.5 w-3.5" />
              View all {selectedTree.common_name} trees
            </button>

            {selectedTree.neighborhood_name && (
              <button
                onClick={() => {
                  setSelectedNeighborhood(selectedTree.neighborhood_name!)
                  if (window.innerWidth < 600) handleDrawerClose()
                }}
                className="flex items-center gap-1 text-sm sm:text-[0.9rem] font-medium bg-transparent border-none p-1 pl-0 cursor-pointer underline decoration-transparent transition-all duration-200 hover:decoration-current"
                style={{ color: accentColor }}
              >
                <Map className="h-3.5 w-3.5" />
                Explore {selectedTree.neighborhood_name}
              </button>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDrawerClose}
          className="absolute top-2.5 right-2.5 text-primary"
        >
          <ChevronRight className="hidden sm:block h-5 w-5" />
          <X className="block sm:hidden h-5 w-5" />
        </Button>
      </div>

      {landmark && <LandmarkBanner landmark={landmark} />}

      {/* Removal warning */}
      {selectedTree.markedForRemoval && (
        <div className="mb-4 p-4 rounded-lg flex flex-col gap-1.5" style={{ backgroundColor: 'rgba(237, 108, 2, 0.08)', border: '1px solid rgba(237, 108, 2, 0.3)' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-[18px] w-[18px]" style={{ color: '#ed6c02' }} />
            <span className="text-sm font-semibold" style={{ color: '#b45309' }}>
              Removal permit filed
              {selectedTree.permitDate && (
                <span className="ml-2 text-xs font-normal" style={{ color: '#92400e' }}>
                  {new Date(selectedTree.permitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </span>
          </div>
          <span className="text-xs leading-relaxed" style={{ color: '#92400e' }}>
            A permit has been submitted to remove this tree. It may still be standing — this does not confirm removal.
          </span>
          <a
            href="https://sfpublicworks.org/index.php/services/tree-removal-notifications"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[0.75rem] font-medium self-start hover:underline"
            style={{ color: '#ed6c02' }}
          >
            <ExternalLink className="h-3 w-3" />
            SF Public Works — Street Trees
          </a>
        </div>
      )}

      {/* Detail cards */}
      <div className="flex-1">
        <div className="grid gap-5">
          {/* Info card */}
          <div className={cardClass} style={cardStyle()}>
            <div className="flex flex-col gap-3">
              {/* Address */}
              <div className="flex items-center gap-3">
                <MapPin className="h-[18px] w-[18px] shrink-0" style={{ color: iconColor }} />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Nearest Address</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-sm flex-1" style={{ color: headingColor }}>
                      {selectedTree.address}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedTree.address)
                        setToastMessage('Address copied to clipboard!')
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${selectedTree.latitude},${selectedTree.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[0.75rem] font-medium mt-1 hover:underline"
                    style={{ color: accentColor }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Google Maps
                  </a>
                </div>
              </div>

              {/* Trunk size */}
              <div className="flex items-center gap-3">
                <Ruler className="h-[18px] w-[18px] shrink-0" style={{ color: iconColor }} />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Trunk Size</span>
                  {selectedTree.dbh ? (
                    <p className="font-semibold text-sm" style={{ color: headingColor }}>{selectedTree.dbh} inches</p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Not recorded</p>
                  )}
                </div>
              </div>

              {/* Date planted */}
              <div className="flex items-center gap-3">
                <Calendar className="h-[18px] w-[18px] shrink-0" style={{ color: iconColor }} />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Date Planted</span>
                  {selectedTree.plantDate ? (
                    <p className="font-semibold text-sm" style={{ color: headingColor }}>
                      {new Date(selectedTree.plantDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Unknown</p>
                  )}
                </div>
              </div>

              {/* Birthday comparison */}
              {birthdayDate && selectedTree.plantDate && (() => {
                const plantDate = new Date(selectedTree.plantDate)
                const diffMs = plantDate.getTime() - birthdayDate.getTime()
                const diffDays = Math.round(Math.abs(diffMs) / 86400000)
                const treePlantedAfter = diffMs > 0
                const years = Math.floor(diffDays / 365)
                const months = Math.floor((diffDays % 365) / 30)
                const days = diffDays % 365 % 30

                let sentence: string
                if (diffDays === 0) {
                  sentence = 'This tree was planted on the day you were born.'
                } else {
                  let timePhrase: string
                  if (years > 0) {
                    timePhrase = `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` and ${months} month${months !== 1 ? 's' : ''}` : ''}`
                  } else if (months > 0) {
                    timePhrase = `${months} month${months !== 1 ? 's' : ''}${days > 0 ? ` and ${days} day${days !== 1 ? 's' : ''}` : ''}`
                  } else {
                    timePhrase = `${diffDays} day${diffDays !== 1 ? 's' : ''}`
                  }
                  if (treePlantedAfter) {
                    sentence = `You were **${timePhrase} old** when this tree was planted.`
                  } else {
                    sentence = `This tree was **${timePhrase} old** when you were born.`
                  }
                }

                const parts = sentence.split(/\*\*(.*?)\*\*/)

                return (
                  <div
                    className="mt-1 py-2 px-3 rounded-lg"
                    style={{ backgroundColor: isDark ? 'rgba(76,175,80,0.08)' : 'rgba(46,125,50,0.04)', border: `1px solid ${cardBorder}` }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: isDark ? '#c8e6c9' : '#33691e' }}>
                      {parts.map((part, i) =>
                        i % 2 === 1
                          ? <strong key={i} style={{ fontWeight: 800, color: accentColor }}>{part}</strong>
                          : <span key={i}>{part}</span>
                      )}
                    </p>
                  </div>
                )
              })()}

              {/* Site type */}
              <div className="flex items-center gap-3">
                <MapPin className="h-[18px] w-[18px] shrink-0" style={{ color: iconColor }} />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Site Type</span>
                  {selectedTree.siteInfo ? (
                    <p className="font-semibold text-sm" style={{ color: headingColor }}>{selectedTree.siteInfo}</p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Standard</p>
                  )}
                </div>
              </div>

              {/* Caretaker */}
              <div className="flex items-center gap-3">
                <Shield className="h-[18px] w-[18px] shrink-0" style={{ color: iconColor }} />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground">Maintained by</span>
                  {selectedTree.caretaker ? (
                    <p className="font-semibold text-sm" style={{ color: headingColor }}>{selectedTree.caretaker}</p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Unknown</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Eco benefits */}
          {ecoBenefits && (
            <div className={cardClass} style={cardStyle()}>
              <div className="flex items-center gap-2 mb-4">
                <Trees className="h-5 w-5" style={{ color: italicColor }} />
                <h3 className="text-sm font-semibold tracking-wide" style={{ color: accentColor }}>
                  Annual Ecological Benefits
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { icon: <Droplets className="h-[17px] w-[17px]" style={{ color: '#64b5f6' }} />, label: 'Stormwater intercepted', amount: `${Math.round(ecoBenefits.stormwaterGal).toLocaleString()} gal`, value: ecoBenefits.stormwaterValue },
                  { icon: <Zap className="h-[17px] w-[17px]" style={{ color: '#ffb74d' }} />, label: 'Energy conserved', amount: `${Math.round(ecoBenefits.energyKwh).toLocaleString()} kWh`, value: ecoBenefits.energyValue },
                  { icon: <Wind className="h-[17px] w-[17px]" style={{ color: '#80cbc4' }} />, label: 'Air pollutants removed', amount: `${ecoBenefits.airLbs < 1 ? ecoBenefits.airLbs.toFixed(2) : Math.round(ecoBenefits.airLbs).toLocaleString()} lbs`, value: ecoBenefits.airValue },
                ].map(({ icon, label, amount, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="mt-0.5">{icon}</div>
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <div className="flex justify-between items-baseline mt-0.5">
                        <span className="font-semibold text-sm" style={{ color: headingColor }}>{amount}</span>
                        <span className="text-xs font-semibold" style={{ color: accentColor }}>
                          ${value < 1 ? value.toFixed(2) : Math.round(value).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-1 pt-3 flex justify-between items-center" style={{ borderTop: `1px solid ${cardBorder}` }}>
                  <span className="font-bold text-sm" style={{ color: headingColor }}>Total annual value</span>
                  <span className="font-bold text-base" style={{ color: accentColor }}>
                    ${Math.round(ecoBenefits.totalValue).toLocaleString()}
                  </span>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-[0.7rem] text-muted-foreground leading-snug cursor-help self-start border-b border-dashed border-muted-foreground">
                        Estimates based on U.S. Forest Service methodology
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs text-xs">
                        Estimates based on U.S. Forest Service i-Tree methodology, calibrated for San Francisco's climate and utility rates.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          <SuggestEdit tree={selectedTree} />

          {/* Street View */}
          <div className={cardClass} style={cardStyle()}>
            <div className="flex items-center gap-2 mb-3">
              <Map className="h-5 w-5" style={{ color: italicColor }} />
              <h3 className="text-sm font-semibold tracking-wide" style={{ color: accentColor }}>
                Street View
              </h3>
            </div>
            <div
              className="relative rounded-lg overflow-hidden h-[300px]"
              style={{ backgroundColor: streetViewBg }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none z-[1]" />
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={streetViewSrc}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Street view may not show the exact tree location
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TreeDetails
