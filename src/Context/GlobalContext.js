import React, {useState, useReducer} from 'react';

// Firebase
import firebase, { db } from '../services/firebase';
import { randomElementArray } from '../helpers/utils';

export const StateContext = React.createContext(null);
export const DispatchContext = React.createContext(null);
export const MethodContext = React.createContext(null);

const initialLanguages = {
    current: 'en',
    actives: {},
    all: {}
}

function languageReducer(state, action) {
    switch( action.type ) {
        case "CURRENT":
            return {
                ...state,
                current: action.payload
            }

        case "ACTIVES":
            return {
                ...state,
                actives: action.payload
            }
        
        case "ALL":
            return {
                ...state,
                all: action.payload
            }
        case 'UPDATE': {
            return {
                ...state,
                ...action.payload
            }
        }
        default: return state;
    }
}

const initialTopics = {
    all: {},
    normalized: [],
    normalizedMap: {},
}

function topicsReducer(state, action) {
    switch( action.type ) {
        case "ALL":
            return {
                ...state,
                all: action.payload
            }

        case "NORMALIZED":
            return {
                ...state,
                normalized: action.payload
            }
        
        case "NORMALIZED_MAP":
            return {
                ...state,
                normalizedMap: action.payload
            }

        case 'UPDATE': {
            return {
                ...state,
                ...action.payload
            }
        }

        default: return state;
    }
}

const initialDifficulties = {
    all: {},
    normalized: [],
    normalizedMap: {},
}

function difficultiesReducer(state, action) {
    switch( action.type ) {
        case "ALL":
            return {
                ...state,
                all: action.payload
            }

        case "NORMALIZED":
            return {
                ...state,
                normalized: action.payload
            }
        
        case "NORMALIZED_MAP":
            return {
                ...state,
                normalizedMap: action.payload
            }

        case 'UPDATE':
            return {
                ...state,
                ...action.payload
            }
        
        default: return state;
    }
}

const initialQuestions = {
    all: {},
    translations: {},
    normalized: [],
    normalizedMap: {},
}

function questionsReducer(state, action) {
    switch( action.type ) {
        case "ALL":
            return {
                ...state,
                all: action.payload
            }

        case "TRANSLATIONS":
            return {
                ...state,
                translations: action.payload
            }

        case "NORMALIZED":
            return {
                ...state,
                normalized: action.payload
            }
        
        case "NORMALIZED_MAP":
            return {
                ...state,
                normalizedMap: action.payload
            }

        case 'UPDATE': {
            return {
                ...state,
                ...action.payload
            }
        }

        default: return state;
    }
}

const initialCard = {
    question: '',
    difficulty: {},
    topic: {},
}

function cardReducer(state, action) {
    switch( action.type ) {
        case "QUESTION":
            return {
                ...state,
                question: action.payload
            }

        case "DIFFICULTY":
            return {
                ...state,
                difficulty: action.payload
            }

        case "TOPIC":
            return {
                ...state,
                topic: action.payload
            }

        case 'UPDATE': {
            return {
                ...state,
                ...action.payload
            }
        }
        
        default: return state;
    }
}

function GlobalContextProvider({children}) {
    
    const [dataIsReady, setDataIsReady] = useState(false);
    const [normalizedDataIsReady, setNormalizedDataIsReady] = useState(false);
    const [history, setHistory] = useState();
    
    const [languages, dispatchLanguages] = useReducer(languageReducer, initialLanguages);
    const [questions, dispatchQuestions] = useReducer(questionsReducer, initialQuestions);
    const [topics, dispatchTopics] = useReducer(topicsReducer, initialTopics);
    const [difficulties, dispatchDifficulties] = useReducer(difficultiesReducer, initialDifficulties);
    const [card, dispatchCard] = useReducer(cardReducer, initialCard);

    React.useEffect(function connectLanguages() {
        const refLanguages = db.ref("languages");
    
        refLanguages.on("value",
        getLanguages,
        function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
    
        function getLanguages(snapshot) {
            const languages = snapshot.val();
            dispatchLanguages({
                type: 'UPDATE',
                payload: {
                    actives: languages.actives,
                    all: languages.isoLangs,
                }
            })
        }
    
        return function disconnectLanguages() {
          refLanguages.off("value", getLanguages);
        }
    
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    React.useEffect( function connectQuestions() {
        const refMainData = db.ref('app/main');

        function getMainData(snapshot) {
            const data = snapshot.val();
            dispatchQuestions({type: 'ALL', payload: data.questions});
        }

        refMainData.on("value",
            getMainData,
            (errorObject) => {
                console.log("The read failed: " + errorObject.code);
            }
        )

        return function disconnectQuestions() {
            refMainData.off('value', getMainData);
        }
    }, [])
    
    React.useEffect(function connectTranslations() {
        const refDataLanguage = db.ref(`app/${languages.current}`);

        function getData(snapshot) {
            const data = snapshot.val();
            dispatchQuestions({type: 'TRANSLATIONS', payload: data.questions});

            dispatchTopics({
                type: 'ALL',
                payload: data.topics
            });

            
            dispatchDifficulties({
                type: 'ALL',
                payload: data.difficulties
            });
            
            dispatchCard({
                type: 'UPDATE',
                payload: {
                    topic: initialFilter(data.topics),
                    difficulty: initialFilter(data.difficulties),
                }
            });
        }

        refDataLanguage.on("value",
            getData,
            (errorObject) => {
                console.log("The read failed: " + errorObject.code);
            }
        )

        return function disconnectTranslations() {
            refDataLanguage.off("value", getData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [languages.current])

    React.useEffect(function normalizeQuestions() {
        if (dataIsReady && Object.entries(card.topic).length > 0 && Object.entries(card.difficulty).length > 0) {
            let normalizedQuestions = [];
            let normalizedQuestionsMap = {};

            for (const questionId in questions.translations) {
                const question = questions.all[questionId];
                if (card.topic[question.topicId] && card.difficulty[question.difficulty]) {
                    normalizedQuestions.push({
                        ...question,
                        question: questions.translations[questionId].question,
                        questionId: questionId
                    })
                }
            }

            normalizedQuestions.sort(function (a, b) {
                if (topics.all[a.topicId].name > topics.all[b.topicId].name) {
                    return 1;
                }
                if (topics.all[a.topicId].name < topics.all[b.topicId].name) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });

            normalizedQuestions.forEach((value, index) => {
                value.index = index;
                normalizedQuestionsMap[value.questionId] = {
                    ...value,
                    index
                };
            });

            dispatchQuestions({
                type: 'UPDATE',
                payload: {
                    normalized: normalizedQuestions,
                    normalizedMap: normalizedQuestionsMap
                }
            });
        }

    }, [card.difficulty, card.topic, dataIsReady, questions.all, questions.translations, topics.all]);

    React.useEffect(function normalizeTopics() {
        if (dataIsReady) {
            let normalizedTopics = [];
            let normalizedTopicsMap = {};

            for (const topicId in topics.all) {
                const topic = topics.all[topicId];
                normalizedTopics.push({
                    ...topic,
                    id: topicId,
                });
            }

            normalizedTopics.sort(function (a, b) {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });

            normalizedTopics.forEach((value, index) => {
                value.index = index;
                normalizedTopicsMap[value.id] = {
                    ...value,
                    idNormalized: index,
                };
            });

            dispatchTopics({
                type: 'UPDATE',
                payload: {
                    normalized: normalizedTopics,
                    normalizedMap: normalizedTopicsMap
                }
            })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topics.all, dataIsReady]);
    
    React.useEffect(function checkIfDataIsReady() {
        const condition = (
            Object.values(languages.all).length > 0 &&
            Object.values(questions.translations).length > 0 &&
            Object.values(questions.all).length > 0 &&
            Object.values(topics.all).length > 0 &&
            Object.values(difficulties.all).length > 0
        );

        if (condition) {
            setDataIsReady(true)
        } else {
            setDataIsReady(false)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulties.all, languages.all, questions.translations, questions.all, topics.all]);

    React.useEffect( function checkIfNormalizedDataIsReady() {
        const condition = (
          Object.entries(questions.normalized).length > 0 &&
          Object.entries(questions.normalizedMap).length > 0 &&
          Object.entries(topics.normalized).length > 0 &&
          Object.entries(topics.normalizedMap).length > 0 &&
          Object.entries(difficulties.normalized).length > 0 &&
          Object.entries(difficulties.normalizedMap).length > 0
        );
    
        if(condition) {
          setNormalizedDataIsReady(true);
        } else {
          setNormalizedDataIsReady(false);
        }
    
      },[questions.normalized, questions.normalizedMap, difficulties.normalized, difficulties.normalizedMap, topics.normalized, topics.normalizedMap]);

    React.useEffect(function normalizeDifficulties() {
        if (dataIsReady) {
            let normalizedDifficulties = [];
            let normalizedDifficultiesMap = {};

            for (const difficultyId in difficulties.all) {
                const topic = difficulties.all[difficultyId];
                normalizedDifficulties.push({
                    ...topic,
                    id: difficultyId,
                });
            }

            normalizedDifficulties.sort(function (a, b) {
                if (a.id > b.id) {
                    return 1;
                }
                if (a.id < b.id) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });

            normalizedDifficulties.forEach((value, index) => {
                value.index = index;
                normalizedDifficultiesMap[value.id] = {
                    ...value,
                    idNormalized: index,
                };
            });

            dispatchDifficulties({
                type: 'UPDATE',
                payload: {
                    normalized: normalizedDifficulties,
                    normalizedMap: normalizedDifficultiesMap
                }
            })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulties.all, dataIsReady]);


  function initialFilter(elements) {
      const result = {};

      for (const id in elements) {
          if (elements.hasOwnProperty(id)) {
              result[id] = true;
          }
      }

      return result;
  }

    function resetData() {
        if (dataIsReady) {
            dispatchCard({
                type: 'UPDATE',
                payload: {
                    question: '',
                    difficulty: initialFilter(difficulties.all),
                    topic: initialFilter(topics.all)
                }
            });
        }
    }

    function createNewParty() {
        resetData();
        if (normalizedDataIsReady) {
            const refParties = db.ref(`parties`);
            const newRefParty = refParties.push();
            history.push(`/room/${newRefParty.key}`)
            let newQuestion = randomElementArray(questions.normalized);

            newRefParty.set({
                currentQuestion: newQuestion.questionId,
                difficulties: initialFilter(difficulties.all),
                topics: initialFilter(topics.all),
                timeStamp: firebase.database.ServerValue.TIMESTAMP
            });
        }
    }

    function randomCard() {
        resetData();
        history.push(`/random`);
    }

    const state = {
        languages,
        questions,
        topics,
        difficulties,
        card,
        dataIsReady,
        normalizedDataIsReady,
    }

    const dispatch = {
        dispatchLanguages,
        dispatchQuestions,
        dispatchTopics,
        dispatchDifficulties,
        dispatchCard,
        setDataIsReady,
        setNormalizedDataIsReady,
        setHistory,
    }

    const methods = {
        randomCard,
        initialFilter,
        createNewParty
    }

    return (
        <MethodContext.Provider value={methods}>
            <DispatchContext.Provider value={dispatch}>
                <StateContext.Provider value={state}>
                    {children}
                </StateContext.Provider>
            </DispatchContext.Provider>
        </MethodContext.Provider>
    )
}

export default GlobalContextProvider
