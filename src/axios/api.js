import axios from "axios";
import {refreshToken} from "./refreshToken.js";

let currentToken = '';

export const updateCurrentToken = (newToken) => {
    currentToken = newToken;
}


export const api = axios.create({
    baseURL: 'https://iis.bsuir.by/api/v1',
    headers: {
        'access-control-allow-origin': '*',
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(async config => {

    if (currentToken) {
        config.headers.Cookie = `JSESSIONID=${currentToken}`;
    }

    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const status = error.response ? error.response.status : null;
        const chatId = error.config ? (error.config.headers.xChatId || null) : null;

        if ((status === 401 || status === 403) && error.config.needrefresh !== false) {
            if (error.config.headers && error.config.headers['NO_RETRY_HEADER']) {
                return Promise.reject(error)
            }

            error.config.headers['NO_RETRY_HEADER'] = 'true'

            const refreshData = await refreshToken(chatId);

            if (refreshData.success) {
                updateCurrentToken(refreshData.token);

                error.config.headers.Cookie = refreshData.token;
            }

            return api(error.config);
        }
        return Promise.reject(error);
    }
);
