 
# Twitch Stream Recorder With Realtime Chat Replay

## 1. Product Goal

Нужно разработать self-hosted веб-приложение для автоматической записи Twitch-стримов выбранных каналов вместе с чатом и поддержкой сторонних эмотов, в первую очередь `7TV`.

Система должна:

- автоматически отслеживать начало и конец стрима;
- автоматически запускать запись видео и чата;
- сохранять архив, который можно смотреть прямо в браузере без скачивания;
- показывать realtime-статус записи в админ-панели;
- иметь удобную UI/UX для администрирования, просмотра активных записей и управления архивом;
- поддерживать смещение чата относительно видео в секундах;
- поддерживать ручное удаление архивов;
- поддерживать политику хранения: по дням и по лимиту диска;
- работать в Docker на VPS с ограниченными ресурсами.

## 2. Deployment Constraints

Целевая среда:

- VPS
- `2 vCPU`
- `8 GB RAM`
- `100 GB SSD`
- Docker / Docker Compose

Вывод по ограничениям:

- система должна быть оптимизирована под `1-3` одновременно отслеживаемых каналов;
- тяжелое realtime-перекодирование нужно минимизировать;
- запись видео желательно делать через `stream copy`, где это возможно;
- хранение должно включать автоочистку, иначе диск быстро заполнится;
- в MVP чат не должен вшиваться в видео в реальном времени;
- основной способ просмотра архива: `веб-плеер + синхронизированный чат`.

## 3. Core Product Principles

Продукт проектируется как `web app`, а не как набор скриптов.

Основные принципы:

- realtime-first интерфейс;
- admin-first UX;
- browser playback without download;
- высокая надежность автоматической записи;
- хранение видео и чата как отдельных, но синхронизированных сущностей;
- возможность расширения на `BTTV` и `FFZ` без ломки архитектуры;
- безопасное ручное управление архивом и настройками.

## 4. MVP Scope

### 4.1 What MVP Must Include

- авторизация администратора;
- dashboard с realtime-статусами;
- список отслеживаемых каналов;
- добавление/удаление каналов;
- включение/выключение автослежения;
- автоматический старт записи при начале стрима;
- автоматическая остановка при завершении стрима;
- запись видео;
- запись чата;
- базовая поддержка `7TV` для replay;
- сохранение чата с таймкодами;
- просмотр архива в браузере;
- просмотр текущей активной записи в near real-time;
- настройка `chat offset` в секундах;
- сохранение `chat offset` для конкретного архива;
- ручное удаление архива из панели;
- автоочистка по дням;
- автоочистка по лимиту диска;
- просмотр логов и ошибок;
- Docker-based запуск всех сервисов.

### 4.2 What MVP Does Not Need Yet

- multi-user roles;
- публичный портал для всех пользователей;
- экспорт одного MP4 с уже отрендеренным чатом;
- продвинутая аналитика;
- мобильное приложение;
- поддержка нескольких провайдеров эмотов кроме `7TV` в первом релизе;
- горизонтальное масштабирование;
- кластерный orchestration beyond Docker Compose.

## 5. Realtime Definition

Система должна работать в `near real-time`, а не обещать нулевую задержку.

Ожидаемое поведение:

- статусы каналов и записи обновляются почти мгновенно;
- чат поступает почти мгновенно;
- dashboard обновляется по `WebSocket`;
- активную запись можно открыть в браузере еще до окончания стрима;
- задержка live playback допустима в диапазоне примерно `2-10 секунд`;
- чат должен синхронизироваться с текущим временем плеера и учитывать offset.

## 6. Recommended Tech Stack

### 6.1 Infrastructure

- `Docker Compose`
- `Nginx` как reverse proxy

### 6.2 Backend

- `Node.js`
- `TypeScript`
- `NestJS`
- `WebSocket Gateway`
- `BullMQ` or equivalent queue layer

### 6.3 Frontend

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`
- `HLS.js`

### 6.4 Data Layer

- `PostgreSQL` as primary database
- `Redis` for queue, live state, ephemeral coordination

### 6.5 Capture Layer

- `Streamlink` for Twitch stream capture input
- `FFmpeg` for recording, HLS packaging, optional post-processing

## 7. High-Level Architecture

Система состоит из следующих сервисов:

- `web`: frontend admin panel + replay UI
- `api`: backend API, auth, settings, orchestration
- `worker`: фоновые задачи, запись, постобработка, retention
- `postgres`: primary database
- `redis`: queues, websocket fanout support, live state
- `nginx`: routing and static delivery

### 7.1 Flow Overview

1. Twitch сообщает о начале стрима.
2. Backend создает `stream session`.
3. Worker запускает захват видео.
4. Worker запускает захват чата.
5. Worker пишет сообщения чата в БД с точными timestamp.
6. Видео сегментируется и публикуется для браузерного просмотра.
7. Frontend получает live updates по WebSocket.
8. После завершения стрима session переводится в завершенный архив.
9. Retention job очищает старые архивы по правилам.

## 8. Twitch Integration

### 8.1 Stream Tracking

Для отслеживания начала и конца стрима использовать `Twitch EventSub`.

Ключевые события:

- `stream.online`
- `stream.offline`

### 8.2 Chat Capture

Для MVP нужно реализовать capture Twitch chat с сохранением:

- message id
- author identity
- badges
- message text
- Twitch emote references
- timestamps
- delete / timeout / moderation events

Допускается начать с наиболее надежного канала получения чата и постепенно выровнять покрытие событий.

## 9. 7TV Support

Система должна поддерживать `7TV` в replay-слое.

Для этого требуется:

- разрешать emote tokens в сообщениях;
- хранить снапшот emote set или достаточно данных для детерминированного отображения;
- учитывать, что emote set может меняться во времени;
- стараться обеспечить точное отображение для архива, а не только для live state.

В MVP приоритет:

- корректный replay наиболее частых `7TV` эмотов;
- архитектура, готовая к будущему расширению на `BTTV` и `FFZ`.

## 10. Storage Strategy

Видео и чат не должны храниться как один монолитный файл.

Нужно хранить:

- исходные или рабочие видеофайлы;
- HLS-представление для браузерного просмотра;
- chat timeline;
- metadata;
- logs;
- emote snapshots / references.

### 10.1 Retention Rules

Нужно поддержать два независимых ограничения:

- `retention_days`
- `storage_limit_gb`

Логика удаления:

- сначала удалять архивы, превысившие `retention_days`;
- затем, если storage все еще выше лимита, удалять самые старые архивы;
- удаление должно быть консистентным: БД, HLS, raw files, chat logs, thumbnails.

## 11. Admin UX Requirements

UI/UX должен быть максимально удобным и понятным, с упором на desktop.

### 11.1 Dashboard

Показывать:

- активные каналы;
- кто live;
- кто записывается;
- статус чата;
- статус post-processing;
- использование диска;
- последние ошибки;
- последние завершенные архивы.

### 11.2 Channels Page

Нужно поддержать:

- добавление канала по Twitch login;
- включение/выключение мониторинга;
- удаление канала;
- просмотр последнего статуса;
- ручной запуск записи;
- ручную остановку записи;
- отображение текущей активности.

### 11.3 Archives Page

Нужно поддержать:

- список архивов;
- фильтры и поиск;
- дата, длительность, размер, канал, статус;
- открыть replay;
- удалить вручную;
- отобразить состояние обработки;
- отобразить сохраненный chat offset.

### 11.4 Settings Page

Нужно поддержать:

- retention days;
- storage limit GB;
- запись чата on/off;
- хранение deleted messages on/off;
- 7TV support on/off;
- default chat offset;
- базовые системные настройки;
- сохранение изменений без ручной перезагрузки.

### 11.5 Logs Page

Нужно поддержать:

- фильтрацию по severity;
- системные события;
- события записи;
- ошибки Twitch integration;
- ошибки capture pipeline;
- retention actions.

## 12. Replay UX Requirements

Replay page является одной из ключевых частей продукта.

### 12.1 Layout

Предпочтительный layout:

- video player as primary content area;
- chat panel on the right;
- control toolbar near player/chat controls;
- archive metadata visible but not distracting.

### 12.2 Chat Controls

Нужно поддержать:

- `chat offset` in seconds;
- шаги смещения `-1 / +1 / -5 / +5`;
- ручной ввод offset;
- сохранение offset для архива;
- размер шрифта;
- скорость/режим прокрутки;
- показать/скрыть deleted messages;
- включить/отключить rendering of 7TV emotes.

### 12.3 Playback Behavior

Нужно поддержать:

- synchronized chat replay with video current time;
- быстрые seek без поломки таймлайна;
- корректную подгрузку сообщений вокруг текущего времени;
- просмотр активного архива во время продолжающейся записи;
- graceful behavior при недоступности части HLS сегментов.

## 13. Chat Offset Model

Offset должен проектироваться как отдельная настройка отображения, а не как изменение исходных chat timestamps.

### 13.1 Rules

- исходные timestamps immutable;
- offset применяется только на уровне replay computation;
- нужен `global default offset`;
- нужен `per-archive override`;
- UI должен позволять временно менять offset без немедленного сохранения;
- UI должен позволять сохранить offset для конкретного архива.

### 13.2 Formula

Показ сообщения в replay:

- `render_time = message_time + effective_chat_offset_sec`

где:

- `message_time` = timestamp сообщения относительно stream session;
- `effective_chat_offset_sec` = per-archive offset, если задан, иначе global default.

## 14. Database Requirement

БД обязательна.

Хранение только в JSON-файлах для данного продукта недостаточно, потому что нужны:

- фильтруемый архив;
- realtime statuses;
- channel management;
- settings persistence;
- logs;
- deletion consistency;
- chat replay queries;
- emote mapping;
- job tracking.

## 15. Suggested Database Schema

### 15.1 users

Поля:

- id
- email or username
- password_hash
- created_at
- updated_at

### 15.2 channels

Поля:

- id
- twitch_user_id
- twitch_login
- display_name
- is_enabled
- auto_record
- preferred_quality
- last_seen_live_at
- created_at
- updated_at

### 15.3 stream_sessions

Поля:

- id
- channel_id
- twitch_stream_id
- title
- category_name
- started_at
- ended_at
- status
- video_status
- chat_status
- replay_status
- is_live
- saved_chat_offset_sec
- created_at
- updated_at

### 15.4 archive_files

Поля:

- id
- stream_session_id
- kind
- path
- size_bytes
- duration_sec
- created_at

### 15.5 chat_messages

Поля:

- id
- stream_session_id
- provider_message_id
- author_user_id
- author_login
- author_display_name
- badges_json
- text_raw
- text_render_tokens_json
- message_timestamp
- relative_time_sec
- is_deleted
- deleted_at
- created_at

### 15.6 chat_events

Поля:

- id
- stream_session_id
- event_type
- provider_event_id
- payload_json
- event_timestamp
- relative_time_sec
- created_at

### 15.7 emote_snapshots

Поля:

- id
- stream_session_id
- provider
- snapshot_key
- payload_json
- created_at

### 15.8 app_settings

Поля:

- key
- value_json
- updated_at

### 15.9 jobs

Поля:

- id
- kind
- target_type
- target_id
- status
- progress
- error_message
- started_at
- finished_at
- created_at

### 15.10 system_logs

Поля:

- id
- level
- scope
- message
- metadata_json
- created_at

## 16. API Requirements

### 16.1 Auth

- login
- logout
- current user

### 16.2 Channels

- list channels
- create channel
- update channel
- delete channel
- start recording manually
- stop recording manually

### 16.3 Dashboard

- system overview
- active recordings
- disk usage
- recent failures

### 16.4 Archives

- list archives
- archive detail
- replay metadata
- delete archive
- update archive chat offset

### 16.5 Settings

- get settings
- update settings

### 16.6 Logs

- list logs
- filter logs

### 16.7 Realtime

WebSocket events:

- channel status changed
- recording started
- recording stopped
- job progress updated
- archive ready
- disk usage updated
- error raised

## 17. Background Jobs

Нужны фоновые jobs:

- event processing
- record stream
- record chat
- build/update HLS
- retention cleanup
- disk usage refresh
- emote snapshot refresh
- archive finalization

## 18. File Layout Strategy

Нужно разделить данные на:

- app source code
- runtime data
- logs
- generated HLS
- temporary capture files

Рекомендуемый runtime layout:

- `/data/records`
- `/data/hls`
- `/data/chat`
- `/data/logs`
- `/data/tmp`

## 19. Security Requirements

MVP security baseline:

- admin login required;
- password hashing;
- secure session or JWT cookie strategy;
- no public write endpoints;
- safe deletion flow;
- basic rate limiting on auth endpoints;
- secrets only via env vars;
- no Twitch secrets committed into repository.

## 20. Docker Requirements

Проект должен запускаться через Docker Compose.

Минимальные сервисы:

- `postgres`
- `redis`
- `api`
- `worker`
- `web`
- `nginx`

Нужно предусмотреть:

- persistent volumes;
- env-based configuration;
- startup dependencies;
- dev and prod friendly defaults where practical.

## 21. Non-Functional Requirements

- устойчивость к кратковременным сетевым сбоям;
- понятные ошибки в UI;
- консистентное удаление архивов;
- расширяемость по эмот-провайдерам;
- нормальная работа на ограниченном VPS;
- удобный интерфейс без ощущения “сырой админки”.

## 22. Delivery Plan

### Phase 1

- repo scaffold
- docker compose
- postgres + redis
- backend skeleton
- frontend skeleton
- auth base
- dashboard shell

### Phase 2

- channels CRUD
- settings CRUD
- twitch integration skeleton
- jobs system
- logging base

### Phase 3

- stream recording pipeline
- chat recording pipeline
- archive persistence
- realtime dashboard updates

### Phase 4

- replay page
- chat sync
- chat offset controls
- archive deletion
- retention automation

### Phase 5

- polish UI/UX
- resilience improvements
- better logs
- edge-case handling

## 23. Immediate Implementation Direction

Работу нужно начинать с создания каркаса проекта, который соответствует этой спецификации:

- monorepo structure;
- Docker Compose;
- NestJS API;
- Next.js web app;
- PostgreSQL and Redis wiring;
- базовые env templates;
- базовая структура модулей под channels, archives, settings, auth, realtime.

## 24. Success Criteria

Результат считается успешным, если система:

- автоматически начинает запись стрима;
- пишет чат параллельно;
- показывает live статус записи в админке;
- позволяет открыть архив в браузере;
- позволяет вручную удалить архив;
- умеет автоочищать архивы по настройкам;
- позволяет смещать чат относительно видео;
- работает в Docker на целевом VPS.
