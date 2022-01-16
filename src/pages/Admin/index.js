import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import Admin from './Admin';

ReactDOM.render(<Admin />, document.getElementById('root'));

serviceWorker.unregister();
