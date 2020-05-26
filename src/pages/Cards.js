import React, {useEffect, useContext} from 'react';
import { useParams } from "react-router-dom";
import { StateContext, DispatchContext } from '../Context/GlobalContext';
import './Cards.scss'

/* COMPONENTS */
import CardComponent from '../components/Card';

/* HELPERS */
import { randomElementArray } from '../helpers/utils';

/* LAYOUT */
import Header from '../layout/CardsHeader';

/* FIREBASE */
import { db } from '../services/firebase';

/* MATERIAL UI */

// Styles
import { makeStyles } from '@material-ui/core/styles';

// Layout
import Container from '@material-ui/core/Container';

// Inputs
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        marginTop: '1.2rem',
        justifyContent: 'space-between'
    },
    flexSpace: {
        flexBasis: 'calc(33.33% - 0.2rem)'
    }
}));

function CardsView() {
    const {id} = useParams();
    const classes = useStyles();

    const {
        questions,
        topics,
        card,
        normalizedDataIsReady: dataIsReady,
    } = useContext(StateContext);

    const {dispatchCard} = useContext(DispatchContext);
    const [partyIsReady, setPartyIsReady] = React.useState();

    // Buttons states
    const [isDisabledPrevBtn, setIsDisabledPrevBtn] = React.useState();
    const [isDisabledNextBtn, setIsDisabledNextBt] = React.useState();
    const [isDisabledRandomBtn, setIsDisabledRandomBtn] = React.useState();

    useEffect( function checkingIfDataIsReady() {
        setIsDisabledPrevBtn(!dataIsReady);
        setIsDisabledNextBt(!dataIsReady);
        setIsDisabledRandomBtn(!dataIsReady);
    },[dataIsReady] );
    
    useEffect( function connectParty(){
        if( id !== undefined && dataIsReady) {

            const refParty = db.ref(`parties/${id}`);

            refParty.on("value",
                getParty,
                (errorObject) => {
                    console.log("The read failed: " + errorObject.code);
                }
            )

            function getParty(snapshot) {
                const party = snapshot.val();
                if (party) {
                    dispatchCard({
                        type: 'UPDATE',
                        payload: {
                            question: party.currentQuestion,
                            difficulty: party.difficulties,
                            topic: party.topics
                        }
                    })

                    setPartyIsReady(true);
                }
            }

            return function disconnectParty() {
                refParty.off("value", getParty);
            }
        }
    }, [dataIsReady, dispatchCard, id]);
    
    useEffect( function randomCard(){
        const condition = (
            id === undefined &&
            dataIsReady &&
            card.question === ''
        );
            
        if( condition ) {
            let newQuestion = randomElementArray(questions.normalized);

            dispatchCard({type: 'QUESTION', payload: newQuestion.questionId});
        }
    }, [card.question, questions.normalized, questions.normalizedMap, dataIsReady, id, dispatchCard]);

    useEffect(function updateAfterChangeFilters() {
        if( card.question !== '' && dataIsReady && !questions.normalizedMap.hasOwnProperty(card.question)) {
            if (id !== undefined) {
                const refcurrentQuestionParty = db.ref(`parties/${id}/currentQuestion`);
                let newQuestion= randomElementArray(questions.normalized);
                refcurrentQuestionParty.set(newQuestion.questionId)
                
            } else {
                let newQuestion = randomElementArray(questions.normalized);
    
                dispatchCard({type: 'QUESTION', payload: newQuestion.questionId});
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questions.normalized, questions.normalizedMap, card.question]);

    // Handlers
    function onUpdateCard() {
        if (id !== undefined && dataIsReady) {
            setIsDisabledRandomBtn(true);
            const refcurrentQuestionParty = db.ref(`parties/${id}/currentQuestion`);

            let newQuestion= randomElementArray(questions.normalized);
            refcurrentQuestionParty.set(newQuestion.questionId, (error) => {
                if(!error) {
                    setIsDisabledRandomBtn(false);
                }
            })
            
        } else if(dataIsReady) {
            let newQuestion = randomElementArray(questions.normalized);

            dispatchCard({type: 'QUESTION', payload: newQuestion.questionId});
        }
    }

    function handleNextClick() {
        if (id !== undefined && dataIsReady) {
            setIsDisabledNextBt(true);
            const refcurrentQuestionParty = db.ref(`parties/${id}/currentQuestion`);
            let currentQuestionInfo = questions.normalizedMap[card.question]
            let nextQuestionInfo = currentQuestionInfo.index + 1 < questions.normalized.length ?
                questions.normalized[currentQuestionInfo.index + 1] :
                questions.normalized[0];

            refcurrentQuestionParty.set(nextQuestionInfo.questionId, (error) => {
                if(!error) {
                    setIsDisabledNextBt(false);
                }
            })
            
        } else if(dataIsReady) {
            let currentQuestionInfo = questions.normalizedMap[card.question]
            let nextQuestionInfo = currentQuestionInfo.index + 1 < questions.normalized.length ?
                questions.normalized[currentQuestionInfo.index + 1] :
                questions.normalized[0];
            
            dispatchCard({type: 'QUESTION', payload: nextQuestionInfo.questionId});
        }
    }

    function handlePrevClick() {
        // let prevId = question - 1 > 0 ? question - 1 : questions.length - 1;
        if (id !== undefined && dataIsReady) {
            setIsDisabledPrevBtn(true);
            const refcurrentQuestionParty = db.ref(`parties/${id}/currentQuestion`);
            let currentQuestionInfo = questions.normalizedMap[card.question]
            let prevQuestionInfo = currentQuestionInfo.index - 1 > 0 ?
                questions.normalized[currentQuestionInfo.index - 1] :
                questions.normalized[questions.normalized.length - 1];

            refcurrentQuestionParty.set(prevQuestionInfo.questionId, (error) => {
                if(!error) {
                    setIsDisabledPrevBtn(false);
                }
            })
            
        } else if(dataIsReady) {
            let currentQuestionInfo = questions.normalizedMap[card.question]
            let prevQuestionInfo = currentQuestionInfo.index + 1 < questions.normalized.length ?
                questions.normalized[currentQuestionInfo.index - 1] :
                questions.normalized[questions.normalized.length - 1];
            dispatchCard({type: 'QUESTION', payload: prevQuestionInfo.questionId});
        }
    }

    let question;
    let title;
    let help;

    if(
        (id !== undefined &&
        dataIsReady &&
        partyIsReady &&
        questions.normalizedMap[card.question] !== undefined)
        ||
        (id === undefined &&
        dataIsReady &&
        card.question !== '' &&
        questions.normalizedMap[card.question] !== undefined)
    ) {
        let topicId = questions.normalizedMap[card.question].topicId;
        question = questions.normalizedMap[card.question].question;
        title = topics.normalizedMap[topicId].name;
        help = topics.normalizedMap[topicId].help;
    }

    return (
        <div className="party-page">
            <Header/>
            <Container maxWidth="xs" className="container">
                <CardComponent
                    question={question}
                    title={title}
                    help={help}
                    onUpdateCard={onUpdateCard}
                />

                <div className={`${classes.container} wrapper-btn`}>
                    <Button disabled={isDisabledPrevBtn}  variant="contained" size="large" color="primary" className={classes.flexSpace} onClick={handlePrevClick}>
                        Prev
                    </Button>
                    <Button disabled={isDisabledRandomBtn} variant="contained" size="large" color="primary" className={classes.flexSpace} onClick={onUpdateCard}>
                        Random
                    </Button>
                    <Button disabled={isDisabledNextBtn} variant="contained" size="large" color="primary" className={classes.flexSpace}  onClick={handleNextClick}>
                        Next
                    </Button>
                </div>
            </Container>
        </div>
    );
}

export default CardsView;