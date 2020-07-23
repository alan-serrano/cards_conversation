import React, { useState, useContext } from 'react';
import { StateContext } from '../../../../../../Context/GlobalContext';
import EditComponent from '../Edit';
import AlertComponent from '../../../../../../components/Alert';

import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {Button} from '@material-ui/core';

import { forwardRef } from 'react';
import MaterialTable from 'material-table';
import Skeleton from '@material-ui/lab/Skeleton';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

/* Firebase */
import { db } from '../../../../../../services/firebase';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};


const useStyles = makeStyles(theme => ({
    root: {
        padding: 0
    },
    content: {
        padding: 0
    },
    table: {
        '& tr > *:first-child': {
            paddingLeft: '1em'
        }
    },
    inner: {
        minWidth: 1050
    },
    nameContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    avatar: {
        marginRight: theme.spacing(2)
    },
    actions: {
        justifyContent: 'flex-end'
    },
    hide: {
        display: 'none',
    }
}));

const Table = props => {
    const { 
        isEdit,
        setIsEdit,
        topicToEdit,
        setTopicToEdit,
        setResetTopic,
    } = props;
    const { admin: { adminTopics } } = useContext(StateContext);

    const classes = useStyles();
    const {languages} = React.useContext(StateContext);
    const [selectedRow, setSelectedRow] = useState(null);

    // Alert on delete rows
    const [topicsToDelete, setTopicsToDelete] = React.useState([]);
    const [openAlertDeleteRows, setOpenAlertDeleteRows] = React.useState(false);

    const [columns, setColumns] = useState([
        { title: 'Topic', field: 'name' },
        {
            title: 'Help',
            field: 'help',
            width: '150',
        },
        { 
            title: 'Language',
            field: 'language',
            width: '150',
        },
        { 
            title: 'Actions',
            field: 'action',
            width: '150',
        }

    ]);

    function removeTopic(topic) {
        const {
            topicId,
            language,
        } = topic;
        
        const languages = {...topic.languages}

        checkLanguages();

        const existOtherLanguageOnTopic = Object.keys(languages).filter((languageId)=>languageId !== language).length > 0;

        if(!existOtherLanguageOnTopic) {
            // Remove Card from main
            db.ref('app').update({
                [`main/topics/${topicId}`]: null,
            });
        }

        db.ref('app').update({
            [`main/topics/${topicId}/languages/${language}`]: null,
            [`${language}/topics/${topicId}`]: null,
        })

        async function checkLanguages() {
            const refMain = db.ref(`app/main`);

            const snapshot = await refMain.once('value');
            let languageExistInDb = false;
            
            if(snapshot) {
                const main = snapshot.val();
                const {topics} = main;

                for (const id in topics) {
                    const topic = topics[id];

                    if(id !== topicId && topic.languages) {
                        if( topic.languages[language]) {
                            languageExistInDb = true;
                            break;
                        }
                    }
                }

                // Checking on cards
                const {questions: cards} = main;

                if(!languageExistInDb) {
                    for (const id in cards) {
                        const card = cards[id];

                        if( card.languages[language]) {
                            languageExistInDb = true;
                            break;
                        }
                    }
                }

                // Checking on difficulties
                const {difficulties} = main;

                if(!languageExistInDb) {
                    for (const id in difficulties) {
                        const difficulty = difficulties[id];

                        if( difficulty.languages[language]) {
                            languageExistInDb = true;
                            break;
                        }
                    }
                }

                if(!languageExistInDb) {
                    // Delete language from actives
                    db.ref(`languages/actives`).update({
                        [language]: null
                    })
                }
            }

        }
    }

    const [data, setData] = useState([]);

    React.useEffect(function initializeColumns() {
        setColumns([
            {
                title: 'Topic',
                field: 'name'
            }, {
                title: 'Help',
                field: 'help',
            },
            { 
                title: 'Language',
                field: 'language',
                width: '150',
                render: (rowData) => {
                    return <>
                        {
                            ( languages.all && languages.all[rowData.language] && languages.all[rowData.language].nativeName ) ||
                            <Skeleton animation="wave" />
                        }
                    </>
                },
            },
            { 
                title: 'Actions',
                field: 'action',
                width: '150',
                render: (rowData) => 
                    <Button
                        onClick={()=>{
                            setIsEdit(true);
                            setTopicToEdit(rowData);
                        }}
                    >
                        <Edit/>
                    </Button>
            }
    
        ])
    }, [languages, setTopicToEdit, setIsEdit])

    React.useEffect(function settingData() {
        setData(adminTopics)
    }, [adminTopics]);

    function handleDeleteTopics(arrTopics) {
        for (const card of arrTopics) {
            removeTopic(card);
        }

        setTopicsToDelete([]);
    }

    return (

        <div >
            {isEdit &&
                <EditComponent
                    topic={topicToEdit}
                    setIsEdit={setIsEdit}
                    setReset={setResetTopic}
                />
            }

            <div className={clsx(isEdit ? classes.hide : '', classes.table)}>
                <MaterialTable
                    icons={tableIcons}
                    title="List of Topics"
                    columns={columns}
                    data={data}
                    options={{
                        sorting: true,
                        selection: true,
                        rowStyle: rowData => ({
                            backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF',
                        })
                    }}
                    
                    onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                    actions={[
                        {
                            tooltip: 'Remove All Selected Users',
                            icon: DeleteOutline,
                            onClick: (evt, dataSelected) => {
                                setTopicsToDelete(dataSelected);
                                setOpenAlertDeleteRows(true);
                            }
                        },
                    ]}
                />
            </div>

            <AlertComponent
                onConfirm={()=>handleDeleteTopics(topicsToDelete)}
                open={openAlertDeleteRows}
                setOpen={setOpenAlertDeleteRows}
            >
                Are you sure you want to delete <strong style={{color: 'red'}}>{topicsToDelete.length} topic(s)</strong>?
            </AlertComponent>
        </div>
    );
};

Table.propTypes = {
    className: PropTypes.string,
};

export default Table;
