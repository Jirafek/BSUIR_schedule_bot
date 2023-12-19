import {deleteUserByChatId, getDecryptedPassword, updateToken} from "../sql/defaultSQLCommands.js";
import {api} from "./api.js";
import {sendMessage} from "../utils/message.js";
import {ReLoginMessage} from "../utils/defaultMessages.js";
import cookie from "cookie";

export const refreshToken = async (chatId) => {

    const userData = await getDecryptedPassword(chatId);

    try {

        const response = await api.post('/auth/login', {
            ...userData
        },
            {
            headers: {
                xChatId: chatId,
            }
        }
        );

        if (response && response.data) {
            const setCookieHeader = response.headers['set-cookie'];
            const parsedCookie = cookie.parse(setCookieHeader.join('; '));

            const tokenValue = parsedCookie.JSESSIONID;

            await updateToken(chatId, tokenValue);

            return {success: true, message: 'Token updated', token: `JSESSIONID=${tokenValue}`}

        } else {
            return {success: false, message: 'No response', token: null}
        }

    } catch (error) {
        return {success: false, message: `Error on refresh - ${error}`, token: null}
    }
}

export const onRefreshFailed = async (bot, chatId) => {
    await deleteUserByChatId(chatId);

    const ReloginButtonsMarkup = {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Повторить', callback_data: 'login_yes'}, {text: 'Выход', callback_data: 'login_no'}],
            ],
        },
    };

    await sendMessage(bot, chatId, ReLoginMessage, {parse_mode: 'Markdown', ...ReloginButtonsMarkup})
}
