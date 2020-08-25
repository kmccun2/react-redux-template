import {
  JOBS_ERROR,
  SET_JOBS_LOADING,
  UPDATE_JOBS,
  GET_ITEMS,
} from '../actions/types'

const initialState = {
  loading: false,
  jobnums: ['7052'],
  // jobnums: ['7052', '6973', '6951', '6112'],
  all_shops: ['', 'BR', 'PA', 'TX', 'M'],
  all_statuses: [
    'Not Workable',
    'Workable',
    'Issued',
    'Welded Out',
    'Ready to Ship to Coating',
    'Shipped to Coating',
    'Ready to Deliver',
    'Delivered',
    'On Hold',
  ],
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
    case UPDATE_JOBS:
      return {
        ...state,
        jobs: payload.jobs,
        dormant: payload.dormant,
        all_spools: payload.all_spools.sort((a, b) =>
          a.spool > b.spool ? 1 : b.spool > a.spool ? -1 : 0
        ),
        all_materials: payload.all_materials.sort(),
        all_priorities: payload.all_priorities.sort(),
        discrepancies: payload.discrepancies,
        loading: false,
      }
    case GET_ITEMS:
      return {
        ...state,
        profspool: payload,
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
