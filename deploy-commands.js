require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { ProxyAgent } = require('undici');

const PROXY_URL = process.env.HTTP_PROXY || 'http://127.0.0.1:3067';

const commands = [
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Показать правила HERADE HOUSE 2.0')
    .addIntegerOption(option => 
      option.setName('глава')
        .setDescription('Номер раздела (1, 2 или 3)')
        .setRequired(true)
        .addChoices(
          { name: 'Раздел 1 - Общие правила', value: 1 },
          { name: 'Раздел 2 - Чат и голос', value: 2 },
          { name: 'Раздел 3 - Игры', value: 3 }
        )
    )
    .toJSON(),
];

const rest = new REST({ version: '10', agent: new ProxyAgent(PROXY_URL) }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Обновление слэш-команд...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1563229854030372864'),
      { body: commands }
    );
    console.log('✅ Команда /rules с выбором главы успешно обновлена!');
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
  }
})();