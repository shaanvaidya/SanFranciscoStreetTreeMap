import { Box, Button, TextField, Autocomplete, Chip, Switch, Typography } from '@mui/material'
import { Star, TuneRounded } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import mapboxgl from 'mapbox-gl'

type MapboxGeocodingFeature = {
  id: string
  place_name: string
  center: [number, number]
}

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
}: Props) => {
  const [addressResults, setAddressResults] = useState<MapboxGeocodingFeature[]>([])
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const accentColor = theme.palette.primary.main
  const btnBg = isDark ? 'rgba(30, 35, 32, 0.85)' : 'rgba(247, 245, 240, 0.92)'
  const btnHoverBg = isDark ? 'rgba(30, 35, 32, 0.95)' : 'rgba(247, 245, 240, 1)'
  const panelBg = isDark ? 'rgba(30, 35, 32, 0.96)' : '#ffffff'
  const panelBorder = isDark ? 'rgba(127, 184, 138, 0.15)' : 'rgba(0, 0, 0, 0.08)'
  const dropdownBg = isDark ? '#1e2320' : '#ffffff'
  const dropdownHover = isDark ? '#2a2f2b' : '#f5f3ee'
  const chipFilterBg = isDark ? 'rgba(127, 184, 138, 0.15)' : 'rgba(45, 95, 63, 0.08)'

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      fontSize: '0.85rem',
      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)' },
      '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)' },
      '&.Mui-focused fieldset': { borderColor: accentColor, borderWidth: 2 },
    },
    '& .MuiInputLabel-root': { fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' },
    '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
  }

  const listboxSx = { '& .MuiAutocomplete-option': { fontSize: '0.85rem', py: 0.75 } }

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

  return (
    <>
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outlined"
        size="small"
        startIcon={<TuneRounded sx={{ fontSize: 15 }} />}
        sx={{
          borderColor: isDark ? 'rgba(127,184,138,0.25)' : 'rgba(0,0,0,0.12)',
          color: isDark ? '#c8e6c9' : '#333',
          backgroundColor: isDark ? 'rgba(30, 35, 32, 0.9)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '0.8rem',
          fontWeight: 500,
          px: 1.5,
          py: 0.5,
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: btnHoverBg,
            borderColor: isDark ? 'rgba(127,184,138,0.4)' : 'rgba(0,0,0,0.2)',
          },
          position: 'absolute',
          top: 66,
          left: 20,
          zIndex: 2
        }}
      >
        {showFilters ? 'Hide Filters' : 'Filters'}
      </Button>
      {!showFilters && (selectedSpecies || selectedNeighborhood || addressQuery) && (
        <Box
          sx={{
            position: 'absolute',
            top: 66,
            left: 'calc(20px + 120px)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexWrap: 'wrap',
            zIndex: 2,
          }}
        >
          {selectedSpecies && (
            <Chip
              label={selectedSpecies}
              onDelete={() => setSelectedSpecies(null)}
              sx={{
                backgroundColor: isDark ? 'rgba(30, 35, 32, 0.9)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(127,184,138,0.25)' : '1px solid rgba(0,0,0,0.12)',
                color: isDark ? '#c8e6c9' : '#333',
                fontWeight: 500,
                fontSize: '0.8rem',
                height: 32,
                '& .MuiChip-deleteIcon': { color: isDark ? '#7fb88a' : '#666', fontSize: 16 },
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
          )}
          {selectedNeighborhood && (
            <Chip
              label={selectedNeighborhood}
              onDelete={() => setSelectedNeighborhood(null)}
              sx={{
                backgroundColor: isDark ? 'rgba(30, 35, 32, 0.9)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(127,184,138,0.25)' : '1px solid rgba(0,0,0,0.12)',
                color: isDark ? '#c8e6c9' : '#333',
                fontWeight: 500,
                fontSize: '0.8rem',
                height: 32,
                '& .MuiChip-deleteIcon': { color: isDark ? '#7fb88a' : '#666', fontSize: 16 },
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
          )}
          {addressQuery && (
            <Chip
              label={addressQuery}
              onDelete={() => setAddressQuery('')}
              sx={{
                backgroundColor: isDark ? 'rgba(30, 35, 32, 0.9)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(127,184,138,0.25)' : '1px solid rgba(0,0,0,0.12)',
                color: isDark ? '#c8e6c9' : '#333',
                fontWeight: 500,
                fontSize: '0.8rem',
                height: 32,
                maxWidth: 220,
                '& .MuiChip-deleteIcon': { color: isDark ? '#7fb88a' : '#666', fontSize: 16 },
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
          )}
        </Box>
      )}
      {showFilters && (
        <Box
          sx={{
            position: 'absolute',
            top: 106,
            left: 20,
            right: 20,
            maxWidth: { xs: '90%', sm: 320 },
            p: 2,
            backgroundColor: panelBg,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '12px',
            boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
            border: `1px solid ${panelBorder}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            zIndex: 2,
          }}
        >
          <Autocomplete
            options={species}
            value={selectedSpecies}
            onChange={(_, newValue) => setSelectedSpecies(newValue)}
            slotProps={{ paper: { sx: listboxSx } }}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>{option}</span>
                  <Chip label={`${speciesCounts[option]?.toLocaleString() || 0}`} size="small" />
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filter by Species"
                variant="outlined"
                size="small"
                sx={inputSx}
              />
            )}
          />

          <Autocomplete
            options={neighborhoods}
            value={selectedNeighborhood}
            onChange={(_, newValue) => setSelectedNeighborhood(newValue)}
            slotProps={{ paper: { sx: listboxSx } }}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>{option}</span>
                  <Chip label={`${neighborhoodCounts[option]?.toLocaleString() || 0}`} size="small" />
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filter by Neighborhood"
                variant="outlined"
                size="small"
                sx={inputSx}
              />
            )}
          />

          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              size="small"
              label="Go to Address"
              variant="outlined"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              sx={inputSx}
            />
            {addressResults.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: dropdownBg,
                  boxShadow: 2,
                  borderRadius: 1,
                  maxHeight: 200,
                  overflowY: 'auto',
                  zIndex: 3
                }}
              >
                {addressResults.map((result) => (
                  <Box
                    key={result.id}
                    sx={{
                      px: 2,
                      py: 1,
                      cursor: 'pointer',
                      color: 'text.primary',
                      '&:hover': { backgroundColor: dropdownHover }
                    }}
                    onClick={() => {
                      onGeocode({ id: result.id, place_name: result.place_name, center: result.center })
                      setAddressResults([])
                    }}
                  >
                    {result.place_name}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Button
            onClick={() => {
              setSelectedSpecies(null)
              setSelectedNeighborhood(null)
              setAddressQuery('')
              onClearAll()
            }}
            variant="text"
            size="small"
            disabled={!selectedSpecies && !selectedNeighborhood && !addressQuery}
            sx={{
              color: 'text.secondary',
              fontSize: '0.78rem',
              py: 0.25,
              alignSelf: 'flex-end',
              minWidth: 'auto',
              '&:hover': { color: accentColor, backgroundColor: 'transparent' },
            }}
          >
            Clear All
          </Button>

          {landmarksEnabled && <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Star sx={{ fontSize: 16, color: '#FFD700' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.2 }}>
                  Notable Trees
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
                  Mike Sullivan's curated list
                </Typography>
              </Box>
            </Box>
            <Switch
              size="small"
              checked={showLandmarks}
              onChange={e => setShowLandmarks(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#FFD700' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#FFD700' },
              }}
            />
          </Box>}
        </Box>
      )}
    </>
  )
}

export default FiltersPanel
