import { Box, Typography, IconButton, Chip, Button } from '@mui/material'
import { Nature, LocationOn, CalendarToday, Straighten, Policy, MapOutlined, ContentCopy, Close as CloseIcon, Launch as LaunchIcon, WarningAmber } from '@mui/icons-material'
import { TreeInfo } from '../types/tree'
import { SuggestEdit } from './SuggestEdit'

const subtitleStyle = {
  color: '#2e7d32',
  mb: 0.5,
  letterSpacing: '0.5px',
  fontWeight: 600
}

export const TreeDetails = ({
  selectedTree,
  speciesCounts,
  setSelectedSpecies,
  setSelectedNeighborhood,
  handleDrawerClose,
  setToastMessage
}: {
  selectedTree: TreeInfo
  speciesCounts: Record<string, number>
  setSelectedSpecies: (val: string) => void
  setSelectedNeighborhood: (val: string) => void
  handleDrawerClose: () => void
  setToastMessage: (message: string) => void
}) => (
  <Box sx={{
    transition: 'transform 0.3s ease-in-out',
    transform: selectedTree ? 'translateX(0)' : 'translateX(100%)',
    p: 3, height: '100%', display: 'flex', flexDirection: 'column',
    overflowY: 'auto',
  }}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 3,
        pb: 3,
        borderBottom: '1px solid rgba(46, 125, 50, 0.2)'
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip 
            label={`Tree #${selectedTree.id}`} 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(46, 125, 50, 0.1)',
              color: '#2e7d32',
              fontWeight: 600,
              fontSize: '0.75rem'
            }} 
          />
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: selectedTree.color,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              border: '2px solid white',
            }}
          />
        </Box>
        
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          color: '#1b5e20', 
          mb: 0.5, 
          fontSize: { xs: '1.5rem', sm: '2.0rem' },
          lineHeight: 1.2
        }}>
          {selectedTree.common_name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Nature sx={{ fontSize: 18, color: '#4caf50' }} />
          <Typography variant="body1" sx={{ 
            color: '#2e7d32', 
            fontStyle: 'italic',
            fontSize: { xs: '0.9rem', sm: '1.1rem' } 
          }}>
            {selectedTree.scientific_name}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ 
          color: '#666', 
          fontSize: { xs: '0.85rem', sm: '0.95rem' },
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          <strong>{speciesCounts[selectedTree.species]?.toLocaleString()}</strong> trees of this species in SF
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1.5 }}>
          <Typography
            component="button"
            onClick={() => {
              setSelectedSpecies(selectedTree.species)
              if (window.innerWidth < 600) {
                handleDrawerClose();
              }
            }}
            sx={{
              color: '#2e7d32',
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              background: 'none',
              border: 'none',
              padding: '4px 0',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                textDecorationColor: '#2e7d32',
                color: '#1b5e20',
              },
            }}
          >
            <Nature sx={{ fontSize: 14 }} />
            View all {selectedTree.common_name} trees
          </Typography>
          
          {selectedTree.neighborhood_name && (
            <Typography
              component="button"
              onClick={() => {
                setSelectedNeighborhood(selectedTree.neighborhood_name!)
                if (window.innerWidth < 600) {
                  handleDrawerClose();
                }
              }}
              sx={{
                color: '#2e7d32',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                background: 'none',
                border: 'none',
                padding: '4px 0',
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationColor: 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  textDecorationColor: '#2e7d32',
                  color: '#1b5e20',
                },
              }}
            >
              <MapOutlined sx={{ fontSize: 14 }} />
              Explore {selectedTree.neighborhood_name}
            </Typography>
          )}
        </Box>
      </Box>
      <IconButton
        onClick={handleDrawerClose}
        sx={{ color: '#2e7d32', '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' }, position: 'absolute', top: 10, right: 10 }}
      >
        <CloseIcon />
      </IconButton>
    </Box>

    {selectedTree.markedForRemoval && (
      <Box sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: 'rgba(237, 108, 2, 0.08)',
        border: '1px solid rgba(237, 108, 2, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmber sx={{ color: '#ed6c02', fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#b45309' }}>
            Removal permit filed
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#92400e', lineHeight: 1.5 }}>
          A permit has been submitted to remove this tree. It may still be standing — this does not confirm removal.
        </Typography>
        <Button
          variant="text"
          size="small"
          component="a"
          href="https://sfpublicworks.org/index.php/services/tree-removal-notifications"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<LaunchIcon sx={{ fontSize: 13 }} />}
          sx={{
            color: '#ed6c02',
            fontSize: '0.75rem',
            p: 0,
            minHeight: 'auto',
            alignSelf: 'flex-start',
            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
          }}
        >
          SF Public Works — Street Trees
        </Button>
      </Box>
    )}

    <Box
      sx={{
        flex: 1,
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { background: '#2e7d32', borderRadius: '3px' }
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          '& > div': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            p: 2.5,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid rgba(46, 125, 50, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              borderColor: 'rgba(46, 125, 50, 0.2)',
            }
          }
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocationOn sx={{ color: '#81c784', fontSize: 18 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                  Nearest Address
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mt: 0.5
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1b5e20', flex: 1 }}>
                    {selectedTree.address}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTree.address);
                      setToastMessage('Address copied to clipboard!');
                    }}
                    sx={{
                      color: '#2e7d32',
                      p: 0.5,
                      '&:hover': { backgroundColor: 'rgba(46,125,50,0.1)' },
                    }}
                  >
                    <ContentCopy sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  component="a"
                  href={`https://www.google.com/maps?q=${selectedTree.latitude},${selectedTree.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    color: '#2e7d32',
                    fontSize: '0.75rem',
                    mt: 0.5,
                    p: 0,
                    minHeight: 'auto',
                    '&:hover': { 
                      backgroundColor: 'rgba(46, 125, 50, 0.04)',
                    }
                  }}
                >
                  View on Google Maps
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Straighten sx={{ color: '#81c784', fontSize: 18 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                  Trunk Size
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1b5e20' }}>
                  {selectedTree.dbh ? `${selectedTree.dbh} inches` : 'Not recorded'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarToday sx={{ color: '#81c784', fontSize: 18 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                  Date Planted
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1b5e20' }}>
                  {selectedTree.plantDate 
                    ? new Date(selectedTree.plantDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocationOn sx={{ color: '#81c784', fontSize: 18 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                  Site Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1b5e20' }}>
                  {selectedTree.siteInfo || 'Standard'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Policy sx={{ color: '#81c784', fontSize: 18 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                  Maintenance
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1b5e20' }}>
                  {selectedTree.legalStatus || 'City Maintained'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <SuggestEdit tree={selectedTree} />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <MapOutlined sx={{ color: '#4caf50', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={subtitleStyle as any}>
              Street View
            </Typography>
          </Box>
          <Box sx={{ 
            position: 'relative',
            borderRadius: 2, 
            overflow: 'hidden', 
            height: 300,
            backgroundColor: '#f5f5f5',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, transparent 80%, rgba(0,0,0,0.05) 100%)',
              pointerEvents: 'none',
              zIndex: 1
            }
          }}>
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/streetview?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDA-b6A5qwlxK2_YnNilM0XRIvMttvD7o4'}&location=${selectedTree.latitude},${selectedTree.longitude}&heading=0&pitch=10&fov=90`}
            ></iframe>
          </Box>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 1, 
              color: '#666',
              textAlign: 'center'
            }}
          >
            Street view may not show the exact tree location
          </Typography>
        </Box>

      </Box>
    </Box>
  </Box>
)

export default TreeDetails


