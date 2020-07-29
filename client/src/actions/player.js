import axios from 'axios'
import { GRAB_PLAYER_DATA } from './types'

// SET LOADING TO TRUE
export const grabPlayerData = () => async (dispatch) => {
  dispatch({
    type: GRAB_PLAYER_DATA,
  })
}
