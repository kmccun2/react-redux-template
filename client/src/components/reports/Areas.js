import React, { Fragment } from 'react'

const AreasSummary = ({ job, header }) => {
  return (
    <Fragment>
      <div className='table-row table-label'>{header}</div>
      <div className='table-container'>
        <div className='table-header table-row'>
          <div className='col1'>Area</div>
          <div className='col2'>Priority</div>
          <div className='col3'>Spools</div>
          <div className='col4'>On Hold</div>
          <div className='col5'>Workable</div>
          <div className='col6'>Not Workable</div>
          <div className='col7'>Welded Out</div>
          <div className='col8'>Not Welded Out</div>
          <div className='col9'>Shipped to Paint</div>
          <div className='col10'>Delivered</div>
          <div className='col11'>Not Delivered</div>
          <div className='col12'>Workable %</div>
          <div className='col13'>Weld Out %</div>
          <div className='col14'>Delivered %</div>
        </div>
        {/* ALL AREAS */}
        {job.areas.map((area) => (
          <div className='table-row' key={Math.random()}>
            <div className='col1'>{area.area}</div>
            <div className='col2'>{area.priority}</div>
            <div className='col3'>{area.spools}</div>
            <div className='col4'>{area.on_hold}</div>
            <div className='col5'>{area.workable}</div>
            <div className='col6'>{area.spools - area.workable}</div>
            <div className='col7'>{area.weldout}</div>
            <div className='col8'>{area.spools - area.weldout}</div>
            <div className='col9'>{area.stc}</div>
            <div className='col10'>{area.delivered}</div>
            <div className='col11'>{area.spools - area.delivered}</div>
            <div className='col12'>
              {area.workable / area.spools === 1
                ? (area.workable / area.spools) * 100
                : ((area.workable / area.spools) * 100).toFixed(2)}
              %
            </div>
            <div className='col13'>
              {area.weldout / area.spools === 1
                ? (area.weldout / area.spools) * 100
                : ((area.weldout / area.spools) * 100).toFixed(2)}
              %
            </div>
            <div className='col14'>
              {area.delivered / area.spools === 1
                ? (area.delivered / area.spools) * 100
                : ((area.delivered / area.spools) * 100).toFixed(2)}
              %
            </div>
          </div>
        ))}
        {/* TOTALS */}
        <div className='totals-row table-row'>
          <div className='col1'></div>
          <div className='col2'></div>
          <div className='col3'>{job.total_spools}</div>
          <div className='col4'>{job.on_hold}</div>
          <div className='col5'>{job.workable}</div>
          <div className='col6'>{job.total_spools - job.workable}</div>
          <div className='col7'>{job.weldout}</div>
          <div className='col8'>{job.total_spools - job.weldout}</div>
          <div className='col9'>{job.stc}</div>
          <div className='col10'>{job.delivered}</div>
          <div className='col11'>{job.total_spools - job.delivered}</div>
          <div className='col12'>
            {job.workable / job.total_spools === 1
              ? (job.workable / job.total_spools) * 100
              : ((job.workable / job.total_spools) * 100).toFixed(2)}
            %
          </div>
          <div className='col13'>
            {job.weldout / job.total_spools === 1
              ? (job.weldout / job.total_spools) * 100
              : ((job.weldout / job.total_spools) * 100).toFixed(2)}
            %
          </div>
          <div className='col14'>
            {job.delivered / job.total_spools === 1
              ? (job.delivered / job.total_spools) * 100
              : ((job.delivered / job.total_spools) * 100).toFixed(2)}
            %
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default AreasSummary
