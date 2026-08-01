"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthProvider } from "./lib/auth-context";

type Locale = "ru" | "en";

type Dictionary = {
  nav: {
    groupRecords: string;
    groupStorage: string;
    groupAdmin: string;
    recordingNow: string;
    archive: string;
    telegramStorage: string;
    twitchAudio: string;
    filesCheck: string;
  };
  storage: {
    title: string;
    subtitle: string;
    uploadedCount: string;
    telegramSize: string;
    freedSize: string;
    awaitingCleanup: string;
    queueTitle: string;
    queueEmpty: string;
    notConfigured: string;
    autoUploadOff: string;
    autoUploadOn: string;
    keepLocalNote: string;
    keepLocalNow: string;
    keepLocalForever: string;
    archiveTitle: string;
    archiveDiskFree: string;
    archiveKeepNote: string;
    archiveKeepForever: string;
    archiveUnavailable: string;
    archiveStored: string;
    archiveStoredSize: string;
    archiveQueued: string;
    archiveExpired: string;
    archiveErrors: string;
    archiveSweep: string;
    openSettings: string;
    diskTitle: string;
    diskSubtitle: string;
    diskFree: string;
    diskUsed: string;
    diskOrphans: string;
    purgeOrphans: string;
    purgeConfirm: string;
    purgeDone: string;
    onlyOrphans: string;
    diskEmpty: string;
    truncatedNote: string;
    fileCol: string;
    modifiedCol: string;
    statusOrphan: string;
    statusRecording: string;
    statusRecent: string;
    fileKindVideo: string;
    fileKindAudio: string;
    fileKindChat: string;
    fileKindSource: string;
    fileKindOther: string;
    deleteFile: string;
    filesPageTitle: string;
    filesPageSubtitle: string;
    diskUsedTotal: string;
    dataFiles: string;
    dbSize: string;
    otherUsage: string;
    verdictMismatch: string;
    dirsTitle: string;
    dirCol: string;
    fileCountCol: string;
    missingTitle: string;
    missingEmpty: string;
    missingUploaded: string;
    missingLost: string;
  };
  common: {
    appName: string;
    dashboard: string;
    channels: string;
    recordingPage: string;
    archives: string;
    settings: string;
    language: string;
    loading: string;
    save: string;
    enabled: string;
    disabled: string;
    live: string;
    offline: string;
    recording: string;
    error: string;
    watch: string;
    watchVideo: string;
    watchWithChat: string;
    start: string;
    stop: string;
    delete: string;
    retry: string;
    diskFree: string;
    actions: string;
    status: string;
    title: string;
    channel: string;
    duration: string;
    sizeLabel: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    trackedChannels: string;
    liveNow: string;
    recordingNow: string;
    recentArchives: string;
    noArchives: string;
    noChannels: string;
    manageChannels: string;
  };
  channels: {
    title: string;
    subtitle: string;
    addTitle: string;
    inputLabel: string;
    inputHint: string;
    inputHintKick: string;
    platformLabel: string;
    addButton: string;
    empty: string;
    liveSince: string;
    currentTitle: string;
    currentGame: string;
    lastArchive: string;
    recordingUnavailable: string;
    autoPaused: string;
    added: string;
    autoRecordingStarted: string;
    autoRecordLabel: string;
    audioOnlyLabel: string;
    audioOnlyHint: string;
    recordVideoLabel: string;
    recordVideoHint: string;
    recordAudioLabel: string;
    recordAudioHint: string;
    trackRequired: string;
    autoRecordWaiting: string;
    refreshHint: string;
    twitchSetupTitle: string;
    twitchSetupCopy: string;
    twitchSetupAction: string;
    twitchSetupRestart: string;
  };
  recording: {
    title: string;
    subtitle: string;
    empty: string;
    liveDuration: string;
    fileSize: string;
    startedAt: string;
    previewPending: string;
  };
  archives: {
    title: string;
    subtitle: string;
    empty: string;
    streamsBlock: string;
    streamsBlockHint: string;
    audioBlock: string;
    audioBlockHint: string;
    audioEmpty: string;
    noCover: string;
    hasAudioTrack: string;
    category: string;
    recordedAt: string;
    endedAt: string;
    size: string;
    deleted: string;
    deleteConfirm: string;
    telegramUploaded: string;
    telegramUploading: string;
    telegramPending: string;
    telegramError: string;
    telegramQueued: string;
    uploadToTelegram: string;
    openInTelegram: string;
    telegramPart: string;
    localFileDeleted: string;
    details: string;
    detailsTitle: string;
    detailsStatus: string;
    detailsUploadedAt: string;
    detailsParts: string;
    detailsChatBundle: string;
    detailsLocalCopy: string;
    detailsLocalCopyKept: string;
    detailsLocalCopyDeleted: string;
  };
  replay: {
    withChat: string;
    withoutChat: string;
    chatUnavailable: string;
    chatNotConfigured: string;
    backToArchives: string;
    videoPending: string;
    recordingInProgress: string;
    deleteArchive: string;
    theaterMode: string;
    fullscreenMode: string;
    normalMode: string;
    exitTheater: string;
    play: string;
    pause: string;
    skipBack: string;
    skipForward: string;
    mute: string;
    unmute: string;
    playbackSpeed: string;
    closeOverlay: string;
    sourceLabel: string;
    sourceLocal: string;
    recordingWindow: string;
    speedTitle: string;
    speedArchive: string;
    speedServer: string;
    speedToClient: string;
    speedWasted: string;
    speedPart: string;
    speedAudio: string;
    speedStreamsOne: string;
    speedStreamsMany: string;
  };
  settings: {
    title: string;
    subtitle: string;
    tabs: {
      recording: string;
      telegram: string;
      storage: string;
    };
    recordChat: string;
    keepDeletedMessages: string;
    support7tv: string;
    defaultChatOffsetSec: string;
    saveSettings: string;
    saved: string;
    telegramEnabled: string;
    telegramChatId: string;
    telegramChatIdHint: string;
    telegramPermanentHint: string;
    telegramConnection: string;
    telegramTokenMissing: string;
    telegramBot: string;
    telegramChat: string;
    telegramApiId: string;
    telegramApiHash: string;
    telegramBotToken: string;
    telegramSecretSet: string;
    telegramSecretsHint: string;
    audioTitle: string;
    audioHint: string;
    audioTrackEnabled: string;
    storageHint: string;
    storageNoTelegramNote: string;
    videoKeepLocal: string;
    audioKeepLocal: string;
    audioKeepLocalHint: string;
    keepLocalImmediate: string;
    keepLocalDays: string;
    keepLocalForever: string;
    keepLocalDaysUnit: string;
    archiveKeep: string;
    archiveKeepHint: string;
    archiveKeepDaysMode: string;
  };
  twitchAudio: {
    title: string;
    subtitle: string;
    howTitle: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    installScript: string;
    copyScript: string;
    copied: string;
    copyFailed: string;
    serverNote: string;
    updateNote: string;
    partLabel: string;
    showScript: string;
    hideScript: string;
    tracksTitle: string;
    tracksEmpty: string;
    localCacheNow: string;
    localCacheDays: string;
    colChannel: string;
    colTitle: string;
    colDate: string;
    colDuration: string;
    download: string;
    deleteAudio: string;
    deleteConfirm: string;
    deleteConfirmAudioOnly: string;
    deleted: string;
    disabledNote: string;
  };
  errors: {
    apiUnavailable: string;
    requestFailed: string;
  };
  localReplay: {
    title: string;
    subtitle: string;
    pickVideo: string;
    pickVideoHint: string;
    pickBundle: string;
    pickBundleHint: string;
    invalidBundle: string;
    help: string;
    openArchives: string;
    changeFiles: string;
    navLabel: string;
    downloadVideo: string;
    downloadBundle: string;
  };
  publicSite: {
    brand: string;
    tagline: string;
    searchPlaceholder: string;
    searchAction: string;
    empty: string;
    emptyHint: string;
    emptyForQuery: string;
    durationLabel: string;
    enterAdmin: string;
    backHome: string;
    backToList: string;
    notFound: string;
    notFoundHint: string;
  };
  auth: {
    login: string;
    logout: string;
    loginTitle: string;
    loginSubtitle: string;
    usernameLabel: string;
    passwordLabel: string;
    submitButton: string;
    submitting: string;
    invalid: string;
    backToPublic: string;
    youAreSuperadmin: string;
    accountLabel: string;
  };
  admin: {
    panelLabel: string;
    sectionUsers: string;
    sectionAccess: string;
    sectionAccount: string;
    forbidden: string;
    forbiddenHint: string;
    needsLogin: string;
  };
  users: {
    title: string;
    subtitle: string;
    addTitle: string;
    usernameLabel: string;
    passwordLabel: string;
    roleLabel: string;
    roleNone: string;
    addButton: string;
    empty: string;
    columnUsername: string;
    columnRole: string;
    columnCreated: string;
    columnActions: string;
    superadminBadge: string;
    resetPassword: string;
    resetPasswordPrompt: string;
    deleteConfirm: string;
    saved: string;
    cannotDeleteSelf: string;
  };
  access: {
    title: string;
    subtitle: string;
    addTitle: string;
    nameLabel: string;
    descriptionLabel: string;
    addButton: string;
    permissionsLabel: string;
    saveRole: string;
    deleteRole: string;
    deleteConfirm: string;
    empty: string;
    usersUsing: string;
    saved: string;
  };
  account: {
    title: string;
    subtitle: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    saveButton: string;
    saved: string;
    mismatch: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    nav: {
      groupRecords: "Записи",
      groupStorage: "Хранилище",
      groupAdmin: "Управление",
      recordingNow: "Сейчас пишется",
      archive: "Архив записей",
      telegramStorage: "Telegram",
      twitchAudio: "Twitch аудио",
      filesCheck: "Файлы и диск",
    },
    storage: {
      title: "Telegram-хранилище",
      subtitle:
        "Записи выгружаются в канал, локальные файлы удаляются через заданный срок, а просмотр идёт прямо из Telegram.",
      uploadedCount: "Записей в Telegram",
      telegramSize: "Объём в Telegram",
      freedSize: "Освобождено на диске",
      awaitingCleanup: "Ждут удаления с диска",
      queueTitle: "Очередь выгрузки",
      queueEmpty: "Очередь пуста — все записи выгружены.",
      notConfigured: "Telegram не настроен. Укажите ключи и канал в настройках.",
      autoUploadOff: "Автовыгрузка выключена — записи выгружаются только вручную.",
      autoUploadOn: "Автовыгрузка включена",
      keepLocalNote: "Локальная копия хранится {days} дн. после выгрузки",
      keepLocalNow: "Локальная копия удаляется сразу после выгрузки",
      keepLocalForever: "Локальные копии не удаляются",
      archiveTitle: "Архивное хранилище",
      archiveDiskFree: "свободно {free} из {total}",
      archiveKeepNote:
        "Записи лежат на подключённом диске {days} дн. от начала эфира, потом остаётся только копия в Telegram",
      archiveKeepForever: "Записи с архивного диска не удаляются",
      archiveUnavailable:
        "Архивный диск недоступен. Записи остаются на сервере и уходят в Telegram — перенос продолжится сам, когда диск вернётся.",
      archiveStored: "Записей в архиве",
      archiveStoredSize: "Объём в архиве",
      archiveQueued: "Ждут переноса",
      archiveExpired: "Срок вышел",
      archiveErrors: "Не удалось перенести записей: {count}. Повтор — раз в час.",
      archiveSweep: "Проверить сейчас",
      openSettings: "Открыть настройки",
      diskTitle: "Файлы на диске",
      diskSubtitle:
        "Каждый файл в хранилище сверяется с базой. «Лишние» ни к чему не привязаны — это остатки удалённых записей и прерванных захватов, их можно удалить полностью.",
      diskFree: "Свободно на диске",
      diskUsed: "Занято файлами",
      diskOrphans: "Лишние файлы",
      purgeOrphans: "Удалить лишние",
      purgeConfirm: "Удалить все лишние файлы ({size})? Они не привязаны ни к одной записи в базе.",
      purgeDone: "Удалено файлов: {count}, освобождено {size}.",
      onlyOrphans: "Только лишние",
      diskEmpty: "Файлов не найдено.",
      truncatedNote: "Показаны самые большие файлы; итоги посчитаны по всем.",
      fileCol: "Файл",
      modifiedCol: "Изменён",
      statusOrphan: "лишний",
      statusRecording: "идёт запись",
      statusRecent: "изменён только что",
      fileKindVideo: "видео",
      fileKindAudio: "аудио",
      fileKindChat: "чат",
      fileKindSource: "исходник записи",
      fileKindOther: "файл",
      deleteFile: "Удалить файл",
      filesPageTitle: "Проверка файлов и диска",
      filesPageSubtitle:
        "Сверка диска с базой записей: куда уходит место, какие файлы лишние и не потерялись ли нужные.",
      diskUsedTotal: "Занято на диске (всего)",
      dataFiles: "Файлы хранилища",
      dbSize: "База данных",
      otherUsage: "Вне хранилища (система, докер)",
      verdictMismatch:
        "Записи занимают всего {data} из {used} занятых на диске. Остальные {other} — не файлы рекордера: система, докер-образы, логи контейнеров. Чистить их нужно на сервере, а не здесь.",
      dirsTitle: "Папки хранилища",
      dirCol: "Папка",
      fileCountCol: "Файлов",
      missingTitle: "Записи без локальных файлов",
      missingEmpty: "Все файлы записей на месте.",
      missingUploaded: "локальная копия удалена после выгрузки в Telegram — норма",
      missingLost: "файл пропал с диска",
    },
    common: {
      appName: "Twitch Stream Recorder",
      dashboard: "Обзор",
      channels: "Каналы",
      recordingPage: "Запись",
      archives: "Архивы",
      settings: "Настройки",
      language: "Язык",
      loading: "Загрузка...",
      save: "Сохранить",
      enabled: "Включено",
      disabled: "Выключено",
      live: "В эфире",
      offline: "Офлайн",
      recording: "Запись",
      error: "Ошибка",
      watch: "Открыть",
      watchVideo: "Без чата",
      watchWithChat: "С чатом",
      start: "Старт",
      stop: "Стоп",
      delete: "Удалить",
      retry: "Обновить",
      diskFree: "Свободно",
      actions: "Действия",
      status: "Статус",
      title: "Название",
      channel: "Канал",
      duration: "Длительность",
      sizeLabel: "Размер",
    },
    dashboard: {
      title: "Обзор и каналы",
      subtitle: "Один центр управления: статус эфира, добавление каналов, запуск записи и последние архивы.",
      trackedChannels: "Каналов",
      liveNow: "Сейчас в эфире",
      recordingNow: "Сейчас пишется",
      recentArchives: "Готово к просмотру",
      noArchives: "Архивов пока нет.",
      noChannels: "Добавьте первый канал на странице «Каналы».",
      manageChannels: "Управлять",
    },
    channels: {
      title: "Каналы",
      subtitle:
        "Вставьте ссылку на Twitch-канал или логин. Если канал существует, он сразу появится в списке. Если эфир уже идет, запись запустится автоматически.",
      addTitle: "Добавить канал",
      inputLabel: "Ссылка или логин",
      inputHint: "Например: https://www.twitch.tv/skywhywalker или skywhywalker",
      inputHintKick: "Например: https://kick.com/xqc или xqc",
      platformLabel: "Платформа",
      addButton: "Добавить",
      empty: "Пока нет ни одного канала.",
      liveSince: "В эфире с",
      currentTitle: "Текущий стрим",
      currentGame: "Категория",
      lastArchive: "Последняя запись",
      recordingUnavailable:
        "Для записи нужен Streamlink. Установите его или сделайте доступным `python -m streamlink`.",
      autoPaused: "Автозапись приостановлена до завершения текущего эфира.",
      added: "Канал добавлен.",
      autoRecordingStarted: "Эфир уже шел, запись запущена автоматически.",
      autoRecordLabel: "Автозапись",
      recordVideoLabel: "Видео",
      recordVideoHint:
        "Записывать видео стрима. Выключите, если у стримера остаются VOD и нужен только звук.",
      recordAudioLabel: "Звук",
      recordAudioHint:
        "Сохранять отдельную звуковую дорожку — её накладывает на VOD пользовательский скрипт.",
      trackRequired: "Нужно оставить включённой хотя бы одну дорожку: видео или звук.",
      audioOnlyLabel: "Только звук",
      audioOnlyHint:
        "Записывать только аудиодорожку (поток audio_only, без видео). Удобно, когда стример хранит VOD: звук накладывается на VOD скриптом. Действует со следующей записи.",
      autoRecordWaiting: "Автозапись включена. Жду старта следующего эфира.",
      refreshHint: "Статус обновляется автоматически. Кнопка «Обновить» нужна только для ручной проверки.",
      twitchSetupTitle: "Twitch API не настроен, включен публичный режим.",
      twitchSetupCopy:
        "Каналы можно добавлять и без TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET. В этом режиме проект использует публичный Twitch GraphQL для статуса и метаданных. Для самой записи всё равно нужен Streamlink.",
      twitchSetupAction: "Открыть консоль Twitch Developers",
      twitchSetupRestart:
        "Если позже добавите ключи в .env и перезапустите npm run dev, проект автоматически переключится на официальный API.",
    },
    recording: {
      title: "Активная запись",
      subtitle:
        "Здесь видно, что пишется прямо сейчас: живой таймер, размер файла и превью, как только файл появится на диске.",
      empty: "Сейчас нет активных записей.",
      liveDuration: "Идёт уже",
      fileSize: "Размер файла",
      startedAt: "Старт записи",
      previewPending: "Видео-файл ещё готовится. Превью появится, как только на диске появятся первые данные.",
    },
    archives: {
      title: "Архивы",
      subtitle: "Все записи, которые уже можно открыть прямо в браузере.",
      empty: "Записей пока нет.",
      streamsBlock: "Записи стримов",
      streamsBlockHint: "Видео с обложкой из самой записи.",
      audioBlock: "Аудиодорожки",
      audioBlockHint: "Отдельные записи звука — накладываются на VOD Twitch.",
      audioEmpty: "Аудиозаписей пока нет.",
      noCover: "Без обложки",
      hasAudioTrack: "Есть отдельная звуковая дорожка",
      category: "Категория",
      recordedAt: "Записано",
      size: "Размер",
      deleted: "Архив удалён.",
      deleteConfirm: "Удалить это видео из архива?",
      endedAt: "Завершено",
      telegramUploaded: "В Telegram",
      telegramUploading: "Выгружается…",
      telegramPending: "В очереди",
      telegramError: "Ошибка выгрузки",
      telegramQueued: "Запись добавлена в очередь выгрузки в Telegram.",
      uploadToTelegram: "Выгрузить в Telegram",
      openInTelegram: "Открыть в Telegram",
      telegramPart: "Часть",
      localFileDeleted: "Локальный файл удалён, запись доступна в Telegram.",
      details: "Подробности",
      detailsTitle: "Хранилище записи",
      detailsStatus: "Статус",
      detailsUploadedAt: "Выгружено",
      detailsParts: "Части в Telegram",
      detailsChatBundle: "Чат (файл .tsr.json)",
      detailsLocalCopy: "Локальная копия",
      detailsLocalCopyKept: "на диске сервера",
      detailsLocalCopyDeleted: "удалена",
    },
    replay: {
      withChat: "С чатом",
      withoutChat: "Без чата",
      chatUnavailable: "Чат для этой записи пока не сохранен.",
      chatNotConfigured: "Запись чата в текущей версии ещё не настроена, поэтому показать чат нельзя.",
      backToArchives: "Назад к архивам",
      videoPending: "Видео ещё не готово к просмотру.",
      recordingInProgress: "Запись ещё идёт. Страница обновляется, но архив не должен создаваться заново.",
      deleteArchive: "Удалить архив",
      theaterMode: "Режим кинотеатра (T)",
      fullscreenMode: "Полный экран (F)",
      normalMode: "Обычный режим",
      exitTheater: "Выйти из кинотеатра (Esc)",
      play: "Воспроизвести (k)",
      pause: "Пауза (k)",
      skipBack: "Назад 5 сек (← / J)",
      skipForward: "Вперёд 5 сек (→ / L)",
      mute: "Без звука (M)",
      unmute: "Включить звук (M)",
      playbackSpeed: "Скорость",
      closeOverlay: "Закрыть",
      sourceLabel: "Источник",
      sourceLocal: "Диск сервера",
      recordingWindow: "Запись",
      speedTitle: "Скорость из Telegram",
      speedArchive: "Эта запись",
      speedServer: "Всего по серверу",
      speedToClient: "к клиенту",
      speedWasted: "впустую",
      speedPart: "Часть",
      speedAudio: "Звук",
      speedStreamsOne: "поток",
      speedStreamsMany: "потоков",
    },
    settings: {
      title: "Настройки",
      subtitle: "Параметры записи, выгрузки в Telegram и локального хранения.",
      tabs: {
        recording: "Запись и чат",
        telegram: "Telegram",
        storage: "Хранение",
      },
      recordChat: "Сохранять чат",
      keepDeletedMessages: "Хранить удаленные сообщения",
      support7tv: "Поддержка 7TV",
      defaultChatOffsetSec: "Смещение чата по умолчанию, сек",
      saveSettings: "Сохранить",
      saved: "Сохранено",
      telegramEnabled: "Выгружать записи в Telegram-канал",
      telegramChatId: "ID канала/чата",
      telegramChatIdHint: "Например -1001234567890 или @имяканала. Бот должен быть админом канала.",
      telegramPermanentHint:
        "Telegram — постоянный архив: автоматически оттуда ничего не удаляется. Записи пропадают из канала только если удалить архив вручную.",
      telegramConnection: "Подключение",
      telegramTokenMissing: "Укажите api_id, api_hash и токен бота ниже (или через .env).",
      telegramBot: "Бот",
      telegramChat: "Канал",
      telegramApiId: "api_id",
      telegramApiHash: "api_hash",
      telegramBotToken: "Токен бота",
      telegramSecretSet: "•••••• (задано)",
      telegramSecretsHint:
        "api_id/api_hash — с my.telegram.org, токен — у @BotFather. Пустое поле не меняет сохранённое значение.",
      audioTitle: "Звуковая дорожка для Twitch",
      audioHint:
        "После записи звук сохраняется отдельным файлом (.m4a) и выгружается в Telegram. Его можно наложить на VOD в Twitch через скрипт со страницы «Twitch аудио».",
      audioTrackEnabled: "Извлекать аудиодорожку из записей",
      storageHint:
        "Локальный диск — только кэш перед Telegram. Файл удаляется с диска лишь после того, как копия ушла в канал; из самого Telegram ничего не удаляется. Просмотр и скачивание после удаления идут напрямую из Telegram.",
      storageNoTelegramNote:
        "Telegram пока не настроен — до этого локальные файлы не удаляются, что бы здесь ни стояло.",
      videoKeepLocal: "Видео на локальном диске",
      audioKeepLocal: "Аудиодорожка на локальном диске",
      audioKeepLocalHint:
        "Дорожка для наложения на Twitch VOD. Из Telegram она отдаётся так же, как локальная, — просто чуть медленнее стартует.",
      keepLocalImmediate: "Удалять сразу после выгрузки",
      keepLocalDays: "Хранить после выгрузки",
      keepLocalForever: "Хранить всегда",
      keepLocalDaysUnit: "дн.",
      archiveKeep: "Записи на архивном диске",
      archiveKeepHint:
        "Срок считается от начала эфира. Когда он выйдет, папка удаляется с архивного диска, а запись остаётся в Telegram — и продолжает открываться в плеере. Пока копии в Telegram нет, запись не удаляется ни при каком сроке.",
      archiveKeepDaysMode: "Хранить",
    },
    twitchAudio: {
      title: "Twitch аудио",
      subtitle:
        "Подмена звука в VOD на Twitch: рекордер сохраняет оригинальную аудиодорожку стрима, а Tampermonkey-скрипт накладывает её на VOD — там, где Twitch заглушил музыку.",
      howTitle: "Как подключить",
      step1: "Установите расширение Tampermonkey (Chrome / Firefox / Edge).",
      step2: "Нажмите «Установить / обновить скрипт» ниже.",
      step3:
        "Tampermonkey откроет страницу установки — подтвердите установку один раз.",
      step4:
        "Откройте любой VOD на twitch.tv — справа внизу появится панель: выберите дорожку и режим «Запись» или «Оба».",
      installScript: "Установить / обновить скрипт",
      copyScript: "Скопировать скрипт",
      copied: "Скопировано ✓",
      copyFailed: "Не удалось скопировать автоматически — скрипт показан ниже, выделите и скопируйте вручную.",
      serverNote:
        "Скрипт обращается к серверу по адресу {origin}. Этот адрес должен быть доступен из браузера, в котором вы смотрите Twitch — если смотрите не из домашней сети, откройте (пробросьте) порт наружу.",
      updateNote:
        "Устанавливается лёгкий скрипт-загрузчик: при каждом открытии Twitch он сам подтягивает свежую версию скрипта с этого сервера — обновлять вручную ничего не нужно. Если раньше вы вставляли скрипт в Tampermonkey вручную, удалите тот старый скрипт, иначе панель может остаться старой версии.",
      partLabel: "часть {n}/{m}",
      showScript: "Показать скрипт",
      hideScript: "Скрыть скрипт",
      tracksTitle: "Доступные аудиодорожки",
      tracksEmpty: "Аудиодорожек пока нет — они появятся после следующей завершённой записи.",
      localCacheNow:
        "Дорожки хранятся в Telegram постоянно. Локальная копия удаляется сразу после выгрузки — дальше файл отдаётся из Telegram по той же ссылке.",
      localCacheDays:
        "Дорожки хранятся в Telegram постоянно. Локальная копия удаляется через {days} дн. после выгрузки — дальше файл отдаётся из Telegram по той же ссылке.",
      colChannel: "Канал",
      colTitle: "Название",
      colDate: "Дата",
      colDuration: "Длительность",
      download: "Скачать",
      deleteAudio: "Удалить звук",
      deleteConfirm: "Удалить аудиодорожку? Локальный файл и копия в Telegram будут удалены.",
      deleteConfirmAudioOnly:
        "Это запись «только звук» — удаление аудио удалит саму запись целиком. Продолжить?",
      deleted: "Аудиодорожка удалена",
      disabledNote:
        "Извлечение аудиодорожки выключено в настройках — новые записи останутся без звука для Twitch.",
    },
    errors: {
      apiUnavailable: "API недоступен.",
      requestFailed: "Запрос завершился ошибкой.",
    },
    localReplay: {
      title: "Офлайн-просмотр",
      subtitle: "Выберите локальные файлы: видео + бандл чата. Работает без подключения к серверу.",
      pickVideo: "Видео (.mp4)",
      pickVideoHint: "Нажмите или перетащите mp4-файл",
      pickBundle: "Чат бандл (.tsr.json)",
      pickBundleHint: "Скачанный с архива JSON с сообщениями",
      invalidBundle: "Неверный формат бандла. Нужен файл *.tsr.json из раздела Архивы.",
      help: "Чтобы скачать видео и бандл чата:",
      openArchives: "Открыть Архивы →",
      changeFiles: "Сменить файлы",
      navLabel: "Локально",
      downloadVideo: "Скачать видео",
      downloadBundle: "Скачать чат (бандл)",
    },
    publicSite: {
      brand: "Twitch Stream Recorder",
      tagline: "Архив записанных стримов.",
      searchPlaceholder: "Поиск по названию стрима…",
      searchAction: "Найти",
      empty: "Пока нет ни одной записи.",
      emptyHint: "Как только администратор добавит каналы и появятся записи, они отобразятся здесь.",
      emptyForQuery: "По вашему запросу ничего не найдено.",
      durationLabel: "Длительность",
      enterAdmin: "Войти в админку",
      backHome: "На главную",
      backToList: "← Все стримы",
      notFound: "Запись не найдена.",
      notFoundHint: "Возможно, она была удалена или ещё не готова.",
    },
    auth: {
      login: "Войти",
      logout: "Выйти",
      loginTitle: "Вход в админку",
      loginSubtitle: "Войдите, чтобы управлять каналами, записями и пользователями.",
      usernameLabel: "Логин",
      passwordLabel: "Пароль",
      submitButton: "Войти",
      submitting: "Входим…",
      invalid: "Неверный логин или пароль.",
      backToPublic: "← Назад к стримам",
      youAreSuperadmin: "Суперадмин",
      accountLabel: "Аккаунт",
    },
    admin: {
      panelLabel: "Админка",
      sectionUsers: "Пользователи",
      sectionAccess: "Доступы",
      sectionAccount: "Аккаунт",
      forbidden: "Недостаточно прав.",
      forbiddenHint: "Попросите администратора выдать вашей роли нужные права.",
      needsLogin: "Эту страницу видят только вошедшие пользователи.",
    },
    users: {
      title: "Пользователи",
      subtitle: "Список пользователей панели. Каждому можно назначить роль с набором прав.",
      addTitle: "Добавить пользователя",
      usernameLabel: "Логин",
      passwordLabel: "Пароль",
      roleLabel: "Роль",
      roleNone: "Без роли",
      addButton: "Создать",
      empty: "Пока нет ни одного пользователя.",
      columnUsername: "Логин",
      columnRole: "Роль",
      columnCreated: "Создан",
      columnActions: "Действия",
      superadminBadge: "Суперадмин",
      resetPassword: "Сбросить пароль",
      resetPasswordPrompt: "Новый пароль (минимум 4 символа):",
      deleteConfirm: "Удалить этого пользователя?",
      saved: "Сохранено.",
      cannotDeleteSelf: "Нельзя удалить самого себя.",
    },
    access: {
      title: "Доступы",
      subtitle: "Создавайте роли и отмечайте, какие действия они открывают. Привязка ролей к пользователям — на странице «Пользователи».",
      addTitle: "Новая роль",
      nameLabel: "Название",
      descriptionLabel: "Описание (необязательно)",
      addButton: "Создать роль",
      permissionsLabel: "Права",
      saveRole: "Сохранить",
      deleteRole: "Удалить роль",
      deleteConfirm: "Удалить роль? Если она привязана к пользователю — удалить нельзя.",
      empty: "Ролей пока нет. Создайте первую — без неё новые пользователи будут «без прав».",
      usersUsing: "пользователей",
      saved: "Сохранено.",
    },
    account: {
      title: "Аккаунт",
      subtitle: "Смена собственного пароля. Старый пароль обязателен для подтверждения.",
      currentPasswordLabel: "Текущий пароль",
      newPasswordLabel: "Новый пароль",
      confirmPasswordLabel: "Повторите новый пароль",
      saveButton: "Сменить пароль",
      saved: "Пароль обновлён.",
      mismatch: "Пароли не совпадают.",
    },
  },
  en: {
    nav: {
      groupRecords: "Recordings",
      groupStorage: "Storage",
      groupAdmin: "Administration",
      recordingNow: "Recording now",
      archive: "Archive",
      telegramStorage: "Telegram",
      twitchAudio: "Twitch audio",
      filesCheck: "Files & disk",
    },
    storage: {
      title: "Telegram storage",
      subtitle:
        "Recordings are uploaded to a channel, local files are removed after the configured period, and playback streams straight from Telegram.",
      uploadedCount: "Recordings in Telegram",
      telegramSize: "Size in Telegram",
      freedSize: "Disk space freed",
      awaitingCleanup: "Awaiting local cleanup",
      queueTitle: "Upload queue",
      queueEmpty: "The queue is empty — everything is uploaded.",
      notConfigured: "Telegram is not configured. Set the keys and channel in settings.",
      autoUploadOff: "Auto-upload is off — recordings are uploaded manually only.",
      autoUploadOn: "Auto-upload is on",
      keepLocalNote: "Local copies are kept for {days} day(s) after upload",
      keepLocalNow: "Local copies are removed right after the upload",
      keepLocalForever: "Local copies are never removed",
      archiveTitle: "Archive storage",
      archiveDiskFree: "{free} free of {total}",
      archiveKeepNote:
        "Recordings stay on the mounted drive for {days} day(s) from the start of the broadcast; after that only the Telegram copy remains",
      archiveKeepForever: "Recordings are never removed from the archive drive",
      archiveUnavailable:
        "The archive drive is unreachable. Recordings stay on the server and go to Telegram — the move resumes on its own once the mount is back.",
      archiveStored: "Recordings archived",
      archiveStoredSize: "Archive size",
      archiveQueued: "Waiting to move",
      archiveExpired: "Expired",
      archiveErrors: "{count} recording(s) failed to reach the archive. Retried hourly.",
      archiveSweep: "Check now",
      openSettings: "Open settings",
      diskTitle: "Files on disk",
      diskSubtitle:
        "Every file in the storage folder is checked against the database. Orphans belong to nothing — leftovers of deleted recordings and interrupted captures — and can be removed safely.",
      diskFree: "Free disk space",
      diskUsed: "Used by files",
      diskOrphans: "Orphan files",
      purgeOrphans: "Delete orphans",
      purgeConfirm: "Delete all orphan files ({size})? They are not linked to any recording.",
      purgeDone: "Deleted {count} file(s), freed {size}.",
      onlyOrphans: "Orphans only",
      diskEmpty: "No files found.",
      truncatedNote: "Showing the largest files; totals include everything.",
      fileCol: "File",
      modifiedCol: "Modified",
      statusOrphan: "orphan",
      statusRecording: "recording",
      statusRecent: "just modified",
      fileKindVideo: "video",
      fileKindAudio: "audio",
      fileKindChat: "chat",
      fileKindSource: "capture source",
      fileKindOther: "file",
      deleteFile: "Delete file",
      filesPageTitle: "Files & disk audit",
      filesPageSubtitle:
        "The disk is checked against the recordings database: where the space goes, which files are orphans and whether any expected files are missing.",
      diskUsedTotal: "Disk used (total)",
      dataFiles: "Recorder files",
      dbSize: "Database",
      otherUsage: "Outside the recorder (system, docker)",
      verdictMismatch:
        "Recordings take only {data} out of {used} used on disk. The remaining {other} is not recorder files: the system, docker images, container logs. Clean those on the server, not here.",
      dirsTitle: "Storage folders",
      dirCol: "Folder",
      fileCountCol: "Files",
      missingTitle: "Recordings with missing local files",
      missingEmpty: "All recording files are present.",
      missingUploaded: "local copy removed after Telegram upload — expected",
      missingLost: "file is missing from disk",
    },
    common: {
      appName: "Twitch Stream Recorder",
      dashboard: "Overview",
      channels: "Channels",
      recordingPage: "Recording",
      archives: "Archives",
      settings: "Settings",
      language: "Language",
      loading: "Loading...",
      save: "Save",
      enabled: "Enabled",
      disabled: "Disabled",
      live: "Live",
      offline: "Offline",
      recording: "Recording",
      error: "Error",
      watch: "Open",
      watchVideo: "Video only",
      watchWithChat: "With chat",
      start: "Start",
      stop: "Stop",
      delete: "Delete",
      retry: "Refresh",
      diskFree: "Free space",
      actions: "Actions",
      status: "Status",
      title: "Title",
      channel: "Channel",
      duration: "Duration",
      sizeLabel: "Size",
    },
    dashboard: {
      title: "Overview & channels",
      subtitle: "One control center: live status, adding channels, starting recordings and recent archives.",
      trackedChannels: "Channels",
      liveNow: "Live now",
      recordingNow: "Recording now",
      recentArchives: "Ready to watch",
      noArchives: "No archives yet.",
      noChannels: "Add the first channel on the Channels page.",
      manageChannels: "Manage",
    },
    channels: {
      title: "Channels",
      subtitle:
        "Paste a Twitch URL or a login. If the channel exists it is added immediately. If the stream is already live, recording starts automatically.",
      addTitle: "Add channel",
      inputLabel: "URL or login",
      inputHint: "Example: https://www.twitch.tv/skywhywalker or skywhywalker",
      inputHintKick: "Example: https://kick.com/xqc or xqc",
      platformLabel: "Platform",
      addButton: "Add",
      empty: "No channels yet.",
      liveSince: "Live since",
      currentTitle: "Current stream",
      currentGame: "Category",
      lastArchive: "Latest recording",
      recordingUnavailable:
        "Recording needs Streamlink. Install it or make `python -m streamlink` available.",
      autoPaused: "Auto recording is paused until the current live stream ends.",
      added: "Channel added.",
      autoRecordingStarted: "The stream was already live, so recording started automatically.",
      autoRecordLabel: "Auto record",
      recordVideoLabel: "Video",
      recordVideoHint:
        "Record the stream video. Turn it off when the streamer keeps VODs and only audio is needed.",
      recordAudioLabel: "Audio",
      recordAudioHint:
        "Keep a standalone audio track — the userscript overlays it on the Twitch VOD.",
      trackRequired: "Keep at least one track enabled: video or audio.",
      audioOnlyLabel: "Audio only",
      audioOnlyHint:
        "Record only the audio track (the audio_only stream variant, no video). Useful when the streamer keeps VODs: the script overlays the sound on the VOD. Takes effect from the next recording.",
      autoRecordWaiting: "Auto record is enabled. Waiting for the next stream to start.",
      refreshHint: "Status updates automatically. Use Refresh only for a manual recheck.",
      twitchSetupTitle: "Twitch API is not configured, public mode is enabled.",
      twitchSetupCopy:
        "You can add channels without TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET. In this mode the app uses public Twitch GraphQL for status and metadata. Streamlink is still required for the actual recording.",
      twitchSetupAction: "Open Twitch Developers console",
      twitchSetupRestart:
        "If you add the keys to .env later and restart npm run dev, the app will switch back to the official API automatically.",
    },
    recording: {
      title: "Active recording",
      subtitle:
        "See what is being captured right now: live duration, current file size, and preview as soon as the file appears on disk.",
      empty: "There are no active recordings right now.",
      liveDuration: "Elapsed",
      fileSize: "File size",
      startedAt: "Recording started",
      previewPending: "The video file is still being prepared. Preview appears as soon as the first data lands on disk.",
    },
    archives: {
      title: "Archives",
      subtitle: "Every recording that is already playable in the browser.",
      empty: "No recordings yet.",
      streamsBlock: "Stream recordings",
      streamsBlockHint: "Video, with a cover frame taken from the recording.",
      audioBlock: "Audio tracks",
      audioBlockHint: "Standalone audio captures — they overlay the Twitch VOD.",
      audioEmpty: "No audio recordings yet.",
      noCover: "No cover",
      hasAudioTrack: "A separate audio track exists",
      category: "Category",
      recordedAt: "Recorded",
      size: "Size",
      deleted: "Archive deleted.",
      deleteConfirm: "Delete this video from archives?",
      endedAt: "Ended",
      telegramUploaded: "In Telegram",
      telegramUploading: "Uploading…",
      telegramPending: "Queued",
      telegramError: "Upload failed",
      telegramQueued: "Recording queued for Telegram upload.",
      uploadToTelegram: "Upload to Telegram",
      openInTelegram: "Open in Telegram",
      telegramPart: "Part",
      localFileDeleted: "Local file removed; the recording is available in Telegram.",
      details: "Details",
      detailsTitle: "Recording storage",
      detailsStatus: "Status",
      detailsUploadedAt: "Uploaded",
      detailsParts: "Parts in Telegram",
      detailsChatBundle: "Chat (.tsr.json file)",
      detailsLocalCopy: "Local copy",
      detailsLocalCopyKept: "kept on server disk",
      detailsLocalCopyDeleted: "deleted",
    },
    replay: {
      withChat: "With chat",
      withoutChat: "Without chat",
      chatUnavailable: "Chat was not captured for this recording yet.",
      chatNotConfigured: "Chat capture is not configured in the current build, so there is no chat to display.",
      backToArchives: "Back to archives",
      videoPending: "The video is not ready for playback yet.",
      recordingInProgress: "Recording is still in progress. The page refreshes, but the archive should not restart.",
      deleteArchive: "Delete archive",
      theaterMode: "Theater mode (T)",
      fullscreenMode: "Fullscreen (F)",
      normalMode: "Normal mode",
      exitTheater: "Exit theater (Esc)",
      play: "Play (k)",
      pause: "Pause (k)",
      skipBack: "Back 5s (← / J)",
      skipForward: "Forward 5s (→ / L)",
      mute: "Mute (M)",
      unmute: "Unmute (M)",
      playbackSpeed: "Speed",
      closeOverlay: "Close",
      sourceLabel: "Source",
      sourceLocal: "Server disk",
      recordingWindow: "Recorded",
      speedTitle: "Telegram throughput",
      speedArchive: "This recording",
      speedServer: "Server total",
      speedToClient: "to client",
      speedWasted: "wasted",
      speedPart: "Part",
      speedAudio: "Audio",
      speedStreamsOne: "stream",
      speedStreamsMany: "streams",
    },
    settings: {
      title: "Settings",
      subtitle: "Recording, Telegram offload and local retention.",
      tabs: {
        recording: "Recording & chat",
        telegram: "Telegram",
        storage: "Retention",
      },
      recordChat: "Record chat",
      keepDeletedMessages: "Keep deleted messages",
      support7tv: "Enable 7TV",
      defaultChatOffsetSec: "Default chat offset, sec",
      saveSettings: "Save",
      saved: "Saved",
      telegramEnabled: "Upload recordings to a Telegram channel",
      telegramChatId: "Channel/chat id",
      telegramChatIdHint: "E.g. -1001234567890 or @channelname. The bot must be an admin of the channel.",
      telegramPermanentHint:
        "Telegram is the permanent archive: nothing is ever deleted from it automatically. A recording only leaves the channel when the archive is deleted by hand.",
      telegramConnection: "Connection",
      telegramTokenMissing: "Set api_id, api_hash and the bot token below (or via .env).",
      telegramBot: "Bot",
      telegramChat: "Channel",
      telegramApiId: "api_id",
      telegramApiHash: "api_hash",
      telegramBotToken: "Bot token",
      telegramSecretSet: "•••••• (set)",
      telegramSecretsHint:
        "api_id/api_hash come from my.telegram.org, the token from @BotFather. Leave a field empty to keep the stored value.",
      audioTitle: "Audio track for Twitch",
      audioHint:
        "After each recording the sound is saved as a standalone .m4a and uploaded to Telegram. The userscript from the \"Twitch audio\" page overlays it on the Twitch VOD.",
      audioTrackEnabled: "Extract an audio track from recordings",
      storageHint:
        "The local disk is only a cache in front of Telegram. A file is removed from disk after its copy reached the channel; nothing is ever removed from Telegram itself. Playback and downloads then come straight from Telegram.",
      storageNoTelegramNote:
        "Telegram is not configured yet — until it is, local files are kept no matter what is selected here.",
      videoKeepLocal: "Video on the local disk",
      audioKeepLocal: "Audio track on the local disk",
      audioKeepLocalHint:
        "The track overlaid on Twitch VODs. Served from Telegram exactly like the local copy, it just takes a moment longer to start.",
      keepLocalImmediate: "Delete right after the upload",
      keepLocalDays: "Keep after the upload",
      keepLocalForever: "Keep forever",
      keepLocalDaysUnit: "days",
      archiveKeep: "Recordings on the archive drive",
      archiveKeepHint:
        "Counted from the start of the broadcast. When it runs out the folder is deleted from the archive drive and the recording lives on in Telegram, still playable. While Telegram has no copy, nothing expires at any setting.",
      archiveKeepDaysMode: "Keep for",
    },
    twitchAudio: {
      title: "Twitch audio",
      subtitle:
        "Restore VOD sound on Twitch: the recorder keeps the original stream audio, and a Tampermonkey userscript overlays it on the VOD where Twitch muted the music.",
      howTitle: "How to set up",
      step1: "Install the Tampermonkey extension (Chrome / Firefox / Edge).",
      step2: "Click \"Install / update script\" below.",
      step3:
        "Tampermonkey opens its installation page — confirm the installation once.",
      step4:
        "Open any VOD on twitch.tv — a panel appears in the bottom-right: pick a track and the \"Recording\" or \"Both\" mode.",
      installScript: "Install / update script",
      copyScript: "Copy script",
      copied: "Copied ✓",
      copyFailed: "Could not copy automatically — the script is shown below, select and copy it by hand.",
      serverNote:
        "The script talks to the server at {origin}. That address must be reachable from the browser where you watch Twitch — forward the port if you are outside your home network.",
      updateNote:
        "A lightweight loader script is installed: every time Twitch is opened it pulls the latest script version from this server — no manual updates ever. If you previously pasted the script into Tampermonkey by hand, delete that old script, otherwise the panel may keep running the outdated version.",
      partLabel: "part {n}/{m}",
      showScript: "Show script",
      hideScript: "Hide script",
      tracksTitle: "Available audio tracks",
      tracksEmpty: "No audio tracks yet — they appear after the next finished recording.",
      localCacheNow:
        "Tracks stay in Telegram permanently. The local copy is dropped right after the upload — the same URL then streams from Telegram.",
      localCacheDays:
        "Tracks stay in Telegram permanently. The local copy is dropped {days} day(s) after the upload — the same URL then streams from Telegram.",
      colChannel: "Channel",
      colTitle: "Title",
      colDate: "Date",
      colDuration: "Duration",
      download: "Download",
      deleteAudio: "Delete audio",
      deleteConfirm: "Delete the audio track? The local file and the Telegram copy will be removed.",
      deleteConfirmAudioOnly:
        "This is an audio-only recording — deleting the audio removes the whole recording. Continue?",
      deleted: "Audio track deleted",
      disabledNote:
        "Audio extraction is disabled in settings — new recordings will have no Twitch audio track.",
    },
    errors: {
      apiUnavailable: "API is unavailable.",
      requestFailed: "The request failed.",
    },
    localReplay: {
      title: "Offline replay",
      subtitle: "Pick local files: video + chat bundle. Works without a server connection.",
      pickVideo: "Video (.mp4)",
      pickVideoHint: "Click or drop an mp4 file",
      pickBundle: "Chat bundle (.tsr.json)",
      pickBundleHint: "Bundle JSON downloaded from the archive",
      invalidBundle: "Invalid bundle. Need a *.tsr.json file from the Archives section.",
      help: "To download the video and chat bundle:",
      openArchives: "Open Archives →",
      changeFiles: "Change files",
      navLabel: "Local",
      downloadVideo: "Download video",
      downloadBundle: "Download chat bundle",
    },
    publicSite: {
      brand: "Twitch Stream Recorder",
      tagline: "Archive of recorded streams.",
      searchPlaceholder: "Search by stream title…",
      searchAction: "Search",
      empty: "No recordings yet.",
      emptyHint: "Once the admin adds channels and recordings appear, they will show up here.",
      emptyForQuery: "Nothing matches your search.",
      durationLabel: "Duration",
      enterAdmin: "Open admin",
      backHome: "Home",
      backToList: "← All streams",
      notFound: "Recording not found.",
      notFoundHint: "It may have been deleted or is not ready yet.",
    },
    auth: {
      login: "Sign in",
      logout: "Sign out",
      loginTitle: "Sign in to admin",
      loginSubtitle: "Sign in to manage channels, recordings and users.",
      usernameLabel: "Username",
      passwordLabel: "Password",
      submitButton: "Sign in",
      submitting: "Signing in…",
      invalid: "Invalid username or password.",
      backToPublic: "← Back to streams",
      youAreSuperadmin: "Superadmin",
      accountLabel: "Account",
    },
    admin: {
      panelLabel: "Admin",
      sectionUsers: "Users",
      sectionAccess: "Access",
      sectionAccount: "Account",
      forbidden: "You do not have access.",
      forbiddenHint: "Ask an administrator to grant your role the needed permissions.",
      needsLogin: "This page is visible to signed-in users only.",
    },
    users: {
      title: "Users",
      subtitle: "Panel users. Each one can be assigned a role with a permission set.",
      addTitle: "Add user",
      usernameLabel: "Username",
      passwordLabel: "Password",
      roleLabel: "Role",
      roleNone: "No role",
      addButton: "Create",
      empty: "No users yet.",
      columnUsername: "Username",
      columnRole: "Role",
      columnCreated: "Created",
      columnActions: "Actions",
      superadminBadge: "Superadmin",
      resetPassword: "Reset password",
      resetPasswordPrompt: "New password (min 4 chars):",
      deleteConfirm: "Delete this user?",
      saved: "Saved.",
      cannotDeleteSelf: "You cannot delete yourself.",
    },
    access: {
      title: "Access",
      subtitle: "Create roles and tick which actions they unlock. Attach roles to users on the Users page.",
      addTitle: "New role",
      nameLabel: "Name",
      descriptionLabel: "Description (optional)",
      addButton: "Create role",
      permissionsLabel: "Permissions",
      saveRole: "Save",
      deleteRole: "Delete role",
      deleteConfirm: "Delete this role? Roles in use by users cannot be deleted.",
      empty: "No roles yet. Create one — until then new users will have no permissions.",
      usersUsing: "users",
      saved: "Saved.",
    },
    account: {
      title: "Account",
      subtitle: "Change your own password. Current password is required for confirmation.",
      currentPasswordLabel: "Current password",
      newPasswordLabel: "New password",
      confirmPasswordLabel: "Repeat new password",
      saveButton: "Update password",
      saved: "Password updated.",
      mismatch: "Passwords do not match.",
    },
  },
};

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function AppProviders({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ru");

  useEffect(() => {
    const stored = window.localStorage.getItem("tsr-locale");
    if (stored === "ru" || stored === "en") {
      setLocale(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tsr-locale", locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
    }),
    [locale],
  );

  return (
    <LanguageContext.Provider value={value}>
      <AuthProvider>{children}</AuthProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside AppProviders.");
  }

  return context;
}
