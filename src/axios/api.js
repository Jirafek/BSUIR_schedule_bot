import axios from "axios";

import {findUserByChatId, getDecryptedPassword, updateToken} from '../sql/defaultSQLCommands.js';
import cookie from "cookie";

let chatId = 0;

export const updateChatId = (newChatId) => {
    chatId = newChatId;
}

export const api = axios.create({
    baseURL: 'https://iis.bsuir.by/api/v1',
    headers: {
        'access-control-allow-origin': '*'
    }
});

api.interceptors.request.use(
    async originalConfig => {

        let token = '';
        const config = {...originalConfig};
        if (config && config.headers) {
            const chatId = parseInt(config.headers['x-chat-id'], 10);

            if (chatId) {
                updateChatId(chatId);
                const user = await findUserByChatId(chatId)

                if (user) {
                    token = user.token ?? '';
                }
            }
            config.headers['Cookie'] = `JSESSIONID=${token}`;

            return config;
        }


        return originalConfig;
    },
    error => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {

                let userData = {
                    username: null,
                    password: null,
                };

                if (chatId) {
                    userData = await getDecryptedPassword(chatId)
                }


                const response = await api.post('/auth/login', {
                    ...userData
                }, {
                    headers: {
                        'x-chat-id': chatId,
                    }
                });

                const setCookieHeader = response.config.headers['set-cookie'];
                const parsedCookie = cookie.parse(setCookieHeader.join('; '));

                const tokenValue = parsedCookie.JSESSIONID;

                updateToken(chatId, tokenValue);


                return api.request(originalRequest);
            } catch (refreshError) {
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    },
);
