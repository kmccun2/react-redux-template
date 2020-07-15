import React, { Fragment, useEffect, useState } from 'react'
import FilterForms from './FilterForms'
import { connect } from 'react-redux'
import Loading from '../misc/Loading'
import { CSVLink } from 'react-csv'

const Filters = ({
  all_spools,
  dormant,
  jobnums,
  all_shops,
  all_materials,
  all_priorities,
  all_statuses,
}) => {
  const [paramJobs, setParamJobs] = useState(undefined)
  const [paramMaterials, setParamMaterials] = useState(undefined)
  const [paramPriorities, setParamPriorities] = useState(undefined)
  const [paramStatuses, setParamStatuses] = useState(undefined)
  const [paramShops, setParamShops] = useState(undefined)
  const [filtSpools, setFiltSpools] = useState([])

  // CREATE PARAMETER LISTS
  useEffect(() => {
    if (dormant !== undefined) {
      setParamJobs(jobnums)
      setParamMaterials(all_materials)
      setParamShops(all_shops)
      setParamPriorities(all_priorities)
      setParamStatuses(all_statuses)
    }
  }, [dormant, jobnums, all_materials, all_shops, all_priorities, all_statuses])

  // CREATE FILTERED SPOOLS LIST
  useEffect(() => {
    if (
      all_spools !== [] &&
      paramJobs !== undefined &&
      paramMaterials !== undefined &&
      paramShops !== undefined &&
      paramPriorities !== undefined &&
      paramStatuses !== undefined
    ) {
      setFiltSpools(
        all_spools.filter(
          (spool) =>
            paramJobs.includes(spool.jobnum) &&
            paramShops.includes(spool.shop) &&
            paramMaterials.includes(spool.material) &&
            paramPriorities.includes(spool.priority) &&
            paramStatuses.includes(spool.status)
        )
      )
    }
    // eslint-disable-next-line
  }, [
    all_spools,
    setFiltSpools,
    paramJobs,
    paramMaterials,
    paramShops,
    paramStatuses,
    paramPriorities,
  ])

  return (
    <Fragment>
      {dormant !== undefined &&
      paramJobs !== undefined &&
      filtSpools !== undefined ? (
        <Fragment>
          <FilterForms
            jobnums={jobnums}
            all_materials={all_materials}
            all_shops={all_shops}
            all_priorities={all_priorities}
            all_statuses={all_statuses}
            paramJobs={paramJobs}
            setParamJobs={setParamJobs}
            paramMaterials={paramMaterials}
            setParamMaterials={setParamMaterials}
            paramShops={paramShops}
            setParamShops={setParamShops}
            paramPriorities={paramPriorities}
            setParamPriorities={setParamPriorities}
            paramStatuses={paramStatuses}
            setParamStatuses={setParamStatuses}
          />
          <CSVLink
            className='filter-btn'
            onClick={() => console.log(filtSpools)}
            data={filtSpools}
          >
            {' '}
            Download CSV
          </CSVLink>
        </Fragment>
      ) : (
        <Loading message='Loading info...' />
      )}
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  all_spools: state.jobs.all_spools,
  dormant: state.jobs.dormant,
  jobnums: state.jobs.jobnums,
  all_shops: state.jobs.all_shops,
  all_materials: state.jobs.all_materials,
  all_priorities: state.jobs.all_priorities,
  all_statuses: state.jobs.all_statuses,
})

export default connect(mapStateToProps)(Filters)
