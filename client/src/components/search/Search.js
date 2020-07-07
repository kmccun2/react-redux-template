import React, { Fragment, useState, useEffect } from 'react'
import { MdCancel } from 'react-icons/md'
import { connect } from 'react-redux'

const Search = ({ loading, jobnums, all_spools }) => {
  const [filteredSpools, setFilteredSpools] = useState([])
  const [formData, setFormData] = useState({
    spoolname: '',
  })

  const { spoolname } = formData

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // FILTER SPOOLS
  useEffect(() => {
    if (spoolname === '') {
      setFilteredSpools([])
    } else {
      setFilteredSpools(
        all_spools.filter((each) =>
          each.spool.toUpperCase().includes(spoolname.toUpperCase())
        )
      )
    }
    console.log(spoolname)
  }, [spoolname])

  return (
    <Fragment>
      {jobnums !== [] && (
        <Fragment>
          <div className='search-box' style={{ display: 'flex' }}>
            <input
              className='header-item spool-search'
              placeholder='Search spools...'
              name='spoolname'
              value={spoolname}
              onChange={(e) => onChange(e)}
            ></input>
            <MdCancel
              size={19}
              color='#9c9c9c'
              style={{
                position: 'absolute',
                marginLeft: 196,
                marginTop: 7,
                display: spoolname === '' ? 'none' : 'flex',
                cursor: 'pointer',
              }}
              onClick={() => setFormData({ ...formData, spoolname: '' })}
            />
          </div>
        </Fragment>
      )}
      {filteredSpools.length > 0 && (
        <div className='list-of-spools'>
          {filteredSpools.map((spool) => (
            <div className='search-item'>
              {spool.spool}
              <div className='search-job'>
                {spool.client} {spool.jobnum}
              </div>
            </div>
          ))}
        </div>
      )}
    </Fragment>
  )
}
const mapStateToProps = (state) => ({
  loading: state.dormant.loading,
  jobnums: state.dormant.jobnums,
  all_spools: state.dormant.all_spools,
})

export default connect(mapStateToProps)(Search)
