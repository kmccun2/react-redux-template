import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const Location = ({ job }) => {
  const [data, setData] = useState([])

  const [maxHeight, setMaxHeight] = useState(0)

  useEffect(() => {
    if (job) {
      setData([
        {
          phase: 'Not Workable ',
          count: job.status.not_workable,
          color: '#3498db',
        },
        { phase: 'Workable', count: job.status.workable, color: '#3498db' },
        { phase: 'Issued', count: job.status.issued, color: '#3498db' },
        { phase: 'Pulled', count: job.status.pulled, color: '#3498db' },
        { phase: 'Welded Out', count: job.status.weldout, color: '#3498db' },
        { phase: 'STC', count: job.status.stc, color: '#3498db' },
        { phase: 'Ready to Deliver', count: job.status.rtd, color: '#3498db' },
        { phase: 'Delivered', count: job.status.delivered, color: '#3498db' },
        { phase: 'On Hold', count: job.status.on_hold, color: '#e74c3c' },
      ])
    }
  }, [job])

  useEffect(() => {
    if (data.length > 0) {
      let max_height = 0
      data.map((each) => {
        if (each.count > max_height) {
          max_height = each.count
        }
        return each
      })
      setMaxHeight(max_height)
    }
  }, [data])

  return (
    <div className='location-chart'>
      <div className='table-label' style={{ marginBottom: 50 }}>
        Spool Location
      </div>
      {maxHeight > 0 && (
        <BarChart width={1100} height={400} data={data}>
          <XAxis
            angle={-30}
            dy={27}
            dataKey='phase'
            height={100}
            paddingTop={10}
            fontWeight='bold'
          />
          <YAxis
            label={{ value: 'Spools', angle: -90, fontWeight: 'bold' }}
            width={110}
          />
          <Tooltip />
          <Bar
            dataKey='count'
            width={30}
            fill={'red'}
            shape={({ background, color, count }) => (
              <g>
                <rect
                  x={background.x + 15}
                  y={background.height * (1 - count / maxHeight) + 5}
                  width={background.width - 30}
                  height={background.height * (count / maxHeight)}
                  fill={color}
                />
              </g>
            )}
          />
        </BarChart>
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  job: state.job.job,
})
export default connect(mapStateToProps)(Location)
