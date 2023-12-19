import {welcomeMessage, welcomeBackMessage, welcomeBackMessageNoLogin} from '../utils/defaultMessages.js';
import {clearChat, deleteMessage, sendMessage} from '../utils/message.js';
import {findUserByChatId} from "../sql/defaultSQLCommands.js";
import {gradesBtn, loginButtonsMarkup, omissionsBtn, reminderBtn, scheduleBtn} from "../utils/defaultButtons.js";

export const startHandler = async (bot, msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    await deleteMessage(bot, chatId, messageId);

    await clearChat(bot, chatId);

    const user = await findUserByChatId(chatId);

    const sendRocket = async () => {
        await bot.sendMessage(chatId, '🚀');
    };

    const promises = Array.from({length: 5}, () => sendRocket());

    await Promise.all(promises);

    if (user) {

        const enterButtonsMarkup = {
            reply_markup: {
                inline_keyboard: []
            }
        }

        if (user.token) {
            enterButtonsMarkup.reply_markup.inline_keyboard.push(
                [scheduleBtn, reminderBtn]
            )

            enterButtonsMarkup.reply_markup.inline_keyboard.push(
                [gradesBtn, omissionsBtn]
            )
        } else {
            enterButtonsMarkup.reply_markup.inline_keyboard.push(
                [scheduleBtn]
            )
        }

        await sendMessage(bot, chatId, user.token ? welcomeBackMessage : welcomeBackMessageNoLogin(user.userGroup), {parse_mode: 'Markdown', ...enterButtonsMarkup})

        return;
    }

    await sendMessage(bot, chatId, welcomeMessage, {parse_mode: 'Markdown', ...loginButtonsMarkup});
};
