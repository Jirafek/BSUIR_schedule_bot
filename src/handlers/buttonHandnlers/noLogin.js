import {noLoginMessage, restriction} from '../../utils/defaultMessages.js';
import {deleteMessage} from '../../utils/message.js';
import {addNoPasswordUser} from '../../sql/defaultSQLCommands.js';

export const noLogin = async (bot, chatId) => {
    await bot.sendMessage(chatId, noLoginMessage, {parse_mode: 'Markdown'});

    bot.once('text', async (message) => {
        const messageId = message.message_id;
        const groupNumber = message.text;

        await deleteMessage(bot, message.chat.id, messageId - 1);
        await deleteMessage(bot, message.chat.id, messageId);

        if (isNaN(Number(groupNumber))) {
            await bot.sendMessage(chatId, restriction, {parse_mode: 'Markdown'});

            return;
        }

        try {
            await addNoPasswordUser(message.chat.id, +groupNumber);
        } catch (e) {
            console.log('Cannot create new no-password user');
            return {success: false, message: 'Error adding a new user.'}
        }

        await bot.sendMessage(message.chat.id, 'Вы успешно добавили свою группу 😊🎉', {
            parse_mode: "Markdown",
        })
    });
}