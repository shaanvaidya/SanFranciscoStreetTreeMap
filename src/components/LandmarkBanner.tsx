import { Box, Typography, Button, Chip } from '@mui/material'
import { Star, Launch as LaunchIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { LandmarkInfo } from '../types/landmark'

export const LandmarkBanner = ({ landmark }: { landmark: LandmarkInfo }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const goldColor = isDark ? '#FFD700' : '#a07800'
  const bg = isDark ? 'rgba(255, 215, 0, 0.07)' : 'rgba(255, 215, 0, 0.1)'
  const border = isDark ? 'rgba(255, 215, 0, 0.25)' : 'rgba(160, 120, 0, 0.25)'

  const text = landmark.description || landmark.detail

  return (
    <Box sx={{ mb: 2.5, p: 2, borderRadius: 2, backgroundColor: bg, border: `1px solid ${border}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: text ? 1 : 0 }}>
        <Star sx={{ color: '#FFD700', fontSize: 17 }} />
        <Typography variant="body2" sx={{ fontWeight: 700, color: goldColor, fontSize: '0.85rem' }}>
          Notable Tree
        </Typography>
        <Chip
          label="Mike Sullivan's List"
          size="small"
          sx={{
            fontSize: '0.65rem',
            height: 18,
            backgroundColor: isDark ? 'rgba(255,215,0,0.12)' : 'rgba(160,120,0,0.1)',
            color: goldColor,
            border: `1px solid ${border}`,
          }}
        />
      </Box>

      {text && (
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65, mb: 1, fontSize: '0.85rem' }}>
          {text}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {landmark.image_url && (
          <Button
            variant="text"
            size="small"
            component="a"
            href={landmark.image_url}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LaunchIcon sx={{ fontSize: 12 }} />}
            sx={{ p: 0, minHeight: 'auto', fontSize: '0.75rem', color: goldColor }}
          >
            View photo
          </Button>
        )}
        {landmark.closeup_url && (
          <Button
            variant="text"
            size="small"
            component="a"
            href={landmark.closeup_url}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LaunchIcon sx={{ fontSize: 12 }} />}
            sx={{ p: 0, minHeight: 'auto', fontSize: '0.75rem', color: goldColor }}
          >
            Closeup
          </Button>
        )}
        <Typography
          component="a"
          href="https://www.sftrees.com/landmark-trees"
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          sx={{ color: 'text.disabled', ml: 'auto', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          sftrees.com
        </Typography>
      </Box>
    </Box>
  )
}

export default LandmarkBanner
