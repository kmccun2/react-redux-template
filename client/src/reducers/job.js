import {
  SET_JOB,
  JOB_ERROR,
  SET_JOB_LOADING,
  UPDATE_JOB,
  DOWNLOAD_JOB,
  DOWNLOAD_JOB_LOADING,
} from '../actions/types'

const initialState = {
  loading: false,
  job_mats: [],
  downloading: false,
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
    case SET_JOB:
      return {
        ...state,
        job: payload,
        loading: false,
      }
    case UPDATE_JOB:
      return {
        ...state,
        job: payload.job,
        loading: false,
      }
    case DOWNLOAD_JOB:
      return {
        ...state,
        downloading: false,
      }
    case DOWNLOAD_JOB_LOADING:
      return {
        ...state,
        downloading: true,
      }
    case JOB_ERROR:
      return {
        ...state,
        job: [],
      }
    default:
      return state
  }
}
