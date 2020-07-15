import React, { Fragment, useState, useEffect } from 'react'
import { MdCancel } from 'react-icons/md'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

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

    // MUST MATCH STARTING WITH FIRST CHARACTER
    //   setFilteredSpools(
    //     all_spools.filter(
    //       (each) =>
    //         each.spool.slice(0, spoolname.length).toUpperCase() ===
    //         spoolname.toUpperCase()
    //     )
    //   )
    // }
    if (spoolname[spoolname.length - 1] === ' ') {
      setFilteredSpools(
        all_spools.filter(
          (each) =>
            each.spool.slice(0, spoolname.length).toUpperCase() ===
              spoolname.slice(0, spoolname.length - 1).toUpperCase() &&
            each.spool.length === spoolname.length - 1
        )
      )
    }
  }, [spoolname, all_spools, filteredSpools])

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
            <Link key={spool.piecemark} to={'/spool/' + spool.piecemark}>
              <div
                onClick={() => setFormData({ ...formData, spoolname: '' })}
                key={spool.piecemark}
                className='search-item'
              >
                {spool.spool}
                <div className='search-job'>
                  {spool.client} {spool.jobnum}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Fragment>
  )
}
const mapStateToProps = (state) => ({
  loading: state.jobs.loading,
  jobnums: state.jobs.jobnums,
  all_spools: state.jobs.all_spools,
})

export default connect(mapStateToProps)(Search)
