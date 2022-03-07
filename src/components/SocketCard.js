import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function SocketCard({
  s3Location,
  stepLabel,
  elapsed,
  thumbnail,
  actionText,
  showCode
}) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        height="180"
        image={'data:image/png;base64,' + thumbnail}
        alt={stepLabel}
      />
      <CardContent>
        <Typography gutterBottom variant="body1" component="div">
          {stepLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Execute time: {elapsed}ms
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" href={s3Location} target="_blank">
          View screenshot 
        </Button>
        <Button size="small" onClick={() => showCode(actionText)}>
          code
        </Button>
      </CardActions>
    </Card>
  );
}
