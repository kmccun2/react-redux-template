import { GET_ASSESSMENTS } from '../actions/types'

const initialState = {
  assessments: [],
  loading: true,
  error: {},
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case GET_ASSESSMENTS:
      return {
        ...state,
        assessments: payload,
        loading: false,
      }
    default:
      return state
  }
}
