import React, { Fragment } from 'react'
import { FaCheckCircle } from 'react-icons/fa'

const Timeline = ({ spool }) => {
  const yes_color = '#4ba8ff'
  const no_color = '#c5c5c5'
  return (
    <Fragment>
      <div className='timeline'>
        <div className='milestone'>
          <div className='ms-header'>Workable</div>
          <div className='ms-graphic'>
            <FaCheckCircle
              color={spool.workable ? yes_color : no_color}
              size={20}
            />
          </div>
        </div>
        <div className='gap'>
          <div
            className='line'
            style={{
              backgroundColor: spool.issued ? yes_color : no_color,
            }}
          ></div>
        </div>
        <div className='milestone'>
          <div className='ms-header'>Issued</div>
          <div className='ms-graphic'>
            <FaCheckCircle
              color={
                spool.issued !== undefined && spool.issued !== ''
                  ? yes_color
                  : no_color
              }
              size={20}
            />
          </div>
        </div>
        <div className='gap'>
          <div
            className='line'
            style={{
              backgroundColor:
                spool.pulled !== undefined && spool.pulled !== ''
                  ? yes_color
                  : no_color,
            }}
          >
            {(spool.i_p || spool.i_p === 0) && (
              <span className='timeline-days'>{spool.i_p}</span>
            )}
          </div>
        </div>
        <div className='milestone'>
          <div className='ms-header'>Pulled</div>
          <div className='ms-graphic'>
            <FaCheckCircle
              color={
                spool.pulled !== undefined && spool.pulled !== ''
                  ? yes_color
                  : no_color
              }
              size={20}
            />
          </div>
        </div>
        <div className='gap'>
          <div
            className='line'
            style={{
              backgroundColor:
                spool.weldout !== undefined && spool.weldout !== ''
                  ? yes_color
                  : no_color,
            }}
          >
            {(spool.p_w || spool.p_w === 0) && (
              <span className='timeline-days'>{spool.p_w}</span>
            )}
          </div>
        </div>
        <div className='milestone'>
          <div className='ms-header'>Weldout</div>
          <div className='ms-graphic'>
            <FaCheckCircle
              color={
                spool.weldout !== undefined && spool.weldout !== ''
                  ? yes_color
                  : no_color
              }
              size={20}
            />
          </div>
        </div>
        {/* IF DELIVERED BUT NO PAINT */}
        {spool.delivered !== undefined &&
        spool.delivered !== '' &&
        spool.stc !== undefined &&
        (spool.stc !== '') === false ? null : (
          <Fragment>
            {spool.rtsc !== undefined && spool.rtsc !== '' && (
              <Fragment>
                <div className='gap'>
                  <div
                    className='line'
                    style={{
                      backgroundColor:
                        spool.rtsc !== undefined && spool.rtsc !== ''
                          ? yes_color
                          : no_color,
                    }}
                  >
                    {spool.w_rtsc && (
                      <span className='timeline-days'>{spool.w_rtsc}</span>
                    )}
                  </div>
                </div>
                <div className='milestone'>
                  <div className='ms-header'>Ready-to-Ship To Coating</div>
                  <div className='ms-graphic'>
                    <FaCheckCircle
                      color={
                        spool.rtsc !== undefined && spool.rtsc !== ''
                          ? yes_color
                          : no_color
                      }
                      size={20}
                    />
                  </div>
                </div>
              </Fragment>
            )}
            <div className='gap'>
              <div
                className='line'
                style={{
                  backgroundColor:
                    spool.stc !== undefined && spool.stc !== ''
                      ? yes_color
                      : no_color,
                }}
              >
                {spool.rtsc_stc ? (
                  <span className='timeline-days'>{spool.rtsc_stc}</span>
                ) : (
                  spool.w_stc && (
                    <span className='timeline-days'>{spool.w_stc}</span>
                  )
                )}
              </div>
            </div>
            <div className='milestone'>
              <div className='ms-header'>Shipped To Coating</div>
              <div className='ms-graphic'>
                <FaCheckCircle
                  color={
                    spool.stc !== undefined && spool.stc !== ''
                      ? yes_color
                      : no_color
                  }
                  size={20}
                />
              </div>
            </div>
          </Fragment>
        )}
        {/* IF DELIVERED BUT NO READY TO SHIP DATE */}
        {spool.delivered !== undefined &&
        spool.delivered !== '' &&
        spool.rts !== undefined &&
        (spool.rts !== '') === false ? null : (
          <Fragment>
            <Fragment>
              <div className='gap'>
                <div
                  className='line'
                  style={{
                    backgroundColor:
                      spool.rts !== undefined && spool.rts !== ''
                        ? yes_color
                        : no_color,
                  }}
                >
                  {spool.stc_rts && (
                    <span className='timeline-days'>{spool.stc_rts}</span>
                  )}
                  {spool.w_rts && (
                    <span className='timeline-days'>{spool.w_rts}</span>
                  )}
                </div>
              </div>
              <div className='milestone'>
                <div className='ms-header'>Ready-to-Deliver</div>
                <div className='ms-graphic'>
                  <FaCheckCircle
                    color={
                      spool.rts !== undefined && spool.rts !== ''
                        ? yes_color
                        : no_color
                    }
                    size={20}
                  />
                </div>
              </div>
            </Fragment>
          </Fragment>
        )}
        <div className='gap'>
          <div
            className='line'
            style={{
              backgroundColor:
                spool.delivered !== undefined && spool.delivered !== ''
                  ? yes_color
                  : no_color,
            }}
          >
            {spool.rts_d_np && (
              <span className='timeline-days'>{spool.rts_d_np}</span>
            )}
            {spool.rts_d_p && (
              <span className='timeline-days'>{spool.rts_d_p}</span>
            )}
            {spool.rts_d_p === undefined &&
              spool.rts_d_np === undefined &&
              spool.w_d_np && (
                <span className='timeline-days'>{spool.w_d_np}</span>
              )}
          </div>
        </div>
        <div className='milestone'>
          <div className='ms-header'>Delivered</div>
          <div className='ms-graphic'>
            <FaCheckCircle
              color={
                spool.delivered !== undefined && spool.delivered !== ''
                  ? yes_color
                  : no_color
              }
              size={20}
            />
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Timeline
