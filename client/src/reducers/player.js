import {
GRAB_PLAYER_DATA
} from '../actions/types'

const initialState = {
players = []
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case GRAB_PLAYER_DATA:
      return {
        ...state,
              }
    case DATA_LOAD_ERROR:
      return {
        ...state,
      }
    default:
      return state
  }
}
