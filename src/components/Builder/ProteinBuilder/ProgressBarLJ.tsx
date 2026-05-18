import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core';
import { Typography } from '@mui/material';


const useStyles = makeStyles(() => ({
  root: {
      "& div" : {
          backgroundColor: "clay",
      },
      "& div div": {
          backgroundColor: "darkcyan",
      },
  },
  label : {}
}));

interface ProgressBarLJProps {
    classes:any
    msg:string
}
export default function ProgressBarLJ(props:any) {
    const classes = useStyles(props);
    return (
    <div className={ classes.root } style={{width:'100%'}}>
    <LinearProgress style={{width:'100%', marginLeft:'.6rem', marginTop:'.6rem'}}/>
    { props.msg && <Typography marginTop={'0.5rem'} align="right" variant="subtitle2" style={{color:'darkcyan'}}> {props.msg} </Typography> }
    </div>
    );
}
