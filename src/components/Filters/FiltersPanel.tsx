import { useEffect, useState, useRef } from 'react'
import {
  Star, AlertTriangle, SlidersHorizontal, X, Search, TreePine, MapPin, FilterX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import mapboxgl from 'mapbox-gl'

type MapboxGeocodingFeature = {
  id: string
  place_name: string
  center: [number, number]
}

type RemovalFilter = 'all' | 'only' | 'hide'

type Props = {
  species: string[]
  neighborhoods: string[]
  speciesCounts: Record<string, number>
  neighborhoodCounts: Record<string, number>
  selectedSpecies: string | null
  setSelectedSpecies: (v: string | null) => void
  selectedNeighborhood: string | null
  setSelectedNeighborhood: (v: string | null) => void
  addressQuery: string
  setAddressQuery: (v: string) => void
  onGeocode: (place: { id: string; place_name: string; center: [number, number] }) => void
  onClearAll: () => void
  showFilters: boolean
  setShowFilters: (v: boolean) => void
  showLandmarks: boolean
  setShowLandmarks: (v: boolean) => void
  landmarksEnabled: boolean
  removalFilter: RemovalFilter
  setRemovalFilter: (v: RemovalFilter) => void
}

function Combobox({
  options,
  value,
  onChange,
  counts,
  placeholder,
  icon,
}: {
  options: string[]
  value: string | null
  onChange: (v: string | null) => void
  counts: Record<string, number>
  placeholder: string
  icon: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isDark = document.documentElement.classList.contains('dark')

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 50)
    : options.slice(0, 50)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[0.85rem] transition-all cursor-text"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          borderColor: open ? (isDark ? '#4caf50' : '#2e7d32') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
          boxShadow: open ? `0 0 0 3px ${isDark ? 'rgba(76,175,80,0.08)' : 'rgba(46,125,50,0.08)'}` : 'none',
        }}
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
      >
        <span className="text-muted-foreground shrink-0">{icon}</span>
        {value && !open ? (
          <span className="flex-1 truncate">{value}</span>
        ) : (
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-[0.85rem] min-w-0"
            placeholder={value || placeholder}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
          />
        )}
        {value && (
          <button
            className="text-muted-foreground hover:text-foreground shrink-0 bg-transparent border-none cursor-pointer p-0"
            onClick={(e) => { e.stopPropagation(); onChange(null); setQuery('') }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl max-h-[200px] overflow-y-auto z-10"
          style={{
            backgroundColor: isDark ? '#1e1e1e' : 'white',
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
          ) : (
            filtered.map(option => (
              <div
                key={option}
                className="flex justify-between items-center px-3 py-1.5 mx-1 my-0.5 rounded-lg text-[0.82rem] cursor-pointer transition-colors"
                style={{ backgroundColor: option === value ? (isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.06)') : 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#2a2a2a' : '#f5f7f5')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = option === value ? (isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.06)') : 'transparent')}
                onClick={() => { onChange(option); setOpen(false); setQuery('') }}
              >
                <span>{option}</span>
                <span
                  className="text-[0.68rem] font-semibold px-1.5 rounded text-muted-foreground"
                  style={{ backgroundColor: isDark ? 'rgba(76,175,80,0.08)' : 'rgba(46,125,50,0.06)' }}
                >
                  {counts[option]?.toLocaleString() || 0}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const FiltersPanel = ({
  species,
  neighborhoods,
  speciesCounts,
  neighborhoodCounts,
  selectedSpecies,
  setSelectedSpecies,
  selectedNeighborhood,
  setSelectedNeighborhood,
  addressQuery,
  setAddressQuery,
  onGeocode,
  onClearAll,
  showFilters,
  setShowFilters,
  showLandmarks,
  setShowLandmarks,
  landmarksEnabled,
  removalFilter,
  setRemovalFilter,
}: Props) => {
  const [addressResults, setAddressResults] = useState<MapboxGeocodingFeature[]>([])
  const isDark = document.documentElement.classList.contains('dark')

  const activeFilterCount = [
    selectedSpecies,
    selectedNeighborhood,
    addressQuery,
    removalFilter !== 'all' ? removalFilter : null,
  ].filter(Boolean).length

  const panelBg = isDark ? 'rgba(22, 22, 22, 0.92)' : 'rgba(255, 255, 255, 0.92)'
  const dropdownBg = isDark ? '#1e1e1e' : 'white'
  const dropdownHover = isDark ? '#2a2a2a' : '#f5f7f5'
  const sectionBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const accentColor = isDark ? '#4caf50' : '#2e7d32'

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!addressQuery) {
        setAddressResults([])
        return
      }
      try {
        const accessToken = mapboxgl.accessToken
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            addressQuery
          )}.json?access_token=${accessToken}&autocomplete=true&limit=5&bbox=-123.1738,37.6398,-122.2818,37.9298`
        )
        const data = await response.json()
        setAddressResults(data.features || [])
      } catch (err) {
        console.error('Error fetching address suggestions:', err)
      }
    }
    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [addressQuery])

  const chipStyle = {
    backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)',
    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
  }

  return (
    <>
      {/* Toggle button */}
      <div className="absolute top-[70px] left-4 z-2 flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-[8px] transition-all duration-200 hover:scale-105 border-none cursor-pointer"
          style={{
            backgroundColor: showFilters ? accentColor : (isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)'),
            color: showFilters ? '#fff' : accentColor,
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.1)',
            border: showFilters ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          {showFilters ? <X className="h-5 w-5" /> : <SlidersHorizontal className="h-5 w-5" />}
        </button>

        {/* Active filter chips */}
        {!showFilters && activeFilterCount > 0 && (
          <div className="flex items-center gap-1 flex-wrap max-w-[calc(100vw-90px)] sm:max-w-[400px]">
            {selectedSpecies && (
              <Badge variant="outline" className="h-7 text-[0.75rem] font-semibold gap-1 backdrop-blur-[8px]" style={chipStyle}>
                <TreePine className="h-3.5 w-3.5" />
                {selectedSpecies}
                <button className="ml-1 bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground p-0" onClick={() => setSelectedSpecies(null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedNeighborhood && (
              <Badge variant="outline" className="h-7 text-[0.75rem] font-semibold gap-1 backdrop-blur-[8px]" style={chipStyle}>
                <MapPin className="h-3.5 w-3.5" />
                {selectedNeighborhood}
                <button className="ml-1 bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground p-0" onClick={() => setSelectedNeighborhood(null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {addressQuery && (
              <Badge variant="outline" className="h-7 text-[0.75rem] font-semibold gap-1 backdrop-blur-[8px]" style={chipStyle}>
                <Search className="h-3.5 w-3.5" />
                {addressQuery}
                <button className="ml-1 bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground p-0" onClick={() => setAddressQuery('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {removalFilter !== 'all' && (
              <Badge variant="outline" className="h-7 text-[0.75rem] font-semibold gap-1 backdrop-blur-[8px]" style={{ ...chipStyle, borderColor: isDark ? 'rgba(237, 108, 2, 0.2)' : 'rgba(237, 108, 2, 0.15)' }}>
                <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#ed6c02' }} />
                Removal: {removalFilter}
                <button className="ml-1 bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground p-0" onClick={() => setRemovalFilter('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Panel */}
      {showFilters && (
        <div
          className="absolute top-[120px] left-4 w-[calc(100%-32px)] sm:w-80 max-w-[calc(100%-32px)] rounded-2xl z-2 overflow-hidden backdrop-blur-[20px]"
          style={{
            backgroundColor: panelBg,
            boxShadow: isDark
              ? '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
              : '0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${sectionBorder}` }}>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-[18px] w-[18px] text-primary" />
              <span className="font-bold text-[0.85rem] tracking-tight">Filters</span>
              {activeFilterCount > 0 && (
                <span
                  className="h-5 min-w-5 px-1.5 rounded-md text-[0.7rem] font-bold flex items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.12)', color: accentColor }}
                >
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSelectedSpecies(null)
                  setSelectedNeighborhood(null)
                  setAddressQuery('')
                  setRemovalFilter('all')
                  onClearAll()
                }}
                className="flex items-center gap-1 text-[0.72rem] font-semibold text-muted-foreground bg-transparent border-none cursor-pointer rounded-lg px-2 py-0.5 transition-colors hover:text-primary"
                style={{ backgroundColor: 'transparent' }}
              >
                <FilterX className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>

          {/* Filter inputs */}
          <div className="p-4 flex flex-col gap-3">
            {/* Species */}
            <Combobox
              options={species}
              value={selectedSpecies}
              onChange={setSelectedSpecies}
              counts={speciesCounts}
              placeholder="Species"
              icon={<TreePine className="h-4 w-4" />}
            />

            {/* Neighborhood */}
            <Combobox
              options={neighborhoods}
              value={selectedNeighborhood}
              onChange={setSelectedNeighborhood}
              counts={neighborhoodCounts}
              placeholder="Neighborhood"
              icon={<MapPin className="h-4 w-4" />}
            />

            {/* Address */}
            <div className="relative">
              <div
                className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[0.85rem] transition-all"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }}
              >
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-[0.85rem] min-w-0"
                  placeholder="Go to Address"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                />
              </div>
              {addressResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl max-h-[200px] overflow-y-auto z-[3]"
                  style={{
                    backgroundColor: dropdownBg,
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
                    border: `1px solid ${sectionBorder}`,
                  }}
                >
                  {addressResults.map((result) => (
                    <div
                      key={result.id}
                      className="px-3 py-2 mx-1 my-0.5 rounded-lg text-[0.82rem] cursor-pointer transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = dropdownHover)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => {
                        onGeocode({ id: result.id, place_name: result.place_name, center: result.center })
                        setAddressResults([])
                      }}
                    >
                      {result.place_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Removal Permits */}
          <div
            className="mx-4 p-2.5 rounded-xl flex items-center justify-between"
            style={{
              marginBottom: landmarksEnabled ? 0 : 16,
              backgroundColor: isDark ? 'rgba(237, 108, 2, 0.06)' : 'rgba(237, 108, 2, 0.04)',
              border: `1px solid ${isDark ? 'rgba(237, 108, 2, 0.12)' : 'rgba(237, 108, 2, 0.08)'}`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-[15px] w-[15px]" style={{ color: '#ed6c02' }} />
              <span className="font-semibold text-[0.78rem]">Removal Permits</span>
            </div>
            <div
              className="flex rounded-lg p-0.5 gap-0.5"
              style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)' }}
            >
              {(['all', 'only', 'hide'] as RemovalFilter[]).map((val) => (
                <button
                  key={val}
                  onClick={() => setRemovalFilter(val)}
                  className="text-[0.68rem] py-0.5 px-2 rounded-md font-semibold border-none cursor-pointer transition-all capitalize"
                  style={{
                    color: removalFilter === val ? '#ed6c02' : undefined,
                    backgroundColor: removalFilter === val
                      ? (isDark ? 'rgba(237, 108, 2, 0.15)' : 'rgba(237, 108, 2, 0.1)')
                      : 'transparent',
                    boxShadow: removalFilter === val && !isDark ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Notable Trees */}
          {landmarksEnabled && (
            <div
              className="mx-4 mb-4 mt-2 p-2.5 rounded-xl flex items-center justify-between"
              style={{
                backgroundColor: isDark ? 'rgba(255, 215, 0, 0.04)' : 'rgba(255, 215, 0, 0.04)',
                border: `1px solid ${isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.12)'}`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <Star className="h-[15px] w-[15px]" style={{ color: '#FFD700' }} />
                <div>
                  <span className="font-semibold text-[0.78rem] leading-tight block">Notable Trees</span>
                  <span className="text-[0.65rem] text-muted-foreground">Mike Sullivan's curated list</span>
                </div>
              </div>
              <Switch
                checked={showLandmarks}
                onCheckedChange={setShowLandmarks}
                className="data-[state=checked]:bg-[#FFD700]"
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default FiltersPanel
