import {login} from './buttonHandnlers/login.js';
import {deleteMessage} from '../utils/message.js';

export const callBackHandler = async (bot, query) => {
    const {data, message} = query;

    await deleteMessage(bot, message.chat.id, message.message_id);

    console.log(message.message_id, 'login');

    if (data === 'login_yes') {
        await login(bot, message.chat.id);
    }

}