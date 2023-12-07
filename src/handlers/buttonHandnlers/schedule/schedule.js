import {loadingFrames, waiting} from "../../../utils/waiting.js";
import {
    noLoginMessage,
} from "../../../utils/defaultMessages.js";
import {isUserAlive} from "../../../user/isUserAlive.js";
import {api} from "../../../axios/api.js";
import {noLogin} from "../noLogin/noLogin.js";
import {deleteMessage, sendMessage} from "../../../utils/message.js";
import {somethingWentWrongError} from "../../../errors/somethingWentWrongError.js";

export const schedule = async (bot, chatId) => {

    let currentFrameIndex = 1;

    const loadingMessage = await sendMessage(bot, chatId, 'Загрузка   👉');

    const loadingInterval = setInterval(() => {
        waiting(bot, chatId, loadingMessage, currentFrameIndex);
        currentFrameIndex = (currentFrameIndex + 1) % loadingFrames.length;
    }, 500);

    const user = await isUserAlive(bot, chatId, true);

    if (!user) {
        clearInterval(loadingInterval);
        await deleteMessage(bot, chatId, loadingMessage.message_id);

        return;
    }

    try {
        const response = await api.get(`/schedule?studentGroup=${user.userGroup}`, {
            headers: {
                'x-chat-id': chatId,
            }
        });

        if (response && response.data) {

            console.log(response.data);

            // here need to parse schedule
        } else {
            await somethingWentWrongError(bot, chatId);
        }

    } catch (error) {
        console.info(error);

        if (error && error.status === 404) {
            await noLogin(bot, chatId, noLoginMessage);
        } else {
            await somethingWentWrongError(bot, chatId);
        }
    } finally {
        clearInterval(loadingInterval);
        await deleteMessage(bot, chatId, loadingMessage.message_id);
    }
}