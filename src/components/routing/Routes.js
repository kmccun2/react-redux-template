import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Feed from '../feed/Feed'
import NotFound from '../misc/NotFound'

const Routes = ({ setActive, getProfiles }) => {
  const handleChange = () => {
    if (window.location.pathname.includes('feed')) {
      setActive('feed')
    } else if (window.location.pathname.includes('search')) {
      setActive('search')
    } else if (window.location.pathname.includes('leaderboards')) {
      setActive('leaderboards')
    } else if (window.location.pathname.includes('notifications')) {
      setActive('notifications')
    } else if (window.location.pathname.includes('/profile')) {
      setActive('profile')
    } else if (window.location.pathname.includes('newassessment')) {
      setActive('newassessment')
      getProfiles()
    } else if (window.location.pathname.includes('edit-profile')) {
      setActive('')
    } else {
      setActive('')
    }
  }
  return (
    <section className='container'>
      <Switch>
        <Route
          exact
          path='/dashboard/feed'
          component={Feed}
          onChange={handleChange()}
        />
        <Route component={NotFound} />
      </Switch>
    </section>
  )
}

export default Routes
