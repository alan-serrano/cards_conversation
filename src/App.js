import React from 'react';
import './App.scss';
import {BrowserRouter as Router, Route} from 'react-router-dom';

// Pages
import Edit from './pages/Edit';
import Party from './pages/Party';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <AppRoutes/>
    </Router>
  );
}

function AppRoutes() {
  return <>
    <Route exact path="/"><Landing/></Route>
    <Route exact path="/edit"><Edit/></Route>
    <Route exact path="/party/:id"><Party/></Route>
  </>;
}

export default App;
