import {
  UPDATE_JOB,
  UPDATE_JOB_MATS,
  JOB_ERROR,
  SET_JOB_LOADING,
} from '../actions/types'

const initialState = {
  loading: false,
  job_mats: [],
  error: {},
  dormant: undefined,
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case SET_JOB_LOADING:
      return {
        ...state,
        loading: true,
      }
    case UPDATE_JOB:
      return {
        ...state,
        job: payload.job,
        job_mats: [],
        dormant: payload.dormant,
        loading: false,
      }
    case UPDATE_JOB_MATS:
      return {
        ...state,
        job_mats: [...state.job_mats, payload],
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
