import {loadingFrames, waiting} from "../../../utils/waiting.js";
import {
    noLoginMessage,
    somethingWentWrong,
} from "../../../utils/defaultMessages.js";
import {isUserAlive} from "../../../user/isUserAlive.js";
import {api} from "../../../axios/api.js";
import {noLogin} from "../noLogin/noLogin.js";
import {sendMessage} from "../../../utils/message.js";

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
        await bot.deleteMessage(chatId, loadingMessage.message_id);

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
            const errorMessage = await sendMessage(bot, chatId, somethingWentWrong, {parse_mode: 'Markdown'});

            setTimeout(async () => {
                await bot.deleteMessage(chatId, errorMessage.message_id);
            }, 5000)
        }

    } catch (error) {
        console.info(error);

        if (error && error.status === 404) {
            await noLogin(bot, chatId, noLoginMessage);
        } else {
            const errorMessage = await sendMessage(bot, chatId, somethingWentWrong, {parse_mode: 'Markdown'});

            setTimeout(async () => {
                await bot.deleteMessage(chatId, errorMessage.message_id);
            }, 5000)
        }
    } finally {
        clearInterval(loadingInterval);
        await bot.deleteMessage(chatId, loadingMessage.message_id);
    }
}