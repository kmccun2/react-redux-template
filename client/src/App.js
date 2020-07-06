import React, { Fragment, useState } from 'react'
import Dashboard from './components/dashboard/Dashboard'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Routes from '../src/components/routes/Routes'
import { Provider } from 'react-redux'
import store from './store'
import './bootstrap.scss'
import './my.scss'
import ReportsDD from './components/misc/ReportsDD'
import Search from './components/search/Search'

const App = () => {
  const [showJobs, setShowJobs] = useState(false)
  const handleReportsTab = () => {
    if (showJobs) {
      setShowJobs(false)
    } else {
      setShowJobs(true)
    }
  }

  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <div className='my-container'>
            <div className='my-header'>
              <span className='header-item company-name'>
                Performance Contractors
              </span>
              <Search />
            </div>
            <div className='my-subheader'>
              <div
                className='subheader-item'
                onClick={() => handleReportsTab()}
              >
                <span>Job Reports</span>
                <ReportsDD show={showJobs} />
              </div>
              <div className='subheader-item'>Dormant Data</div>
              <div className='subheader-item'>Descrepancies</div>
              <div className='subheader-item'>Support Comparison</div>
            </div>
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
