import { COMPARE_ITEMS } from '../actions/types'

const initialState = {
  loading: false,
  sp_items: [],
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case COMPARE_ITEMS:
      return {
        ...state,
        loading: false,
        sp_items: payload.sp_items,
        headers: payload.headers,
      }

    default:
      return state
  }
}
