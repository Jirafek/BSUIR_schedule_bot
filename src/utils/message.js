export const deleteMessage = async (bot, chatId, messageId) => {
    try {
        await bot.deleteMessage(chatId, messageId);
        return {success: true, message: 'Message deleted successfully.'};
    } catch (error) {
        console.error('Error deleting message:');
        return {success: false, message: 'Error deleting message.'};
    }
}