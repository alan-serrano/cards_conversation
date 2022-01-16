import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

const config = {
    apiKey: "AIzaSyBJmgMqOrcOQBg3-JvswwmqlLCvbIAIoeY",
    authDomain: "cards-conversation-starters.firebaseapp.com",
    databaseURL: "https://cards-conversation-starters.firebaseio.com",
    projectId: "cards-conversation-starters",
    storageBucket: "cards-conversation-starters.appspot.com",
    messagingSenderId: "1037492872627",
    appId: "1:1037492872627:web:9af0f2901b3655cb7357c6",
    measurementId: "G-HSK36FCQYP"
};

firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();
export default firebase;