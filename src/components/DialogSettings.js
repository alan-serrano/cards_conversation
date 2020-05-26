import React, { useContext } from 'react';
import { useParams } from "react-router-dom";
import { StateContext, DispatchContext } from '../Context/GlobalContext';

/* FIREBASE */
import { db } from '../services/firebase';

/* MATERIAL UI */
// Styles
import { makeStyles } from '@material-ui/core/styles';

// Layout
import Container from '@material-ui/core/Container'

// Inputs
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

// Surfaces
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

// Feedback
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

// Data Display
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';

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
    },
    divider: {
        marginBottom: theme.spacing(1)
    }
}));


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function DialogSettings() {
    const {id} = useParams();
    const classes = useStylesDialog();
    
    const {card, normalizedDataIsReady: dataIsReady} = useContext(StateContext);
    const {dispatchCard} = useContext(DispatchContext);
    const [open, setOpen] = React.useState(false);
    
    // Handle cheks states
    const [difficultyStates, setDifficultyStates] = React.useState();
    const [topicStates, setTopicStates] = React.useState();
    
    React.useEffect( function initializeFilters() {
        setDifficultyStates({
            ...card.difficulty,
        });

        setTopicStates({
            ...card.topic,
        });
    }, [card.difficulty, card.topic] )

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);

        setDifficultyStates({
            ...card.difficulty,
        });

        setTopicStates({
            ...card.topic,
        });
        
    };
    
    const handleSave = () => {
        setOpen(false);

        if( id !== undefined ) {
            const refcurrentTopicsParty = db.ref(`parties/${id}/topics`);
            const refcurrentDifficultiesParty = db.ref(`parties/${id}/difficulties`);
    
            refcurrentTopicsParty.set({
                ...topicStates,
            });
            
            refcurrentDifficultiesParty.set({
                ...difficultyStates,
            });

        } else {
            dispatchCard({
                type: 'UPDATE',
                payload: {
                    topic: {
                        ...topicStates
                    },
                    difficulty: {
                        ...difficultyStates
                    }
                }
            })
        }
    };

    return (
        <>
            <IconButton disabled={!dataIsReady} style={(dataIsReady) ? { color: '#F44336' } : {}} aria-label="settings"  onClick={handleClickOpen}>
                <SettingsIcon />
            </IconButton>
            <Dialog fullScreen open={open} onClose={handleClose} aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description" TransitionComponent={Transition}>
                <AppBar className={classes.appBar} >
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            Settings
                        </Typography>
                        <IconButton edge="start" color="inherit" onClick={handleSave} aria-label="close">
                            <DoneIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent className={classes.content}>
                    <ContentSettings 
                        topicStates={topicStates}
                        setTopicStates={setTopicStates}
                        
                        difficultyStates={difficultyStates}
                        setDifficultyStates={setDifficultyStates}
                    />
                        
                </DialogContent>
            </Dialog>
        </>
    );
}

function ContentSettings(props) {
    const classes = useStylesDialog();
    const {
        difficultyStates,
        setDifficultyStates,

        topicStates,
        setTopicStates
    } = props

    const {topics, difficulties} = useContext(StateContext);

    const [allDifficultiesCheck, setAllDifficultiesCheck] = React.useState(false);
    const [allTopicsCheck, setAllTopicsCheck] = React.useState(false);

    React.useEffect( function verifyCheckboxs() {
        if( Object.values(difficultyStates).filter( v => v ).length === Object.values(difficultyStates).length ) {
            setAllDifficultiesCheck(true);
        } else {
            setAllDifficultiesCheck(false);
        }
        
        if( Object.values(topicStates).filter( v => v ).length !== Object.values(topicStates).length ) {
            setAllTopicsCheck(false);
        } else {
            setAllTopicsCheck(true);
        }

    },[difficultyStates, topicStates]);

    const handleDifficultyChange = (event) => {
        const newDifficultyStates = {...difficultyStates};
        newDifficultyStates[event.target.name] = event.target.checked;
        setDifficultyStates( newDifficultyStates );
    };
    
    const handleAllDifficultiesCheck = (event) => {
        if( event.target.checked ) {
            const newDifficulyStates = {};

            for (const difficultyStateId in difficultyStates) {
                newDifficulyStates[difficultyStateId] = true;
            }

            setDifficultyStates( newDifficulyStates );
        } else {
            const newDifficulyStates = {};

            for (const difficultyStateId in difficultyStates) {
                newDifficulyStates[difficultyStateId] = false;
            }

            setDifficultyStates( newDifficulyStates );
        }

        setAllDifficultiesCheck( event.target.checked );
    };
    
    const handleTopicChange = (event) => {
        const newTopicsStates = {...topicStates};
        newTopicsStates[event.target.name] = event.target.checked;
        setTopicStates(newTopicsStates);
    };

    const handleAllTopicsCheck = (event) => {
        if( event.target.checked ) {
            const newTopicStates = {};

            for (const topicStateId in topicStates) {
                newTopicStates[topicStateId] = true;
            }

            setTopicStates( newTopicStates );
        } else {
            const newTopicStates = {};

            for (const topicStateId in topicStates) {
                newTopicStates[topicStateId] = false;
            }

            setTopicStates( newTopicStates );
        }

        setAllTopicsCheck( event.target.checked );
    };

    function createCheckboxs(elements, elementStates, handler) {

        return elements.map( (element, index) => (
            <FormControlLabel
                control={<Checkbox checked={elementStates[element.id]} onChange={handler} name={`${element.id}`} />}
                label={element.name}
                key={index}
            />
        ));
    }
    
    return (
        <>
            <form>
                <Container maxWidth="xs">
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Select difficulties</FormLabel>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={allDifficultiesCheck} onChange={handleAllDifficultiesCheck} />}
                                label={"All"}
                            />
                            {createCheckboxs( difficulties.normalized, difficultyStates, handleDifficultyChange )}
                        </FormGroup>
                    </FormControl>
                    <Divider light className={classes.divider}/>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Select topics</FormLabel>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={allTopicsCheck} onChange={handleAllTopicsCheck} />}
                                label={"All"}
                            />
                            {createCheckboxs( topics.normalized, topicStates, handleTopicChange )}
                        </FormGroup>
                    </FormControl>
                </Container>
            </form>
        </>
    );
}

export default DialogSettings;