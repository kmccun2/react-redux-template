import React, { Fragment } from 'react'

const Dormant = ({
  dormant: { overall, jobs, shops, materials, manyjobs },
}) => {
  return (
    <Fragment>
      {/* OVERALL */}
      <div className='table-container'>
        <div className='table-row table-label'>Overall Averages</div>
        <div className='table-header table-row'>
          <div className='d-col1'></div>
          <div className='d-col2'>Lifespan</div>
          <div className='d-col3'>Issue to Pull</div>
          <div className='d-col4'>Pull to Weld</div>
          <div className='d-col5'>Weld to RTS Coating</div>
          <div className='d-col6'>RTS Coating to STC</div>
          <div className='d-col7'>Weld to STC</div>
          <div className='d-col8'>STC to RTS</div>
          <div className='d-col9'>RTS to Site</div>
          <div className='d-col10'>Weld to Site</div>
          <div className='d-col11'>Weld to RTS</div>
          <div className='d-col12'>RTS to Site</div>
          <div className='d-col13'>Weld to Site</div>
        </div>
        <div className='table-row'>
          <div className='d-col1 table-subheader'>ALL SPOOLS</div>
          <div className='d-col2'>
            {overall.lifespan.avg !== 0 ? overall.lifespan.avg : '-'}
          </div>
          <div className='d-col3'>
            {overall.i_p.avg !== 0 ? overall.i_p.avg : '-'}
          </div>
          <div className='d-col4'>
            {overall.p_w.avg !== 0 ? overall.p_w.avg : '-'}
          </div>
          <div className='d-col5'>
            {overall.w_rtsc.avg !== 0 ? overall.w_rtsc.avg : '-'}
          </div>
          <div className='d-col6'>
            {overall.rtsc_stc.avg !== 0 ? overall.rtsc_stc.avg : '-'}
          </div>
          <div className='d-col7'>
            {overall.w_stc.avg !== 0 ? overall.w_stc.avg : '-'}
          </div>
          <div className='d-col8'>
            {overall.stc_rts.avg !== 0 ? overall.stc_rts.avg : '-'}
          </div>
          <div className='d-col9'>
            {overall.rts_d_p.avg !== 0 ? overall.rts_d_p.avg : '-'}
          </div>
          <div className='d-col10'>
            {overall.w_d_p.avg !== 0 ? overall.w_d_p.avg : '-'}
          </div>
          <div className='d-col11'>
            {overall.w_rts.avg !== 0 ? overall.w_rts.avg : '-'}
          </div>
          <div className='d-col12'>
            {overall.rts_d_np.avg !== 0 ? overall.rts_d_np.avg : '-'}
          </div>
          <div className='d-col13'>
            {overall.w_d_np.avg !== 0 ? overall.w_d_np.avg : '-'}
          </div>
        </div>
      </div>
      {/* BY JOB */}
      {manyjobs && (
        <div className='table-container'>
          <div className='table-row table-label'>By Job</div>
          <div className='table-header table-row'>
            <div className='d-col1'></div>
            <div className='d-col2'>Lifespan</div>
            <div className='d-col3'>Issue to Pull</div>
            <div className='d-col4'>Pull to Weld</div>
            <div className='d-col5'>Weld to RTS Coating</div>
            <div className='d-col6'>RTS Coating to STC</div>
            <div className='d-col7'>Weld to STC</div>
            <div className='d-col8'>STC to RTS</div>
            <div className='d-col9'>RTS to Site</div>
            <div className='d-col10'>Weld to Site</div>
            <div className='d-col11'>Weld to RTS</div>
            <div className='d-col12'>RTS to Site</div>
            <div className='d-col13'>Weld to Site</div>
          </div>
          {jobs.map((job) => (
            <div className='table-row' key={job.number}>
              <div className='d-col1 table-subheader'>{job.number}</div>
              <div className='d-col2'>
                {job.lifespan.avg !== 0 ? job.lifespan.avg : '-'}
              </div>
              <div className='d-col3'>
                {job.i_p.avg !== 0 ? job.i_p.avg : '-'}
              </div>
              <div className='d-col4'>
                {job.p_w.avg !== 0 ? job.p_w.avg : '-'}
              </div>
              <div className='d-col5'>
                {job.w_rtsc.avg !== 0 ? job.w_rtsc.avg : '-'}
              </div>
              <div className='d-col6'>
                {job.rtsc_stc.avg !== 0 ? job.rtsc_stc.avg : '-'}
              </div>
              <div className='d-col7'>
                {job.w_stc.avg !== 0 ? job.w_stc.avg : '-'}
              </div>
              <div className='d-col8'>
                {job.stc_rts.avg !== 0 ? job.stc_rts.avg : '-'}
              </div>
              <div className='d-col9'>
                {job.rts_d_p.avg !== 0 ? job.rts_d_p.avg : '-'}
              </div>
              <div className='d-col10'>
                {job.w_d_p.avg !== 0 ? job.w_d_p.avg : '-'}
              </div>
              <div className='d-col11'>
                {job.w_rts.avg !== 0 ? job.w_rts.avg : '-'}
              </div>
              <div className='d-col12'>
                {job.rts_d_np.avg !== 0 ? job.rts_d_np.avg : '-'}
              </div>
              <div className='d-col13'>
                {job.w_d_np.avg !== 0 ? job.w_d_np.avg : '-'}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* BY SHOP */}
      <div className='table-container'>
        <div className='table-row table-label'>By Shop</div>
        <div className='table-header table-row'>
          <div className='d-col1'></div>
          <div className='d-col2'>Lifespan</div>
          <div className='d-col3'>Issue to Pull</div>
          <div className='d-col4'>Pull to Weld</div>
          <div className='d-col5'>Weld to RTS Coating</div>
          <div className='d-col6'>RTS Coating to STC</div>
          <div className='d-col7'>Weld to STC</div>
          <div className='d-col8'>STC to RTS</div>
          <div className='d-col9'>RTS to Site</div>
          <div className='d-col10'>Weld to Site</div>
          <div className='d-col11'>Weld to RTS</div>
          <div className='d-col12'>RTS to Site</div>
          <div className='d-col13'>Weld to Site</div>
        </div>
        {shops.map((shop) => (
          <div className='table-row' key={shop.shop}>
            <div className='d-col1 table-subheader'>{shop.shop}</div>
            <div className='d-col2'>
              {shop.lifespan.avg !== 0 ? shop.lifespan.avg : '-'}
            </div>
            <div className='d-col3'>
              {shop.i_p.avg !== 0 ? shop.i_p.avg : '-'}
            </div>
            <div className='d-col4'>
              {shop.p_w.avg !== 0 ? shop.p_w.avg : '-'}
            </div>
            <div className='d-col5'>
              {shop.w_rtsc.avg !== 0 ? shop.w_rtsc.avg : '-'}
            </div>
            <div className='d-col6'>
              {shop.rtsc_stc.avg !== 0 ? shop.rtsc_stc.avg : '-'}
            </div>
            <div className='d-col7'>
              {shop.w_stc.avg !== 0 ? shop.w_stc.avg : '-'}
            </div>
            <div className='d-col8'>
              {shop.stc_rts.avg !== 0 ? shop.stc_rts.avg : '-'}
            </div>
            <div className='d-col9'>
              {shop.rts_d_p.avg !== 0 ? shop.rts_d_p.avg : '-'}
            </div>
            <div className='d-col10'>
              {shop.w_d_p.avg !== 0 ? shop.w_d_p.avg : '-'}
            </div>
            <div className='d-col11'>
              {shop.w_rts.avg !== 0 ? shop.w_rts.avg : '-'}
            </div>
            <div className='d-col12'>
              {shop.rts_d_np.avg !== 0 ? shop.rts_d_np.avg : '-'}
            </div>
            <div className='d-col13'>
              {shop.w_d_np.avg !== 0 ? shop.w_d_np.avg : '-'}
            </div>
          </div>
        ))}
      </div>
      {/* BY MATERIAL */}
      <div className='table-container'>
        <div className='table-row table-label'>By Material</div>
        <div className='table-header table-row'>
          <div className='d-col1'></div>
          <div className='d-col2'>Lifespan</div>
          <div className='d-col3'>Issue to Pull</div>
          <div className='d-col4'>Pull to Weld</div>
          <div className='d-col5'>Weld to RTS Coating</div>
          <div className='d-col6'>RTS Coating to STC</div>
          <div className='d-col7'>Weld to STC</div>
          <div className='d-col8'>STC to RTS</div>
          <div className='d-col9'>RTS to Site</div>
          <div className='d-col10'>Weld to Site</div>
          <div className='d-col11'>Weld to RTS</div>
          <div className='d-col12'>RTS to Site</div>
          <div className='d-col13'>Weld to Site</div>
        </div>
        {materials.map((material) => (
          <div className='table-row' key={material.material}>
            <div className='d-col1 table-subheader'>{material.material}</div>
            <div className='d-col2'>
              {material.lifespan.avg !== 0 ? material.lifespan.avg : '-'}
            </div>
            <div className='d-col3'>
              {material.i_p.avg !== 0 ? material.i_p.avg : '-'}
            </div>
            <div className='d-col4'>
              {material.p_w.avg !== 0 ? material.p_w.avg : '-'}
            </div>
            <div className='d-col5'>
              {material.w_rtsc.avg !== 0 ? material.w_rtsc.avg : '-'}
            </div>
            <div className='d-col6'>
              {material.rtsc_stc.avg !== 0 ? material.rtsc_stc.avg : '-'}
            </div>
            <div className='d-col7'>
              {material.w_stc.avg !== 0 ? material.w_stc.avg : '-'}
            </div>
            <div className='d-col8'>
              {material.stc_rts.avg !== 0 ? material.stc_rts.avg : '-'}
            </div>
            <div className='d-col9'>
              {material.rts_d_p.avg !== 0 ? material.rts_d_p.avg : '-'}
            </div>
            <div className='d-col10'>
              {material.w_d_p.avg !== 0 ? material.w_d_p.avg : '-'}
            </div>
            <div className='d-col11'>
              {material.w_rts.avg !== 0 ? material.w_rts.avg : '-'}
            </div>
            <div className='d-col12'>
              {material.rts_d_np.avg !== 0 ? material.rts_d_np.avg : '-'}
            </div>
            <div className='d-col13'>
              {material.w_d_np.avg !== 0 ? material.w_d_np.avg : '-'}
            </div>
          </div>
        ))}
      </div>
    </Fragment>
  )
}

export default Dormant
