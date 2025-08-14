import { Box, Typography, Button, IconButton } from '@mui/material'
import { LocationOn, Close as CloseIcon } from '@mui/icons-material'
import { TreeInfo } from '../types/tree'

export const TreeSummaryBar = ({
  tree,
  onMoreDetails,
  onClose,
}: {
  tree: TreeInfo;
  onMoreDetails: () => void;
  onClose: () => void;
}) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: 0,
      width: '100%',
      zIndex: 1100,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderTop: '2px solid rgba(46, 125, 50, 0.2)',
      px: 2,
      py: 1.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      minHeight: 85,
      overflow: 'hidden',
      boxSizing: 'border-box',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
    }}
  >
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: tree.color,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        />
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#1b5e20',
            fontSize: '1rem',
          }}
        >
          {tree.common_name}
        </Typography>
      </Box>
      
      <Typography
        variant="body2"
        sx={{
          fontStyle: 'italic',
          color: '#4caf50',
          lineHeight: 1.2,
          fontSize: '0.8rem',
          mb: 0.5,
        }}
      >
        {tree.scientific_name}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <LocationOn sx={{ fontSize: 16, color: '#81c784' }} />
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.75rem', 
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {tree.address}
        </Typography>
      </Box>
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Button
        variant="text"
        onClick={onMoreDetails}
        size="small"
        sx={{ 
          color: '#2e7d32',
          fontWeight: 500,
          fontSize: '0.875rem',
          px: 1.5,
          py: 0.5,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.04)',
          }
        }}
      >
        Details
      </Button>

      <IconButton 
        onClick={onClose} 
        size="small"
        sx={{ 
          color: '#666',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          }
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  </Box>
);

export default TreeSummaryBar


