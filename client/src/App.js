import React, { Fragment } from 'react'
import Dashboard from './components/dashboard/Dashboard'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Routes from '../src/components/routes/Routes'
import { Provider } from 'react-redux'
import store from './store'
import './my.scss'

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <div className='my-container'>
            <Switch>
              <Route exact path='/' component={Dashboard} />
              <Route component={Routes} />
            </Switch>
          </div>
        </Fragment>
      </Router>
    </Provider>
  )
}

export default App
