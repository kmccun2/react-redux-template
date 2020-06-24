import { UPDATE_JOB, JOB_ERROR } from '../actions/types'

const initialState = {
  loading: true,
  error: {},
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case UPDATE_JOB:
      return {
        ...state,
        [payload.jobnum]: {
          ...state[payload.jobnum],
          spools: payload.job.spools,
        },
        loading: false,
      }
    case JOB_ERROR:
      return {
        ...state,
        [payload.jobnum]: {},
        loading: false,
      }
    default:
      return state
  }
}
