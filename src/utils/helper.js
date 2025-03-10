import dayjs from "dayjs";


// Function to merge consecutive date ranges
function mergeDateRanges(inputDates) {
    if (!inputDates.length) return [];

    // Sort input dates based on start date
    const sortedDates = [...inputDates].sort((a, b) =>
        dayjs(a.start).isBefore(dayjs(b.start)) ? -1 : 1
    );

    const mergedDates = [];
    let currentRange = { ...sortedDates[0] };

    for (let i = 1; i < sortedDates.length; i++) {
        const nextRange = sortedDates[i];

        // If the current range end matches the next range start, merge them
        if (dayjs(currentRange.end).isSame(dayjs(nextRange.start))) {
            currentRange.end = nextRange.end; // Extend the current range
        } else {
            mergedDates.push(currentRange); // Push the completed range
            currentRange = { ...nextRange }; // Start a new range
        }
    }

    mergedDates.push(currentRange); // Push the last range

    return mergedDates;
}

export { mergeDateRanges };