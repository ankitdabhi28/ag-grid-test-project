# Pixally CRM Calendar Demo

## Project Overview

This is a React-based calendar application using FullCalendar for date management and selection.

## Prerequisites

- Node.js (version 18 or 20)
- Yarn package manager

## Custom Date Handling Features

The application includes three custom date handling functions:

### 1. Date Separation

`separateDates()` breaks down multi-day date ranges into individual daily events.

- Input: `[{start: "2025-03-10", end: "2025-03-12"}]`
- Output: Daily date ranges for each day in the selection

### 2. Duplicate Date Removal

`removeDuplicates()` eliminates duplicate date ranges, ensuring unique date selections.

### 3. Date Gap Validation

`isGapWithinLimit()` checks if selected dates are within a 0-1 day range.

## Setup and Installation

1. Install Dependencies

```bash
yarn install
```

2. Start Development Server

```bash
yarn run start
```

## Features

- Interactive calendar with date selection
- Event creation and management
- Weekend toggle
- Responsive design

## Technologies

- React
- Redux
- FullCalendar
- Day.js
- UUID

## Usage Tips

- Click and drag to select dates
- Click events to unselect dates
- Use sidebar to manage selections

## License

[Add your license information here]
