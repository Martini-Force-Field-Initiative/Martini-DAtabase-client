import * as React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Fab from '@mui/material/Fab';
import PolyplyControls from './PolyplyControls'

interface BCProps {
  onUndo: ()=>void,
  onSubmit: ()=>void,
  onRepairClick: ()=>void,
  onError:boolean 
}
export default function BottomControls(props:BCProps) {
  return (
      <AppBar position="absolute" color="transparent" 
        sx={{ top: 'auto', bottom: 0, maxWidth: '25em', marginRight: '25%', backgroundColor:"white",
            minWidth:"25em", borderRadius:'0.5em 0.5em 0em 0em'

         }}>
        <Toolbar
        sx={{paddingTop:'0.5em', paddingBottom:"0.5em"}}>     

        <PolyplyControls
          onUndo         = { props.onUndo }
          onSubmit       = { props.onSubmit }
          onRepairClick  = { props.onRepairClick }
          onError        = { props.onError }
        />            
        </Toolbar>
      </AppBar>
  );
}

/* Default working
const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 0,
  top: -30,
  left: '96%',
  right: 0,
  margin: '0 auto',
});

export default function BottomControls() {
  return (
    <React.Fragment>  
      <AppBar position="absolute" color="primary" sx={{ top: 'auto', bottom: 0, maxWidth:'33%', marginRight:'15%' }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer">
            <MenuIcon />
          </IconButton>
          <StyledFab color="secondary" aria-label="add">
            <AddIcon />
          </StyledFab>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>
          <IconButton color="inherit">
            <MoreIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}
  */