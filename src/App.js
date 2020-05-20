import React, {useState} from 'react';
import './App.scss';
import {HashRouter as Router, Route, useHistory} from 'react-router-dom';

// Pages
import Edit from './pages/Edit';
import CardsView from './pages/Cards';
import Landing from './pages/Landing';
import Admin from './pages/Admin';

// Firebase
import { db } from './services/firebase';
import { randomElementArray } from './helpers/utils';

function App() {
  
  return (
    <Router>
      <AppRoutes/>
    </Router>
  );
}

function AppRoutes() {
  const [languageISO, setLanguageISO] = useState('en');
  const [languageActives, setLanguageActives] = useState();
  const [languages, setLanguages] = useState({});

  const [questions, setQuestions] = useState({});

  const [topics, setTopics] = React.useState({});
  const [normalizedTopics, setNormalizedTopics] = React.useState();
  const [normalizedTopicsMap, setNormalizedTopicsMap] = React.useState();

  const [difficulties, setDifficulties] = React.useState({});
  const [normalizedDifficulties, setNormalizedDifficulties] = React.useState();
  const [normalizedDifficultiesMap, setNormalizedDifficultiesMap] = React.useState();

  // Current information of cards
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionsMap, setCurrentQuestionsMap] = useState();
  const [currentQuestion, setCurrentQuestion] = React.useState();
  const [difficultyFilters, setDifficultyFilters] = React.useState();
  const [topicFilters, setTopicFilters] = React.useState();

  const [dataIsReady, setDataIsReady] = useState(false);
  const [normalizedDataIsReady, setNormalizedDataIsReady] = useState(false);

  const history = useHistory();

  React.useEffect(function connectLanguages() {
    const refLanguages = db.ref("languages");

    refLanguages.on("value",
    getLanguages,
    function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    function getLanguages(snapshot) {
      const languages = snapshot.val();
      setLanguageActives(languages.actives);
      setLanguages(languages.isoLangs);
    }

    return function disconnectLanguages() {
      refLanguages.off("value", getLanguages);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect( function connectData() {
    const refData = db.ref(`app/${languageISO}`);

    refData.on("value",
      getData,
      (errorObject) => {
        console.log("The read failed: " + errorObject.code);
      }
    )
  
    function getData(snapshot) {
      const data = snapshot.val();
      setQuestions(data.questions);

      setTopics(data.topics);
      setTopicFilters(initialFilter(data.topics));
      
      setDifficulties(data.difficulties);
      setDifficultyFilters(initialFilter(data.difficulties));
    }

    return function disconnectData() {
      refData.off("value", getData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageISO]);

  React.useEffect(function normalizeQuestions() {
    if( dataIsReady && topicFilters && difficultyFilters) {
      let normalizedQuestions = [];
      let normalizedQuestionsMap = {};

      for (const questionId in questions) {
        const question = questions[questionId];
        if( topicFilters[question.topicId] && difficultyFilters[question.difficulty]) {
          normalizedQuestions.push({
            ...question,
            questionId: questionId
          })
        }
      }

      normalizedQuestions.sort(function (a, b) {
        if (topics[a.topicId].name > topics[b.topicId].name) {
          return 1;
        }
        if (topics[a.topicId].name < topics[b.topicId].name) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      normalizedQuestions.forEach( (value, index) => {
        value.index = index;
        normalizedQuestionsMap[value.questionId] = {
          ...value,
          index
        };
      });

      setCurrentQuestions( normalizedQuestions );
      setCurrentQuestionsMap( normalizedQuestionsMap );
    }

  }, [dataIsReady, difficultyFilters, questions, topicFilters, topics]);

  React.useEffect(function normalizeTopics() {
    if( dataIsReady ) {
      let normalizedTopics = [];
      let normalizedTopicsMap = {};

      for (const topicId in topics) {
        const topic = topics[topicId];
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

      normalizedTopics.forEach( (value, index) => {
        value.index = index;
        normalizedTopicsMap[value.id] = {
          ...value,
          idNormalized: index,
        };
      });

      setNormalizedTopics( normalizedTopics );
      setNormalizedTopicsMap( normalizedTopicsMap );
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics, dataIsReady]);

  React.useEffect(function normalizeDifficulties() {
    if( dataIsReady ) {
      let normalizedDifficulties = [];
      let normalizedDifficultiesMap = {};

      for (const difficultyId in difficulties) {
        const topic = difficulties[difficultyId];
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

      normalizedDifficulties.forEach( (value, index) => {
        value.index = index;
        normalizedDifficultiesMap[value.difficultyId] = {
          ...value,
          idNormalized: index,
        };
      });

      setNormalizedDifficulties( normalizedDifficulties );
      setNormalizedDifficultiesMap( normalizedDifficultiesMap );
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulties, dataIsReady]);

  React.useEffect(function checkIfDataIsReady() {
    const condition = (
      Object.values(languages).length > 0 &&
      Object.values(questions).length > 0 &&
      Object.values(topics).length > 0 &&
      Object.values(difficulties).length > 0
    );

    if(condition) setDataIsReady(true);
  }, [difficulties, languages, questions, topics]);

  React.useEffect( function checkIfNormalizedDataIsReady() {
    const condition = (
      Object.entries(currentQuestions).length > 0 &&
      currentQuestionsMap &&
      normalizedTopics &&
      normalizedTopicsMap &&
      normalizedDifficulties &&
      normalizedDifficultiesMap
    );

    if(condition) {
      setNormalizedDataIsReady(true);
    } else {
      setNormalizedDataIsReady(false);
    }

  },[currentQuestions, currentQuestionsMap, normalizedDifficulties, normalizedDifficultiesMap, normalizedTopics, normalizedTopicsMap]);

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
      setCurrentQuestion(undefined);
      setDifficultyFilters(initialFilter(difficulties));
      setTopicFilters(initialFilter(topics));
    }
  }

  function createNewParty() {
    resetData();
    if (normalizedDataIsReady) {
      const refParties = db.ref(`parties`);
      const newRefParty = refParties.push();
      history.push(`/room/${newRefParty.key}`)
      let newQuestion = randomElementArray(currentQuestions);

      newRefParty.set({
        currentQuestion: newQuestion.questionId,
        difficulties: initialFilter(difficulties),
        topics: initialFilter(topics)
      });
    }
  }

  function randomCard() {
    resetData();
    history.push(`/random`);
  }

  return <>
    <Route exact path="/">
      <Landing
        dataIsReady={normalizedDataIsReady}
        
        languageISO={languageISO}
        setLanguageISO={setLanguageISO}
        languageActives={languageActives}

        createNewParty={createNewParty}
        randomCard={randomCard}
      />
    </Route>
    <Route exact path="/edit"><Edit/></Route>
    <Route exact path="/admin"><Admin/></Route>
    <Route exact path="/room/:id">
      <CardsView 
        setLanguageISO={setLanguageISO}
        languageISO={languageISO}
        languages={languages}
        languageActives={languageActives}

        questions={questions}

        topics={topics}
        normalizedTopics={normalizedTopics}
        normalizedTopicsMap={normalizedTopicsMap}
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

        dataIsReady={normalizedDataIsReady}
      />
    </Route>
    <Route exact path="/random">
      <CardsView
        setLanguageISO={setLanguageISO}
        languageISO={languageISO}
        languages={languages}
        languageActives={languageActives}

        questions={questions}

        topics={topics}
        normalizedTopics={normalizedTopics}
        normalizedTopicsMap={normalizedTopicsMap}
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

        dataIsReady={normalizedDataIsReady}
      />
    </Route>
  </>;
}

export default App;
