import { combineReducers } from 'redux'
import alert from './alert'
import jobs from './jobs'

export default combineReducers({
  alert,
  jobs,
})
