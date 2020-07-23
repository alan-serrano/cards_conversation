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
import TextField from '@material-ui/core/TextField';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
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
        setResetCard,
    } = props;
    const [idCard, setIdCard] = React.useState(props.card.questionId);
    const isEdit = !!idCard;
    const classes = useStyles();
    const {languages} = React.useContext(StateContext);
    
    const [editor, setEditor] = React.useState();
    const [card, setCard] = React.useState(props.card);
    const [cardChanges, setCardChanges] = React.useState({});
    const [topics, setTopics] = React.useState({});
    const [difficulties, setDifficulties] = React.useState({});
    const [selectedLanguage, setSelectedLanguage] = React.useState(props.card.language + '' || '');
    const [btnDisabled, setBtnDisabled] = React.useState(true);
    const [btnRemoveDisabled, setBtnRemoveDisabled] = React.useState(true);

    // Alert
    const [openAlertOnDelete, setOpenAlertOnDelete] = React.useState(false);    

    function reset() {
        setSelectedLanguage('');
        setTopics({});
        setDifficulties({});
        setCard({});
        setCardChanges({});
        setEditor('');
    }
    
    function resetNewCard() {
        reset();
        setIdCard(undefined);
    }

    React.useEffect(function initializeCard() {
        setIdCard(props.card.questionId);
    }, [props.card.questionId]);

    React.useEffect(function initialize() {
        setResetCard(()=>resetNewCard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(function connectFirstLanguageCard() {
        if( isEdit ) {

            const refCard = db.ref(`app/main/questions/${idCard}`);

            refCard.on("value",
                getCardAndCurrentLanguage,
                (errorObject) => {
                    console.log("The read failed: " + errorObject.code);
                }
            )

            function getCardAndCurrentLanguage(snapshot) {
                const card = snapshot.val();
                console.log(card)
                if (card) {
                    const firstLanguage = selectedLanguage || Object.keys(card.languages).sort()[0];
                    setCard((prevCard)=>({
                        ...prevCard,
                        ...card,
                        language: firstLanguage,
                    }));

                    setCardChanges((prevCard)=>({
                        ...prevCard,
                        ...card,
                        language: firstLanguage,
                    }))

                    setSelectedLanguage(firstLanguage);
                } else {
                    reset();
                }
            }

            return function disconnectCard() {
                refCard.off("value", getCardAndCurrentLanguage);
            }
        } else {
            reset();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idCard]);
    
    React.useEffect(function connectCardTranslations() {
        const existLanguageOnCard = card.languages && selectedLanguage && card.languages[selectedLanguage];
        let languageCard;
        if( existLanguageOnCard ) {
            setCard((card)=>({
                ...card,
                language: selectedLanguage,
            }));

            languageCard = selectedLanguage

        } else if( selectedLanguage ) {
            languageCard = card.language;
        }

        const refQuestion = db.ref(`app/${languageCard}/questions/${idCard}`);
        
        refQuestion.on("value", getQuestion);

        function getQuestion(snapshot) {
            const card = snapshot.val();
            console.log(card)

            if(card) {
                setCard((prevCard)=>({
                    ...prevCard,
                    question: card.question
                }));
                
                setCardChanges((prevCard)=>({
                    ...prevCard,
                    question: card.question
                }));
                
                setEditor(convertToEditorState(card.question));
            }
        }
        

        return function disconnectCardTranslations() {
            refQuestion.off("value", getQuestion);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage, idCard, card.language, card.languages && card.languages[selectedLanguage]]);
    
    React.useEffect(function connectOptionsTranslations() {
        const refTopics = db.ref(`app/main/topics`);
        const refDifficulties = db.ref(`app/main/difficulties`);
        
        refTopics.on("value", getTopics, (error)=>console.log(error.code));
        refDifficulties.on("value", getDifficulties, (error)=>console.log(error.code));

        function getTopics(snapshot) {
            const topicsSnapShot = snapshot.val();

            if(topicsSnapShot) {
                const topicsTranslation = { ...topicsSnapShot };
                let counter = 0;


                Object.keys(topicsSnapShot).forEach((topicId, index, arr) => {
                    const topic = topicsSnapShot[topicId];
                    let firstLanguage;

                    if (topic.languages[selectedLanguage]) {
                        firstLanguage = selectedLanguage;
                        topicsTranslation[topicId].language = selectedLanguage;
                    } else if(topics[topicId] && topics[topicId].language){
                        firstLanguage = topics[topicId].language;
                    } else {
                        firstLanguage = (topic.languages.en) ? 'en' : Object.keys(topic.languages).sort()[0];
                    }

                    const refTopicTranslation = db.ref(`app/${firstLanguage}/topics/${topicId}`);
                    refTopicTranslation.once("value", (translation) => {
                        counter++;
                        topicsTranslation[topicId].name = translation.val().name;
                        topicsTranslation[topicId].help = translation.val().help;
                        const isLastIteration = counter === arr.length;
                        if (isLastIteration) {
                            setTopics(topicsTranslation);
                        }
                    })
                })
            }
        }
        
        function getDifficulties(snapshot) {
            const difficultiesSnapshot = snapshot.val();

            if(difficultiesSnapshot) {
                const difficultiesTranslation = {...difficultiesSnapshot};
                let counter = 0;


                Object.keys(difficultiesSnapshot).forEach((difficultyId, index, arr)=> {
                    const difficulty = difficultiesSnapshot[difficultyId];
                    let firstLanguage;

                    if(difficulty.languages[selectedLanguage]) {
                        firstLanguage = selectedLanguage;
                        difficultiesTranslation[difficultyId].language = selectedLanguage;
                    } else if(difficulties[difficultyId] && difficulties[difficultyId].language) {
                        firstLanguage = difficulties[difficultyId].language;
                    } 
                    else {
                        firstLanguage = (difficulty.languages.en) ? 'en' :  Object.keys(difficulty.languages).sort()[0];
                    }

                    const refTopicTranslation = db.ref(`app/${firstLanguage}/difficulties/${difficultyId}/name`);
                    refTopicTranslation.once("value", (translation)=> {
                        counter++;
                        difficultiesTranslation[difficultyId].name = translation.val();
                        const isLastIteration = counter === arr.length;
                        if(isLastIteration) {
                            setDifficulties(difficultiesTranslation);
                        }
                    })

                })
            }
        }

        return function disconnectTranslations() {
            if(selectedLanguage) {
                refTopics.off("value", getTopics);
                refDifficulties.off("value", getDifficulties);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage, idCard, card.language])

    React.useEffect( function lookingForChanges() {
        if(card.question !== cardChanges.question) {
            setBtnDisabled(false);
            setBtnRemoveDisabled(true);
        }

        else if(card.topicId !== cardChanges.topicId ) {
            setBtnDisabled(false);
            setBtnRemoveDisabled(true);
        }

        else if(card.difficulty !== cardChanges.difficulty) {
            setBtnDisabled(false);
            setBtnRemoveDisabled(true);
            
        } else if(card.author !== cardChanges.author) {
            setBtnDisabled(false);
            setBtnRemoveDisabled(true);
            console.log("HOla")
        }

        else {
            setBtnDisabled(true);

            if(selectedLanguage === card.language) {
                setBtnRemoveDisabled(false);
            } else {
                setBtnRemoveDisabled(true);
            }
        }
    }, [card.question, card.topicId, card.difficulty, card.author, cardChanges.question, cardChanges.topicId, cardChanges.difficulty, cardChanges.author, selectedLanguage, card.language]);

    // Handlers
    function handleChange(e) {
        const type = e.target.name;

        if(type === 'language') {
            const value = e.target.value;
            setSelectedLanguage(value);
        }

        if(type === 'topic') {
            const value = e.target.value;
            setCard((card)=> ({
                ...card,
                topicId: value,
            }))
        }

        if(type === 'difficulty') {
            const value = e.target.value;
            setCard((card)=> ({
                ...card,
                difficulty: value,
            }))
        }
    }

    function handleInputChange(e) {
        const type = e.target.getAttribute('name');
        const value = e.target.value;
        
        if(type === 'author') {
            setCard((card)=> ({
                ...card,
                author: value, 
            }))
        }
    }

    function onEditorStateChange(editorState) {
        const rawContentState = convertToRaw(editorState.getCurrentContent());

        setCard((card) =>({
            ...card,
            question: draftToHtml(rawContentState)
        }));
        setEditor(editorState);
    }

    function onClickBtn() {
        setBtnDisabled(true);
        const isNewLanguageOnEdit = isEdit && (selectedLanguage !== card.language);

        if( isNewLanguageOnEdit ) {
            const refCardLanguages = db.ref(`app/main/questions/${idCard}/languages`);
            
            // Setting Question 
            db.ref(`app/${selectedLanguage}/questions/${idCard}/question`).set(card.question);
            
            // Setting new active language in the app
            const refLanguages = db.ref(`languages/actives`);
            refLanguages.update({
                [selectedLanguage]: true
            });

            // Setting new language in card
            refCardLanguages.update({
                [selectedLanguage]: true,
            });

        } else if(isEdit) {
            // Setting Question
            db.ref(`app/${card.language}/questions/${idCard}/question`).set(card.question);
        }
        
        if(isEdit) {
            // Setting topic
            db.ref(`app/main/questions/${idCard}/topicId`).set(card.topicId);
            
            // Setting Difficulty
            db.ref(`app/main/questions/${idCard}/difficulty`).set(card.difficulty);

            // Setting Author
            db.ref(`app/main/questions/${idCard}/author`).set(card.author || '');
        }
        
        if( !isEdit ) {
            // Setting Question 
            const refCard = db.ref(`app/main/questions`).push();
            const idCard = refCard.key;
            const refCardTranslation = db.ref(`app/${selectedLanguage}/questions/${idCard}/question`);
            refCardTranslation.set(card.question);

            // Setting topic
            refCard.child('topicId').set(card.topicId);
            
            // Setting Difficulty
            refCard.child('difficulty').set(card.difficulty);
            setIdCard(idCard);

            // Setting Author
            refCard.child('author').set(card.author);


            // Setting new active language in the app
            const refLanguages = db.ref(`languages/actives`);
            refLanguages.update({
                [selectedLanguage]: true
            })
            
            // Setting new language in card
            const refCardLanguages = db.ref(`app/main/questions/${idCard}/languages`);
            refCardLanguages.update({
                [selectedLanguage]: true,
            });
        }

        setSelectedLanguage(selectedLanguage);
    }

    async function onRemove() {
        setBtnRemoveDisabled(true);
        const thereIsNoChanges = isEdit && (selectedLanguage === card.language);

        if(thereIsNoChanges) {
            // Delete translation
            const cardLanguage = selectedLanguage;
            const cardLanguages = {...card.languages};

            checkLanguages();

            const existOtherLanguageOnCard = Object.keys(cardLanguages).filter((languageId)=>languageId !== cardLanguage).length > 0;
            if(existOtherLanguageOnCard) {
                const otherLanguages = Object.keys(cardLanguages).filter((languageId)=>languageId!==cardLanguage);
                setIdCard(idCard);
                setSelectedLanguage( otherLanguages['en'] ? 'en' : otherLanguages[0] );
            } else {
                setIsEdit(false);
                
                // Remove Card from main
                db.ref('app').update({
                    [`main/questions/${idCard}`]: null,
                });
            }


            db.ref('app').update({
                [`main/questions/${idCard}/languages/${cardLanguage}`]: null,
                [`${cardLanguage}/questions/${idCard}`]: null,
            })

            async function checkLanguages() {
                const refQuestionsMain = db.ref(`app/main`);
                const language = cardLanguage;

                const snapshot = await refQuestionsMain.once('value');
                let languageExistInDb = false;
                
                if(snapshot) {
                    const main = snapshot.val();
                    const {questions} = main;

                    for (const questionId in questions) {
                        const question = questions[questionId];

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
                            [cardLanguage]: null
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
                <h1 className={classes.textCenter}>Cards</h1>

                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="language-select">Language</InputLabel>
                    <Select 
                        defaultValue=""
                        inputProps={{name: 'language', id: 'language-select'}}
                        value={`${selectedLanguage || ''}`}
                        onChange={handleChange}
                    >
                        {card.languages && <ListSubheader><strong>ACTIVES</strong></ListSubheader>}
                        {card.languages && languages.all && Object.keys(card.languages).sort().map( (languageId) => 
                            <MenuItem key={languageId} value={languageId}>
                                {(languages.all[languageId]) &&
                                    `${languages.all[languageId].nativeName} - ${languageId}`
                                }
                            </MenuItem>
                        )}

                        <ListSubheader><strong>NEW LANGUAGE</strong></ListSubheader>
                        {languages.all && Object.keys(languages.all).filter((languageId)=>{
                            return (card.languages) ? !card.languages.hasOwnProperty(languageId) : true;
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
                    <InputLabel htmlFor="topic-select">Topic</InputLabel>
                    <Select 
                        defaultValue=""
                        inputProps={{name: 'topic', id: 'topic-select'}}
                        value={`${card.topicId || ''}`}
                        onChange={handleChange}
                    >
                        {Object.keys(topics).sort((a,b) => {
                            if( topics[a].name > topics[b].name ) return 1;
                            if( topics[a].name < topics[b].name ) return -1;
                            return 0;
                        })
                        .map((topicId)=>
                            <MenuItem key={topicId} value={topicId}>{topics[topicId].name}</MenuItem>
                        )}
                    </Select>
                </FormControl>

                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="difficulty-selector">Difficulty</InputLabel>
                    <Select
                        defaultValue=""
                        inputProps={{name: 'difficulty', id: 'difficulty-select'}}
                        value={`${card.difficulty || ''}`}
                        onChange={handleChange}    
                    >
                        {Object.keys(difficulties).sort((a,b) => {
                            if( a.name > b.name ) return 1;
                            if( a.name < b.name ) return -1;
                            return 0;
                        })
                        .map((difficultyId)=>
                            <MenuItem key={difficultyId} value={difficultyId}>{difficulties[difficultyId].name}</MenuItem>
                        )}
                    </Select>
                </FormControl>

                <FormControl className={classes.formControl}>
                    <TextField
                        inputProps={{name: 'author', id: 'author-input'}}
                        label="Author"
                        value={card.author || ''}
                        onChange={handleInputChange}
                    />
                </FormControl>

                <FormControl className={classes.formControl}>
                    <FormLabel style={{marginTop: '16px'}}>Question</FormLabel>
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
                Are you sure you want to delete the card with language "{languages.all && languages.all[selectedLanguage] && languages.all[selectedLanguage].name} | {languages.all && languages.all[selectedLanguage] && languages.all[selectedLanguage].nativeName} | {selectedLanguage}"?
            </AlertComponent>
        </div>
    )
}

export default Edit
