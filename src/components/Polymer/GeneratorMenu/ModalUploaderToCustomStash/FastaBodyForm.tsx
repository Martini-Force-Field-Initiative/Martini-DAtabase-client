import React, { useState } from "react";
import { Stack, Typography } from '@mui/material';
import TextField from '@material-ui/core/TextField';
import Divider from '@mui/material/Divider';
import { fastaParser, fastaRegEx } from './UploadParsers';
import FileUploadButon from './ModalUploaderButton';
import BodyProps from "./BodyProps";

export default function FastaBodyForm(props:BodyProps){

    const [fastaSequence, setFastaSequence] = useState("");
    const [fastaTitle, setFastaTitle] = useState("");
    const [fastaErrorMessage, setfastaErrorMessage] = useState("");

    /*const bodyUpload = (title?:string, content?:string) => {
      if (title && content)
        props.onBodyUpload(title, content);
      else
        props.onBodyUpload(fastaTitle, fastaSequence);

    }*/
    const handleFastaFileUpload = async (e:any) => {
      try {
        const [title, content] = await fastaParser(e);
        setFastaSequence(content);
        setFastaTitle(title);
        console.log(`setting title ${title} and content ${content}`);
        props.onTitleChange(title);
        props.onContentChange(content);
        //bodyUpload(title, content);
      } catch(e) {
        console.error("fasta upload error");
        props.onUploadError(e as string);
      }
      console.log("fasta format finished");
      
    }
    
    const handleNameChange = (e:any) => {
      setFastaTitle(e.target.value);
      props.onTitleChange(e.target.value);
    };
    const handleFastaChange = (e:any) => {
        
      const curr_seq = e.target.value.replace(/[\s\n]/g, "");
              
      if ( curr_seq.match(fastaRegEx) ) {
          setFastaSequence(curr_seq);
          setfastaErrorMessage("");
          props.onContentChange(curr_seq);

      } else {
          //setFastaSequence("")
          setFastaSequence(curr_seq);
          setfastaErrorMessage("Unknwon letter");
          
      }        
    };

    return (
        <Stack direction={'column'} spacing={4}>
           <FileUploadButon
            accept="fasta,fa,fna,txt"
            label="Upload FASTA file" 
            onUpload={ handleFastaFileUpload }
            />
            <Divider>OR</Divider>
            <TextField
                id="fasta-title"
                label="Peptide name"                
                value={fastaTitle}
                variant="outlined"
                style={{"maxWidth":'18rem'}}
                onChange={ (e)=> {
                    //props.onTitleChange(e.target.value);
                    handleNameChange(e);
                }}
            />       
            <TextField
                id="fasta-seq"
                label="Fasta sequence"
                multiline
                minRows={4}            
                variant="outlined"
                value={fastaSequence}
                onChange={handleFastaChange}
                error={fastaErrorMessage !== ""}
                helperText={fastaErrorMessage !== "" ? fastaErrorMessage : ""}
                style={ {'minWidth' : "25rem"}}
            />
        </Stack>
    )
}