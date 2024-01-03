import {loadingFrames, waiting} from "../../../utils/waiting.js";
import {addUser, updateGroup, updateToken} from "../../../sql/defaultSQLCommands.js";
import {api} from "../../../axios/api.js";
import cookie from "cookie";
import {gradesBtn, menuBtn, omissionsBtn, reminderBtn, scheduleBtn} from "../../../utils/defaultButtons.js";
import {somethingWentWrong, successLogin, wrongPasswordMessage} from "../../../utils/defaultMessages.js";
import {sendMessage} from "../../../utils/message.js";

export async function auth(bot, chatId, username, password) {

    let currentFrameIndex = 1;

    const loadingMessage = await bot.sendMessage(chatId, 'Загрузка   👉');

    const loadingInterval = setInterval(() => {
        waiting(bot, chatId, loadingMessage, currentFrameIndex);
        currentFrameIndex = (currentFrameIndex + 1) % loadingFrames.length;
    }, 500);


    const ReloginButtonsMarkup = {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Повторить', callback_data: 'login_yes'}, menuBtn],
            ],
        },
    };

    try {

        const response = await api.post('/auth/login', {
            username: username,
            password: password,
        }, {
            headers: {
                xChatId: chatId,
            },
            needrefresh: false,
        });

        if (response && response.data) {
            try {
                await addUser(chatId, username, password);
            } catch (error) {
                console.log('cannot add new user')
            }

            const setCookieHeader = response.headers['set-cookie'];
            const parsedCookie = cookie.parse(setCookieHeader.join('; '));

            const tokenValue = parsedCookie.JSESSIONID;

            await updateToken(chatId, tokenValue);
            updateGroup(chatId, +response.data.group);

            const studentName = response.data.fio.split(' ')[1];


            const EnterButtonsMarkup = {
                reply_markup: {
                    inline_keyboard: [
                        [scheduleBtn, reminderBtn],
                        [gradesBtn, omissionsBtn],
                    ],
                },
            };

            await sendMessage(bot, chatId, `*${studentName}* ${successLogin}`, {parse_mode: 'Markdown', ...EnterButtonsMarkup})

        } else {
            const errorMessage = await sendMessage(bot, chatId, somethingWentWrong, {parse_mode: 'Markdown'});

            setTimeout(async () => {
                await sendMessage(bot, chatId, errorMessage.message_id);
            }, 5000)
        }

    } catch (error) {
        await sendMessage(bot, chatId, wrongPasswordMessage, {parse_mode: 'Markdown', ...ReloginButtonsMarkup});
    } finally {
        clearInterval(loadingInterval);
        await bot.deleteMessage(chatId, loadingMessage.message_id);
    }
}