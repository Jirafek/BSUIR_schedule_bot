import {sendMessage} from "../../../utils/message.js";
import {isUserAlive} from "../../../user/isUserAlive.js";


export const subGroupChoice = async (bot, chatId) => {
    const user = await isUserAlive(bot, chatId, true);

    if (!user) {
        return;
    }

    const subGroupButtonsMarkup = {
        reply_markup: {
            inline_keyboard: [
                [{text: '1 🤠', callback_data: 'subGroup_1'}, {text: '2 😸', callback_data: 'subGroup_2'}],
                [{text: 'Для обеих 👥', callback_data: 'subGroup_both'}]
            ]
        }
    }

    await sendMessage(bot, chatId, 'Для какой подгруппы показывать расписание?', {parse_mode: 'Markdown', ...subGroupButtonsMarkup})
}
