import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import BugReportIcon from '@mui/icons-material/BugReport';

interface propsalert {
    type:'warning'|'fatal',
    report: boolean,
    message: string,
    reponse: boolean|undefined,
    close: () => void;
}

export default class WarningDialog extends React.Component<propsalert> {
    show = () => {
        let show: boolean
        this.props.message ? show = true : show = false;
        if (this.props.message) {
            return <Dialog
                open={show}
                keepMounted
                onClose={() => { this.props.close() }}
                aria-describedby="alert-dialog-slide-description" >
                <DialogTitle
                style = {{ color : this.props.type === 'warning' ? 'orange' : 'red'}}
                >{this.props.type === 'warning' ? "Warning" : "Error"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {this.props.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    { this.props.report &&
                        <Button variant="outlined" 
                            color="secondary"
                            target="_top"
                            rel="noopener noreferrer"
                            href={`mailto:mad-contact@ens-lyon.fr?subject=MAD:PolymerEditor -- Bug Report&body=Thank you for using MAD and taking the time to report a bug.%0D%0AYou may describe sequence of actions that led to the following error:%0D%0A${this.props.message}%0D%0AOr any other information that could be useful to us.`}                       
                            onClick={() => { this.props.close() }}
                            startIcon={<BugReportIcon />}>
                            Send us a bug report
                        </Button>
                    }
                    <Button onClick={() => { this.props.close() }}>
                    {this.props.type === 'warning' ? "Dismiss" : "Reset Editor"}
                    </Button>
                </DialogActions>
            </Dialog>
        }
        else return;
    }


    render() {
        return (
            <div>
                {this.show()}
            </div >
        );
    }
}