import React from 'react';
import { 
  LinearProgress 
} from '@mui/material';
 
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';

export default function  PreviewCard ({ message, thumbnail, progress, testName }) {
  const theme = useTheme();
    const variant = !!progress ? 'determinate' : 'indeterminate'
  return (
    <Card sx={{ display: 'flex' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography className="no-wrap" style={{width: 320}} component="div" variant="body1">
            {message}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
           {testName}
          </Typography>
            <Box>
            <LinearProgress variant={variant} value={progress} />
            </Box>
        </CardContent>
      </Box>
     {!!thumbnail && <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={'data:image/png;base64,' + thumbnail}
        alt={message}
      />}
    </Card>
  );
}



 