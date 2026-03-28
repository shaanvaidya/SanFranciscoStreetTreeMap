import { useMemo } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TreeInfo } from '../types/tree'

const TOP_N = 20

export const ForestStats = ({
  totalTrees,
  speciesCounts,
  neighborhoodCounts,
  allTrees,
  loading,
  setSelectedSpecies,
  onClose,
}: {
  totalTrees: number
  speciesCounts: Record<string, number>
  neighborhoodCounts: Record<string, number>
  allTrees: TreeInfo[]
  loading: boolean
  setSelectedSpecies: (s: string) => void
  onClose: () => void
}) => {
  const isDark = document.documentElement.classList.contains('dark')

  const headingColor = 'var(--heading)'
  const accentColor = isDark ? '#4caf50' : '#2e7d32'
  const subtleText = 'var(--subtle-text)'
  const cardBg = 'var(--card-bg)'
  const cardBorder = 'var(--card-border)'
  const dividerColor = 'var(--divider)'

  const speciesCommonName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const tree of allTrees) {
      if (tree.species && !map[tree.species]) {
        map[tree.species] = tree.common_name
      }
    }
    return map
  }, [allTrees])

  const topSpecies = useMemo(() =>
    Object.entries(speciesCounts)
      .sort(([, a], [, b]) => b - a)
      .filter(([species]) => {
        const name = (speciesCommonName[species] ?? species).toLowerCase()
        return !name.includes('unknown') && name !== '' && species !== ''
      })
      .slice(0, TOP_N)
      .map(([species, count]) => ({
        species,
        commonName: speciesCommonName[species] ?? species,
        count,
        pct: totalTrees > 0 ? (count / totalTrees) * 100 : 0,
      })),
    [speciesCounts, speciesCommonName, totalTrees]
  )

  const speciesCount = useMemo(() =>
    Object.keys(speciesCounts).filter(s => {
      const name = (speciesCommonName[s] ?? s).toLowerCase()
      return !name.includes('unknown') && s !== ''
    }).length,
    [speciesCounts, speciesCommonName]
  )

  const topNeighborhood = useMemo(() => {
    const entries = Object.entries(neighborhoodCounts)
    if (!entries.length) return null
    return entries.sort(([, a], [, b]) => b - a)[0]
  }, [neighborhoodCounts])

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto scrollbar-thin">

      {/* Header */}
      <div className="mb-6 pb-6" style={{ borderBottom: `1px solid ${dividerColor}` }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 text-primary"
        >
          <ChevronRight className="hidden sm:block h-5 w-5" />
          <X className="block sm:hidden h-5 w-5" />
        </Button>

        <h2
          className="font-bold text-2xl sm:text-[1.65rem] leading-tight mb-2 pr-8"
          style={{ color: headingColor }}
        >
          San Francisco's Urban Forest
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: subtleText }}>
          San Francisco's streets are lined with over 195,000 city-maintained trees — planted in sidewalks,
          medians, and public right-of-ways across every neighborhood. This map covers trees managed by SF
          Public Works. Click any tree to explore its species, planting history, and more.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3" style={{ color: subtleText }}>
          <Progress className="flex-1 h-[3px]" value={undefined} />
          <span className="text-xs">Loading tree data…</span>
        </div>
      )}

      {!loading && <>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[
          { value: totalTrees.toLocaleString(), label: 'Trees Mapped' },
          { value: speciesCount.toLocaleString(), label: 'Species' },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="rounded-xl p-5 backdrop-blur-[8px]"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div className="text-[1.8rem] font-bold leading-none mb-1" style={{ color: headingColor }}>
              {value}
            </div>
            <span className="text-xs font-medium" style={{ color: subtleText }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Extra stats row */}
      {topNeighborhood && (
        <div className="mb-6">
          <div
            className="rounded-xl p-4 backdrop-blur-[8px]"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div className="text-[0.85rem] font-bold leading-tight mb-0.5" style={{ color: headingColor }}>
              {topNeighborhood[0]}
            </div>
            <span className="text-xs" style={{ color: subtleText }}>
              Most trees — {topNeighborhood[1].toLocaleString()} street trees
            </span>
          </div>
        </div>
      )}

      {/* Top species */}
      <div
        className="rounded-xl p-5 backdrop-blur-[8px] flex-1"
        style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <h3
          className="text-sm font-semibold tracking-wide mb-4"
          style={{ color: accentColor }}
        >
          Most Common Species
        </h3>

        <div className="flex flex-col gap-3.5">
          {topSpecies.map(({ species, commonName, count, pct }) => (
            <div
              key={species}
              onClick={() => setSelectedSpecies(species)}
              className="cursor-pointer group"
            >
              <div className="flex justify-between items-baseline mb-1">
                <span
                  className="font-semibold text-[0.85rem] transition-colors flex-1 pr-2 group-hover:text-[var(--heading)]"
                  style={{ color: accentColor }}
                >
                  {commonName}
                </span>
                <span className="text-xs whitespace-nowrap" style={{ color: subtleText }}>
                  {count.toLocaleString()} · {pct.toFixed(1)}%
                </span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.1)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: accentColor }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      </>}
    </div>
  )
}

export default ForestStats
