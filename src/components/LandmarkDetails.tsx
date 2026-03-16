import { Box, Typography, IconButton, Chip, Button } from '@mui/material'
import {
  Star, LocationOn, Nature, Launch as LaunchIcon, Close as CloseIcon,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { LandmarkInfo } from '../types/landmark'

export const LandmarkDetails = ({
  landmark,
  onClose,
}: {
  landmark: LandmarkInfo
  onClose: () => void
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const goldColor = isDark ? '#FFD700' : '#a07800'
  const goldBg = isDark ? 'rgba(255, 215, 0, 0.07)' : 'rgba(255, 215, 0, 0.1)'
  const goldBorder = isDark ? 'rgba(255, 215, 0, 0.25)' : 'rgba(160, 120, 0, 0.25)'
  const headingColor = isDark ? '#c8e6c9' : '#1b5e20'
  const italicColor = isDark ? '#a5d6a7' : '#4caf50'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.95)'
  const cardBorder = isDark ? 'rgba(76,175,80,0.15)' : 'rgba(46, 125, 50, 0.1)'
  const dividerColor = isDark ? 'rgba(76,175,80,0.2)' : 'rgba(46, 125, 50, 0.2)'
  const scrollTrack = isDark ? 'rgba(255,255,255,0.06)' : '#f1f1f1'
  const accentColor = theme.palette.primary.main

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-track': { background: scrollTrack },
      '&::-webkit-scrollbar-thumb': { background: accentColor, borderRadius: '3px' },
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, pb: 3, borderBottom: `1px solid ${dividerColor}` }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Star sx={{ color: '#FFD700', fontSize: 18 }} />
            <Chip
              label="Notable Tree"
              size="small"
              sx={{
                backgroundColor: goldBg,
                color: goldColor,
                border: `1px solid ${goldBorder}`,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: headingColor, mb: 0.5, fontSize: { xs: '1.5rem', sm: '2.0rem' }, lineHeight: 1.2 }}>
            {landmark.common_name || landmark.scientific_name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Nature sx={{ fontSize: 18, color: italicColor }} />
            <Typography variant="body1" sx={{ color: italicColor, fontStyle: 'italic', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
              {landmark.scientific_name}
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Private or park tree — not in the city street tree dataset
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{ color: accentColor, position: 'absolute', top: 10, right: 10, '&:hover': { backgroundColor: isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.08)' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Cards */}
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {/* Location */}
        <Box sx={{ backgroundColor: cardBg, p: 2.5, borderRadius: 3, border: `1px solid ${cardBorder}` }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <LocationOn sx={{ color: '#81c784', fontSize: 18, mt: 0.2 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Location
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor, mt: 0.5 }}>
                {landmark.address || 'See description below'}
              </Typography>
              {landmark.latitude && (
                <Button
                  variant="text"
                  size="small"
                  component="a"
                  href={`https://www.google.com/maps?q=${landmark.latitude},${landmark.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                  sx={{ color: accentColor, fontSize: '0.75rem', mt: 0.5, p: 0, minHeight: 'auto' }}
                >
                  View on Google Maps
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Mike's notes */}
        {(landmark.description || landmark.detail) && (
          <Box sx={{ backgroundColor: goldBg, p: 2.5, borderRadius: 3, border: `1px solid ${goldBorder}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Star sx={{ color: '#FFD700', fontSize: 16 }} />
              <Typography variant="subtitle2" sx={{ color: goldColor, fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                MIKE'S NOTES
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
              {landmark.description || landmark.detail}
            </Typography>
          </Box>
        )}

        {/* Photos */}
        {(landmark.image_url || landmark.closeup_url) && (
          <Box sx={{ backgroundColor: cardBg, p: 2.5, borderRadius: 3, border: `1px solid ${cardBorder}` }}>
            <Typography variant="subtitle2" sx={{ color: accentColor, fontWeight: 600, mb: 1.5, fontSize: '0.8rem', letterSpacing: '0.5px' }}>
              PHOTOS
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {landmark.image_url && (
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={landmark.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LaunchIcon sx={{ fontSize: 13 }} />}
                  sx={{ fontSize: '0.8rem', borderColor: goldBorder, color: goldColor }}
                >
                  View photo
                </Button>
              )}
              {landmark.closeup_url && (
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={landmark.closeup_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LaunchIcon sx={{ fontSize: 13 }} />}
                  sx={{ fontSize: '0.8rem', borderColor: goldBorder, color: goldColor }}
                >
                  Closeup
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Credit */}
        <Box sx={{ p: 2, borderRadius: 2, backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Curated by{' '}
            <Typography
              component="a"
              href="https://www.sftrees.com/landmark-trees"
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              sx={{ color: accentColor, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Mike Sullivan / sftrees.com
            </Typography>
            {' '}— an independent list of notable SF trees. This tree is not in the city's official street tree dataset.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default LandmarkDetails
