import {loadingFrames, waiting} from "../../../utils/waiting.js";
import {
    noLoginMessage,
} from "../../../utils/defaultMessages.js";
import {isUserAlive} from "../../../user/isUserAlive.js";
import {api} from "../../../axios/api.js";
import {noLogin} from "../noLogin/noLogin.js";
import {deleteMessage, sendMessage} from "../../../utils/message.js";
import {somethingWentWrongError} from "../../../errors/somethingWentWrongError.js";
import {updateSchedule} from "./savedSchedule.js";
import {collectMessage} from "./collectMessage.js";

export const schedule = async (bot, chatId, date = new Date(), subGroup = null, messageId = null) => {

    let currentFrameIndex = 1;

    const user = await isUserAlive(bot, chatId, true);

    const loadingMessage = await sendMessage(bot, chatId, 'Загрузка   👉');

    const loadingInterval = setInterval(() => {
        waiting(bot, chatId, loadingMessage, currentFrameIndex);
        currentFrameIndex = (currentFrameIndex + 1) % loadingFrames.length;
    }, 500);

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

            updateSchedule(response.data);

            await collectMessage(bot, chatId, response.data, date, subGroup, messageId);


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