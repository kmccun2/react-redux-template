import React, { useEffect } from 'react'
import { Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'

// COMPONENTS
import Dashboard from '../dashboard/Dashboard'
import Reports from '../reports/Reports'
import NotFound from '../misc/NotFound'

const Routes = () => {
  return (
    <section className='content-body'>
      <Switch>
        <Route exact path='/' component={Dashboard} />
        <Route exact path='/reports/:player_id' component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </section>
  )
}

export default Routes
