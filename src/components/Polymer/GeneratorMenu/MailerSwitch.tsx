import * as React from 'react';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import MailOutline from '@mui/icons-material/MailOutline';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

export interface MSProps {
    onChange:(status:boolean)=>void
}
export default function MailerSwitch(props:MSProps) {
    return ( 
        <Alert
        iconMapping={{
            success: <MailOutline fontSize="inherit" />,
          }}
        severity="success"
        action={
        <Switch onChange={ (_,checked)=>{ props.onChange(checked);} } color="success"/>
         }
        >
            Send email upon completion.
        </Alert>
    )
}

/*
        <Alert variant="outlined" severity="info"
        iconMapping={{
            success: <MailOutline fontSize="inherit" />,
        }}
        >
        <FormControlLabel control={<Switch defaultChecked />} label="Send email upon completion" />
        </Alert>
        */