import React from 'react'
import Dashboard from '../dashboard/Dashboard'
import { Switch, Route } from 'react-router-dom'
import Reports from '../reports/Reports'
import NotFound from '../misc/NotFound'

const Routes = () => {
  return (
    <section className='content-body'>
      <Switch>
        <Route exact path='/' component={Dashboard} />
        <Route exact path='/reports/:job' component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </section>
  )
}

export default Routes
