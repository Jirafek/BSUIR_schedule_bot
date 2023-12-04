import {restriction} from '../../../utils/defaultMessages.js';
import {clearChat, deleteMessage, sendMessage} from '../../../utils/message.js';
import {addNoPasswordUser} from '../../../sql/defaultSQLCommands.js';
import botCommands from "../../../utils/botCommands.js";

export const noLogin = async (bot, chatId, message) => {
    await sendMessage(bot, chatId, message, {parse_mode: 'Markdown'});

    bot.once('text', async (message) => {
        const messageId = message.message_id;
        const groupNumber = message.text;

        if (botCommands.includes(groupNumber)) {
            await clearChat(bot, chatId);

            return;
        }

        await deleteMessage(bot, message.chat.id, messageId - 1);
        await deleteMessage(bot, message.chat.id, messageId);

        if (isNaN(Number(groupNumber))) {
            await sendMessage(bot, chatId, restriction, {parse_mode: 'Markdown'});

            return;
        }

        try {
            await addNoPasswordUser(message.chat.id, +groupNumber);
        } catch (e) {
            console.log('Cannot create new no-password user');
            return {success: false, message: 'Error adding a new user.'}
        }

        const EnterButtonsMarkup = {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Расписание', callback_data: 'schedule'},],
                ],
            },
        };

        await sendMessage(bot, message.chat.id, `Вы успешно добавили свою группу 😊🎉 *${groupNumber}*`, {
            parse_mode: "Markdown",
            ...EnterButtonsMarkup
        })
    });
}