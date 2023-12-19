
export const CollectMessage = (response) => {
    response = response[0];

    let gradesMessage = `${response.student.fio.split(' ')[1]}, *Ваша успеваемость:* \n\n`;

    let subjects = {};
    let controlPoints = {};

    response.student.lessons.forEach(lesson => {
        if (!subjects[lesson.lessonNameAbbrev]) {
            subjects[lesson.lessonNameAbbrev] = [];
        }

        subjects[lesson.lessonNameAbbrev] = [...subjects[lesson.lessonNameAbbrev], ...lesson.marks];

        if (!controlPoints[lesson.controlPoint]) {
            controlPoints[lesson.controlPoint] = [];
        }

        controlPoints[lesson.controlPoint] = [...controlPoints[lesson.controlPoint], ...lesson.marks];
    });

    for (const subject in subjects) {
        gradesMessage += `*${subject}* - `;

        subjects[subject].forEach(mark => {
            gradesMessage += `_${mark}_, `;
        });

        if (subjects[subject].length === 0) {
            gradesMessage += `_нет оценок_, `;
        }

        gradesMessage = gradesMessage.slice(0, -2);

        gradesMessage += `\n`;
    }

    gradesMessage += `\n\n*КТ:*\n\n`;

    for (const controlPoint in controlPoints) {
        let sum = controlPoints[controlPoint].reduce(function(acc, cur) {
            return acc + cur;
        }, 0);

        if (parseInt(sum) !== 0) {
            sum = sum / controlPoints[controlPoint].length;
        }

        gradesMessage += `*${controlPoint}* - _${sum.toFixed(2)}_\n`;
    }


    return gradesMessage;
}

