import { ADD_MATCH, COMPARE_ITEMS } from '../actions/types'

const initialState = {
  loading: false,
  sp_items: [],
  po_items: [],
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case COMPARE_ITEMS:
      return {
        ...state,
        loading: false,
        sp_items: payload.sp_items,
        po_items: payload.po_items,
        sp_headers: payload.sp_headers,
        po_headers: payload.po_headers,
        discrepancies: payload.discrepancies,
      }
    case ADD_MATCH:
      return {
        ...state,
        loading: false,
        sp_items: payload.sp_items,
        po_items: payload.po_items,
        discrepancies: payload.discrepancies,
      }
    default:
      return state
  }
}
