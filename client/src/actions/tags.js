import axios from 'axios'
import { COMPARE_TAGS } from './types'

// SET LOADING TO TRUE
export const compareTags = (job) => async (dispatch) => {
  console.log('dogs')
  // GRAB CLIENT TAGS
  const res = await axios.get('/api/tags/client/' + job.jobnum)
  let client_tags_csv = res.data

  // FIND HEADERS FROM LINELIST CSV
  let lines = client_tags_csv.split('\n')
  let header = lines[0]
  let headers = header.split(',')

  // FIND FIRST ROW OF SPOOLS
  let count = 1
  let first_row = undefined

  console.log(headers)

  dispatch({
    type: COMPARE_TAGS,
  })
}
