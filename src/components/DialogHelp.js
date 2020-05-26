import React, { useContext } from 'react';
import { StateContext } from '../Context/GlobalContext';

/* MATERIAL UI */

// Styles
import { makeStyles } from '@material-ui/core/styles';

// Surfaces
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

// Feedback
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

// Data Display
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

// Utils
import Slide from '@material-ui/core/Slide';

const useStylesDialog = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    content: {
        marginTop: '20px'
    }
}));


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function DialogHelp({children, Icon}) {
    const classes = useStylesDialog();
    const {normalizedDataIsReady: dataIsReady} = useContext(StateContext);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <IconButton disabled={!dataIsReady} style={(dataIsReady) ? { color: '#F44336' } : {}}  aria-label="help" onClick={handleClickOpen}>
                <Icon/>
            </IconButton>
            <Dialog fullScreen open={open} onClose={handleClose} aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description" TransitionComponent={Transition}>
                <AppBar className={classes.appBar} >
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            Help
                        </Typography>
                    </Toolbar>
                </AppBar>
                <DialogContent className={classes.content}>
                        {children}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default DialogHelp;