"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Locale = "ru" | "en";

type Dictionary = {
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
    size: string;
    deleted: string;
    deleteConfirm: string;
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
  };
  errors: {
    apiUnavailable: string;
    requestFailed: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  ru: {
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
    },
    errors: {
      apiUnavailable: "API недоступен.",
      requestFailed: "Запрос завершился ошибкой.",
    },
  },
  en: {
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
    },
    errors: {
      apiUnavailable: "API is unavailable.",
      requestFailed: "The request failed.",
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

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside AppProviders.");
  }

  return context;
}
