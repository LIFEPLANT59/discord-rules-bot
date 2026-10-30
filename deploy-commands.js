require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { ProxyAgent } = require('undici');

// Твой прокси из bot.js
const PROXY_URL = process.env.HTTP_PROXY || 'http://127.0.0.1:3067';

const commands = [
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Показать правила сервера')
    .toJSON(),
];

// ВАЖНО: передаем agent с прокси в REST
const rest = new REST({ 
  version: '10',
  agent: new ProxyAgent(PROXY_URL) 
}).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Регистрация слэш-команд на сервере...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1563229854030372864'),
      { body: commands }
    );
    console.log('✅ Слэш-команды успешно зарегистрированы на сервере!');
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
  }
})();