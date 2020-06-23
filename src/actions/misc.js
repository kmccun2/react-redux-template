import { SET_ACTIVE } from './types'

// Get assessments
export const getAssessments = () => async (dispatch) => {
  //   try {
  //     const res = await axios.get('/api/assessment')
  //     dispatch({
  //       type: GET_ASSESSMENTS,
  //       payload: res.data,
  //     })
  //   } catch (err) {
  //     dispatch({
  //       type: ASSESSMENT_ERROR,
  //       payload: { msg: err.response.statusText, status: err.response.status },
  //     })
  //   }
}

export const setActive = (page) => (dispatch) => {
  dispatch({
    type: SET_ACTIVE,
    payload: page,
  })
}
