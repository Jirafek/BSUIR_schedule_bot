export const scheduleBtn = {text: '📅 Расписание', callback_data: 'schedule'};
export const reminderBtn = {text: '⏰ Напоминания', callback_data: 'reminders'};
export const gradesBtn = {text: '📝 Оценки', callback_data: 'grades'};
export const omissionsBtn = {text: '📋 Пропуски', callback_data: 'omissions'};
export const menuBtn = {text: '🍽 Меню', callback_data: 'menu'};

export const loginButtonsMarkup = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'Да ✅', callback_data: 'login_yes'}, {text: 'Нет ❌', callback_data: 'login_no'}],
        ],
    },
};