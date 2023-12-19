import {findUserByChatId} from "../sql/defaultSQLCommands.js";
import {gradesBtn, loginButtonsMarkup, omissionsBtn, reminderBtn, scheduleBtn} from "../utils/defaultButtons.js";
import {clearChat, deleteMessage, sendMessage} from "../utils/message.js";
import {
    menuWelcomeBackMessageNoLogin,
    menuWelcomeMessage, welcomeMessage,
} from "../utils/defaultMessages.js";


export const menu = async (bot, msg, chatId = null) => {

    if (!chatId) {
        chatId = msg.chat.id;

        await deleteMessage(bot, chatId, msg.message_id);

        await clearChat(bot, chatId);
    }

    const user = await findUserByChatId(chatId);

    if (user) {

        const menuButtonsMarkup = {
            reply_markup: {
                inline_keyboard: [],
            },
        };

        if (user.token) {
            menuButtonsMarkup.reply_markup.inline_keyboard.push(
                [scheduleBtn, reminderBtn]
            )

            menuButtonsMarkup.reply_markup.inline_keyboard.push(
                [gradesBtn, omissionsBtn]
            )
        } else {
            menuButtonsMarkup.reply_markup.inline_keyboard.push(
                [{text: 'Войти ✅', callback_data: 'login_yes'}]
            )

            menuButtonsMarkup.reply_markup.inline_keyboard.push(
                [scheduleBtn]
            )
        }

        await sendMessage(bot, chatId, user.token ? menuWelcomeMessage : menuWelcomeBackMessageNoLogin(user.userGroup), {parse_mode: 'Markdown', ...menuButtonsMarkup})

        return;
    }

    await sendMessage(bot, chatId, welcomeMessage, {parse_mode: 'Markdown', ...loginButtonsMarkup});
}
