export const ping = async (message) => {
    if (message.author.bot) return
    
    if (message.content === 'ping') {
        await message.reply('pong')
    }
}