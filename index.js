const TelegramAPI = require('node-telegram-bot-api');

const {gameOptions, againOptions} = require('./options')
const token = '1866462389:AAETNMboHgN4qwfPUNvOjWY_3My380dwC4M';
const bot = new TelegramAPI(token, {polling: true});
const chats = {};





bot.setMyCommands([
    {command: '/start', description: 'initial greeting'},
    {command: '/info', description: 'get user info'},
    {command: '/game', description: 'guess number'}
]);

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `try to guess a number from 0 to 9`);
    const randomNumber = Math.floor(Math.random() * 10 + 1);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'try to guess a number', gameOptions)
}

const start = () => {
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const name = msg.from.first_name;
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/1.webp');
            return bot.sendMessage(chatId, `Welcome to GuessBot `);
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, `your name is ${name} ${msg.from.username}`);
        }
        if (text === '/game') {
            return startGame(chatId)
            // await bot.sendMessage(chatId, `try to guess a number from 0 to 9`);
            // const randomNumber = Math.floor(Math.random() * 10 + 1);
            // chats[chatId] = randomNumber;
            // return bot.sendMessage(chatId, 'try to guess a number', gameOptions)
        }
        return bot.sendMessage(chatId, `i don't understand you, please try again`);
    });
    bot.on('callback_query', msg => {

        const data = msg.data;
        const chatId = msg.message.chat.id;
        if(data === '/again') {
            return startGame(chatId)
        }
        if(chatId === chats[chatId]){
            return bot.sendMessage(chatId, `Congratulations! You guessed the numbers ${chats[chatId]}`,againOptions )
        } else {
            return bot.sendMessage(chatId, `Unfortunately you lost. Crrect number was ${chats[chatId]}`,againOptions)
        }
        // bot.sendMessage(chatId, `you chosen number ${data}`);
    });
};

start();