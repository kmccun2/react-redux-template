import {} from '../actions/types'

const initialState = {
  loading: false,
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    default:
      return state
  }
}
