import React, { useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { formatDate } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import actionCreators from "./actions";
import { createSelector } from "reselect";
import { v4 as uuidv4 } from "uuid";
import { getHashValues } from "./utils";
import dayjs from "dayjs";
import { mergeDateRanges } from "./utils/helper";

const inputDates = [
  {
    start: "2025-02-24",
    end: "2025-02-25",
    id: "selected_date_key_04fedf23-a7b3-4415-adef-0f5b65b3a522",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-02-25",
    end: "2025-02-26",
    id: "selected_date_key_967ecb44-d837-4786-a455-3cacbca8befb",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-02-26",
    end: "2025-02-27",
    id: "selected_date_key_97474f4f-e84c-4744-86fd-9a214bef3b19",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-02-27",
    end: "2025-02-28",
    id: "selected_date_key_b107779c-af3d-4e32-8fbb-aa2b961081eb",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-02-28",
    end: "2025-03-01",
    id: "selected_date_key_9ec4c01b-5c9a-4257-96c6-ba3b08df44f4",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-03-01",
    end: "2025-03-02",
    id: "selected_date_key_b25a6eb9-54ff-44d6-a75c-c9eb898ddc6d",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-03-02",
    end: "2025-03-03",
    id: "selected_date_key_a0f06b85-a34d-4623-8679-af33a9bed71c",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-03-05",
    end: "2025-03-06",
    id: "selected_date_key_8c7060e2-a150-4c08-b23e-3ce201c49a43",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-03-13",
    end: "2025-03-14",
    id: "selected_date_key_2953892b-9255-4543-bebf-035f905f0213",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
];

const outputDates = [
  {
    start: "2025-02-24",
    end: "2025-03-03",
    id: "selected_date_key_04fedf23-a7b3-4415-adef-0f5b65b3a522",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-03-05",
    end: "2025-03-06",
    id: "selected_date_key_8c7060e2-a150-4c08-b23e-3ce201c49a43",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
  {
    start: "2025-03-13",
    end: "2025-03-14",
    id: "selected_date_key_2953892b-9255-4543-bebf-035f905f0213",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  },
];

// ! START CUSTOM FUNCTION FOR SEPARATING DATES
// * INPUT: [{start: "2025-03-10", end: "2025-03-12"}]
// * OUTPUT: [{start: "2025-03-10", end: "2025-03-11"},
// *          {start: "2025-03-11", end: "2025-03-12"},
// *          {start: "2025-03-11", end: "2025-03-12"}]
function separateDates(dates) {
  return dates.flatMap((dateRange) => {
    const start = dayjs(dateRange.start);
    const end = dayjs(dateRange.end);

    const separatedDates = [];

    let currentDate = start;
    while (currentDate.isBefore(end)) {
      separatedDates.push({
        start: currentDate.format("YYYY-MM-DD"),
        end: currentDate.add(1, "day").format("YYYY-MM-DD"),
      });
      currentDate = currentDate.add(1, "day");
    }

    return separatedDates;
  });
}
// ! END CUSTOM FUNCTION FOR SEPARATING DATES

// ! START CUSTOM FUNCTION FOR REMOVING DUPLICATES DATES
// * INPUT: [{start: "2025-03-10", end: "2025-03-11"},
// *          {start: "2025-03-11", end: "2025-03-12"},
// *          {start: "2025-03-11", end: "2025-03-12"}]
// * OUTPUT: [{start: "2025-03-10", end: "2025-03-11"},
// *          {start: "2025-03-11", end: "2025-03-12"}]
function removeDuplicates(events) {
  const uniqueEvents = [];
  const seen = new Set();

  events.forEach((event) => {
    const key = `${dayjs(event.start).format("YYYY-MM-DD")}-${dayjs(
      event.end
    ).format("YYYY-MM-DD")}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueEvents.push(event);
    }
  });

  return uniqueEvents;
}
// ! END CUSTOM FUNCTION FOR REMOVING DUPLICATES DATES

// ! START CUSTOM FUNCTION FOR CHECKING IF THE GAP BETWEEN DATES IS WITHIN THE LIMIT
function isGapWithinLimit({ start, end }) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  const gap = Math.abs(endDate.diff(startDate, "day"));
  return gap === 1 || gap === 0;
}
// ! END CUSTOM FUNCTION FOR CHECKING IF THE GAP BETWEEN DATES IS WITHIN THE LIMIT

// Selector function (previously in mapStateToProps)
const selectEvents = createSelector((state) => state.eventsById, getHashValues);

const DemoApp = () => {
  // const calenderApi = useRef(null);
  // const calendarCurrentView = calenderApi?.current;

  // const calenderSelectedDates =
  //   calendarCurrentView &&
  //   calendarCurrentView?.calendar
  //     .getEvents()
  //     .map((event) => event.toPlainObject())
  //     .filter((event) => event.id?.includes('selected_date_key'))

  const selectedDateKey = ({ uuid }) => ({
    id: `selected_date_key_${uuid}`,
    // title: "SELECTED_DATE",
    allDay: true,
    extendedProps: {
      selectedDateKey: "selected_date_key",
    },
    display: "background",
    classNames: ["selected_date_key"],
  });
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);

  const weekendsVisible = useSelector((state) => state.weekendsVisible);

  // State for selected dates
  const [selectedDates, setSelectedDates] = useState([]);
  // console.log("selectedDates -->>", {
  //   selectedDates,
  //   mergedDates: mergeDateRanges(selectedDates),
  //   inputDates: mergeDateRanges(inputDates),
  // });
  // Handler for date selection
  const handleDateSelect = useCallback((selectInfo) => {
    const { startStr, endStr, view } = selectInfo;

    let calendarApi = view.calendar;

    calendarApi.unselect();

    // ! START CUSTOM LOGIC SELECTING DATE & UNSELECTING DATE
    const isSingleDay = isGapWithinLimit({
      start: startStr,
      end: endStr,
    });

    setSelectedDates((prevDates) => {
      let dates;
      let datesToAdd = true;

      if (isSingleDay) {
        dates = [{ start: startStr, end: endStr }];
        if (
          prevDates.some(
            (date) => date.start === startStr && date.end === endStr
          )
        ) {
          datesToAdd = false;
        }
      } else {
        dates = separateDates([
          {
            start: startStr,
            end: endStr,
          },
        ]);
        datesToAdd = true;
      }

      const toUpdateDates = [...prevDates, ...dates].filter((date) =>
        datesToAdd ? true : date.start !== startStr && date.end !== endStr
      );

      const uniqueDates = removeDuplicates(toUpdateDates)?.map((date) => {
        if (date?.id?.includes("selected_date_key")) {
          return date;
        } else {
          return {
            ...date,
            ...selectedDateKey({ uuid: uuidv4() }),
          };
        }
      });

      return uniqueDates;
    });

    // ! END CUSTOM LOGIC SELECTING DATE & UNSELECTING DATE
  }, []);

  // Handler for event click (delete)
  const handleEventClick = useCallback((clickInfo) => {
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    }
  }, []);

  // Handlers for data operations
  const handleDates = useCallback(
    (rangeInfo) => {
      dispatch(
        actionCreators.requestEvents(rangeInfo.startStr, rangeInfo.endStr)
      ).catch(reportNetworkError);
    },
    [dispatch]
  );

  const handleEventAdd = useCallback(
    (addInfo) => {
      dispatch(actionCreators.createEvent(addInfo.event.toPlainObject())).catch(
        () => {
          reportNetworkError();
          addInfo.revert();
        }
      );
    },
    [dispatch]
  );

  const handleEventChange = useCallback(
    (changeInfo) => {
      dispatch(
        actionCreators.updateEvent(changeInfo.event.toPlainObject())
      ).catch(() => {
        reportNetworkError();
        changeInfo.revert();
      });
    },
    [dispatch]
  );

  const handleEventRemove = useCallback(
    (removeInfo) => {
      dispatch(actionCreators.deleteEvent(removeInfo.event.id)).catch(() => {
        reportNetworkError();
        removeInfo.revert();
      });
    },
    [dispatch]
  );

  // Toggle weekends handler
  const toggleWeekends = useCallback(() => {
    dispatch(actionCreators.toggleWeekends());
  }, [dispatch]);

  // Render sidebar
  const renderSidebar = () => (
    <div className="demo-app-sidebar">
      <div className="demo-app-sidebar-section">
        <h2>Instructions</h2>
        <ul>
          <li>Select dates and you will be prompted to create a new event</li>
          <li>Drag, drop, and resize events</li>
          <li>Click an event to delete it</li>
        </ul>
      </div>
      <div className="demo-app-sidebar-section">
        <label>
          <input
            type="checkbox"
            checked={weekendsVisible}
            onChange={toggleWeekends}
          />
          toggle weekends
        </label>
      </div>
      <div className="demo-app-sidebar-section">
        <h2>All Events ({events.length})</h2>
        <ul>{events.map(renderSidebarEvent)}</ul>
      </div>
      <div className="demo-app-sidebar-section">
        <h2>Selected Dates</h2>
        <ul>
          {selectedDates.map(({ start, end }, index) => (
            <li key={index}>
              {formatDate(start, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              {end
                ? ` - ${formatDate(end, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}`
                : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="demo-app">
      {renderSidebar()}
      <div className="demo-app-main">
        <FullCalendar
          // ref={calenderApi}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={weekendsVisible}
          datesSet={handleDates}
          select={handleDateSelect}
          events={[...events, ...mergeDateRanges(selectedDates)]}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          eventAdd={handleEventAdd}
          eventChange={handleEventChange}
          eventRemove={handleEventRemove}
        />
      </div>
    </div>
  );
};

// Utility render functions (unchanged)
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );
}

function renderSidebarEvent(plainEventObject) {
  return (
    <li key={plainEventObject.id}>
      <b>
        {formatDate(plainEventObject.start, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </b>
      <i>{plainEventObject.title}</i>
    </li>
  );
}

function reportNetworkError() {
  alert("This action could not be completed");
}

export default DemoApp;
