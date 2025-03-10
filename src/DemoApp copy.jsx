import React, { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import actionCreators from './actions'
import { createSelector } from 'reselect'
import { getHashValues } from './utils'

// Selector function (previously in mapStateToProps)
const selectEvents = createSelector(
  (state) => state.eventsById,
  getHashValues
)

const DemoApp = () => {
  const dispatch = useDispatch()
  const events = useSelector(selectEvents)
  const weekendsVisible = useSelector(state => state.weekendsVisible)

  // State for selected dates
  const [selectedDates, setSelectedDates] = useState([])
  console.log('selectedDates', selectedDates)

  // Handler for date selection
  const handleDateSelect = useCallback((selectInfo) => {
    let calendarApi = selectInfo.view.calendar

    setSelectedDates((prevDates) => {
      const newDates = [...prevDates, {
        startStr: selectInfo.startStr, 
        endStr: selectInfo.endStr
      }]
      for (let i = 0; i < newDates.length; i++) {
        // calendarApi.select(newDates[i].startStr, newDates[i].endStr)
      }
      return newDates
    })
  }, [])

  // Handler for event click (delete)
  const handleEventClick = useCallback((clickInfo) => {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove()
    }
  }, [])

  // Handlers for data operations
  const handleDates = useCallback((rangeInfo) => {
    dispatch(actionCreators.requestEvents(rangeInfo.startStr, rangeInfo.endStr))
      .catch(reportNetworkError)
  }, [dispatch])

  const handleEventAdd = useCallback((addInfo) => {
    console.log('addInfo', addInfo)
    dispatch(actionCreators.createEvent(addInfo.event.toPlainObject()))
      .catch(() => {
        reportNetworkError()
        addInfo.revert()
      })
  }, [dispatch])

  const handleEventChange = useCallback((changeInfo) => {
    dispatch(actionCreators.updateEvent(changeInfo.event.toPlainObject()))
      .catch(() => {
        reportNetworkError()
        changeInfo.revert()
      })
  }, [dispatch])

  const handleEventRemove = useCallback((removeInfo) => {
    dispatch(actionCreators.deleteEvent(removeInfo.event.id))
      .catch(() => {
        reportNetworkError()
        removeInfo.revert()
      })
  }, [dispatch])

  // Toggle weekends handler
  const toggleWeekends = useCallback(() => {
    dispatch(actionCreators.toggleWeekends())
  }, [dispatch])

  // Clear selected dates
  const clearSelectedDates = useCallback(() => {
    setSelectedDates([])
  }, [])

  // Render sidebar
  const renderSidebar = () => (
    <div className='demo-app-sidebar'>
      <div className='demo-app-sidebar-section'>
        <h2>Instructions</h2>
        <ul>
          <li>Select dates and you will be prompted to create a new event</li>
          <li>Drag, drop, and resize events</li>
          <li>Click an event to delete it</li>
        </ul>
      </div>
      <div className='demo-app-sidebar-section'>
        <label>
          <input
            type='checkbox'
            checked={weekendsVisible}
            onChange={toggleWeekends}
          />
          toggle weekends
        </label>
      </div>
      <div className='demo-app-sidebar-section'>
        <h2>All Events ({events.length})</h2>
        <ul>
          {events.map(renderSidebarEvent)}
        </ul>
      </div>
      <div className='demo-app-sidebar-section'>
        <h2>Selected Dates</h2>
        <ul>
          {selectedDates.map(({startStr, endStr}, index) => (
            <li key={index}>
              {formatDate(startStr, {year: 'numeric', month: 'short', day: 'numeric'})}
              {endStr ? ` - ${formatDate(endStr, {year: 'numeric', month: 'short', day: 'numeric'})}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <div className='demo-app'>
      {renderSidebar()}
      <div className='demo-app-main'>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView='dayGridMonth'
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={weekendsVisible}
          datesSet={handleDates}
          select={handleDateSelect}
          events={events}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          eventAdd={handleEventAdd}
          eventChange={handleEventChange}
          eventRemove={handleEventRemove}
        />
      </div>
    </div>
  )
}

// Utility render functions (unchanged)
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  )
}

function renderSidebarEvent(plainEventObject) {
  return (
    <li key={plainEventObject.id}>
      <b>{formatDate(plainEventObject.start, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
      <i>{plainEventObject.title}</i>
    </li>
  )
}

function reportNetworkError() {
  alert('This action could not be completed')
}

export default DemoApp
