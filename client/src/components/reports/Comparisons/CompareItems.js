import React, { Fragment, useEffect, useState } from 'react'
import { compareItems, downloadSP, downloadPO, downloadCompare, setMatch } from '../../../actions/compareItems'
import { connect } from 'react-redux'
import _ from 'lodash'
import StackedBar from '../Visuals/StackedBar'

const NewCodes = ({
  compareItems,
  downloadSP,
  sp_items,
  po_items,
  sp_headers,
  po_headers,
  downloadPO,
  downloadCompare,
  discrepancies,
  setMatch,
}) => {
  const [poItems, setPoItems] = useState([])
  const [show, setShow] = useState('')
  const [desc, setDesc] = useState(false)

  // Grab and calculate data on page load if not already loaded
  useEffect(() => {
    if (sp_items.length === 0) compareItems()
  }, [compareItems, sp_items])

  // Create an array of po items that don't have any matches
  useEffect(() => {
    if (po_items.length > 0)
      setPoItems(po_items.filter((po_item) => po_item.breakpoint !== undefined && po_item.suggestions.length > 0))
  }, [po_items])

  // Edit the po items and save to a new object in the state
  const handleItemClick = (item) => {
    if (show === item.description + item.size) setShow('')
    else setShow(item.description + item.size)
  }

  // Add the suggestion to matches of the po
  const handleSuggestionClick = (sp_items, po_items, item, suggestion) => {
    setMatch(sp_items, po_items, item, suggestion)
    setShow('')
    setPoItems(po_items.filter((po_item) => po_item.breakpoint !== undefined))
  }

  // Sort headers
  const sortHeaders = (header, poItems, desc) => {
    if (desc) {
      setPoItems(_.orderBy(poItems, [header], 'asc'))
      setDesc(false)
    } else {
      setPoItems(_.orderBy(poItems, [header], 'desc'))
      setDesc(true)
    }
  }

  return (
    <div className={'page-container'}>
      {sp_items.length > 0 ? (
        // Download buttons
        <Fragment>
          <div className='btns-container'>
            <div className='compare-btn' onClick={() => downloadSP(sp_items, sp_headers)}>
              New Codes
            </div>
            <div className='compare-btn' onClick={() => downloadPO(po_items, po_headers)}>
              New PO
            </div>
            <div className='compare-btn' onClick={() => downloadCompare(sp_items, po_items, discrepancies)}>
              Compare
            </div>
          </div>
          <div className='unmatched-container'>
            <StackedBar po_items={po_items} />
            <div className='page-header'>Suggested Matches ({poItems.length} items)</div>
            <table>
              <thead>
                <tr className='compare-header'>
                  <td className='comp1' onClick={() => sortHeaders('breakpoint', poItems, desc)}>
                    Breakpoint
                  </td>
                  <td className='comp2' onClick={() => sortHeaders('description', poItems, desc)}>
                    Description
                  </td>
                  <td className='comp3' onClick={() => sortHeaders('suggestions', poItems, desc)}>
                    Suggestions
                  </td>
                </tr>
              </thead>
              <tbody className='unmatched-body'>
                {poItems.map((poItem) => (
                  <Fragment key={Math.random()}>
                    <tr className='po-item' onClick={() => handleItemClick(poItem)}>
                      <td className='comp1'>{poItem.breakpoint}</td>
                      <td className='comp2'>{poItem.description}</td>
                      <td className='comp3'>{poItem.suggestions && poItem.suggestions.length}</td>
                    </tr>
                    {poItem.suggestions.map((suggestion) => (
                      <tr
                        key={Math.random(0)}
                        className={show !== poItem.description + poItem.size ? 'hide' : 'po-suggestion'}
                        onClick={() => handleSuggestionClick(sp_items, po_items, poItem, suggestion)}
                      >
                        <td className='comp1'>{suggestion.sketch}</td>
                        <td className='comp2'>{suggestion.description}</td>
                        <td className='comp3'>{suggestion['NEW TAG']}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Fragment>
      ) : (
        // Loading
        <div style={{ marginTop: 400, display: 'flex', justifyContent: 'center' }}>Fetching data...</div>
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  sp_items: state.compareItems.sp_items,
  po_items: state.compareItems.po_items,
  sp_headers: state.compareItems.sp_headers,
  po_headers: state.compareItems.po_headers,
  discrepancies: state.compareItems.discrepancies,
})

export default connect(mapStateToProps, { compareItems, downloadSP, downloadPO, downloadCompare, setMatch })(NewCodes)
