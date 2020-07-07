import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux'

const Search = ({ loading, jobnums }) => {
  const [formData, setFormData] = useState({
    spoolname: '',
  })

  const { spoolname } = formData

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })
  console.log(spoolname)

  return (
    <Fragment>
      {loading === false && jobnums !== [] && (
        <input
          className='header-item spool-search'
          placeholder='Search spools...'
          value={spoolname}
          onChange={(e) => onChange(e)}
        ></input>
      )}
    </Fragment>
  )
}
const mapStateToProps = (state) => ({
  loading: state.dormant.loading,
  jobnums: state.dormant.jobnums,
})

export default connect(mapStateToProps)(Search)
