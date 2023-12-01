import {deleteMessage} from '../../utils/message.js';
import {addUser, updateToken} from '../../sql/defaultSQLCommands.js';
import {api} from '../../axios/api.js';
import cookie from 'cookie';

export const login = async (bot, chatId) => {

    await bot.sendMessage(chatId, 'Введите ваш *username*:', {parse_mode: 'Markdown'});

    const toBeDeleted = [];

    bot.once('text', async (message) => {
        const messageId = message.message_id;
        const username = message.text;

        toBeDeleted.push(messageId - 1);
        toBeDeleted.push(messageId);

        await bot.sendMessage(chatId, 'Введите ваш *пароль*:', {parse_mode: 'Markdown'});

        bot.once('text', async (message) => {
            const messageId = message.message_id;
            const password = message.text;

            toBeDeleted.push(messageId - 1)
            toBeDeleted.push(messageId)

            toBeDeleted.forEach(id => {
                deleteMessage(bot, chatId, id)
            })

            await auth(bot, chatId, username, password);

        });
    });
}

async function auth(bot, chatId, username, password) {


    const loadingFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let currentFrameIndex = 0;

    const loadingMessage = await bot.sendMessage(chatId, 'Загрузка...');

    function updateLoadingMessage() {
        const frame = loadingFrames[currentFrameIndex];
        currentFrameIndex = (currentFrameIndex + 1) % loadingFrames.length;
        const newText = `Загрузка... ${frame}`;

        bot.editMessageText(newText, {
            chat_id: chatId,
            message_id: loadingMessage.message_id,
        });
    }

    const loadingInterval = setInterval(updateLoadingMessage, 500);

    try {
        await addUser(chatId, username, password);

    } catch (error) {
        console.log('Cannot add a new user');
        return {success: false, message: 'Error adding a new user.'}
    }

    try {
        const response = await api.post('/auth/login', {
            username: username,
            password: password,
        }, {
            headers: {
                'x-chat-id': chatId,
            }
        });

        if (response) {
            const setCookieHeader = response.headers['set-cookie'];
            const parsedCookie = cookie.parse(setCookieHeader.join('; '));

            const tokenValue = parsedCookie.JSESSIONID;

            updateToken(chatId, tokenValue);
        }

    } catch (error) {
        console.info(error);
    } finally {
        clearInterval(loadingInterval);
        await bot.deleteMessage(chatId, loadingMessage.message_id);
    }
}

