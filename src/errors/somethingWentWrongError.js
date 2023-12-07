import {deleteMessage, sendMessage} from "../utils/message.js";
import {somethingWentWrong} from "../utils/defaultMessages.js";

export const somethingWentWrongError = async (bot, chatId) => {
    const errorMessage = await sendMessage(bot, chatId, somethingWentWrong, {parse_mode: 'Markdown'});

    setTimeout(async () => {
        await deleteMessage(bot, chatId, errorMessage.message_id);
    }, 5000)
}