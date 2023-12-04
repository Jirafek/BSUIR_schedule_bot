import {deleteMessage, sendMessage} from '../../../utils/message.js';
import botCommands from "../../../utils/botCommands.js";
import {auth} from "./auth.js";

export const login = async (bot, chatId) => {

    await sendMessage(bot, chatId, 'Введите ваш *username*:', {parse_mode: 'Markdown'});

    const toBeDeleted = [];

    bot.once('text', async (message) => {
        const messageId = message.message_id;
        const username = message.text;

        toBeDeleted.push(messageId - 1);
        toBeDeleted.push(messageId);

        if (botCommands.includes(username)) {
            await deleteMessage(bot, chatId, toBeDeleted);

            return;
        }

        await sendMessage(bot, chatId, 'Введите ваш *пароль*:', {parse_mode: 'Markdown'});

        bot.once('text', async (message) => {
            const messageId = message.message_id;
            const password = message.text;

            toBeDeleted.push(messageId - 1)
            toBeDeleted.push(messageId)

            if (botCommands.includes(password)) {
                await deleteMessage(bot, chatId, toBeDeleted);

                return;
            }

            await deleteMessage(bot, chatId, toBeDeleted);

            await auth(bot, chatId, username, password);

        });
    });
}

