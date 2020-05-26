import React, { useContext } from 'react';
import './App.scss';
import {HashRouter as Router, Route, useHistory} from 'react-router-dom';
import { DispatchContext } from './Context/GlobalContext';

// Pages
import Edit from './pages/Edit';
import CardsView from './pages/Cards';
import Landing from './pages/Landing';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <AppRoutes/>
    </Router>
  );
}

function AppRoutes() {
  const {setHistory} = useContext(DispatchContext);
  const history = useHistory();

  React.useEffect( function shareHistoryWithGlobalContext() {
    setHistory(history)
  }, [history, setHistory] );

  return <>
    <Route exact path="/">
      <Landing/>
    </Route>
    <Route exact path="/edit"><Edit/></Route>
    <Route exact path="/admin"><Admin/></Route>
    <Route exact path={["/room/:id", "/random"]}>
      <CardsView />
    </Route>
  </>;
}

export default App;
