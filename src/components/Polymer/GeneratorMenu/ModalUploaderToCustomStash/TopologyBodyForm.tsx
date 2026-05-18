import React, { useState } from "react";
import { Stack, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import {readManyItpFromSring, itpParser} from './UploadParsers';
import ItpFile from "itp_mad_parser";
import FileUploadButon from './ModalUploaderButton';
import BodyProps from './BodyProps';
/*import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';*/


import { DataGrid, GridColDef } from '@mui/x-data-grid';

function MoleculeGrid(props:{ onSelectionChange:(names:string[])=>void,
                              moleculeList: [string, number][]}) {
    const columns: GridColDef[] = [
    { field: 'moleculeName', headerName: 'Molecule name', width: 230 },
    { field: 'beadCount',
        headerName: 'Bead count ',
        width: 150,
        editable: true,
    }
    ];   
  const fields      = props.moleculeList.map(([n,c], i)=>( {id:`mol_${i}`, moleculeName:n, beadCount:c}))
  const name_id_map:{[id:string]:string} = {};
  props.moleculeList.forEach(([n,c], i)=>{ name_id_map[`mol_${i}`] = n });


  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={fields}
        columns={columns}
        pageSize={5}
        checkboxSelection        
        onSelectionModelChange={(ids) => 
          props.onSelectionChange(ids.map( (id) => name_id_map[id]))
        }
      />
    </div>
  );
}

export default function TopologyBodyForm(props:BodyProps){

    const [selectableMolecule, setSelectableMolecule] = useState<[string, number][]>([]);
    const [topologyContent, setTopologyContent]   = useState<ItpFile[]>([]);
    //const [moleculeToSubmit, setMoleculeToSubmit] = useState<string[]>([]);
    const [topologyErrorMessage, setTopologyErrorMessage] = useState("");

    const handleTopologyChange = (e:any) => {
      try {  
        const [moleculeList, _] = readManyItpFromSring(e.target.value);
        setTopologyContent(e.target.value);
        setTopologyErrorMessage("");
        //props.onContentChange(e.target.value);
        setSelectableMolecule(moleculeList);
      } catch (e) {
        setTopologyContent([]);
        setSelectableMolecule([]);
        setTopologyErrorMessage("Malformed Topology File");
      }
    };

    const handleTopologyFileUpload = async (e:any) => {
      try {
        const [ moleculeList, content ] = await itpParser(e);
        setTopologyContent(content);
        setSelectableMolecule(moleculeList);
        //bodyUpload(jsonTitle, content);
      } catch(e) {
        console.error("ITP upload error");
        props.onUploadError(e as string);
      }
      console.log("itp file uploaded and parsed");
    }
    
    const handleSelectMoleculeChange = (moleculeNames:string[]) => {
      console.log('loading molecule', moleculeNames);
      const itpSubsetString = topologyContent.filter( (itp)=> moleculeNames.includes(itp?.name)).map(itp=>itp.toString()).join('\n')
      props.onContentChange( itpSubsetString);
      props.onTitleChange("itp_library");
    };

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8; // This height computation needs tweaking
    const ITEMS_NB = selectableMolecule.length < 5 ? selectableMolecule.length - 0.5: 4.5;
    const MenuProps = {
        PaperProps: {
            style: {
            maxHeight: ITEM_HEIGHT * ITEMS_NB + ITEM_PADDING_TOP,
            width: 250,
            },
        }
    };

    return (
        <Stack direction={'column'} spacing={4}  style={{minWidth:"25rem", minHeight:"12rem"}}>
          {/*
            <TextField                
                id="json-string"
                label="Polymer as Gromacs Included Topology"
                multiline
                minRows={4}
                style={{overflowY:"auto", 'minWidth' : "25rem"}}            
                variant="outlined"
                onChange={handleTopologyChange}
                error={topologyErrorMessage !== ""}
                helperText={topologyErrorMessage !== "" ? topologyErrorMessage : ""}                
            />
            <Divider style={{paddingLeft:"33%", maxWidth:'66%'}}>OR</Divider>
           */}
          
            <FileUploadButon 
                accept=".itp"
                label="Upload Gromacs Included Topology file" 
                onUpload={ handleTopologyFileUpload }               
            /> 
            {(selectableMolecule.length > 0) &&
            <>
              <Divider>Then select molecule to add to library</Divider> 
              <MoleculeGrid
                moleculeList={selectableMolecule}
                onSelectionChange={handleSelectMoleculeChange}
              />
              </>
            } 
            { /*(selectedMolecule.length === 1) &&
                <TextField
                    disabled
                    id="single-molecule"
                    label="New Polymer Name"
                    defaultValue={selectedMolecule[0][0]}
                    variant="filled"
               />*/
            }
        </Stack>
    )
}