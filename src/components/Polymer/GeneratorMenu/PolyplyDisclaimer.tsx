import * as React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import AlertTitle from '@mui/material/AlertTitle';
import { Typography } from '@mui/material';
import { Marger } from '../../../helpers';
export default function PolyplyDisclaimer() {
  const [open, setOpen] = React.useState(true);

  return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={open}>
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          <AlertTitle>Welcome to the MAD:Polymer Editor, powered by the polyply software</AlertTitle>
          Here you will be able to:
          <ul>
            <li>Create/edit new polymers.</li>
            <li>Create /edit polymers from the polyply library</li>
            <li>Attach polymers to a previously martinized molecule (like a protein)</li>
          </ul>
          <div>
            <Typography variant='body2'>
              The flexibility of the &nbsp;
              <span style={{ fontWeight: 'bold' }}>MAD:Polymer Editor</span>            
              &nbsp;
              can lead to the creation of models with molecular links which are not yet 
              covered by the Polyply library. In such events, the editor will assist you 
              in the creation of the ad hoc link.
            </Typography>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Typography variant="body2">
              You may also start by providing:
              </Typography>
              <ul>
                <li><Typography variant="body2">A previously saved polymer in .json format</Typography></li>
                <li><Typography variant="body2">A protein sequence in.fasta format</Typography></li>
                <li><Typography variant="body2">The topology of a new molecule in .itp</Typography></li>
              </ul>
           
          </div>
        </Alert>
      </Collapse>
    </Box>
  );

}