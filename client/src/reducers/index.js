import { combineReducers } from 'redux'
import alert from './alert'
import dormant from './dormant'
import job from './job'

export default combineReducers({
  alert,
  dormant,
  job,
})
