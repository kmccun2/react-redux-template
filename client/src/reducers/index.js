import { combineReducers } from 'redux'
import jobs from './jobs'
import job from './job'
import compareItems from './compareItems'

export default combineReducers({
  jobs,
  job,
  compareItems,
})
