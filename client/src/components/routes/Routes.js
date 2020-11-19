import React from 'react'
import Dashboard from '../dashboard/Dashboard'
import { Switch, Route } from 'react-router-dom'
import NotFound from '../misc/NotFound'

const Routes = () => {
  return (
    <section className='content-body'>
      <Switch>
        <Route exact path='/' component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </section>
  )
}

export default Routes
