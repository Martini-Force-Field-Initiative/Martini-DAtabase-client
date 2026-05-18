import React from 'react';
//import ItpFile, { TopFile } from 'itp-parser-forked';
import ItpFile, { TopFile } from 'itp_mad_parser';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, DialogContentText, TextField } from '@material-ui/core';
import { Marger } from '../../helpers';
import { Alert, Typography } from '@mui/material';

interface TCProps {
  open?: boolean;
  onValidate(file: File): void;
  onCancel(): void;
  itpFiles: File[];
}

interface TCState {
  loading: boolean;
  generated: string;
}

/**
 * Create a generated TOP file for the given ITPs.
 */
export default class TopCreator extends React.Component<TCProps, TCState> {
  state: TCState = {
    loading: false,
    generated: '',
  };

  componentDidMount() {
    if (this.props.itpFiles.length && this.props.open) {
      this.createTopFile();
    }
  }

  componentDidUpdate(old_props: TCProps) {
    if (old_props !== this.props && this.props.itpFiles.length && this.props.open) {
      this.createTopFile();
    }
  }

  async createTopFile() { /* All VirtGosite logics are deprecated */
    this.setState({
      loading: true
    });

    const f = TopFile.readFromString('');
    const itps = this.props.itpFiles;

    const has_go = itps.some(e => e.name.startsWith('BB-part-def_VirtGoSites'));
    if (has_go) {
      f.headlines.push('#define GO_VIRT');
    }

    f.headlines.push('#include "martini.itp"; will be replaced');

    // Include every itp except the one with VirtGoSites
    const real_itps = itps.filter(itp => !itp.name.includes('VirtGoSites') && !itp.name.includes('go4view_harm'));

    for (const itp of real_itps) {
      f.headlines.push(`#include "${itp.name}"`);
    }

    f.setField('system', ['This is an auto generated system']);

    // Read every ITP and extract molecule type
    f.appendFieldLine('molecules', ';moleculetype\tcount');
    for (const itp of real_itps) {
      const locals = await ItpFile.readMany(itp);

      for (const local of locals) {
        if (!local.name) {
          continue;
        }

        f.appendFieldLine('molecules', `${local.name}\t1`);
      }
    }

    // Render TopFile
    const content = f.toString();

    this.setState({
      loading: false,
      generated: content,
    });
  }

  onValidate = () => {
    const content = this.state.generated;
    this.props.onValidate(new File([content], 'system.top', { type: 'x/chemical-topology' }));
  };
  
  renderLoading() {
    return (
      <div style={{ textAlign: 'center' }}>
        <Marger size="1rem" />
        <CircularProgress size={56} />
        <Marger size="1rem" />
      </div>
    );
  }

  renderEditor() {
    return (
      <React.Fragment>
        <DialogContentText>
          Inspect the generated TOP file to check if it is OK with the submitted molecule.
          <Alert icon={false} severity="info">         
          The "<b>#include martini.itp</b>" statement will be replaced by the appropriate include statement(s) for the forcefield you selected.
          This process is automatic and will occur once you <b>save</b> your molecule. 
          The parameter files of the various martini versions we manage can be consulted on the <a href="force_fields" target="_blank" rel="noopener noreferrer">corresponding MAD page</a>.
          </Alert>
        <Marger size="1rem"/>
        You may still edit the file.        
        </DialogContentText>       

        <TextField 
          multiline
          fullWidth
          value={this.state.generated}
          onChange={e => this.setState({ generated: e.target.value })}
          variant="outlined"
          color="primary"
          inputProps={{ 'data-monospace': 'true' }}
        />
      </React.Fragment>
    );
  }

  render() {
    return (
      <Dialog open={!!this.props.open}>
        <DialogTitle>
          Create a TOP file
        </DialogTitle>

        <DialogContent>
          {this.state.loading && this.renderLoading()}
          {!this.state.loading && this.renderEditor()}
        </DialogContent>

        {!this.state.loading && <DialogActions>
          <Button color="secondary" onClick={this.props.onCancel}>
            Cancel
          </Button>
          <Button color="primary" onClick={this.onValidate}>
            Validate
          </Button>
        </DialogActions>}
      </Dialog>
    );
  }
}
