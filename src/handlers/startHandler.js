import {welcomeMessage} from '../utils/defaultMessages.js';
import {deleteMessage} from '../utils/message.js';

export const startHandler = async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    for (let i = 0; i < 5; i++) {
        bot.sendMessage(chatId, '🚀');
    }

    const loginButtonsMarkup = {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Да ✅', callback_data: 'login_yes'}],
                [{text: 'Нет ❌', callback_data: 'login_no'}],
            ],
        },
    };

    await deleteMessage(bot, chatId, messageId);

    await bot.sendMessage(chatId, welcomeMessage, {parse_mode: 'Markdown', ...loginButtonsMarkup});
};
