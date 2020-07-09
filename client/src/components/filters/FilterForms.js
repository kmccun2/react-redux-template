import React, { Fragment, useState } from 'react'
import { BsFillCaretDownFill } from 'react-icons/bs'
import { FaCheck } from 'react-icons/fa'

const FilterForms = ({
  all_jobs,
  paramJobs,
  setParamJobs,
  all_materials,
  paramMaterials,
  setParamMaterials,
  all_shops,
  paramShops,
  setParamShops,
  all_priorities,
  paramPriorities,
  setParamPriorities,
  all_statuses,
  paramStatuses,
  setParamStatuses,
}) => {
  const [jobOpen, setJobOpen] = useState(false)
  const [matOpen, setMatOpen] = useState(false)
  const [priOpen, setPriOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [lsOpen, setLsOpen] = useState(false)

  const handleSelect = (type, item, list) => {
    if (list.includes(item)) {
      if (type === 'job') {
        setParamJobs(list.filter((each) => each !== item))
        console.log(list)
      }
      if (type === 'material') {
        setParamMaterials(list.filter((each) => each !== item))
        console.log(list)
      }
      if (type === 'shop') {
        setParamShops(list.filter((each) => each !== item))
        console.log(list)
      }
      if (type === 'priority') {
        setParamPriorities(list.filter((each) => each !== item))
        console.log(list)
      }
      if (type === 'status') {
        setParamStatuses(list.filter((each) => each !== item))
        console.log(list)
      }
    } else {
      if (type === 'job') {
        setParamJobs([...list, item])
      }
      if (type === 'material') {
        setParamMaterials([...list, item])
      }
      if (type === 'shop') {
        setParamShops([...list, item])
      }
      if (type === 'priority') {
        setParamPriorities([...list, item])
      }
      if (type === 'status') {
        setParamStatuses([...list, item])
      }
    }
  }

  return (
    <Fragment>
      <div className='js-heading'>Filter Spools</div>
      <div className='filter-forms'>
        <div className='filter-form'>
          <div
            className='filter-header'
            onClick={
              jobOpen === false
                ? () => setJobOpen(true)
                : () => setJobOpen(false)
            }
          >
            <span>Job</span>
            <BsFillCaretDownFill />
          </div>
          <div className={jobOpen ? 'filter-dd' : 'filter-dd hide'}>
            <Fragment>
              {all_jobs.map((job) => (
                <div
                  className='filter-item'
                  onClick={() => handleSelect('job', job, paramJobs)}
                  key={job}
                >
                  <div className='checkbox'>
                    {paramJobs.includes(job) && <FaCheck size={16} />}
                  </div>
                  <span>{job}</span>
                </div>
              ))}
            </Fragment>
          </div>
        </div>
        <div className='filter-form'>
          <div
            className='filter-header'
            onClick={
              matOpen === false
                ? () => setMatOpen(true)
                : () => setMatOpen(false)
            }
          >
            <span>Material</span>
            <BsFillCaretDownFill />
          </div>
          <div className={matOpen ? 'filter-dd' : 'filter-dd hide'}>
            <Fragment>
              {all_materials.map((material) => (
                <div
                  className='filter-item'
                  onClick={() =>
                    handleSelect('material', material, paramMaterials)
                  }
                  key={material}
                >
                  <div className='checkbox'>
                    {paramMaterials.includes(material) && <FaCheck size={16} />}
                  </div>
                  <span>{material}</span>
                </div>
              ))}
            </Fragment>
          </div>
        </div>
        <div className='filter-form'>
          <div
            className='filter-header'
            onClick={
              priOpen === false
                ? () => setPriOpen(true)
                : () => setPriOpen(false)
            }
          >
            <span>Priority</span>
            <BsFillCaretDownFill />
          </div>
          <div className={priOpen ? 'filter-dd' : 'filter-dd hide'}>
            <Fragment>
              {all_priorities.map((priority) => (
                <div
                  className='filter-item'
                  onClick={() =>
                    handleSelect('priority', priority, paramPriorities)
                  }
                  key={priority}
                >
                  <div className='checkbox'>
                    {paramPriorities.includes(priority) && (
                      <FaCheck size={16} />
                    )}
                  </div>
                  <span>{priority}</span>
                </div>
              ))}
            </Fragment>
          </div>
        </div>
        <div className='filter-form'>
          <div
            className='filter-header'
            onClick={
              shopOpen === false
                ? () => setShopOpen(true)
                : () => setShopOpen(false)
            }
          >
            <span>Shop</span>
            <BsFillCaretDownFill />
          </div>
          <div className={shopOpen ? 'filter-dd' : 'filter-dd hide'}>
            <Fragment>
              {all_shops.map((shop) => (
                <div
                  className='filter-item'
                  onClick={() => handleSelect('shop', shop, paramShops)}
                  key={shop}
                >
                  <div className='checkbox'>
                    {paramShops.includes(shop) && <FaCheck size={16} />}
                  </div>
                  <span>{shop}</span>
                </div>
              ))}
            </Fragment>
          </div>
        </div>
        <div className='filter-form'>
          <div
            className='filter-header'
            onClick={
              lsOpen === false ? () => setLsOpen(true) : () => setLsOpen(false)
            }
          >
            <span>Last Status</span>
            <BsFillCaretDownFill />
          </div>
          <div className={lsOpen ? 'filter-dd' : 'filter-dd hide'}>
            <Fragment>
              {all_statuses.map((status) => (
                <div
                  className='filter-item'
                  onClick={() => handleSelect('status', status, paramStatuses)}
                  key={status}
                >
                  <div className='checkbox'>
                    {paramStatuses.includes(status) && <FaCheck size={16} />}
                  </div>
                  <span>{status}</span>
                </div>
              ))}
            </Fragment>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default FilterForms
