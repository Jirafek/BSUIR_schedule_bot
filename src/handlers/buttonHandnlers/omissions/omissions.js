import {deleteMessage, sendMessage} from "../../../utils/message.js";
import {loadingFrames, waiting} from "../../../utils/waiting.js";
import {isUserAlive} from "../../../user/isUserAlive.js";
import {api, updateCurrentToken} from "../../../axios/api.js";
import {somethingWentWrongError} from "../../../errors/somethingWentWrongError.js";
import {onRefreshFailed} from "../../../axios/refreshToken.js";
import {monthEmojis} from "../../../utils/defaultMessages.js";

export const omissions = async (bot, chatId, isRetryed = false) => {

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

    try {
        updateCurrentToken(user.token);

        const response = await api.get(`/omission-count-by-student-for-semester`, {
            headers: {
                xChatId: chatId,
            }
        });

        if (response && response.data) {
            let omissionsMessage = response.data.length !== 0 ? `*Ваши текущие пропуски:* \n\n` : `Кажется у вас совсем нету пропусков! 🎉\n`;
            let totalHours = 0;

            response.data.forEach(omission => {
                omissionsMessage += `${monthEmojis[omission.month]} _${omission.month}_: ${omission.omissionCount}ч.\n`;
                totalHours += omission.omissionCount;
            });

            omissionsMessage += `\n*Всего*: ${totalHours}ч.`;

            await sendMessage(bot, chatId, omissionsMessage, {parse_mode: 'Markdown'});


        } else if (!response) {
            await somethingWentWrongError(bot, chatId);
        }

        clearInterval(loadingInterval);
        await deleteMessage(bot, chatId, loadingMessage.message_id);

    } catch (error) {
        clearInterval(loadingInterval);
        await deleteMessage(bot, chatId, loadingMessage.message_id);

        if ([401, 403].includes(error.response.status)) {
            if (!isRetryed) {
                await omissions(bot, chatId, true);
            } else {
                await onRefreshFailed(bot, chatId);
            }
        } else {
            await somethingWentWrongError(bot, chatId);
        }
    }

}