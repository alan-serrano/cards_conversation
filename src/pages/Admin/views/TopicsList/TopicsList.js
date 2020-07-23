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

const TopicsList = () => {
  const classes = useStyles();
  const [isEdit, setIsEdit] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState({});
  const [resetTopic, setResetTopic] = useState( ()=>()=>{} );

  return (
    <div className={classes.root}>
      <Toolbar resetTopic={resetTopic} isEdit={isEdit} setIsEdit={setIsEdit} setTopicToEdit={setTopicToEdit}/>
      <div className={classes.content}>
        <Table setResetTopic={setResetTopic} isEdit={isEdit} setIsEdit={setIsEdit} topicToEdit={topicToEdit} setTopicToEdit={setTopicToEdit}/>
      </div>
    </div>
  );
};

export default TopicsList;
