const TelegramAPI = require('node-telegram-bot-api');
const sequelize = require('./db');
const {gameOptions, againOptions} = require('./options');
const UserModel = require('./models');
const token = '1866462389:AAETNMboHgN4qwfPUNvOjWY_3My380dwC4M';
const bot = new TelegramAPI(token, {polling: true});
const chats = {};


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `try to guess a number from 0 to 9`);
    const randomNumber = Math.floor(Math.random() * 10 + 1);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'try to guess a number', gameOptions);
};

const start = async () => {

    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (e) {
        console.log('Подключение к бд сломалось', e);
    }

    bot.setMyCommands([
        {command: '/start', description: 'initial greeting'},
        {command: '/info', description: 'get user info'},
        {command: '/game', description: 'guess number'}
    ]);

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
            return startGame(chatId);
            // await bot.sendMessage(chatId, `try to guess a number from 0 to 9`);
            // const randomNumber = Math.floor(Math.random() * 10 + 1);
            // chats[chatId] = randomNumber;
            // return bot.sendMessage(chatId, 'try to guess a number', gameOptions)
        }
        return bot.sendMessage(chatId, `i don't understand you, please try again`);
    });
    bot.on('callback_query', async msg => {

        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId);
        }
        const user = await UserModel.findOne({chatId})
        if (chatId == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Congratulations! You guessed the numbers ${chats[chatId]}`, againOptions);
        } else {
            await bot.sendMessage(chatId, `Unfortunately you lost. Correct number was ${chats[chatId]}`, againOptions);
        }
        await user.save()
    });
};

start();

bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === '/again') {
        return startGame(chatId)
    }
    const user = await UserModel.findOne({chatId})
    if (data == chats[chatId]) {
        user.right += 1;
        await bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions);
    } else {
        user.wrong += 1;
        await bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions);
    }
    await user.save();
})