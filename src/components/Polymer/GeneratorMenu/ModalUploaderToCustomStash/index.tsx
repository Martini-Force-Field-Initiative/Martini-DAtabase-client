import React, { useState } from "react";
import Button from "@mui/material/Button";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import FastaBodyForm from './FastaBodyForm';
import JsonBodyForm from "./JsonBodyForm";
import TopologyBodyForm from "./TopologyBodyForm";
import UploadDialogToast from "./ModalUploaderToaster";

export interface MUCSProps  {   
    onCancel:()=>void;
    format:string;
    ff:string;
    onValidate:(title:string, content:string)=>void;
}
export default function ModalUploadToCustomStash(props:MUCSProps) {
    
    const [open, setOpen] = React.useState(true);
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [uploadError, setUploadError] = React.useState("");

    const handleClose = () => {
        props.onCancel();
        setOpen(false);
    }

    const handleSubmit = (_title?:string, _content?:string) => {
      if (_title && _content)
        props.onValidate(_title, _content);
      else if (title !== "" && content !== "") {
        props.onValidate(title, content);
      } else { 
        setUploadError("Missing polymer title or content");
        return;
      }
      setOpen(false);

    }

    return (
      <Dialog 
        open={open} 
        onClose={handleClose}
        closeAfterTransition={false}
        > 
        <DialogTitle>
            { props.format === "fasta" && <span>Add a peptide to polymer library</span>}
            { props.format === "itp"   && <span>Gromacs included Topology</span> }
            { props.format === "json"  && <span>Polyply JSON topology</span>}
        </DialogTitle>

        <DialogContent>
            { props.format === "fasta" && 
              <FastaBodyForm 
                onContentChange={ (content:string)=>setContent(content) }
                onTitleChange={ (title:string)=>setTitle(title) }
                onBodyUpload={ handleSubmit }
                onUploadError={ setUploadError }
          
            />} 
            { props.format === "itp"   && <TopologyBodyForm
                onContentChange={ (content:string)=>setContent(content) }
                onTitleChange={ (title:string)=>setTitle(title) }
                onBodyUpload={ handleSubmit }
                onUploadError={ setUploadError }
            />
            }
            { props.format === "json"   && <JsonBodyForm
              onContentChange={ (content:string)=>setContent(content) }
              onTitleChange={ (title:string)=>setTitle(title) }
              onBodyUpload={ handleSubmit }
              onUploadError={ setUploadError }
            />  }
        </DialogContent>

        <DialogActions
        style={ {justifyContent: uploadError === "" ? 'right' : 'center' } }>
          { uploadError !== "" &&
            <UploadDialogToast
              message={uploadError}
              onClose={()=>{ setUploadError(""); }}
            />
          }
          { uploadError === "" &&
          <>
          <Button color="primary" onClick={ handleClose }>
              Cancel
          </Button> 
          <Button color="primary" onClick={ ()=>{handleSubmit();} }>
              Submit
          </Button>   
          </>
          }               
        </DialogActions>
      </Dialog>
    )
  }