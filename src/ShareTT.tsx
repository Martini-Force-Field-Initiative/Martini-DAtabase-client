import { debugLog } from './logger';
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
//import { Alert } from '@material-ui/lab';
import { Tooltip } from '@material-ui/core';
import ListSubheader from '@mui/material/ListSubheader';
/*
type State = {
    open: boolean,
  };
  
  type Props = {
    id: string,
    msg: string,
    children: any//PropTypes.node,
  };
  class ControlledTooltip extends React.PureComponent<Props, State> /*
  <Props & WithStyles<keyof typeof styles>, State>*/
  /*
   {
  
    constructor(props:any) {
        super(props);
        console.warn("####");
        this.state = {
            open: false,
        };
    }
  
    private handleTooltipClose(): void {
        debugLog("httC..");
        this.setState({ open: false });
        debugLog("httC done");
    }
  
    private handleTooltipOpen(): void {
        debugLog("httO.."); 
        this.setState({ open: true });
        debugLog("httO done");             
    }
  
    render() {
        const { id, msg, children } = this.props;
        const { open } = this.state;
        return(
            <div>
                <Tooltip id={id}
                key={id}
                    title={msg}
                    open={open}
                    onClose={this.handleTooltipClose}
                    onOpen={this.handleTooltipOpen}
                >
                    {children ? children : null}
                </Tooltip>
            </div>
        );
    }
  }
*/

  

  // Renders a molecule menu-item label, wrapping it in a thumbnail Tooltip only
  // when the thumbnail image actually loads. The image is probed eagerly (rather
  // than relying on the Tooltip's lazily-mounted title) so a missing thumbnail
  // never flashes a broken tooltip on first hover.
  function MoleculeLabel(props: { mol: [string, string, string] }) {
    const { mol } = props;
    const [thumbOk, setThumbOk] = React.useState(false);

    React.useEffect(() => {
      const url = mol[1];
      if (!url) {
        setThumbOk(false);
        return;
      }
      let cancelled = false;
      const img = new Image();
      img.onload = () => { if (!cancelled) setThumbOk(true); };
      img.onerror = () => { if (!cancelled) setThumbOk(false); };
      img.src = url;
      return () => { cancelled = true; };
    }, [mol]);

    const label = <span style={{ width: '100%' }}>{mol[0]}</span>;

    if (!thumbOk)
      return label;

    return (
      <Tooltip title={<img src={mol[1]} width="200px" alt="molecule"/>} placement="right-end" arrow>
        {label}
      </Tooltip>
    );
  }

  // WIP of Select managing tooltips ...
  //https://github.com/mui/material-ui/issues/9737
  export function TooltipedSelect(props: {
    label: string,
    value: string, 
    onChange: (v: string) => void, 
    id: string,
    values: Record<string, [string, string, string][]>//{ id: string, name: string, url?:string, }[],
    disabled?: boolean,
    formControlClass?: string,
    variant?: "outlined" | "standard" | "filled",
    noMinWidth?: boolean,
    required?: boolean,
    //children?: ReactElement<any, any>|ReactElement<any, any>[]
    // <Icon className="fas fa-question-circle fa-xs" />
    }) {
    const inputLabel = React.useRef<HTMLLabelElement>(null);
    const [labelWidth, setLabelWidth] = React.useState(0);
    React.useEffect(() => {
      if (inputLabel.current)
        setLabelWidth(inputLabel.current!.offsetWidth);
    }, [props]);
   
    return (
      <FormControl required={props.required} className={props.formControlClass} variant={props.variant ?? "outlined"} style={{ minWidth: props.noMinWidth ? 0 : 180 }}>
        <InputLabel ref={inputLabel} id={props.id}>
          {props.label}
        </InputLabel>
        <Select
          labelId={props.id}
          value={props.value}
          onChange={v => props.onChange(v.target.value as string)}
          labelWidth={labelWidth}
          required          
          disabled={props.disabled}
        >
          { Object.keys(props.values).map( molCat => {
              return (
                [
                <ListSubheader color='primary'>{ molCat }</ListSubheader>,
                
                  props.values[molCat].map( mol =>
                    <MenuItem key={mol[2]} value={mol[2]}>
                      <MoleculeLabel mol={mol} />
                  </MenuItem>
                  )
                  
                ]
                )  
        })}
        </Select>
      </FormControl>
    )
  }
  