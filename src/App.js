import React from 'react'
import Dashboard from './components/dashboard/Dashboard'

// Redux
import { Provider } from 'react-redux'
import store from './store'

import './bootstrap.scss'
import './my.scss'

const App = () => {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  )
}

export default App
