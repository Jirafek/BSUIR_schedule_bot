import {loadingFrames, waiting} from "../../../utils/waiting.js";
import {deleteMessage, sendMessage} from "../../../utils/message.js";
import {isUserAlive} from "../../../user/isUserAlive.js";
import {menuBtn} from "../../../utils/defaultButtons.js";
import {api, updateCurrentToken} from "../../../axios/api.js";
import {somethingWentWrongError} from "../../../errors/somethingWentWrongError.js";
import {onRefreshFailed} from "../../../axios/refreshToken.js";
import {CollectMessage} from "./collectMessage.js";

export const grades = async (bot, chatId, isRetryed = false) => {

        let currentFrameIndex = 1;

        const loadingMessage = await sendMessage(bot, chatId, 'Загрузка   👉');

        const loadingInterval = setInterval(() => {
            waiting(bot, chatId, loadingMessage, currentFrameIndex);
            currentFrameIndex = (currentFrameIndex + 1) % loadingFrames.length;
        }, 500);

    const user = await isUserAlive(bot, chatId, true, true);

    if (!user) {
        clearInterval(loadingInterval);
        await deleteMessage(bot, chatId, loadingMessage.message_id);

        return;
    }

    const gradesButtonsMarkup = {
        reply_markup: {
            inline_keyboard: [
                [menuBtn],
            ]
        }
    }

    try {
        updateCurrentToken(user.token);

        const response = await api.get(`/grade-book`, {
            headers: {
                xChatId: chatId,
            }
        });

        if (response && response.data) {
            const gradesMessage = CollectMessage(response.data);

            await sendMessage(bot, chatId, gradesMessage, {parse_mode: 'Markdown', ...gradesButtonsMarkup});

        } else if (!response) {
            await somethingWentWrongError(bot, chatId);
        }

        clearInterval(loadingInterval);
        await deleteMessage(bot, chatId, loadingMessage.message_id);

    } catch (error) {
        clearInterval(loadingInterval);
        await deleteMessage(bot, chatId, loadingMessage.message_id);

        if (error.response && [401, 403].includes(error.response.status)) {
            if (!isRetryed) {
                await grades(bot, chatId, true);
            } else {
                await onRefreshFailed(bot, chatId);
            }
        } else {
            await somethingWentWrongError(bot, chatId);
        }
    }

}
