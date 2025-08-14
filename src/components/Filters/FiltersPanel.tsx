import { Box, Button, TextField, Autocomplete, Chip } from '@mui/material'
import { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

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
}: Props) => {
  const [addressResults, setAddressResults] = useState<any[]>([])

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
        sx={{
          borderColor: '#2e7d32',
          color: '#2e7d32',
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderColor: '#27662c',
          },
          display: { xs: 'block', sm: 'block' },
          position: 'absolute',
          top: 70,
          left: 20,
          zIndex: 2
        }}
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </Button>
      {!showFilters && (selectedSpecies || selectedNeighborhood || addressQuery) && (
        <Box
          sx={{
            position: 'absolute',
            top: 70,
            left: 'calc(20px + 140px)',
            backgroundColor: 'rgba(29, 120, 80, 0.2)',
            color: 'gray',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '14px',
          }}
        >
          {selectedSpecies ? `Species: ${selectedSpecies}` : ''}
          {selectedNeighborhood ? `, Neighborhood: ${selectedNeighborhood}` : ''}
          {addressQuery ? `, Address: ${addressQuery}` : ''}
        </Box>
      )}
      {showFilters && (
        <Box
          sx={{
            position: 'absolute',
            top: 110,
            left: 20,
            right: 20,
            maxWidth: { xs: '90%', sm: 340 },
            p: { xs: 2, sm: 2.5 },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(46, 125, 50, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 2,
            transition: 'all 0.3s ease',
          }}
        >
          <Autocomplete
            options={species}
            value={selectedSpecies}
            onChange={(_, newValue) => setSelectedSpecies(newValue)}
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
              />
            )}
          />

          <Autocomplete
            options={neighborhoods}
            value={selectedNeighborhood}
            onChange={(_, newValue) => setSelectedNeighborhood(newValue)}
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
            />
            {addressResults.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
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
                      '&:hover': { backgroundColor: '#f0f0f0' }
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
            variant="outlined"
            size="small"
            fullWidth
            disabled={!selectedSpecies && !selectedNeighborhood && !addressQuery}
          >
            Clear All
          </Button>
        </Box>
      )}
    </>
  )
}

export default FiltersPanel


