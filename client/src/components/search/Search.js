import React from 'react'
import { connect } from 'react-redux'

const Search = () => {
  return (
    <input
      className='header-item spool-search'
      placeholder='Search spools...'
    ></input>
  )
}
const mapStateToProps = (state) => ({
  job: state.jobs.job,
})

export default connect(mapStateToProps)(Search)
