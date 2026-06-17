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
  onError:boolean,
  // Width (px) of the resizable left menu. Used to keep the controls
  // horizontally centered on the SVG viewer, not on the menu panel.
  menuWidth?: number,
}
export default function BottomControls(props:BCProps) {
  // The SVG viewer fills the viewport to the right of the menu, so its
  // horizontal center sits at `menuWidth + (100vw - menuWidth) / 2`, i.e.
  // `50vw + menuWidth / 2`. Use `position: fixed` so the bar is anchored to
  // the viewport rather than the resizable menu's containing block.
  const menuWidth = props.menuWidth ?? 0;
  return (
      <AppBar position="fixed" color="transparent"
        sx={{ top: 'auto', bottom: 0, width: 'auto', maxWidth: '25em', minWidth: '25em',
            left: `calc(50vw + ${menuWidth / 2}px)`, right: 'auto',
            transform: 'translateX(-50%)', backgroundColor: "white",
            borderRadius: '0.5em 0.5em 0em 0em'

         }}>
        <Toolbar
        disableGutters
        sx={{ p: 0, minHeight: 0 }}>

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