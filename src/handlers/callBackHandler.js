import {login} from './buttonHandnlers/login.js';
import {noLogin} from './buttonHandnlers/noLogin.js';
import {deleteMessage} from '../utils/message.js';

export const callBackHandler = async (bot, query) => {
    const {data, message} = query;

    await deleteMessage(bot, message.chat.id, message.message_id);

    console.log(message.message_id, 'login');

    if (data === 'login_yes') {
        await login(bot, message.chat.id);
    } else if (data === 'login_no') {
        await noLogin(bot, message.chat.id)
    }

}