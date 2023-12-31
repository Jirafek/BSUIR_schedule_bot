export const loadingFrames = ['👉', '👉🏻', '👉🏼', '👉🏽', '👉🏾', '👉🏿', '🔍', '🔍🏻', '🔍🏼', '🔍🏽'];

export const waiting = async (bot, chatId, loadingMessage, currentFrameIndex) => {
    const frame = loadingFrames[currentFrameIndex];

    const newText = `Загрузка   ${frame}`;

    try {
        await bot.editMessageText(newText, {
            chat_id: chatId,
            message_id: loadingMessage.message_id,
            parse_mode: 'Markdown',
        });
    } catch (error) {
        console.error(error.response.statusCode);
    }
}
