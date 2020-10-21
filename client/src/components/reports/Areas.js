import React, { Fragment } from 'react'

const AreasSummary = ({ job, header }) => {
  return (
    <Fragment>
      <div className='table-row table-label'>{header}</div>
      <div className='table-container'>
        <div className='table-header table-row'>
          <div className='col1'>Priority</div>
          <div className='col2'>Area</div>
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
            <div className='col1'>{area.priority}</div>
            <div className='col2'>{area.area}</div>
            <div className='col3'>{area.spools}</div>
            <div className='col4'>{area.on_hold}</div>
            <div className='col5'>{area.workable}</div>
            <div className='col6'>{area.not_workable}</div>
            <div className='col7'>{area.weldout}</div>
            <div className='col8'>{area.not_weldout}</div>
            <div className='col9'>{area.stc}</div>
            <div className='col10'>{area.delivered}</div>
            <div className='col11'>{area.not_delivered}</div>
            <div className='col12'>{area.workable_perc}%</div>
            <div className='col13'>{area.weldout_perc}%</div>
            <div className='col14'>{area.delivered_perc}%</div>
          </div>
        ))}
        {/* TOTALS */}
        <div className='table-row totals-row'>
          <div className='col1'>TOTAL</div>
          <div className='col2'></div>
          <div className='col3'>{job.total}</div>
          <div className='col4'>{job.on_hold}</div>
          <div className='col5'>{job.workable}</div>
          <div className='col6'>{job.total - job.workable}</div>
          <div className='col7'>{job.weldout}</div>
          <div className='col8'>{job.total - job.weldout}</div>
          <div className='col9'>{job.stc}</div>
          <div className='col10'>{job.delivered}</div>
          <div className='col11'>{job.total - job.delivered}</div>
          <div className='col12'>
            {job.workable / job.total === 1
              ? (job.workable / job.total) * 100
              : ((job.workable / job.total) * 100).toFixed(2)}
            %
          </div>
          <div className='col13'>
            {job.weldout / job.total === 1
              ? (job.weldout / job.total) * 100
              : ((job.weldout / job.total) * 100).toFixed(2)}
            %
          </div>
          <div className='col14'>
            {job.delivered / job.total === 1
              ? (job.delivered / job.total) * 100
              : ((job.delivered / job.total) * 100).toFixed(2)}
            %
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default AreasSummary
