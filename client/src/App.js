import React, { Fragment } from 'react'
import Dashboard from './components/dashboard/Dashboard'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Routes from '../src/components/routes/Routes'
import { Provider } from 'react-redux'
import store from './store'
import './bootstrap.scss'
import './my.scss'
import { FaTruck } from 'react-icons/fa'
import Search from './components/search/Search'
import Navlinks from './components/misc/Navlinks'

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <div className='my-container'>
            <div className='my-header'>
              <Link to='/'>
                <FaTruck
                  color='white'
                  size={30}
                  style={{ marginRight: 13, marginTop: -9 }}
                />
                <span className='header-item company-name'>
                  Performance Hub
                </span>
              </Link>
              <Search />
            </div>
            <Navlinks />
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
