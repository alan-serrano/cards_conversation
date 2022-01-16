import React, { useEffect, useContext } from 'react';
import { Router } from 'react-router-dom';
import { MethodContext, DispatchContext } from '../../Context/GlobalContext';
import { createBrowserHistory } from 'history';
import { Chart } from 'react-chartjs-2';
import { ThemeProvider } from '@material-ui/core/styles';
import validate from 'validate.js';

import { chartjs } from './helpers';
import theme from './theme';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './assets/scss/index.scss';
import validators from './common/validators';
import AdminRoutes from './Admin.Routes';

import { db } from '../../services/firebase';

Chart.helpers.extend(Chart.elements.Rectangle.prototype, {
  draw: chartjs.draw
});

validate.validators = {
  ...validate.validators,
  ...validators
};

export default function Admin() {
  const {dispatchAdmin} = useContext(DispatchContext)

  useEffect(function getDataAdmin() {
    const refApp = db.ref("app");
    refApp.on(
      "value",
      getLanguages,
      function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      }
    );

    function getLanguages(snapshot) {
      const app = snapshot.val();
      
      if (app) {
        dispatchAdmin({
          type: 'ADMIN_CARDS',
          payload: createListCards(app)
        });
        
        dispatchAdmin({
          type: 'ADMIN_TOPICS',
          payload: createListTopics(app)
        });
      }
    }

    return function disconnectLanguages() {
      refApp.off("value", getLanguages);
    }

    function createListCards(appData) {

      const cardsList = toArray(appData);

      return cardsList;

      function toArray(appData) {
        const {
          questions,
          difficulties,
          topics
        } = appData.main;
        let result = [];

        for (const questionId in questions) {
          const card = questions[questionId];

          for (const language in card.languages) {
            const additionalData = {};

            if (questions[questionId].languages[language]) {
              additionalData.question = appData[language]['questions'][questionId].question;
            } else if (questions[questionId].languages.en) {
              additionalData.question = appData['en']['questions'][questionId].question;
            } else {
              let otherLanguage = Object.key(questions[questionId].languages)[0];
              additionalData.question = appData[otherLanguage]['questions'][questionId].question;
            }

            if (difficulties[card.difficulty].languages[language]) {
              additionalData.difficulty = appData[language]['difficulties'][card.difficulty].name;
            } else if (difficulties[card.difficulty].languages.en) {
              additionalData.difficulty = appData['en']['difficulties'][card.difficulty].name;
            } else {
              let otherLanguage = Object.key(difficulties[card.difficulty].languages)[0];
              additionalData.difficulty = appData[otherLanguage]['difficulties'][card.difficulty].name;
            }

            if (topics[card.topicId].languages[language]) {
              additionalData.topic = appData[language]['topics'][card.topicId].name;
            } else if (topics[card.topicId].languages.en) {
              additionalData.topic = appData['en']['topics'][card.topicId].name;
            } else {
              let otherLanguage = Object.keys(topics[card.topicId].languages)[0];
              additionalData.topic = appData[otherLanguage]['topics'][card.topicId].name;
            }

            result.push({
              ...card,
              ...additionalData,
              difficultyId: card.difficulty,
              questionId,
              language
            })
          }
        }

        result.sort((a, b) => {
          if (a.topicId > b.topicId) return 1;
          if (a.topicId < b.topicId) return -1;

          if (a.difficultyId > b.difficultyId) return 1;
          if (a.difficultyId < b.difficultyId) return -1;

          if (a.questionId > b.questionId) return 1;
          if (a.questionId < b.questionId) return -1;

          if (a.language > b.language) return 1;
          if (a.language < b.language) return -1;

          return 0;
        });

        result = result.map((val, index) => {
          return {
            ...val,
            index
          }
        });

        return result;
      }
    }
    function createListTopics(appData) {

      const topicsList = toArray(appData);

      return topicsList;

      function toArray(appData) {
        const {
          topics
        } = appData.main;
        let result = [];

        for (const topicId in topics) {
          const topic = topics[topicId];

          for (const language in topic.languages) {
            const additionalData = {};

            additionalData.name = appData[language]['topics'][topicId].name;
            additionalData.help = appData[language]['topics'][topicId].help;

            result.push({
              ...topic,
              ...additionalData,
              topicId,
              language
            })
          }
        }

        result.sort((a, b) => {
          if (a.topicId > b.topicId) return 1;
          if (a.topicId < b.topicId) return -1;
          
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;

          if (a.language > b.language) return 1;
          if (a.language < b.language) return -1;

          return 0;
        });

        result = result.map((val, index) => {
          return {
            ...val,
            index
          }
        });

        return result;
      }
    }
  }, [dispatchAdmin])

    return (
      <ThemeProvider theme={theme}>
        {/* <Router history={browserHistory}> */}
          <AdminRoutes />
        {/* </Router> */}
      </ThemeProvider>
    );
}
