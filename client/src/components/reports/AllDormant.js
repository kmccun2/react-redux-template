import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setJobsLoading, updateDormant } from '../../actions/dormant'
import Loading from '../misc/Loading'

const AllDormant = ({
  all_spools,
  loading,
  setJobsLoading,
  jobnums,
  updateDormant,
}) => {
  useEffect(() => {
    setJobsLoading()
    updateDormant(jobnums)
  }, [])

  useEffect(() => {}, [all_spools])

  return (
    <div className='dormant-container'>
      {loading ? (
        <Loading message='Fetching data from database...' />
      ) : // <Dormant dormant={dormant} />
      null}
    </div>
  )
}
const mapStateToProps = (state) => ({
  jobnums: state.dormant.jobnums,
  loading: state.dormant.loading,
  dormant: state.dormant.dormant,
  all_spools: state.dormant.all_spools,
})

export default connect(mapStateToProps, { setJobsLoading, updateDormant })(
  AllDormant
)
