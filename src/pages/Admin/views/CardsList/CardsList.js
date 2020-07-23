import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';

import { Toolbar, Table } from './components';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const UserList = () => {
  const classes = useStyles();
  const [isEdit, setIsEdit] = useState(false);
  const [cardToEdit, setCardToEdit] = useState({});
  const [resetCard, setResetCard] = useState( ()=>()=>{} );

  return (
    <div className={classes.root}>
      <Toolbar resetCard={resetCard} isEdit={isEdit} setIsEdit={setIsEdit} cardToEdit={cardToEdit} setCardToEdit={setCardToEdit}/>
      <div className={classes.content}>
        <Table setResetCard={setResetCard} isEdit={isEdit} setIsEdit={setIsEdit} cardToEdit={cardToEdit} setCardToEdit={setCardToEdit}/>
      </div>
    </div>
  );
};

export default UserList;
