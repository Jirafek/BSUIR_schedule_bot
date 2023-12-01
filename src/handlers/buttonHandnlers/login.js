import {deleteMessage} from '../../utils/message.js';
import {addUser, updateToken, updateGroup} from '../../sql/defaultSQLCommands.js';
import {wrongPasswordMessage, successLogin} from '../../utils/defaultMessages.js';
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

    const loadingMessage = await bot.sendMessage(chatId, 'Загрузка   ');

    function updateLoadingMessage() {
        const frame = loadingFrames[currentFrameIndex];
        currentFrameIndex = (currentFrameIndex + 1) % loadingFrames.length;
        const newText = `Загрузка    ${frame}`;

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
            updateGroup(chatId, +response.data.group);

            const studentName = response.data.fio.split(' ')[1];


            const EnterButtonsMarkup = {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Расписание', callback_data: 'schedule'}, {
                            text: 'Напоминания',
                            callback_data: 'reminders'
                        }],
                        [{text: 'Отметки', callback_data: 'grades'},],
                    ],
                },
            };

            await bot.sendMessage(chatId, `*${studentName}* ${successLogin}`, {parse_mode: 'Markdown', ...EnterButtonsMarkup})

        }

    } catch (error) {
        console.info(error);

        const ReloginButtonsMarkup = {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Повторить', callback_data: 'login_yes'}, {text: 'Выход', callback_data: 'login_no'}],
                ],
            },
        };

        await bot.sendMessage(chatId, wrongPasswordMessage, {parse_mode: 'Markdown', ...ReloginButtonsMarkup});
    } finally {
        clearInterval(loadingInterval);
        await bot.deleteMessage(chatId, loadingMessage.message_id);
    }
}

