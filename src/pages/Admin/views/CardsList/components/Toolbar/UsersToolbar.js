import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {},
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  }
}));

const UsersToolbar = props => {
  const { 
    className,
    setIsEdit,
    isEdit,
    setCardToEdit,
    resetCard,
  } = props;

  console.log(resetCard)

  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.row}>
        {isEdit && 
          <Button onClick={() => setIsEdit(false)} variant="contained" color="primary">
            Go back
          </Button>
        }
        <span className={classes.spacer} />
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            resetCard();
            setIsEdit(true);
            setCardToEdit({});
          }}
        >
          Add New Card
        </Button>
      </div>
    </div>
  );
};

UsersToolbar.propTypes = {
  className: PropTypes.string
};

export default UsersToolbar;
