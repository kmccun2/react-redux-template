import React, { Fragment, useEffect, useState } from 'react'
import FilterForms from './FilterForms'
import { connect } from 'react-redux'
import Loading from '../misc/Loading'
import { CSVLink } from 'react-csv'

const Filters = ({
  spools,
  dormant,
  all_jobs,
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
      setParamJobs(all_jobs)
      setParamMaterials(all_materials)
      setParamShops(all_shops)
      setParamPriorities(all_priorities)
      setParamStatuses(all_statuses)
    }
  }, [
    dormant,
    all_jobs,
    all_materials,
    all_shops,
    all_priorities,
    all_statuses,
  ])

  // CREATE FILTERED SPOOLS LIST
  useEffect(() => {
    if (
      spools !== [] &&
      paramJobs !== undefined &&
      paramMaterials !== undefined &&
      paramShops !== undefined &&
      paramPriorities !== undefined &&
      paramStatuses !== undefined
    ) {
      setFiltSpools(
        spools.filter(
          (spool) =>
            paramJobs.includes(spool.jobnum) &&
            paramShops.includes(spool.shop) &&
            paramMaterials.includes(spool.material) &&
            paramPriorities.includes(spool.priority) &&
            paramStatuses.includes(spool.status)
        )
      )
      console.log(filtSpools)
    }
    // eslint-disable-next-line
  }, [
    spools,
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
            all_jobs={all_jobs}
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
          <CSVLink className='filter-btn' data={filtSpools}>
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
  spools: state.jobs.all_spools,
  dormant: state.jobs.dormant,
  jobnums: state.jobs.jobnums,
  all_jobs: state.jobs.all_jobs,
  all_shops: state.jobs.all_shops,
  all_materials: state.jobs.all_materials,
  all_priorities: state.jobs.all_priorities,
  all_statuses: state.jobs.all_statuses,
})

export default connect(mapStateToProps)(Filters)
