
export const getCurrentWeek = (date, currentDate = new Date()) => {
    const DEFAULT_WEEK_DAYS = 7;
    const DEFAULT_BSUIR_WEEKS = 4;

    let weekCounter = 0

    let startDate = new Date(date.split('.').reverse().join('-'));

    while (startDate <= currentDate) {
        const currentDay = startDate.getDay();

        startDate.setDate(startDate.getDate() + (DEFAULT_WEEK_DAYS - currentDay))

        weekCounter++;
    }

    return weekCounter % DEFAULT_BSUIR_WEEKS === 0 ? DEFAULT_BSUIR_WEEKS : weekCounter % DEFAULT_BSUIR_WEEKS

}
