import { Box, Typography, IconButton } from '@mui/material'
import { InfoOutlined as InfoOutlinedIcon, DarkMode, LightMode } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

type Props = {
  mode: 'light' | 'dark'
  onToggleTheme: () => void
  onInfoClick: () => void
}

const HeaderBar = ({ mode, onToggleTheme, onInfoClick }: Props) => {
  const theme = useTheme()
  const isDark = mode === 'dark'

  const headerBg = isDark ? 'rgba(18, 18, 18, 0.9)' : 'rgba(248, 249, 250, 0.9)'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0'

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          px: 2,
          backgroundColor: headerBg,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${borderColor}`,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            San Francisco Street Tree Map
          </Typography>
          <IconButton
            size="small"
            onClick={onInfoClick}
            sx={{ color: theme.palette.primary.main, ml: 1 }}
            aria-label="About this map"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 0.5 }}>
          <IconButton
            onClick={onToggleTheme}
            size="small"
            sx={{ color: theme.palette.primary.main }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>

        </Box>
      </Box>

    </>
  )
}

export default HeaderBar
