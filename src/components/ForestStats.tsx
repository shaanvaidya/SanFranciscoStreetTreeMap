import { useMemo } from 'react'
import { Box, Typography, LinearProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { TreeInfo } from '../types/tree'

const TOP_N = 8

export const ForestStats = ({
  totalTrees,
  speciesCounts,
  allTrees,
  setSelectedSpecies,
}: {
  totalTrees: number
  speciesCounts: Record<string, number>
  allTrees: TreeInfo[]
  setSelectedSpecies: (s: string) => void
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const headingColor = isDark ? '#c8e6c9' : '#1b5e20'
  const accentColor = theme.palette.primary.main
  const subtleText = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)'
  const cardBorder = isDark ? 'rgba(76,175,80,0.15)' : 'rgba(46, 125, 50, 0.12)'
  const dividerColor = isDark ? 'rgba(76,175,80,0.15)' : 'rgba(46, 125, 50, 0.15)'

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
      .slice(0, TOP_N)
      .map(([species, count]) => ({
        species,
        commonName: speciesCommonName[species] ?? species,
        count,
        pct: totalTrees > 0 ? (count / totalTrees) * 100 : 0,
      })),
    [speciesCounts, speciesCommonName, totalTrees]
  )

  const speciesCount = Object.keys(speciesCounts).length

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-track': { background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f1f1' },
      '&::-webkit-scrollbar-thumb': { background: accentColor, borderRadius: '3px' },
    }}>

      {/* Header */}
      <Box sx={{ mb: 3, pb: 3, borderBottom: `1px solid ${dividerColor}` }}>
        <Typography variant="h5" sx={{
          fontWeight: 700,
          color: headingColor,
          fontSize: { xs: '1.4rem', sm: '1.7rem' },
          lineHeight: 1.2,
          mb: 0.5,
        }}>
          San Francisco Urban Forest
        </Typography>
        <Typography variant="body2" sx={{ color: subtleText }}>
          Click any tree on the map to explore it
        </Typography>
      </Box>

      {/* Stat grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        mb: 3,
      }}>
        {[
          { value: totalTrees.toLocaleString(), label: 'Trees Mapped' },
          { value: speciesCount.toLocaleString(), label: 'Species' },
        ].map(({ value, label }) => (
          <Box key={label} sx={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 3,
            p: 2.5,
            backdropFilter: 'blur(8px)',
          }}>
            <Typography sx={{
              fontSize: '1.8rem',
              fontWeight: 700,
              color: headingColor,
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

      {/* Top species */}
      <Box sx={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 3,
        p: 2.5,
        backdropFilter: 'blur(8px)',
        flex: 1,
      }}>
        <Typography variant="subtitle2" sx={{
          color: accentColor,
          fontWeight: 600,
          letterSpacing: '0.5px',
          mb: 2,
        }}>
          Most Common Species
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {topSpecies.map(({ species, commonName, count, pct }) => (
            <Box
              key={species}
              onClick={() => setSelectedSpecies(species)}
              sx={{ cursor: 'pointer', '&:hover .species-name': { color: headingColor } }}
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
                  backgroundColor: isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.1)',
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
    </Box>
  )
}

export default ForestStats
