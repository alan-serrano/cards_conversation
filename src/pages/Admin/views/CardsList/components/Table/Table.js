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
        cardToEdit,
        setCardToEdit,
        setResetCard,
    } = props;
    const { admin: { adminCards } } = useContext(StateContext);

    const classes = useStyles();
    const {languages} = React.useContext(StateContext);
    const [selectedRow, setSelectedRow] = useState(null);

    // Alert on delete rows
    const [cardsToDelete, setCardsToDelete] = React.useState([]);
    const [openAlertDeleteRows, setOpenAlertDeleteRows] = React.useState(false);

    const [columns, setColumns] = useState([
        { title: 'Question', field: 'question' },
        {
            title: 'Topic',
            field: 'topic',
            width: '150',
        },
        {
            title: 'Difficulty',
            field: 'difficulty',
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

    function removeCard(card) {
        const {
            questionId: idCard,
            language,
        } = card;
        
        const languages = {...card.languages}

        checkLanguages();

        const existOtherLanguageOnCard = Object.keys(languages).filter((languageId)=>languageId !== language).length > 0;

        if(!existOtherLanguageOnCard) {
            // Remove Card from main
            db.ref('app').update({
                [`main/questions/${idCard}`]: null,
            });
        }

        db.ref('app').update({
            [`main/questions/${idCard}/languages/${language}`]: null,
            [`${language}/questions/${idCard}`]: null,
        })

        async function checkLanguages() {
            const refQuestionsMain = db.ref(`app/main`);

            const snapshot = await refQuestionsMain.once('value');
            let languageExistInDb = false;
            
            if(snapshot) {
                const main = snapshot.val();
                const {questions} = main;

                for (const questionId in questions) {
                    const question = questions[questionId];
                    console.log(question, questionId, idCard, language);

                    if(questionId !== idCard && question.languages) {
                        if( question.languages[language]) {
                            console.log("pasé por aquí")
                            languageExistInDb = true;
                            break;
                        }
                    }
                }

                // Checking on topics
                const {topics} = main;

                if(!languageExistInDb) {
                    for (const id in topics) {
                        const difficulty = topics[id];

                        if( difficulty.languages[language]) {
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
            { title: 'Question', field: 'question' },
            {
                title: 'Topic',
                field: 'topic',
                width: '150',
            },
            {
                title: 'Difficulty',
                field: 'difficulty',
                width: '150',
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
                            setCardToEdit(rowData);
                            console.log(rowData)
                        }}
                    >
                        <Edit/>
                    </Button>
            }
    
        ])
    }, [languages, setCardToEdit, setIsEdit])

    React.useEffect(function settingData() {
        setData(adminCards);
    }, [adminCards]);

    function handleDeleteCards(arrCards) {
        for (const card of arrCards) {
            removeCard(card);
        }

        setCardsToDelete([]);
    }

    return (

        <div >
            {isEdit &&
                <EditComponent
                    card={cardToEdit}
                    setIsEdit={setIsEdit}
                    setResetCard={setResetCard}
                />
            }

            <div className={clsx(isEdit ? classes.hide : '', classes.table)}>
                <MaterialTable
                    icons={tableIcons}
                    title="List of Cards"
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
                                console.log(dataSelected);
                                setCardsToDelete(dataSelected);
                                setOpenAlertDeleteRows(true);
                            }
                        },
                    ]}
                />
            </div>

            <AlertComponent
                onConfirm={()=>handleDeleteCards(cardsToDelete)}
                open={openAlertDeleteRows}
                setOpen={setOpenAlertDeleteRows}
            >
                Are you sure you want to delete <strong style={{color: 'red'}}>{cardsToDelete.length} card(s)</strong>?
            </AlertComponent>
        </div>
    );
};

Table.propTypes = {
    className: PropTypes.string,
};

export default Table;
