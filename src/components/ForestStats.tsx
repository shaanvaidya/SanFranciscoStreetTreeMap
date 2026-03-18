import { useMemo } from 'react'
import { Box, Typography, LinearProgress, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ChevronRight, Close as CloseIcon } from '@mui/icons-material'
import { TreeInfo } from '../types/tree'

const TOP_N = 8

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
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const headingColor = isDark ? '#c8e6c9' : '#1a3d2a'
  const accentColor = theme.palette.primary.main
  const subtleText = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0, 0, 0, 0.06)'
  const dividerColor = isDark ? 'rgba(127,184,138,0.15)' : 'rgba(45, 95, 63, 0.12)'
  const statCardBg = isDark ? 'rgba(127, 184, 138, 0.1)' : 'rgba(45, 95, 63, 0.05)'

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
    <Box sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-track': { background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f1f1' },
      '&::-webkit-scrollbar-thumb': { background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', borderRadius: '3px' },
    }}>

      {/* Header */}
      <Box sx={{ mb: 3, pb: 3, borderBottom: `1px solid ${dividerColor}` }}>
        <IconButton
          onClick={onClose}
          sx={{
            color: accentColor,
            '&:hover': { backgroundColor: isDark ? 'rgba(127,184,138,0.12)' : 'rgba(45, 95, 63, 0.08)' },
            position: 'absolute',
            top: 10,
            right: 10,
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'flex' } }}><ChevronRight /></Box>
          <Box component="span" sx={{ display: { xs: 'flex', sm: 'none' } }}><CloseIcon /></Box>
        </IconButton>

        <Typography variant="h5" sx={{
          color: headingColor,
          fontSize: { xs: '1.4rem', sm: '1.65rem' },
          lineHeight: 1.2,
          mb: 1,
          pr: 4,
        }}>
          San Francisco's Urban Forest
        </Typography>
        <Typography variant="body2" sx={{ color: subtleText, lineHeight: 1.6 }}>
          San Francisco's streets are lined with over 195,000 city-maintained trees — planted in sidewalks,
          medians, and public right-of-ways across every neighborhood. This map covers trees managed by SF
          Public Works. Click any tree to explore its species, planting history, and more.
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: subtleText }}>
          <LinearProgress sx={{ flex: 1, borderRadius: 1, height: 3 }} />
          <Typography variant="caption">Loading tree data…</Typography>
        </Box>
      )}

      {!loading && <>

      {/* Stat grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        mb: 2,
      }}>
        {[
          { value: totalTrees.toLocaleString(), label: 'Trees Mapped' },
          { value: speciesCount.toLocaleString(), label: 'Species' },
        ].map(({ value, label }) => (
          <Box key={label} sx={{
            backgroundColor: statCardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '10px',
            p: 2,
          }}>
            <Typography sx={{
              fontSize: '2rem',
              fontWeight: 700,
              color: accentColor,
              lineHeight: 1,
              mb: 0.5,
            }}>
              {value}
            </Typography>
            <Typography variant="caption" sx={{ color: subtleText, fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Extra stats row */}
      {topNeighborhood && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{
            border: `1px solid ${cardBorder}`,
            borderRadius: '10px',
            p: 2,
          }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: headingColor, lineHeight: 1.3, mb: 0.25 }}>
              {topNeighborhood[0]}
            </Typography>
            <Typography variant="caption" sx={{ color: subtleText }}>
              Most trees — {topNeighborhood[1].toLocaleString()} street trees
            </Typography>
          </Box>
        </Box>
      )}

      {/* Top species */}
      <Box sx={{
        border: `1px solid ${cardBorder}`,
        borderRadius: '10px',
        p: 2,
        flex: 1,
      }}>
        <Typography variant="subtitle2" sx={{
          color: accentColor,
          mb: 2,
        }}>
          Most Common Species
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {topSpecies.map(({ species, commonName, count, pct }, index) => (
            <Box
              key={species}
              onClick={() => setSelectedSpecies(species)}
              sx={{
                cursor: 'pointer',
                '&:hover .species-name': { color: headingColor },
                animation: 'fadeInUp 0.3s ease both',
                animationDelay: `${index * 0.04}s`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                <Typography
                  className="species-name"
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: accentColor,
                    fontSize: '0.85rem',
                    transition: 'color 0.15s',
                    flex: 1,
                    pr: 1,
                  }}
                >
                  {commonName}
                </Typography>
                <Typography variant="caption" sx={{ color: subtleText, whiteSpace: 'nowrap' }}>
                  {count.toLocaleString()} · {pct.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? 'rgba(127,184,138,0.12)' : 'rgba(45,95,63,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    backgroundColor: accentColor,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      </>}
    </Box>
  )
}

export default ForestStats
