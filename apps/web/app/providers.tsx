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
    openSettings: string;
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
  };
  settings: {
    title: string;
    subtitle: string;
    retentionDays: string;
    storageLimitGb: string;
    recordChat: string;
    keepDeletedMessages: string;
    support7tv: string;
    defaultChatOffsetSec: string;
    saveSettings: string;
    saved: string;
    telegramTitle: string;
    telegramEnabled: string;
    telegramChatId: string;
    telegramChatIdHint: string;
    telegramKeepLocalDays: string;
    telegramConnection: string;
    telegramTokenMissing: string;
    telegramBot: string;
    telegramChat: string;
    telegramApiId: string;
    telegramApiHash: string;
    telegramBotToken: string;
    telegramSecretSet: string;
    telegramSecretsHint: string;
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
      openSettings: "Открыть настройки",
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
      title: "Состояние записи",
      subtitle: "Только важное: кто сейчас в эфире, кто записывается и что уже можно открыть.",
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
    },
    settings: {
      title: "Настройки",
      subtitle: "Здесь оставлены только параметры хранения и поведения replay по умолчанию.",
      retentionDays: "Сколько дней хранить архив",
      storageLimitGb: "Лимит диска, GB",
      recordChat: "Сохранять чат",
      keepDeletedMessages: "Хранить удаленные сообщения",
      support7tv: "Поддержка 7TV",
      defaultChatOffsetSec: "Смещение чата по умолчанию, сек",
      saveSettings: "Сохранить",
      saved: "Сохранено",
      telegramTitle: "Telegram-хранилище",
      telegramEnabled: "Выгружать записи в Telegram-канал",
      telegramChatId: "ID канала/чата",
      telegramChatIdHint: "Например -1001234567890 или @имяканала. Бот должен быть админом канала.",
      telegramKeepLocalDays: "Хранить локальный файл после выгрузки, дней",
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
      openSettings: "Open settings",
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
      title: "Recording status",
      subtitle: "Only what matters: who is live, what is recording now, and what is ready to open.",
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
    },
    settings: {
      title: "Settings",
      subtitle: "Only retention and replay defaults stay here.",
      retentionDays: "Retention days",
      storageLimitGb: "Storage limit, GB",
      recordChat: "Record chat",
      keepDeletedMessages: "Keep deleted messages",
      support7tv: "Enable 7TV",
      defaultChatOffsetSec: "Default chat offset, sec",
      saveSettings: "Save",
      saved: "Saved",
      telegramTitle: "Telegram storage",
      telegramEnabled: "Upload recordings to a Telegram channel",
      telegramChatId: "Channel/chat id",
      telegramChatIdHint: "E.g. -1001234567890 or @channelname. The bot must be an admin of the channel.",
      telegramKeepLocalDays: "Keep local file after upload, days",
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
