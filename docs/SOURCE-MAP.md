# Исходники stream.neyron.site — 26.09.2026

Актуальная общая Git-копия: `/root/projects/twitch-stream-recorder-current`.
GitHub: `NirvanaEx/twitch-stream-recorder`, ветка `main`.
Этот коммит сохраняет уже работающие обновления; сам push ничего не выкладывает.

| Компонент | Путь в репозитории | Источник работающей версии |
| --- | --- | --- |
| Независимый HTTP API | `apps/api`, `ops/deploy-api.py` | `twitch-stream-recorder-isolation`, выпуск `20260926T155841Z-4c93c62e` |
| Интерфейс, загрузка видео, чат и превью | `apps/web`, `apps/api/scripts/*timeline*`, `scripts/test-preview-preload.cjs` | `twitch-stream-recorder-playback-flow-20260926`, образ `twitch-stream-recorder-web:playback-flow-20260926`; [проверка релиза](playback-fixes-20260926.md) |
| Фоновая синхронизация аудио и чата | `services/twitch-sync` | отдельный репозиторий `/root/projects/twitch-sync`, коммит `6317875` |
| Хранение видео и аудио | `services/twitch-retention` | отдельный репозиторий `/root/projects/twitch-retention`, коммит `530a4d9` |
| Аудиодорожка для завершённых сегментных записей | `ops/segmented-audio.*`, `ops/twitch-segmented-audio.*` | существующий таймер `twitch-segmented-audio.timer` |

`services/*` добавлены через Git subtree с исходными идентификаторами коммитов.
Их внутренние пути сохранены: это самостоятельные приложения, а не модули Nest.
В частности, актуальный userscript обслуживает `tsr-sync`, его источник находится
в `services/twitch-sync/apps/web/app/lib/twitch-audio-script.ts`.
Версия в основном `apps/web` соответствует установленному web-образу и служит
старым маршрутом; она не заменяет новый payload в Nginx.

## Выкладка

Обычный API: `python3 ops/deploy-api.py`; детали и откат в [OPERATIONS.md](OPERATIONS.md).
Web обновляется отдельно. Не запускать общий Compose или старые скрипты `api web`.
Корневые Compose/Nginx остаются шаблоном прежней установки, а не снимком текущих
выпусков. API deploy читает действующий Nginx и меняет только HTTP API upstream,
сохраняя WebSocket рекордера и блок `BEGIN TSR BACKGROUND SYNC`.

Синхронизация и retention пока выкладываются из своих самостоятельных серверных
репозиториев согласно их OPERATIONS/README. Перед будущей выкладкой изменений из
subtree перенести их в соответствующий репозиторий и проверить diff; не запускать
копию deploy-скрипта в subtree в расчёте, что она развернёт именно эту копию:
скрипты намеренно указывают на прежние самостоятельные источники.

Скрипты rescue и отчёты в `docs/history` описывают уже выполненное обслуживание;
не повторять их автоматически. Проверка `ops/verify-isolation.py` действительно
перезапускает только независимый API; при публикации в GitHub она не запускалась.

## Прежние незакоммиченные правки

Старая копия `/root/projects/twitch-stream-recorder` отставала от GitHub и содержала
незакоммиченные изменения. Её состояние сохранено отдельным коммитом в ветке
`archive/pending-before-api-isolation-20260926`, исходная папка не изменена.
Это архив разработки, не ветка для выкладки: более новые версии Telegram,
синхронизации, интерфейса и API находятся в `main`.

Файлы `.env`, ключи, рабочие базы, записи, node_modules и временные сборки не добавлены.
Исторические исходники и самостоятельные репозитории на сервере сохранены.
