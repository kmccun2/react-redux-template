import {
  JOBS_ERROR,
  SET_JOBS_LOADING,
  UPDATE_JOB_SPOOLS,
  UPDATE_DORMANT,
} from '../actions/types'

const initialState = {
  loading: false,
  jobnums: ['6951', '6973'],
  all_spools: [],
  dormant: undefined,
  error: {},
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case SET_JOBS_LOADING:
      return {
        ...state,
        loading: true,
      }
    case UPDATE_JOB_SPOOLS:
      return {
        ...state,
        dormant: payload.dormant,
        all_spools: payload.all_spools,
      }
    case UPDATE_DORMANT:
      return {
        ...state,
        dormant: payload.dormant,
        loading: false,
      }
    case JOBS_ERROR:
      return {
        ...state,
        jobs: [],
        loading: false,
      }
    default:
      return state
  }
}
