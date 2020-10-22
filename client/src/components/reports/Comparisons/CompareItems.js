import React, { useEffect } from 'react'
import { compareItems } from '../../../actions/compareItems'
import { connect } from 'react-redux'

const CompareItems = ({ compareItems }) => {
  useEffect(() => {
    compareItems()
  }, [])
  return <div></div>
}

const mapStateToProps = (state) => ({})

export default connect(mapStateToProps, { compareItems })(CompareItems)
