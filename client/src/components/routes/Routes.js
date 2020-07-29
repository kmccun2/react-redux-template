import React, { useEffect } from 'react'
import Dashboard from '../dashboard/Dashboard'
import { Switch, Route } from 'react-router-dom'
import Reports from '../reports/Reports'
import NotFound from '../misc/NotFound'
import AllDormant from '../reports/AllDormant'
import SpoolProf from '../spool/SpoolProf'
import Filters from '../filters/Filters'
import Download from '../misc/Download'
import { updateJobs } from '../../actions/jobs'
import { connect } from 'react-redux'
import Discrepancies from '../discrepancies/Discrepancies'

const Routes = ({ jobnums, updateJobs, jobs }) => {
  useEffect(() => {
    updateJobs(jobnums)
  }, [jobnums, updateJobs])
  return (
    <section className='content-body'>
      <Switch>
        <Route exact path='/' component={Dashboard} />
        <Route exact path='/reports/:job' component={Reports} />
        <Route exact path='/dormant' component={AllDormant} />
        <Route exact path='/spool/:id' component={SpoolProf} />
        <Route exact path='/filters' component={Filters} />
        <Route exact path='/download' component={Download} />
        <Route exact path='/discrepancies' component={Discrepancies} />
        <Route component={NotFound} />
      </Switch>
    </section>
  )
}

const mapStateToProps = (state) => ({
  jobnums: state.jobs.jobnums,
  jobs: state.jobs.jobs,
})

export default connect(mapStateToProps, { updateJobs })(Routes)
