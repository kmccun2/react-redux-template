import React from 'react'
import Dashboard from '../dashboard/Dashboard'
import { Switch, Route } from 'react-router-dom'
import Reports from '../reports/Reports'
import NotFound from '../misc/NotFound'
import AllDormant from '../reports/AllDormant'
import SpoolProf from '../spool/SpoolProf'
import Filters from '../filters/Filters'

const Routes = () => {
  return (
    <section className='content-body'>
      <Switch>
        <Route exact path='/' component={Dashboard} />
        <Route exact path='/reports/:job' component={Reports} />
        <Route exact path='/dormant' component={AllDormant} />
        <Route exact path='/spool/:id' component={SpoolProf} />
        <Route exact path='/filters' component={Filters} />
        <Route component={NotFound} />
      </Switch>
    </section>
  )
}

export default Routes
