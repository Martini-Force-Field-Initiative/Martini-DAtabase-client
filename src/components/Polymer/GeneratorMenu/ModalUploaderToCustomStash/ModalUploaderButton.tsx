import { debugLog } from '../../../../logger';
import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from "@mui/material/Button";


import UploadToast from "./ModalUploaderToaster";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });
  
  export default function FileUploadButon(props:{ accept:string, label:string, disabled?:boolean,onUpload:(f:FileList)=>Promise<void>}) {
    return (
      <Button
        disabled={props.disabled}
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        { props.label}
        <VisuallyHiddenInput
          type="file"
          accept={ props.accept}
          onChange={(event) => { 
            debugLog(event.target.files);
            props.onUpload(event.target.files as FileList)
          }}
          multiple
        />
      </Button>
    );
  }