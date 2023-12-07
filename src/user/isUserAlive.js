import {findUserByChatId} from "../sql/defaultSQLCommands.js";
import {dontHaveAccess, dontHaveAccessButton} from "../utils/defaultMessages.js";
import {sendMessage} from "../utils/message.js";

export const isUserAlive = async (bot, chatId, isButtonCLick, needToCheckToken = false) => {
    const user = await findUserByChatId(chatId);

    const checker = needToCheckToken ? user && user.token : user;

    if (!checker) {
        const ReloginButtonsMarkup = {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Вход', callback_data: 'login_yes'}, {text: 'Отмена', callback_data: 'login_no'}],
                ],
            },
        };

        await sendMessage(bot, chatId, isButtonCLick ? dontHaveAccessButton : dontHaveAccess, {parse_mode: 'Markdown', ...ReloginButtonsMarkup});

        return null;
    }

    return user;

}