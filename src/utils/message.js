export const localMessages = [];

export const deleteMessage = async (bot, chatId, messageId) => {
    try {

        if (Array.isArray(messageId)) {
            for (const id of messageId) {
                await bot.deleteMessage(chatId, id);

                const indexToRemove = localMessages.indexOf(id);
                localMessages.splice(indexToRemove);
            }
        } else {
            await bot.deleteMessage(chatId, messageId);

            const indexToRemove = localMessages.indexOf(messageId);
            localMessages.splice(indexToRemove);
        }

        return {success: true, message: 'Message deleted successfully.'};
    } catch (error) {
        return {success: false, message: 'Error deleting message.'};
    }
}

export const clearChat = async (bot, chatId) => {
    try {
        await deleteMessage(bot, chatId, localMessages);
    } catch (error) {
        return {success: false, message: 'Error deleting all messages.'};
    }
}

export const sendMessage = async (bot, chatId, text, options = {}) => {
    const message = await bot.sendMessage(chatId, text, options);

    localMessages.push(message.message_id);

    return message;
}
