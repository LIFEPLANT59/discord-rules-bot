require('dotenv').config();
const { bootstrap } = require('global-agent');

// Настройка прокси для обхода блокировок WSL
const PROXY_URL = process.env.HTTP_PROXY || 'http://127.0.0.1:3067';
process.env.GLOBAL_AGENT_HTTP_PROXY = PROXY_URL;
process.env.GLOBAL_AGENT_HTTPS_PROXY = PROXY_URL;
bootstrap();

const { setGlobalDispatcher, ProxyAgent } = require('undici');
try {
  setGlobalDispatcher(new ProxyAgent(PROXY_URL));
} catch (e) {
  console.log('⚠️ Ошибка установки прокси в undici, идем напрямую...');
}

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const RULES = {
  games: {
    title: 'РАЗДЕЛ 3 — ПОВЕДЕНИЕ В ИГРАХ',
    icon: '🎮',
    desc: 'Данный раздел устанавливает правила поведения участников во время совместной игры. Нарушение данных правил влечет за собой наказание.',
    points: [
      { name: 'Пункт 3.1', rule: 'Запрещено использование читов и запрещённых программ.', punish: 'Бан.', duration: 'до 7 дней | Навсегда.' },
      { name: 'Пункт 3.2', rule: 'Запрещено использование игровых багов для преимущества.', punish: 'Пред/Бан.', duration: 'до 7 дней.' }
    ]
  },
  chat: {
    title: 'РАЗДЕЛ 1 — ОБЩЕНИЕ',
    icon: '💬',
    desc: 'Правила общения в текстовых и голосовых каналах.',
    points: [
      { name: 'Пункт 1.1', rule: 'Запрещено оскорбление участников.', punish: 'Мут.', duration: 'на 1 час.' }
    ]
  }
};

function buildEmbed(key) {
  const data = RULES[key];
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setAuthor({ name: 'Правила | TRIGERY', iconURL: client.user.displayAvatarURL() })
    .setTitle(`${data.icon} ${data.title}`)
    .setDescription(`**${data.desc}**`);

  data.points.forEach(p => {
    embed.addFields({ name: `\u200b\n🔹 **${p.name}**`, value: `\`\`\`${p.rule}\`\`\`` });
    embed.addFields(
      { name: 'Наказание:', value: `> **${p.punish}**`, inline: true },
      { name: 'Длительность:', value: `> **${p.duration}**`, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }
    );
  });
  return embed;
}

function buildMenu() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('rules_menu')
    .setPlaceholder('Выберите раздел...')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Поведение в играх').setValue('games').setEmoji('🎮'),
      new StringSelectMenuOptionBuilder().setLabel('Общение').setValue('chat').setEmoji('💬')
    );
  return new ActionRowBuilder().addComponents(menu);
}

client.once('ready', () => console.log(`✅ Бот ${client.user.tag} запущен!`));

client.on('interactionCreate', async i => {
  if (i.isChatInputCommand() && i.commandName === 'rules') {
    if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return i.reply({ content: '⛔ Только для админов.', ephemeral: true });
    }
    await i.reply({ embeds: [buildEmbed('games')], components: [buildMenu()] });
  }
  if (i.isStringSelectMenu() && i.customId === 'rules_menu') {
    await i.deferUpdate();
    await i.editReply({ embeds: [buildEmbed(i.values[0])], components: [buildMenu()] });
  }
});

client.login(process.env.DISCORD_TOKEN);