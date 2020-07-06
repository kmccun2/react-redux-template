import { combineReducers } from 'redux'
import alert from './alert'
import jobs from './jobs'
import job from './job'

export default combineReducers({
  alert,
  jobs,
  job,
})
