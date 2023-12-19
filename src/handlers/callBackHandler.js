import {login} from './buttonHandnlers/login/login.js';
import {noLogin} from './buttonHandnlers/noLogin/noLogin.js';
import {schedule} from './buttonHandnlers/schedule/schedule.js';
import {deleteMessage} from '../utils/message.js';
import {noLoginMessage} from '../utils/defaultMessages.js';
import {omissions} from "./buttonHandnlers/omissions/omissions.js";
import {subGroupChoice} from "./buttonHandnlers/schedule/subGroupChoice.js";
import botEditedCommands from "../utils/botEditedCommands.js";
import {getSavedSchedule, needToUpdateSchedule} from "./buttonHandnlers/schedule/savedSchedule.js";
import {collectMessage} from "./buttonHandnlers/schedule/collectMessage.js";
import {menu} from "./menu.js";

export const callBackHandler = async (bot, query) => {
    const {data, message} = query;

    if (!botEditedCommands.includes(data.split('_')[0])) {
        await deleteMessage(bot, message.chat.id, message.message_id);
    }


    if (data === 'login_yes') {

        await login(bot, message.chat.id);

    } else if (data === 'login_no') {

        await noLogin(bot, message.chat.id, noLoginMessage);

    } else if (data === 'schedule') {

        await subGroupChoice(bot, message.chat.id);

    } else if (data === 'omissions') {

        await omissions(bot, message.chat.id);

    } else if (data.startsWith('subGroup')) {
        let subGroup = data.split('_').pop();

        if (isNaN(Number(subGroup))) subGroup = null;
        else subGroup = +subGroup

        await schedule(bot, message.chat.id, new Date(), subGroup);
    } else if (data.startsWith('getSchedule')) {
        let subGroup = data.split('_')[1];

        if (isNaN(Number(subGroup))) subGroup = null;
        else subGroup = +subGroup

        const date = new Date(data.split('_').pop());

        if (needToUpdateSchedule()) {
            try {
                await bot.answerCallbackQuery(query.id, {
                    text: 'Обновляю ваше расписание',
                });
            } catch (error) {
                console.log(error.response.statusCode);
            }

            await schedule(bot, message.chat.id, date, subGroup, message.message_id);
        } else {
            const scheduleResponce = getSavedSchedule();

            await collectMessage(bot, message.chat.id, scheduleResponce, date, subGroup, message.message_id);
        }

    } else if (data === 'menu') {
        await menu(bot, null, message.chat.id);
    }

}