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
  general: {
    title: 'РАЗДЕЛ 1 — ОБЩИЕ ПРАВИЛА',
    icon: '📜',
    desc: 'Основные правила поведения на сервере. Незнание правил не освобождает от ответственности.',
    points: [
      { name: 'Пункт 1.1', rule: 'Запрещено использование ненормативной лексики в чрезмерном или оскорбительном виде для других пользователей.', punish: 'Пред/Мут.', duration: 'до 2 часов | 3 дней.' },
      { name: 'Пункт 1.2', rule: 'Запрещён расизм, нацизм, дискриминация, унижение людей по национальности, цвету кожи, вероисповеданию.\nЗапрещены нацистские лозунги, символика, ники, аватарки, шутки и любые упоминания связанные с 1488, свастикой, Hitler, Nazi, ZOV, СВО.', punish: 'Мут/Бан.', duration: 'до 10 часов | 2 недели | Смена ника | Бан 3 дня.' },
      { name: 'Пункт 1.3', rule: 'Запрещена публикация материалов насильственного характера, жестокости, суицида, шок-контента.\nЗапрещён 18+ контент, NSFW-аватарки, баннеры и ссылки на подобные материалы.', punish: 'Мут/Бан.', duration: 'до 5 часов | 1 недели | Бан навсегда.' },
      { name: 'Пункт 1.4', rule: 'Запрещены ники, которые могут оскорбить других пользователей.\nЗапрещается использование в никах адресов сайтов, ссылок, рекламы.\nЗапрещено копирование профиля администрации.', punish: 'Мут/Бан.', duration: 'до 3 часов | 1 недели | Смена ника | Бан 7 дней.' },
      { name: 'Пункт 1.5', rule: 'Запрещено распространение личной информации пользователей без их разрешения.\nЗапрещены угрозы сватом, минированием, деаноном, родителями и иными методами давления.', punish: 'Бан.', duration: 'Навсегда.' },
      { name: 'Пункт 1.6', rule: 'Запрещена реклама сторонних Discord-серверов, проектов и сообществ.\nЗапрещена скрытая реклама через статус, ник, ссылки, демонстрацию экрана.', punish: 'Мут/Бан.', duration: 'до 5 часов | 1 недели | Бан навсегда.' },
      { name: 'Пункт 1.7', rule: 'Запрещён скам, обман, мошенничество и любые махинации.\nЗапрещено выдавать себя за другого человека, администрацию или медийную личность.', punish: 'Мут/Бан.', duration: 'до 2 недели | Бан навсегда' },
      { name: 'Пункт 1.8', rule: 'Запрещено намеренное создание конфликтов между участниками сервера.', punish: 'Пред/Мут.', duration: 'до 6 часов | 5 дней.' },
      { name: 'Пункт 1.9', rule: 'Запрещён обход правил и поиск лазеек в правилах сервера.', punish: 'На усмотрение администрации.', duration: '—' },
      { name: 'Пункт 1.10', rule: 'Запрещены рейды сервера, массовый флуд и действия направленные на нарушение работы сервера.', punish: 'Бан.', duration: 'Навсегда.' }
    ]
  },
  chat: {
    title: 'РАЗДЕЛ 2 — ЧАТ И ГОЛОСОВЫЕ КАНАЛЫ',
    icon: '💬',
    desc: 'Правила общения в текстовых и голосовых каналах для комфортной атмосферы.',
    points: [
      { name: 'Пункт 2.1', rule: 'Запрещено включать музыку, шумы, звуки и соундпад без согласия участников канала.\nЗапрещены слишком громкие, резкие или мешающие общению звуки.', punish: 'Пред/Мут.', duration: 'до 2 часов.' },
      { name: 'Пункт 2.2', rule: 'Запрещено мешать общению в голосовом канале: крики, перебивание, эхо, намеренное ухудшение качества общения.', punish: 'Пред/Мут.', duration: 'до 4 часов.' },
      { name: 'Пункт 2.3', rule: 'Запрещено использование программ изменения голоса в целях обмана или помех общению.', punish: 'Пред/Мут.', duration: 'до 4 часов.' },
      { name: 'Пункт 2.4', rule: 'Запрещено использование багов или уязвимостей Discord, а также распространение способов их использования.', punish: 'Пред/Бан.', duration: 'до 7 дней.' }
    ]
  },
  games: {
    title: 'РАЗДЕЛ 3 — ПОВЕДЕНИЕ В ИГРАХ',
    icon: '🎮',
    desc: 'Данный раздел устанавливает правила поведения участников во время совместной игры. Они направлены на поддержание честной игры и комфортной атмосферы.',
    points: [
      { name: 'Пункт 3.1', rule: 'Запрещено использование / распространение | читов, макросов, скриптов и других запрещённых программ.', punish: 'Бан.', duration: 'до 7 дней | Навсегда.' },
      { name: 'Пункт 3.2', rule: 'Запрещено использование игровых багов для получения преимущества над другими игроками.', punish: 'Пред/Бан.', duration: 'до 7 дней.' }
    ]
  }
};

function buildEmbed(key) {
  const data = RULES[key];
  if (!data) return [];

  const embeds = [];
  let currentEmbed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setAuthor({ name: 'Правила | TRIGERY', iconURL: client.user.displayAvatarURL() })
    .setTitle(`${data.icon} ${data.title}`)
    .setDescription(`**${data.desc}**`);

  let fieldCount = 0;

  data.points.forEach(p => {
    // Discord разрешает максимум 25 полей. Мы добавляем по 4 поля за пункт.
    // Если достигаем лимита, сохраняем текущий эмбед и начинаем новый.
    if (fieldCount + 4 > 25) {
      embeds.push(currentEmbed);
      currentEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle(`${data.icon} ${data.title} (продолжение)`);
      fieldCount = 0;
    }

    currentEmbed.addFields(
      { name: `\u200b\n🔹 **${p.name}**`, value: `\`\`\`${p.rule}\`\`\`` },
      { name: 'Наказание:', value: `> **${p.punish}**`, inline: true },
      { name: 'Длительность:', value: `> **${p.duration}**`, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }
    );
    fieldCount += 4;
  });

  embeds.push(currentEmbed);
  return embeds;
}

function buildMenu() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('rules_menu')
    .setPlaceholder('Выберите раздел...')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Общие правила').setValue('general').setEmoji('📜'),
      new StringSelectMenuOptionBuilder().setLabel('Чат и голосовые каналы').setValue('chat').setEmoji('💬'),
      new StringSelectMenuOptionBuilder().setLabel('Поведение в играх').setValue('games').setEmoji('🎮')
    );
  return new ActionRowBuilder().addComponents(menu);
}

client.once('clientReady', () => console.log(`✅ Бот ${client.user.tag} запущен!`));

client.on('interactionCreate', async i => {
  if (i.isChatInputCommand() && i.commandName === 'rules') {
    if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return i.reply({ content: '⛔ Только для админов.', ephemeral: true });
    }
    // Передаем массив эмбедов (buildEmbed теперь возвращает массив)
    await i.reply({ embeds: buildEmbed('general'), components: [buildMenu()] });
  }
  if (i.isStringSelectMenu() && i.customId === 'rules_menu') {
    await i.deferUpdate();
    await i.editReply({ embeds: buildEmbed(i.values[0]), components: [buildMenu()] });
  }
});

client.login(process.env.DISCORD_TOKEN);