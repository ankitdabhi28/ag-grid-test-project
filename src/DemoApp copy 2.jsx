import React, { useState, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import actionCreators from './actions'
import { createSelector } from 'reselect'
import { v4 as uuidv4 } from 'uuid'
import { getHashValues } from './utils'
import dayjs from 'dayjs'

function removeDuplicates(events) {
  const uniqueEvents = []
  const seen = new Set()

  events.forEach((event) => {
    const key = `${dayjs(event.startStr).format('YYYY-MM-DD')}-${dayjs(
      event.endStr
    ).format('YYYY-MM-DD')}`

    if (!seen.has(key)) {
      seen.add(key)
      uniqueEvents.push(event)
    }
  })

  return uniqueEvents
}

function isGapWithinLimit({ startStr, endStr }) {
  const startDate = dayjs(startStr)
  const endDate = dayjs(endStr)

  const gap = Math.abs(endDate.diff(startDate, 'day'))
  return gap === 1 || gap === 0
}
// Selector function (previously in mapStateToProps)
const selectEvents = createSelector((state) => state.eventsById, getHashValues)

const DemoApp = () => {
  const calenderApi = useRef(null)
  const calendarCurrentView = calenderApi?.current

  const calenderSelectedDates =
    calendarCurrentView &&
    calendarCurrentView?.calendar
      .getEvents()
      .map((event) => event.toPlainObject())
      .filter((event) => event.id?.includes('selected_date_key'))

  console.log('CUSTOM calenderSelectedDates', calenderSelectedDates)
  const selectedDateKey = ({ uuid }) => ({
    id: `selected_date_key_${uuid}`,
    title: 'SELECTED_DATE',
    allDay: true,
    extendedProps: {
      selectedDateKey: 'selected_date_key',
    },
    display: 'background',
    classNames: ['selected_date_key'],
  })
  const dispatch = useDispatch()
  const events = useSelector(selectEvents)
  console.log('CUSTOM events', events)
  const weekendsVisible = useSelector((state) => state.weekendsVisible)

  // State for selected dates
  const [selectedDates, setSelectedDates] = useState([])
  console.log('CUSTOM selectedDates', selectedDates)
  // Handler for date selection
  const handleDateSelect = useCallback(
    (selectInfo) => {
      let calendarApi = selectInfo.view.calendar
      const allEventObjects = calendarApi
        .getEvents()
        .map((event) => event.toPlainObject())
        .filter((event) => event.id?.includes('selected_date_key'))
      // // Get all event details including title, start, end dates, etc.
      // const allEvents = calendarApi.getEvents().map((event) => ({
      //   id: event.id,
      //   title: event.title,
      //   start: event.start,
      //   end: event.end,
      //   allDay: event.allDay,
      //   extendedProps: event.extendedProps,
      // }))
      console.log('CUSTOM All Event Details:', allEventObjects)

      const isSingleDay = isGapWithinLimit({
        startStr: selectInfo.startStr,
        endStr: selectInfo.endStr,
      })

      setSelectedDates((prevDates) => {
        console.log('CUSTOM prevDates ->>>>>>>>>>>>>>>>>>>>>>>', prevDates)
        // const event = calendarApi.getEventById(allEventObjects[3]?.id)
        // console.log('event ->>>>>>>>>>>>>>>>>>>>>>>', event)
        // if (event) {
        //   event.remove()
        // }

        // prevDates.forEach((date) => {
        //   const event = calendarApi.getEventById(date.id)
        //   console.log('event ->>>>>>>>>>>>>>>>>>>>>>>', event)
        //   if (event) {
        //     event.remove()
        //   }
        // })

        // const newDates = separateDates([{
        //   startStr: selectInfo.startStr,
        //   endStr: selectInfo.endStr
        // }])

        let dates
        let datesToAdd = true

        if (isSingleDay) {
          dates = [{ startStr: selectInfo.startStr, endStr: selectInfo.endStr }]
          if (
            prevDates.some(
              (date) =>
                date.startStr === selectInfo.startStr &&
                date.endStr === selectInfo.endStr
            )
          ) {
            datesToAdd = false
          }
        } else {
          dates = separateDates([
            {
              startStr: selectInfo.startStr,
              endStr: selectInfo.endStr,
            },
          ])
          datesToAdd = true
        }

        const toUpdateDates = [...prevDates, ...dates].filter((date) =>
          datesToAdd
            ? true
            : date.startStr !== selectInfo.startStr &&
              date.endStr !== selectInfo.endStr
        )

        const uniqueDates = removeDuplicates(toUpdateDates)?.map((date) => {
          if (date?.id?.includes('selected_date_key')) {
            return date
          } else {
            return {
              startStr: date?.startStr,
              endStr: date?.endStr,
              ...selectedDateKey({ uuid: uuidv4() }),
            }
          }
        })

        // uniqueDates.forEach((dateRange) => {
        //   // calendarApi.addEvent(
        //   //   {
        //   //     start: dateRange.startStr,
        //   //     end: dateRange.endStr,
        //   //     ...selectedDateKey({ uuid: uuidv4() }),
        //   //   },
        //   //   true
        //   // )
        //   if (allEventObjects?.length > 0) {
        //     const isAlreadyAdded = allEventObjects.some(
        //       (event) =>
        //         event.startStr === dateRange.startStr &&
        //         event.endStr === dateRange.endStr
        //     )
        //     if (!isAlreadyAdded) {
        //       calendarCurrentView?.calendar?.addEvent(
        //         {
        //           start: dateRange.startStr,
        //           end: dateRange.endStr,
        //           ...selectedDateKey({ uuid: uuidv4() }),
        //         },
        //         true
        //       )
        //     }
        //   } else {
        //     calendarCurrentView?.calendar?.addEvent(
        //       {
        //         start: dateRange.startStr,
        //         end: dateRange.endStr,
        //         ...selectedDateKey({ uuid: uuidv4() }),
        //       },
        //       true
        //     )
        //   }
        // })

        return uniqueDates
      })
    },
    [calendarCurrentView?.calendar]
  )

  // Handler for event click (delete)
  const handleEventClick = useCallback((clickInfo) => {
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove()
    }
  }, [])

  // Handlers for data operations
  const handleDates = useCallback(
    (rangeInfo) => {
      dispatch(
        actionCreators.requestEvents(rangeInfo.startStr, rangeInfo.endStr)
      ).catch(reportNetworkError)
    },
    [dispatch]
  )

  const handleEventAdd = useCallback(
    (addInfo) => {
      dispatch(actionCreators.createEvent(addInfo.event.toPlainObject())).catch(
        () => {
          reportNetworkError()
          addInfo.revert()
        }
      )
    },
    [dispatch]
  )

  const handleEventChange = useCallback(
    (changeInfo) => {
      dispatch(
        actionCreators.updateEvent(changeInfo.event.toPlainObject())
      ).catch(() => {
        reportNetworkError()
        changeInfo.revert()
      })
    },
    [dispatch]
  )

  const handleEventRemove = useCallback(
    (removeInfo) => {
      dispatch(actionCreators.deleteEvent(removeInfo.event.id)).catch(() => {
        reportNetworkError()
        removeInfo.revert()
      })
    },
    [dispatch]
  )

  // Toggle weekends handler
  const toggleWeekends = useCallback(() => {
    dispatch(actionCreators.toggleWeekends())
  }, [dispatch])

  // Render sidebar
  const renderSidebar = () => (
    <div className='demo-app-sidebar'>
      <button
        onClick={() => {
          // calendarCurrentView?.calendar?.addEvent(
          //   {
          //     start: '2025-03-13',
          //     end: '2025-03-14',
          //     ...selectedDateKey({ uuid: uuidv4() }),
          //   },
          //   true
          // )
          console.log(
            'CUSTOM CHECK calenderSelectedDates',
            calenderSelectedDates
          )
        }}
      >
        Add Event
      </button>
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
        <ul>{events.map(renderSidebarEvent)}</ul>
      </div>
      <div className='demo-app-sidebar-section'>
        <h2>Selected Dates</h2>
        <ul>
          {selectedDates.map(({ startStr, endStr }, index) => (
            <li key={index}>
              {formatDate(startStr, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              {endStr
                ? ` - ${formatDate(endStr, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}`
                : ''}
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
          ref={calenderApi}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView='dayGridMonth'
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={weekendsVisible}
          datesSet={handleDates}
          select={handleDateSelect}
          events={[...events, ...selectedDates]}
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
      <b>
        {formatDate(plainEventObject.start, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </b>
      <i>{plainEventObject.title}</i>
    </li>
  )
}

function reportNetworkError() {
  alert('This action could not be completed')
}

function separateDates(dates) {
  return dates.flatMap((dateRange) => {
    const start = dayjs(dateRange.startStr)
    const end = dayjs(dateRange.endStr)

    const separatedDates = []

    let currentDate = start
    while (currentDate.isBefore(end)) {
      separatedDates.push({
        startStr: currentDate.format('YYYY-MM-DD'),
        endStr: currentDate.add(1, 'day').format('YYYY-MM-DD'),
      })
      currentDate = currentDate.add(1, 'day')
    }

    return separatedDates
  })
}

export default DemoApp
