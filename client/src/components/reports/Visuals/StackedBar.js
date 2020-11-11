import React, { useRef, useState, useEffect } from 'react'
import { select, axisBottom, scaleLinear, axisLeft, scaleBand, stack, max, transition } from 'd3'
import { useResizeObserver } from '../../../actions/useResizeObserver'

const StackedBar = ({ po_items }) => {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const dimensions = useResizeObserver(wrapperRef)
  const [data, setData] = useState([])
  const [filters, setFilters] = useState([])
  const [keyshown, setKeyShown] = useState('item_detail')
  const [options, setOptions] = useState([
    { key: 'material', name: 'Material' },
    { key: 'size', name: 'Size' },
    { key: 'schedule', name: 'Schedule' },
    { key: 'seam', name: 'Seam' },
    { key: 'face', name: 'Face' },
  ])

  // Function to create data object
  const getData = (po_items, keyshown, filters, options) => {
    // Find all items on job
    let keyvaluelist = []
    po_items.map((po_item) => {
      if (po_item[keyshown] === undefined) po_item[keyshown] = ' NOT LABELED'
      if (keyvaluelist.includes(po_item[keyshown]) === false) keyvaluelist.push(po_item[keyshown])
    })

    // Remove items based on filters
    filters.map((filter) => {
      po_items = po_items.filter((po_item) => po_item[filter.key] === filter.value)
    })

    // Create an object for each item with number of matches and unmatches
    let bars = []
    keyvaluelist = keyvaluelist.sort()
    keyvaluelist.map((each) => {
      bars.push({
        bar: each,
        matched: po_items.filter((po_item) => po_item[keyshown] === each && po_item.matches.length > 0).length,
        unmatched: po_items.filter((po_item) => po_item[keyshown] === each && po_item.matches.length === 0).length,
      })
    })
    return bars
  }

  // Create data object
  useEffect(() => {
    setData(getData(po_items, keyshown, filters, options))
  }, [keyshown, po_items, filters, options])

  // Create chart
  useEffect(() => {
    // Colors for bars
    let colors = {
      matched: '#7ecd7e',
      unmatched: '#e86262',
    }

    // Reference the svg and set width, height form useResizeObserver to make responsive
    const svg = select(svgRef.current)
    const wrapper = select(wrapperRef.current)
    // const tooltip = select(tooltipRef.current)
    const { width, height } = dimensions || wrapperRef.current.getBoundingClientRect()

    // Generate stacks from data
    const stackGenerator = stack().keys(['matched', 'unmatched'])
    const layers = stackGenerator(data)
    const extent = [0, max(layers, (layer) => max(layer, (seq) => seq[1])) + 10]

    var tooltip = wrapper
      .append('div')
      .attr('class', 'mytooltip')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')

    var optionitems = wrapper
      .append('div')
      .attr('class', 'option-items')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
    // Add option items
    optionitems
      .selectAll('div')
      .data(options)
      .join('div')
      .attr('class', 'option-item')
      .html((option) => option.name)
      // Click event for each item in options menu
      .on('click', (e, d) => {
        optionitems.style('visibility', 'hidden')
        setKeyShown(d.key)
      })

    // X scale
    const xScale = scaleBand()
      .domain(data.map((d) => d.bar))
      .range([0, width])
      .padding(0.2)
    // X axis
    const xAxis = axisBottom(xScale)
    // Add to chart
    svg
      .select('.x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-60)')

    // Y scale
    const yScale = scaleLinear().domain(extent).range([height, 0])
    // Y axis
    const yAxis = axisLeft(yScale)
    // Add to chart
    svg.select('.y-axis').call(yAxis)

    // Add bars to chart
    svg
      // Entire layer
      .selectAll('.layer')
      .data(layers)
      .join('g')
      .attr('fill', (layer) => colors[layer.key])
      .style('cursor', 'pointer')
      .attr('class', 'layer')
      // Single bar layer
      .selectAll('rect')
      .data((layer) => layer)
      .join('rect')
      .attr('x', (seq) => xScale(seq.data.bar))
      .attr('width', xScale.bandwidth())
      .attr('y', (seq) => yScale(seq[1]))
      .attr('height', (seq) => yScale(seq[0]) - yScale(seq[1]))
      // Mouse over/move/leave events
      .on('mouseover', (e, d) => {
        select(e.target).style('opacity', 0.8)
        tooltip.style('visibility', 'visible')
      })
      .on('mousemove', (e, d) => {
        // Find out if hovered bar is matched or unmatched
        let matchtype = ''
        if (d[1] - d[0] === d.data.matched) matchtype = 'Matched'
        else if (d[1] - d[0] === d.data.unmatched) matchtype = 'Unmatched'
        // Apply styling for tooltip
        tooltip
          .style('top', e.pageY - 30 + 'px')
          .style('left', e.pageX + 15 + 'px')
          .html(`${d[1] - d[0]} ${matchtype} Items`)
      })
      .on('mouseleave', (e) => {
        select(e.target).style('opacity', 1)
        tooltip.style('visibility', 'hidden')
      })
      .on('click', (e, d) => {
        optionitems
          .style('visibility', 'visible')
          .style('top', e.pageY - 40 + 'px')
          .style('left', e.pageX - 210 + 'px')
      })
  }, [data, dimensions])

  return (
    <div ref={wrapperRef} style={{ marginBottom: 175 }}>
      <svg ref={svgRef} className='items-sb'>
        <g className='x-axis'></g>
        <g className='y-axis'></g>
      </svg>
    </div>
  )
}

export default StackedBar
