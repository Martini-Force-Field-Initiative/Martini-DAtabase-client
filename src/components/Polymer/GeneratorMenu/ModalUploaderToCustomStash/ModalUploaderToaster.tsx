import React, { useState } from "react";
import { Alert } from "@mui/material";


export default function UploadDialogToast(props:{message:string, onClose: () => void}) {
    return (    
        <Alert 
            severity="error"
            style={{minWidth:'25rem'}}
            onClose={props.onClose}            
        >
            { props.message }
            
        </Alert>
    );
  }