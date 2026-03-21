import { Box, Typography, IconButton, Chip, Button, Tooltip } from '@mui/material'
import { Nature, LocationOn, CalendarToday, Straighten, Policy, MapOutlined, ContentCopy, ChevronRight, Close as CloseIcon, Launch as LaunchIcon, WarningAmber, WaterDrop, ElectricBolt, Air, Park } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { TreeInfo } from '../types/tree'
import { LandmarkInfo } from '../types/landmark'
import { SuggestEdit } from './SuggestEdit'
import { LandmarkBanner } from './LandmarkBanner'
import { calculateEcoBenefits } from '../utils/ecoBenefits'
import { ECO_BENEFITS_ENABLED } from '../flags'

export const TreeDetails = ({
  selectedTree,
  speciesCounts,
  setSelectedSpecies,
  setSelectedNeighborhood,
  handleDrawerClose,
  setToastMessage,
  landmark,
  birthdayDate,
}: {
  selectedTree: TreeInfo
  speciesCounts: Record<string, number>
  setSelectedSpecies: (val: string) => void
  setSelectedNeighborhood: (val: string) => void
  handleDrawerClose: () => void
  setToastMessage: (message: string) => void
  landmark?: LandmarkInfo
  birthdayDate?: Date | null
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const headingColor = isDark ? '#c8e6c9' : '#1b5e20'
  const accentColor = theme.palette.primary.main
  const italicColor = isDark ? '#a5d6a7' : '#4caf50'
  const iconColor = '#81c784'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.95)'
  const cardBorder = isDark ? 'rgba(76,175,80,0.15)' : 'rgba(46, 125, 50, 0.1)'
  const cardBorderHover = isDark ? 'rgba(76,175,80,0.3)' : 'rgba(46, 125, 50, 0.2)'
  const chipBg = isDark ? 'rgba(76,175,80,0.2)' : 'rgba(46, 125, 50, 0.1)'
  const dividerColor = isDark ? 'rgba(76,175,80,0.2)' : 'rgba(46, 125, 50, 0.2)'
  const scrollTrack = isDark ? 'rgba(255,255,255,0.06)' : '#f1f1f1'
  const streetViewBg = isDark ? '#2a2a2a' : '#f5f5f5'

  const subtitleStyle = {
    color: accentColor,
    mb: 0.5,
    letterSpacing: '0.5px',
    fontWeight: 600
  }

  const ecoBenefits = ECO_BENEFITS_ENABLED ? calculateEcoBenefits(selectedTree.dbh) : null

  return (
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
          borderBottom: `1px solid ${dividerColor}`
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label={`Tree #${selectedTree.id}`}
              size="small"
              sx={{
                backgroundColor: chipBg,
                color: accentColor,
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
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            />
          </Box>

          <Typography variant="h5" sx={{
            fontWeight: 700,
            color: headingColor,
            mb: 0.5,
            fontSize: { xs: '1.5rem', sm: '2.0rem' },
            lineHeight: 1.2
          }}>
            {selectedTree.common_name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Typography variant="body1" sx={{
              color: italicColor,
              fontStyle: 'italic',
              fontSize: { xs: '0.9rem', sm: '1.1rem' }
            }}>
              {selectedTree.scientific_name}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{
            color: 'text.secondary',
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
                color: accentColor,
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
                  textDecorationColor: accentColor,
                  color: headingColor,
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
                  color: accentColor,
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
                    textDecorationColor: accentColor,
                    color: headingColor,
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
          sx={{ color: accentColor, '&:hover': { backgroundColor: isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46, 125, 50, 0.08)' }, position: 'absolute', top: 10, right: 10 }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'flex' } }}><ChevronRight /></Box>
          <Box component="span" sx={{ display: { xs: 'flex', sm: 'none' } }}><CloseIcon /></Box>
        </IconButton>
      </Box>

      {landmark && <LandmarkBanner landmark={landmark} />}

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
              {selectedTree.permitDate && (
                <Typography component="span" variant="caption" sx={{ ml: 1, fontWeight: 400, color: '#92400e' }}>
                  {new Date(selectedTree.permitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              )}
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
          '&::-webkit-scrollbar-track': { background: scrollTrack },
          '&::-webkit-scrollbar-thumb': { background: accentColor, borderRadius: '3px' }
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            '& > div': {
              backgroundColor: cardBg,
              backdropFilter: 'blur(8px)',
              p: 2.5,
              borderRadius: 3,
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${cardBorder}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.12)',
                borderColor: cardBorderHover,
              }
            }
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOn sx={{ color: iconColor, fontSize: 18 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Nearest Address
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.5
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor, flex: 1 }}>
                      {selectedTree.address}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedTree.address);
                        setToastMessage('Address copied to clipboard!');
                      }}
                      sx={{
                        color: accentColor,
                        p: 0.5,
                        '&:hover': { backgroundColor: isDark ? 'rgba(76,175,80,0.15)' : 'rgba(46,125,50,0.1)' },
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
                      color: accentColor,
                      fontSize: '0.75rem',
                      mt: 0.5,
                      p: 0,
                      minHeight: 'auto',
                      '&:hover': {
                        backgroundColor: isDark ? 'rgba(76,175,80,0.08)' : 'rgba(46, 125, 50, 0.04)',
                      }
                    }}
                  >
                    View on Google Maps
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Straighten sx={{ color: iconColor, fontSize: 18 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Trunk Size
                  </Typography>
                  {selectedTree.dbh ? (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor }}>
                      {`${selectedTree.dbh} inches`}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 400, color: 'text.disabled', fontStyle: 'italic' }}>
                      Not recorded
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarToday sx={{ color: iconColor, fontSize: 18 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Date Planted
                  </Typography>
                  {selectedTree.plantDate ? (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor }}>
                      {new Date(selectedTree.plantDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 400, color: 'text.disabled', fontStyle: 'italic' }}>
                      Unknown
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Birthday age comparison */}
              {birthdayDate && selectedTree.plantDate && (() => {
                const plantDate = new Date(selectedTree.plantDate)
                const diffMs = plantDate.getTime() - birthdayDate.getTime()
                const diffDays = Math.round(Math.abs(diffMs) / 86400000)
                const treePlantedAfter = diffMs > 0
                const years = Math.floor(diffDays / 365)
                const months = Math.floor((diffDays % 365) / 30)
                const days = diffDays % 365 % 30

                let sentence: string
                if (diffDays === 0) {
                  sentence = 'This tree was planted on the day you were born.'
                } else {
                  // Build a natural time phrase with the most significant unit bold
                  let timePhrase: string
                  if (years > 0) {
                    timePhrase = `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` and ${months} month${months !== 1 ? 's' : ''}` : ''}`
                  } else if (months > 0) {
                    timePhrase = `${months} month${months !== 1 ? 's' : ''}${days > 0 ? ` and ${days} day${days !== 1 ? 's' : ''}` : ''}`
                  } else {
                    timePhrase = `${diffDays} day${diffDays !== 1 ? 's' : ''}`
                  }

                  if (treePlantedAfter) {
                    sentence = `You were **${timePhrase} old** when this tree was planted.`
                  } else {
                    sentence = `This tree was **${timePhrase} old** when you were born.`
                  }
                }

                // Parse **bold** markers into JSX
                const parts = sentence.split(/\*\*(.*?)\*\*/)

                return (
                  <Box
                    sx={{
                      mt: 0.5,
                      py: 1,
                      px: 1.5,
                      borderRadius: 2,
                      backgroundColor: isDark ? 'rgba(76,175,80,0.08)' : 'rgba(46,125,50,0.04)',
                      border: `1px solid ${cardBorder}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: isDark ? '#c8e6c9' : '#33691e', lineHeight: 1.5 }}>
                      {parts.map((part, i) =>
                        i % 2 === 1
                          ? <Typography key={i} component="span" variant="body2" sx={{ fontWeight: 800, color: accentColor }}>{part}</Typography>
                          : <span key={i}>{part}</span>
                      )}
                    </Typography>
                  </Box>
                )
              })()}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOn sx={{ color: iconColor, fontSize: 18 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Site Type
                  </Typography>
                  {selectedTree.siteInfo ? (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor }}>
                      {selectedTree.siteInfo}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 400, color: 'text.disabled', fontStyle: 'italic' }}>
                      Standard
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Policy sx={{ color: iconColor, fontSize: 18 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Maintained by
                  </Typography>
                  {selectedTree.caretaker ? (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor }}>
                      {selectedTree.caretaker}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 400, color: 'text.disabled', fontStyle: 'italic' }}>
                      Unknown
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
          {ecoBenefits && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Park sx={{ color: italicColor, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={subtitleStyle}>
                  Annual Ecological Benefits
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  {
                    icon: <WaterDrop sx={{ color: '#64b5f6', fontSize: 17 }} />,
                    label: 'Stormwater intercepted',
                    amount: `${Math.round(ecoBenefits.stormwaterGal).toLocaleString()} gal`,
                    value: ecoBenefits.stormwaterValue,
                  },
                  {
                    icon: <ElectricBolt sx={{ color: '#ffb74d', fontSize: 17 }} />,
                    label: 'Energy conserved',
                    amount: `${Math.round(ecoBenefits.energyKwh).toLocaleString()} kWh`,
                    value: ecoBenefits.energyValue,
                  },
                  {
                    icon: <Air sx={{ color: '#80cbc4', fontSize: 17 }} />,
                    label: 'Air pollutants removed',
                    amount: `${ecoBenefits.airLbs < 1 ? ecoBenefits.airLbs.toFixed(2) : Math.round(ecoBenefits.airLbs).toLocaleString()} lbs`,
                    value: ecoBenefits.airValue,
                  },
                ].map(({ icon, label, amount, value }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ mt: 0.25 }}>{icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {label}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: 0.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: headingColor }}>
                          {amount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: accentColor, fontWeight: 600 }}>
                          ${value < 1 ? value.toFixed(2) : Math.round(value).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}

                <Box sx={{
                  mt: 0.5,
                  pt: 1.5,
                  borderTop: `1px solid ${cardBorder}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: headingColor }}>
                    Total annual value
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: accentColor, fontSize: '1.05rem' }}>
                    ${Math.round(ecoBenefits.totalValue).toLocaleString()}
                  </Typography>
                </Box>

                <Tooltip title="Estimates based on U.S. Forest Service i-Tree methodology, calibrated for San Francisco's climate and utility rates." arrow placement="top">
                  <Typography variant="caption" sx={{
                    color: 'text.disabled',
                    fontSize: '0.7rem',
                    lineHeight: 1.4,
                    cursor: 'help',
                    borderBottom: '1px dashed',
                    borderColor: 'text.disabled',
                    alignSelf: 'flex-start',
                  }}>
                    Estimates based on U.S. Forest Service methodology
                  </Typography>
                </Tooltip>
              </Box>
            </Box>
          )}

          <SuggestEdit tree={selectedTree} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <MapOutlined sx={{ color: italicColor, fontSize: 20 }} />
              <Typography variant="subtitle2" sx={subtitleStyle}>
                Street View
              </Typography>
            </Box>
            <Box sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              height: 300,
              backgroundColor: streetViewBg,
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
                src={`https://www.google.com/maps/embed/v1/streetview?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&location=${selectedTree.latitude},${selectedTree.longitude}&heading=0&pitch=10&fov=90`}
              ></iframe>
            </Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                color: 'text.secondary',
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
}

export default TreeDetails
