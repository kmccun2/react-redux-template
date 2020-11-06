import React, { Fragment, useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Stack, Animation, EventTracker } from '@devexpress/dx-react-chart'
import { Chart, BarSeries, ArgumentAxis, ValueAxis, Legend, Tooltip } from '@devexpress/dx-react-chart-material-ui'
import _ from 'lodash'

const StackedBar = ({ po_items }) => {
  const [data, setData] = useState([
    {
      type: 'USA',
      matched: 59.8,
      unmatched: 937.6,
    },
    {
      type: 'China',
      matched: 74.2,
      unmatched: 308.6,
    },
    {
      type: 'Russia',
      matched: 40,
      unmatched: 128.5,
    },
    {
      type: 'Japan',
      matched: 22.6,
      unmatched: 241.5,
    },
  ])

  // Create data object
  useEffect(() => {
    const bars = []
    const unique = []
    const unique2 = []
    po_items.map((po_item) => {
      if (unique.includes(po_item.item_detail) === false) {
        unique.push(po_item.item_detail)
        bars.push({
          type: po_item.item_detail,
          matched: po_items.filter((item) => item.item_detail === po_item.item_detail && item.matches.length > 0)
            .length,
          unmatched: po_items.filter((item) => item.item_detail === po_item.item_detail && item.matches.length === 0)
            .length,
        })
      }
      return po_item
    })
    setData(_.orderBy(bars, 'type', 'desc'))
  }, [])

  // Creating the legend
  const legendStyles = () => ({
    root: {
      display: 'flex',
      margin: 'auto',
      flexDirection: 'row',
    },
  })
  const legendRootBase = ({ classes, ...restProps }) => <Legend.Root {...restProps} className={classes.root} />
  const Root = withStyles(legendStyles, { name: 'LegendRoot' })(legendRootBase)
  const legendLabelStyles = () => ({
    label: {
      whiteSpace: 'nowrap',
    },
  })
  const legendLabelBase = ({ classes, ...restProps }) => <Legend.Label className={classes.label} {...restProps} />
  const Label = withStyles(legendLabelStyles, { name: 'LegendLabel' })(legendLabelBase)

  return (
    <Fragment>
      <Chart data={data} rotated={true} height={750}>
        <ArgumentAxis />
        <ValueAxis max={2400} />
        <BarSeries name='Matched' valueField='matched' argumentField='type' color={'#2ecc71'} />
        <BarSeries name='Unmatched' valueField='unmatched' argumentField='type' color={'#e74c3c'} />
        <Animation />
        <Legend position='bottom' rootComponent={Root} labelComponent={Label} />
        <Stack stacks={[{ series: ['Matched', 'Unmatched'] }]} />
        <EventTracker />
        <Tooltip />
      </Chart>
    </Fragment>
  )
}

export default StackedBar
