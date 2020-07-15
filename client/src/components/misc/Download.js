import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import Loading from '../../components/misc/Loading'

const Download = ({ loading }) => {
  return (
    <Fragment>
      {loading ? (
        <Loading message='Updating job...' />
      ) : (
        <div className='msg'>
          Job downloaded! Save file to the job folder as "job.json".
        </div>
      )}
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  loading: state.job.loading,
})

export default connect(mapStateToProps)(Download)
