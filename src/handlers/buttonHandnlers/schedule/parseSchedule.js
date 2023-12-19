

export const parseSchedule = (schedules, dayName, date, weekNumber, subGroup = null) => {

    if (!schedules[dayName]) return null;

    const todaySchedule = schedules[dayName].map(pr => {
        const workableLessonTypes = ['ЛК', 'ЛР', 'ПЗ'];

        if (!workableLessonTypes.includes(pr.lessonTypeAbbrev)) return null; // For now without exams and preporations for them
        if (!pr.weekNumber.includes(weekNumber)) return null;
        if (new Date(pr.startLessonDate.split('.').reverse().join('-')) > date || new Date(pr.endLessonDate.split('.').reverse().join('-')) < date) return null;
        if (subGroup && pr.numSubgroup !== 0 && subGroup !== pr.numSubgroup) return null;
        return pr;
    }).filter(pr => pr !== null);

    return todaySchedule.slice().sort(compareStartTime);



}

function compareStartTime(lesson1, lesson2) {
    const time1 = new Date(`1970-01-01T${lesson1.startLessonTime}`);
    const time2 = new Date(`1970-01-01T${lesson2.startLessonTime}`);

    return time1 - time2;
}

