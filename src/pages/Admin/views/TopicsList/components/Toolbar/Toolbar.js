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

const Toolbar = props => {
  const { 
    className,
    setIsEdit,
    isEdit,
    setTopicToEdit,
    resetTopic,
  } = props;

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
            resetTopic();
            setIsEdit(true);
            setTopicToEdit({});
          }}
        >
          Add New Topic
        </Button>
      </div>
    </div>
  );
};

Toolbar.propTypes = {
  className: PropTypes.string
};

export default Toolbar;
