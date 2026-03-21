import { Box, Button, TextField, Autocomplete, Chip, Switch, Typography, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material'
import { Star, WarningAmber, TuneRounded, CloseRounded, SearchRounded, ParkRounded, LocationOnRounded, ClearAllRounded } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useTheme, alpha } from '@mui/material/styles'
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
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

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

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      fontSize: '0.85rem',
      transition: 'all 0.2s ease',
      '& fieldset': {
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        transition: 'border-color 0.2s ease',
      },
      '&:hover fieldset': {
        borderColor: alpha(theme.palette.primary.main, 0.3),
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1.5px',
      },
      '&.Mui-focused': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,1)',
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
      },
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.85rem',
    },
  }

  return (
    <>
      {/* Toggle button */}
      <Box
        sx={{
          position: 'absolute',
          top: 70,
          left: 16,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            backgroundColor: showFilters
              ? theme.palette.primary.main
              : (isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)'),
            color: showFilters
              ? '#fff'
              : theme.palette.primary.main,
            boxShadow: isDark
              ? '0 2px 12px rgba(0,0,0,0.4)'
              : '0 2px 12px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(8px)',
            border: showFilters
              ? 'none'
              : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: showFilters
                ? theme.palette.primary.dark
                : (isDark ? 'rgba(40,40,40,0.95)' : 'rgba(245,245,245,0.98)'),
              transform: 'scale(1.05)',
            },
          }}
        >
          {showFilters ? <CloseRounded sx={{ fontSize: 20 }} /> : <TuneRounded sx={{ fontSize: 20 }} />}
        </IconButton>

        {/* Active filter chips */}
        {!showFilters && activeFilterCount > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flexWrap: 'wrap',
              maxWidth: { xs: 'calc(100vw - 90px)', sm: 400 },
            }}
          >
            {selectedSpecies && (
              <Chip
                label={selectedSpecies}
                size="small"
                onDelete={() => setSelectedSpecies(null)}
                icon={<ParkRounded sx={{ fontSize: '14px !important' }} />}
                sx={{
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  '& .MuiChip-deleteIcon': {
                    fontSize: 16,
                    color: 'text.disabled',
                    '&:hover': { color: 'text.primary' },
                  },
                }}
              />
            )}
            {selectedNeighborhood && (
              <Chip
                label={selectedNeighborhood}
                size="small"
                onDelete={() => setSelectedNeighborhood(null)}
                icon={<LocationOnRounded sx={{ fontSize: '14px !important' }} />}
                sx={{
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  '& .MuiChip-deleteIcon': {
                    fontSize: 16,
                    color: 'text.disabled',
                    '&:hover': { color: 'text.primary' },
                  },
                }}
              />
            )}
            {addressQuery && (
              <Chip
                label={addressQuery}
                size="small"
                onDelete={() => setAddressQuery('')}
                icon={<SearchRounded sx={{ fontSize: '14px !important' }} />}
                sx={{
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  '& .MuiChip-deleteIcon': {
                    fontSize: 16,
                    color: 'text.disabled',
                    '&:hover': { color: 'text.primary' },
                  },
                }}
              />
            )}
            {removalFilter !== 'all' && (
              <Chip
                label={`Removal: ${removalFilter}`}
                size="small"
                onDelete={() => setRemovalFilter('all')}
                icon={<WarningAmber sx={{ fontSize: '14px !important', color: '#ed6c02 !important' }} />}
                sx={{
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  border: `1px solid ${isDark ? 'rgba(237, 108, 2, 0.2)' : 'rgba(237, 108, 2, 0.15)'}`,
                  '& .MuiChip-deleteIcon': {
                    fontSize: 16,
                    color: 'text.disabled',
                    '&:hover': { color: 'text.primary' },
                  },
                }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Panel */}
      {showFilters && (
        <Box
          sx={{
            position: 'absolute',
            top: 120,
            left: 16,
            maxWidth: { xs: 'calc(100% - 32px)', sm: 320 },
            width: { xs: 'calc(100% - 32px)', sm: 320 },
            backgroundColor: panelBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: isDark
              ? '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
              : '0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
            zIndex: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${sectionBorder}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneRounded sx={{ fontSize: 18, color: theme.palette.primary.main }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
                Filters
              </Typography>
              {activeFilterCount > 0 && (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              )}
            </Box>
            {activeFilterCount > 0 && (
              <Button
                size="small"
                onClick={() => {
                  setSelectedSpecies(null)
                  setSelectedNeighborhood(null)
                  setAddressQuery('')
                  setRemovalFilter('all')
                  onClearAll()
                }}
                startIcon={<ClearAllRounded sx={{ fontSize: '14px !important' }} />}
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'none',
                  minWidth: 'auto',
                  py: 0.25,
                  px: 1,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Clear all
              </Button>
            )}
          </Box>

          {/* Filter inputs */}
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Species */}
            <Autocomplete
              options={species}
              value={selectedSpecies}
              onChange={(_, newValue) => setSelectedSpecies(newValue)}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.82rem' }}>{option}</Typography>
                    <Chip
                      label={speciesCounts[option]?.toLocaleString() || 0}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: 'text.secondary',
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  </Box>
                </li>
              )}
              componentsProps={{
                paper: {
                  sx: {
                    borderRadius: '12px',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0,0,0,0.5)'
                      : '0 8px 24px rgba(0,0,0,0.12)',
                    mt: 0.5,
                    '& .MuiAutocomplete-option': {
                      borderRadius: '8px',
                      mx: 0.5,
                      my: 0.25,
                    },
                  },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Species"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <ParkRounded sx={{ fontSize: 16, color: 'text.disabled', mr: 0.5, ml: -0.25 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  sx={inputSx}
                />
              )}
            />

            {/* Neighborhood */}
            <Autocomplete
              options={neighborhoods}
              value={selectedNeighborhood}
              onChange={(_, newValue) => setSelectedNeighborhood(newValue)}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.82rem' }}>{option}</Typography>
                    <Chip
                      label={neighborhoodCounts[option]?.toLocaleString() || 0}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: 'text.secondary',
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  </Box>
                </li>
              )}
              componentsProps={{
                paper: {
                  sx: {
                    borderRadius: '12px',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0,0,0,0.5)'
                      : '0 8px 24px rgba(0,0,0,0.12)',
                    mt: 0.5,
                    '& .MuiAutocomplete-option': {
                      borderRadius: '8px',
                      mx: 0.5,
                      my: 0.25,
                    },
                  },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Neighborhood"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <LocationOnRounded sx={{ fontSize: 16, color: 'text.disabled', mr: 0.5, ml: -0.25 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  sx={inputSx}
                />
              )}
            />

            {/* Address */}
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                size="small"
                label="Go to Address"
                variant="outlined"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchRounded sx={{ fontSize: 16, color: 'text.disabled', mr: 0.5 }} />
                  ),
                }}
                sx={inputSx}
              />
              {addressResults.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    mt: 0.5,
                    backgroundColor: dropdownBg,
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0,0,0,0.5)'
                      : '0 8px 24px rgba(0,0,0,0.12)',
                    borderRadius: '12px',
                    maxHeight: 200,
                    overflowY: 'auto',
                    zIndex: 3,
                    border: `1px solid ${sectionBorder}`,
                  }}
                >
                  {addressResults.map((result) => (
                    <Box
                      key={result.id}
                      sx={{
                        px: 1.5,
                        py: 1,
                        mx: 0.5,
                        my: 0.25,
                        cursor: 'pointer',
                        color: 'text.primary',
                        fontSize: '0.82rem',
                        borderRadius: '8px',
                        transition: 'background-color 0.15s ease',
                        '&:hover': { backgroundColor: dropdownHover },
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
          </Box>

          {/* Removal Permits */}
          <Box
            sx={{
              mx: 2,
              mb: landmarksEnabled ? 0 : 2,
              p: 1.25,
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(237, 108, 2, 0.06)' : 'rgba(237, 108, 2, 0.04)',
              border: `1px solid ${isDark ? 'rgba(237, 108, 2, 0.12)' : 'rgba(237, 108, 2, 0.08)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <WarningAmber sx={{ fontSize: 15, color: '#ed6c02' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                Removal Permits
              </Typography>
            </Box>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={removalFilter}
              onChange={(_, val) => { if (val !== null) setRemovalFilter(val) }}
              sx={{
                backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)',
                borderRadius: '8px',
                p: '2px',
                gap: '2px',
                '& .MuiToggleButtonGroup-grouped': {
                  border: 'none',
                  '&:not(:first-of-type)': { borderRadius: '6px', ml: 0 },
                  '&:first-of-type': { borderRadius: '6px' },
                },
                '& .MuiToggleButton-root': {
                  fontSize: '0.68rem',
                  py: 0.25,
                  px: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'text.secondary',
                  border: 'none',
                  transition: 'all 0.15s ease',
                },
                '& .MuiToggleButton-root.Mui-selected': {
                  color: '#ed6c02',
                  backgroundColor: isDark ? 'rgba(237, 108, 2, 0.15)' : 'rgba(237, 108, 2, 0.1)',
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="only">Only</ToggleButton>
              <ToggleButton value="hide">Hide</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Notable Trees */}
          {landmarksEnabled && (
            <Box
              sx={{
                mx: 2,
                mb: 2,
                mt: 1,
                p: 1.25,
                borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(255, 215, 0, 0.04)' : 'rgba(255, 215, 0, 0.04)',
                border: `1px solid ${isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.12)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Star sx={{ fontSize: 15, color: '#FFD700' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', lineHeight: 1.2 }}>
                    Notable Trees
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
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
            </Box>
          )}
        </Box>
      )}
    </>
  )
}

export default FiltersPanel
