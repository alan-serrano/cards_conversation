import React from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function Alert(props) {
    const {
        onConfirm = ()=>{},
        title,
        children,
        open,
        setOpen,
    } = props;
  
    const handleClose = () => {
      setOpen(false);
    };

    function handleConfirm() {
        onConfirm();
        handleClose();
    }

  
    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="dialog-title"
          maxWidth='sm'
        >
          {title && 
            <DialogTitle id="dialog-title">
                {title}
            </DialogTitle>
          }
          <DialogContent>
            <DialogContentText>
              {children}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirm} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
}

Alert.propTypes = {
    onConfirm: PropTypes.func,
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
};

export default Alert
