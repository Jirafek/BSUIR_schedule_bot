import {getCurrentWeek} from "./weeks/currentWeek.js";
import {parseSchedule} from "./parseSchedule.js";
import {sendMessage} from "../../../utils/message.js";
import {menuBtn} from "../../../utils/defaultButtons.js";

const daysData = {
    0: {
        name: 'Воскресенье',
        shortName: 'ВС',
    },
    1: {
        name: 'Понедельник',
        shortName: 'ПН',
    },
    2: {
        name: 'Вторник',
        shortName: 'ВТ',
    },
    3: {
        name: 'Среда',
        shortName: 'СР',
    },
    4: {
        name: 'Четверг',
        shortName: 'ЧТ',
    },
    5: {
        name: 'Пятница',
        shortName: 'ПТ',
    },
    6: {
        name: 'Суббота',
        shortName: 'СБ',
    },
}

const monthsData = {
    0: 'января',
    1: 'февраля',
    2: 'марта',
    3: 'апреля',
    4: 'мая',
    5: 'июня',
    6: 'июля',
    7: 'августа',
    8: 'сентября',
    9: 'октября',
    10: 'ноября',
    11: 'декабря'
}

const lessonEmojis = {
    'ЛК': '🟢',
    'ЛР': '🟡',
    'ПЗ': '🔴',
};

export const collectMessage = async (bot, chatId, scheduleResponse, date, subGroup = null, messageId = null) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const textTodayTomorrow = today.toDateString() === date.toDateString() ? 'Сегодня, ' : tomorrow.toDateString() === date.toDateString() ? 'Завтра, ' : '';

    const currentWeek = getCurrentWeek(scheduleResponse.startDate, scheduleResponse.endDate, date);

    let message = `<b>${scheduleResponse.studentGroupDto.name}</b> ${subGroup ? `👤 <b>${subGroup}</b>` : '👥'}\n\n`;
    message += `<b>${textTodayTomorrow}${daysData[date.getDay()].shortName}, ${date.getDate()} ${monthsData[date.getMonth()]}</b>\n\n`

    const parsedSchedule = parseSchedule(scheduleResponse.schedules, daysData[date.getDay()].name, date, currentWeek, subGroup);


    const nextDate = new Date(date);
    const prevDate = new Date(date);

    nextDate.setDate(date.getDate() + 1);
    prevDate.setDate(date.getDate() - 1);

    const scheduleButtonsMarkup = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '📅 Сегодня',
                    callback_data: `getSchedule_${subGroup}_${today.toISOString().split('T')[0]}`
                }, menuBtn],
                [{
                    text: '⬅️ Назад',
                    callback_data: `getSchedule_${subGroup}_${prevDate.toISOString().split('T')[0]}`
                }, {
                    text: 'Вперед ➡️',
                    callback_data: `getSchedule_${subGroup}_${nextDate.toISOString().split('T')[0]}`
                }]
            ]
        }
    }

    if (parsedSchedule === null || parsedSchedule.length === 0) {
        message += 'Нет занятий 🎉';
    } else {
        parsedSchedule.forEach(pr => {
            const needSubGroup = !subGroup && pr.numSubgroup !== 0;

            message += `${needSubGroup ? ` 👤 <b>${pr.numSubgroup}</b>  ` : ''}${lessonEmojis[pr.lessonTypeAbbrev]} <u>${pr.lessonTypeAbbrev}</u> <b>${pr.startLessonTime} - ${pr.endLessonTime}</b>\n`
            message += `${needSubGroup ? `      ` : ''}     •  <em>${pr.subject}  ${pr.employees.map(emp => `${emp.lastName} ${emp.firstName.charAt(0)}.${emp.middleName.charAt(0)}`)} ${pr.auditories.join(', ')}</em> ${pr.note ? `<u><b>${pr.note}</b></u>` : ''}\n\n`
        })
    }


    if (messageId) {
        try {
            await bot.editMessageText(message, {
                parse_mode: 'HTML',
                chat_id: chatId,
                message_id: messageId,
                ...scheduleButtonsMarkup
            });
        } catch (error) {
            console.log(error.response.statusCode)
        }
    } else {
        await sendMessage(bot, chatId, message, {parse_mode: 'HTML', ...scheduleButtonsMarkup});
    }

}

