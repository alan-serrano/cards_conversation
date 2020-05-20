import React, {useEffect} from 'react';
import { useParams } from "react-router-dom";
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

function CardsView(props) {
    const {
        setLanguageISO,
        languageISO,
        languages,
        languageActives,

        questions,

        topics,
        normalizedTopics,
        normalizedTopicsMap,
        topicFilters,
        setTopicFilters,
        
        difficulties,
        normalizedDifficulties,
        normalizedDifficultiesMap,
        difficultyFilters,
        setDifficultyFilters,

        currentQuestions,
        currentQuestionsMap,
        currentQuestion,
        setCurrentQuestion,

        dataIsReady
    } = props;

    const {id} = useParams();

    const classes = useStyles();

    const [partyIsReady, setPartyIsReady] = React.useState();

    const [currentTopic, setCurrentTopic] = React.useState();

    // Buttons states
    const [isDisabledPrevBtn, setIsDisabledPrevBtn] = React.useState();
    const [isDisabledNextBtn, setIsDisabledNextBt] = React.useState();
    const [isDisabledRandomBtn, setIsDisabledRandomBtn] = React.useState();

    React.useEffect( function checkingIfDataIsReady() {
        setIsDisabledPrevBtn(!dataIsReady);
        setIsDisabledNextBt(!dataIsReady);
        setIsDisabledRandomBtn(!dataIsReady);
    },[dataIsReady] );
    

    // Connecting to party
    
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
                    setCurrentQuestion(party.currentQuestion);
                    setCurrentTopic(questions[party.currentQuestion].topicId)
                    setDifficultyFilters(party.difficulties);
                    setTopicFilters(party.topics);
                    setPartyIsReady(true);
                }
            }

            return function disconnectParty() {
                refParty.off("value", getParty);
            }
        }
    }, [dataIsReady, id, partyIsReady, questions, setCurrentQuestion, setDifficultyFilters, setTopicFilters]);
    
    React.useEffect( function randomCard(){
        const condition = (
            id === undefined &&
            currentQuestions !== undefined &&
            currentQuestionsMap !== undefined &&
            currentQuestion === undefined
        );
            
        if( condition ) {
            let newQuestion = randomElementArray(currentQuestions);

            setCurrentQuestion(newQuestion.questionId);
            setCurrentTopic(newQuestion.topicId)
        }
    }, [currentQuestion, currentQuestions, currentQuestionsMap, dataIsReady, id, setCurrentQuestion]);

    React.useEffect(function updateAfterChangeFilters() {
        if( currentQuestion !== undefined && dataIsReady && !currentQuestionsMap.hasOwnProperty(currentQuestion)) {
            if (id !== undefined) {
                const refcurrentQuestionParty = db.ref(`parties/${id}/currentQuestion`);
                let newQuestion= randomElementArray(currentQuestions);
                refcurrentQuestionParty.set(newQuestion.questionId)
                
            } else {
                let newQuestion = randomElementArray(currentQuestions);
    
                setCurrentQuestion(newQuestion.questionId);
                setCurrentTopic(newQuestion.topicId)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestions, currentQuestionsMap, currentQuestion]);

    // Handlers
    function onUpdateCard() {
        if (id !== undefined && dataIsReady) {
            setIsDisabledRandomBtn(true);
            const refcurrentQuestionParty = db.ref(`parties/${id}/currentQuestion`);

            let newQuestion= randomElementArray(currentQuestions);
            refcurrentQuestionParty.set(newQuestion.questionId, (error) => {
                if(!error) {
                    setIsDisabledRandomBtn(false);
                }
            })
            
        } else if(dataIsReady) {
            let newQuestion = randomElementArray(currentQuestions);

            setCurrentQuestion(newQuestion.questionId);
            setCurrentTopic(newQuestion.topicId)
        }
        
    }

    function handleNextClick() {
        if (id !== undefined && dataIsReady) {
            setIsDisabledNextBt(true);
            const refcurrentQuestionParty = db.ref(`parties/${id}/currentQuestion`);
            let currentQuestionInfo = currentQuestionsMap[currentQuestion]
            let nextQuestionInfo = currentQuestionInfo.index + 1 < currentQuestions.length ?
                currentQuestions[currentQuestionInfo.index + 1] :
                currentQuestions[0];

            refcurrentQuestionParty.set(nextQuestionInfo.questionId, (error) => {
                if(!error) {
                    setIsDisabledNextBt(false);
                }
            })
            
        } else if(dataIsReady) {
            let currentQuestionInfo = currentQuestionsMap[currentQuestion]
            let nextQuestionInfo = currentQuestionInfo.index + 1 < currentQuestions.length ?
                currentQuestions[currentQuestionInfo.index + 1] :
                currentQuestions[0];
            setCurrentQuestion(nextQuestionInfo.questionId);
            setCurrentTopic(nextQuestionInfo.topicId);
        }
    }

    function handlePrevClick() {
        // let prevId = question - 1 > 0 ? question - 1 : questions.length - 1;
        if (id !== undefined && dataIsReady) {
            setIsDisabledPrevBtn(true);
            const refcurrentQuestionParty = db.ref(`parties/${id}/currentQuestion`);
            let currentQuestionInfo = currentQuestionsMap[currentQuestion]
            let prevQuestionInfo = currentQuestionInfo.index - 1 > 0 ?
                currentQuestions[currentQuestionInfo.index - 1] :
                currentQuestions[currentQuestions.length - 1];

            refcurrentQuestionParty.set(prevQuestionInfo.questionId, (error) => {
                if(!error) {
                    setIsDisabledPrevBtn(false);
                }
            })
            
        } else if(dataIsReady) {
            let currentQuestionInfo = currentQuestionsMap[currentQuestion]
            let prevQuestionInfo = currentQuestionInfo.index + 1 < currentQuestions.length ?
                currentQuestions[currentQuestionInfo.index - 1] :
                currentQuestions[currentQuestions.length - 1];
            setCurrentQuestion(prevQuestionInfo.questionId);
            setCurrentTopic(prevQuestionInfo.topicId);
        }
    }

    return (
        <div className="party-page">
            <Header 
                languages={languages}
                languageActives={languageActives}
                languageISO={languageISO}
                setLanguageISO={setLanguageISO}>
            </Header>
            <Container maxWidth="xs" className="container">
                { id !== undefined &&
                    <CardComponent
                        question={dataIsReady && partyIsReady && currentQuestionsMap[currentQuestion] !== undefined && currentQuestionsMap[currentQuestion].question}
                        title={dataIsReady && partyIsReady && normalizedTopicsMap[currentTopic].name}
                        help={dataIsReady && partyIsReady && normalizedTopicsMap[currentTopic].help}
                        onUpdateCard={onUpdateCard}
                        dataIsReady={dataIsReady}

                        topics={topics}
                        normalizedTopics={normalizedTopics}
                        normalizedTopicsMap={normalizedTopicsMap}
                        setCurrentTopic={setCurrentTopic}
                        topicFilters={topicFilters}
                        setTopicFilters={setTopicFilters}

                        difficulties={difficulties}
                        normalizedDifficulties={normalizedDifficulties}
                        normalizedDifficultiesMap={normalizedDifficultiesMap}
                        difficultyFilters={difficultyFilters}
                        setDifficultyFilters={setDifficultyFilters}

                        currentQuestions={currentQuestions}
                        currentQuestionsMap={currentQuestionsMap}
                        currentQuestion={currentQuestion}
                        setCurrentQuestion={setCurrentQuestion}
                    />
                }

                {id === undefined &&
                    <CardComponent
                        question={currentQuestionsMap && currentQuestion && currentQuestionsMap[currentQuestion] && currentQuestionsMap[currentQuestion].question}
                        title={currentQuestionsMap && currentTopic && topics[currentTopic] && topics[currentTopic].name}
                        help={currentQuestionsMap && currentTopic && topics[currentTopic] &&topics[currentTopic].help}
                        onUpdateCard={onUpdateCard}
                        dataIsReady={dataIsReady}

                        topics={topics}
                        normalizedTopics={normalizedTopics}
                        normalizedTopicsMap={normalizedTopicsMap}
                        setCurrentTopic={setCurrentTopic}
                        topicFilters={topicFilters}
                        setTopicFilters={setTopicFilters}

                        difficulties={difficulties}
                        normalizedDifficulties={normalizedDifficulties}
                        normalizedDifficultiesMap={normalizedDifficultiesMap}
                        difficultyFilters={difficultyFilters}
                        setDifficultyFilters={setDifficultyFilters}

                        currentQuestions={currentQuestions}
                        currentQuestionsMap={currentQuestionsMap}
                        currentQuestion={currentQuestion}
                        setCurrentQuestion={setCurrentQuestion}
                    />
                }

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