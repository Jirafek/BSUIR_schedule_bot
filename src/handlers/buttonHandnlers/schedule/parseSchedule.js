

export const parseSchedule = (schedules, dayName, date, weekNumber, subGroup = null) => {

    if (!schedules[dayName]) return null;

    const todaySchedule = schedules[dayName].map(pr => {
        const workableLessonTypes = ['ЛК', 'ЛР', 'ПЗ', 'Консультация', 'Экзамен'];

        if (!workableLessonTypes.includes(pr.lessonTypeAbbrev)) return null;

        if (pr.startLessonDate && pr.endLessonDate) {
            if (!pr.weekNumber.includes(weekNumber)) return null;
            if (new Date(pr.startLessonDate.split('.').reverse().join('-')) > date || new Date(pr.endLessonDate.split('.').reverse().join('-')) < date) return null;
        } else {
            const prDate = new Date(pr.dateLesson.split('.').reverse().join('-'));

            if (prDate.getFullYear() !== date.getFullYear() || prDate.getMonth() !== date.getMonth() || prDate.getDate() !== date.getDate()) return null;
        }

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

