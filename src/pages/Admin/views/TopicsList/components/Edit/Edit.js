import React from 'react';
import clsx from 'clsx';
import { StateContext } from '../../../../../../Context/GlobalContext';
import AlertComponent from '../../../../../../components/Alert';

// Material-UI
import Container from '@material-ui/core/Container';

// Styles
import { makeStyles } from '@material-ui/core/styles';

// Input
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ListSubheader from '@material-ui/core/ListSubheader';

// Icons
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import UpdateIcon from '@material-ui/icons/Update';
import AddIcon from '@material-ui/icons/Add';


// WYSIWYG
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

/* FIREBASE */
import { db } from '../../../../../../services/firebase';

const useStyles = makeStyles((theme) => ({
    margin: {
        marginTop: theme.spacing(3),
    },
    formControl: {
        margin: theme.spacing(1),
        width: '100%'
    },
    formControlButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    editorToolbarClassName: {
        borderBottom: '1px solid gray',
        marginBottom: 0
    },
    editorWrapperClassName: {
        border: '1px solid gray',
        backgroundColor: 'white',
        marginTop: theme.spacing(1)
    },
    editorClassName: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        minHeight: '150px',
    },
    textCenter: {
        textAlign: 'center'
    },
    button: {
        marginLeft: theme.spacing(2),
    },
    danger: {
        backgroundColor: 'rgb(220, 0, 78)',
        '&:hover': {
            backgroundColor: 'rgb(154, 0, 54)'
        }
    }
}));

function Edit(props) {
    const {
        setIsEdit,
        setReset,
    } = props;
    const [topicId, setTopicId] = React.useState(props.topic.topicId);
    const isEdit = !!topicId;
    const classes = useStyles();
    const {languages} = React.useContext(StateContext);
    
    const [editor, setEditor] = React.useState();
    const [topic, setTopic] = React.useState({});
    const [topicChanges, setTopicChanges] = React.useState({});
    const [selectedLanguage, setSelectedLanguage] = React.useState(props.topic.language + '' || '');
    const [btnDisabled, setBtnDisabled] = React.useState(true);
    const [btnRemoveDisabled, setBtnRemoveDisabled] = React.useState(true);

    // Alert
    const [openAlertOnDelete, setOpenAlertOnDelete] = React.useState(false);

    function reset() {
        setSelectedLanguage('');
        setTopic({});
        setTopicChanges({});
        setEditor('');
    }
    
    function resetNew() {
        reset();
        setTopicId(undefined);
    }

    React.useEffect(function initializeCard() {
        setTopicId(props.topic.topicId);
    }, [props.topic.topicId]);

    React.useEffect(function initialize() {
        setReset(()=>resetNew);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(function connectFirstLanguageTopic() {
        if( isEdit ) {

            const refCard = db.ref(`app/main/topics/${topicId}`);

            refCard.on("value",
                getTopicAndLanguage,
                (errorObject) => {
                    console.log("The read failed: " + errorObject.code);
                }
            )

            function getTopicAndLanguage(snapshot) {
                const topic = snapshot.val();
                if (topic) {
                    const firstLanguage = selectedLanguage || Object.keys(topic.languages).sort()[0];
                    setTopic({
                        ...topic,
                        language: firstLanguage,
                    });

                    setTopicChanges({
                        ...topic,
                        language: firstLanguage
                    })

                    setSelectedLanguage(firstLanguage);
                } else {
                    reset();
                }
            }

            return function disconnectCard() {
                refCard.off("value", getTopicAndLanguage);
            }
        } else {
            reset();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId]);
    
    React.useEffect(function connectTopicTranslations() {
        const existLanguageOnCard = topic.languages && selectedLanguage && topic.languages[selectedLanguage];
        let languageTopic;
        if( existLanguageOnCard ) {
            setTopic((topic)=>({
                ...topic,
                language: selectedLanguage,
            }));

            languageTopic = selectedLanguage

        } else if( selectedLanguage ) {
            languageTopic = topic.language;
        }

        const refTopic = db.ref(`app/${languageTopic}/topics/${topicId}`);
        
        refTopic.on("value", getTopic);

        function getTopic(snapshot) {
            const topic = snapshot.val();

            if(topic) {
                setTopic((prevCard)=>({
                    ...prevCard,
                    help: topic.help,
                    name: topic.name
                }));
                
                setTopicChanges((prevCard)=>({
                    ...prevCard,
                    help: topic.help,
                    name: topic.name
                }));
                
                setEditor(convertToEditorState(topic.help));
            }
        }
        

        return function disconnectCardTranslations() {
            refTopic.off("value", getTopic);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage, topicId, topic.language, topic.languages && topic.languages[selectedLanguage]]);

    React.useEffect( function lookingForChanges() {
        if(topic.name !== topicChanges.name) {
            setBtnDisabled(false);
            setBtnRemoveDisabled(true);
        }

        else if(topic.help !== topicChanges.help ) {
            setBtnDisabled(false);
            setBtnRemoveDisabled(true);
        }

        else {
            setBtnDisabled(true);

            if(selectedLanguage === topic.language) {
                setBtnRemoveDisabled(false);
            } else {
                setBtnRemoveDisabled(true);
            }
        }
    }, [topic.name, topicChanges.name, selectedLanguage, topic.language, topic.help, topicChanges.help]);

    // Handlers
    function handleChange(e) {
        const type = e.target.name;

        if(type === 'language') {
            const value = e.target.value;
            setSelectedLanguage(value);
        }
    }
    
    function handleInputChange(e) {
        const type = e.target.getAttribute('name');
        const value = e.target.value;
        
        if(type === 'name') {
            setTopic(()=> ({
                ...topic,
                name: value, 
            }))
        }
    }

    function onEditorStateChange(editorState) {
        const rawContentState = convertToRaw(editorState.getCurrentContent());

        setTopic((topic) =>({
            ...topic,
            help: draftToHtml(rawContentState)
        }));
        setEditor(editorState);
    }

    function onClickBtn() {
        setBtnDisabled(true);
        const isNewLanguageOnEdit = isEdit && (selectedLanguage !== topic.language);

        if( isNewLanguageOnEdit ) {
            const refTopicLanguages = db.ref(`app/main/topics/${topicId}/languages`);

            // Setting topic
            db.ref(`app/${selectedLanguage}/topics/${topicId}/name`).set(topic.name);
            
            // Setting Help
            db.ref(`app/${selectedLanguage}/topics/${topicId}/help`).set(topic.help);

            // Setting new active language in the app
            const refLanguages = db.ref(`languages/actives`);
            refLanguages.update({
                [selectedLanguage]: true
            });

            // Setting new language in card
            refTopicLanguages.update({
                [selectedLanguage]: true,
            });

        } else if(isEdit) {
            // Setting Topic
            db.ref(`app/${topic.language}/topics/${topicId}/name`).set(topic.name);
            
            // Setting Help
            db.ref(`app/${topic.language}/topics/${topicId}/help`).set(topic.help || '');
        }

        if( !isEdit ) {
            // Setting Topic
            const refTopic = db.ref(`app/main/topics`).push();
            const topicId = refTopic.key;

            const refTopicTranslation = db.ref(`app/${selectedLanguage}/topics/${topicId}`);
            refTopicTranslation.child('name').set(topic.name);
            refTopicTranslation.child('help').set(topic.help || '');

            // Setting new active language in the app
            const refLanguages = db.ref(`languages/actives`);
            refLanguages.update({
                [selectedLanguage]: true
            })

            // Setting new language in card
            const refTopicLanguages = db.ref(`app/main/topics/${topicId}/languages`);
            refTopicLanguages.update({
                [selectedLanguage]: true,
            });

            setTopicId(topicId)
        }

        setSelectedLanguage(selectedLanguage);
    }

    async function onRemove() {
        setBtnRemoveDisabled(true);

        if(isEdit && (selectedLanguage === topic.language)) {
            // Delete translation
            const topicLanguage = selectedLanguage;
            const topicLanguages = {...topic.languages};

            checkLanguages();

            const existOtherLanguageOnCard = Object.keys(topicLanguages).filter((languageId)=>languageId !== topicLanguage).length > 0;
            if(existOtherLanguageOnCard) {
                const otherLanguages = Object.keys(topicLanguages).filter((languageId)=>languageId!==topicLanguage);
                setTopicId(topicId);
                setSelectedLanguage( otherLanguages['en'] ? 'en' : otherLanguages[0] );
            } else {
                setIsEdit(false);
                
                // Remove Card from main
                db.ref('app').update({
                    [`main/topics/${topicId}`]: null,
                });
            }


            db.ref('app').update({
                [`main/topics/${topicId}/languages/${topicLanguage}`]: null,
                [`${topicLanguage}/topics/${topicId}`]: null,
            })

            async function checkLanguages() {
                const refTopicsMain = db.ref(`app/main`);
                const language = topicLanguage;

                const snapshot = await refTopicsMain.once('value');
                let languageExistInDb = false;
                
                if(snapshot) {
                    const main = snapshot.val();

                    // Checking on topics
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
                        db.ref(`languages/actives`).update({
                            [language]: null
                        })
                    }
                } 

            }
        }
    }

    function convertToEditorState(html) {
        let editorState;
        const contentBlock = htmlToDraft(html);

        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            editorState = EditorState.createWithContent(contentState)
        }

        return editorState;
    }

    return (
        <div className="edit">
            <Container className={classes.margin} maxWidth="sm">
                <h1 className={classes.textCenter}>Topics</h1>

                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="language-select">Language</InputLabel>
                    <Select 
                        defaultValue=""
                        inputProps={{name: 'language', id: 'language-select'}}
                        value={`${selectedLanguage || ''}`}
                        onChange={handleChange}
                    >
                        {topic.languages && <ListSubheader><strong>ACTIVES</strong></ListSubheader>}
                        {topic.languages && languages.all && Object.keys(topic.languages).sort().map( (languageId) => 
                            <MenuItem key={languageId} value={languageId}>
                                {(languages.all[languageId]) &&
                                    `${languages.all[languageId].nativeName} - ${languageId}`
                                }
                            </MenuItem>
                        )}

                        <ListSubheader><strong>NEW LANGUAGE</strong></ListSubheader>
                        {languages.all && Object.keys(languages.all).filter((languageId)=>{
                            return (topic.languages) ? !topic.languages.hasOwnProperty(languageId) : true;
                        })
                        .sort((a,b)=>{
                            if (a.nativeName > b.nativeName) return 1;
                            if (a.nativeName < b.nativeName) return -1;
                            return 0;
                        }).map((languageId)=> {
                            let languageNativeName = languages.all[languageId].nativeName;
                        return <MenuItem key={languageId} value={languageId}>{languageNativeName} - {languageId}</MenuItem>
                        })}

                    </Select>
                </FormControl>

                <FormControl className={classes.formControl}>
                    <TextField
                        inputProps={{name: 'name', id: 'name-input'}}
                        label="Topic"
                        value={topic.name || ''}
                        onChange={handleInputChange}
                    />
                </FormControl>
                
                <FormControl className={classes.formControl}>
                    <FormLabel style={{marginTop: '16px'}}>Help</FormLabel>
                    <Editor
                        editorState={editor}
                        toolbarClassName={classes.editorToolbarClassName}
                        wrapperClassName={classes.editorWrapperClassName}
                        editorClassName={classes.editorClassName}
                        onEditorStateChange={onEditorStateChange}
                        toolbar={{
                            options: ['inline', 'blockType', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
                        }}
                    />
                </FormControl>

                <FormControl className={clsx(classes.formControl, classes.formControlButtons)}>
                    <Button onClick={onClickBtn} variant="contained" disabled={btnDisabled} className={classes.button} color="primary">
                        {(isEdit) ?
                                <>UPDATE <UpdateIcon style={{marginLeft: '0.4em'}}/></>
                            :
                                <>Add <AddIcon style={{marginLeft: '0.4em'}}/></>
                        } 
                    </Button>
                        {(isEdit) &&
                            <Button onClick={()=>setOpenAlertOnDelete(true)} disabled={btnRemoveDisabled} variant="contained" className={clsx(classes.button, classes.danger)} color="secondary">
                                DELETE <DeleteOutline style={{marginLeft: '0.4em'}}/>
                            </Button>
                        }
                </FormControl>
            </Container>
            <AlertComponent
                open={openAlertOnDelete}
                setOpen={setOpenAlertOnDelete}
                onConfirm={onRemove}
            >
                Are you sure you want to delete the topic with language "{languages.all && languages.all[selectedLanguage] && languages.all[selectedLanguage].name} | {languages.all && languages.all[selectedLanguage] && languages.all[selectedLanguage].nativeName} | {selectedLanguage}"?
            </AlertComponent>
        </div>
    )
}

export default Edit
