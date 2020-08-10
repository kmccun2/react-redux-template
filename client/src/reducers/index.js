import { combineReducers } from 'redux'
import jobs from './jobs'
import job from './job'
import compareTags from './compareTags'

export default combineReducers({
  jobs,
  job,
  compareTags,
})
