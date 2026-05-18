import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

//const options = ['Upload your own molecule', 'Load from MAD:Database', 'Load from your MAD:History'];
interface PSBProps {
    options:[title:string, action:()=>void][],
    onClick?:(index:number)=>void    
    //onClick:(index:number)=>void;
}

export default function PolymerSourceButtons({options}:PSBProps) {
  const [state, setState] = React.useState({ open:false, selectedIndex: 0/*, used:false*/ });
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const handleClick = () => {
    console.info(`[PolymerSource Button]You clicked ${options[state.selectedIndex]} passing it above`);
    options[state.selectedIndex][1]();
    setState({...state, selectedIndex:0 });

  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    console.log("You clicked on menu item")
    setState({...state, open:false, selectedIndex:index});
  };

  const handleToggle = () => {
    setState( {...state, open : ! state.open})
    //setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setState({...state, open:false});
  };

  return (
    <React.Fragment>
      <ButtonGroup
        variant="contained"
        color="warning"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <Button onClick={ handleClick }>
          {options[state.selectedIndex][0]}
        </Button>
        <Button
          size="small"
          aria-controls={state.open ? 'split-button-menu' : undefined}
          aria-expanded={state.open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={state.open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map(([title, action], index) => (
                    <MenuItem
                      key={title}
                      //disabled={index === 2}
                      selected={index === state.selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index) }
                    >
                      {title}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}
