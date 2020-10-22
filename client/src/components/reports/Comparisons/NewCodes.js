import React, { useEffect } from 'react'
import { newCodes } from '../../../actions/newCodes'
import { connect } from 'react-redux'

const NewCodes = ({ newCodes }) => {
  useEffect(() => {
    newCodes()
  }, [])
  return <div></div>
}

const mapStateToProps = (state) => ({})

export default connect(mapStateToProps, { newCodes })(NewCodes)
