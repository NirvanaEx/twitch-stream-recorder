#!/usr/bin/env bash
# Выкладывает twitch-stream-recorder в тот момент, когда обрывать нечего.
#
# streamlink и ffmpeg — дочерние процессы контейнера api, поэтому подмена
# контейнера убивает любой идущий захват. Сборка образов идёт до подмены и
# записи не мешает, так что опасны последние секунды деплоя — и достаточно
# попасть ими в паузу между эфирами.
#
# Условие выкладки: ни одной сессии в статусе recording И ни одного канала в
# эфире (второе — чтобы захват не начался ровно во время подмены).
set -Eeuo pipefail

REPO="/root/projects/twitch-stream-recorder"
LOG="/tmp/twitch-recorder-deploy-watch.log"
POLL_SEC=60
MAX_HOURS=14

log() { printf '[watch] %s %s\n' "$(date -Is)" "$*" | tee -a "$LOG"; }

psql_one() {
  docker exec twitch-recorder-postgres \
    psql -U twitch_recorder -d twitch_recorder -tAc "$1" 2>/dev/null | tr -d '[:space:]'
}

deadline=$(( $(date +%s) + MAX_HOURS * 3600 ))

log "жду паузы между эфирами; порог ожидания ${MAX_HOURS} ч"

while :; do
  recording="$(psql_one "select count(*) from \"StreamSession\" where status='recording'")"
  live="$(psql_one "select count(*) from \"Channel\" where \"isLive\" and \"isEnabled\"")"

  if [[ -z "$recording" || -z "$live" ]]; then
    log "база недоступна — жду и пробую снова"
  elif [[ "$recording" == "0" && "$live" == "0" ]]; then
    log "чисто: записей 0, каналов в эфире 0 — выкладываю"
    break
  else
    log "занято: записей ${recording}, каналов в эфире ${live}"
  fi

  if (( $(date +%s) > deadline )); then
    log "порог ожидания исчерпан, выкладка не выполнена"
    exit 2
  fi

  sleep "$POLL_SEC"
done

# Проверка вплотную к push: между опросом и этой строкой прошли секунды, но
# эфир мог начаться именно в них.
if [[ "$(psql_one "select count(*) from \"StreamSession\" where status='recording'")" != "0" ]]; then
  log "запись началась перед самой выкладкой — возвращаюсь к ожиданию"
  exec "$0"
fi

log "git push srv main"
git -C "$REPO" push srv main 2>&1 | tee -a "$LOG"

log "выкладка завершена, проверяю состояние"
docker ps --format '{{.Names}}\t{{.Status}}' | grep twitch-recorder | tee -a "$LOG"
curl -fsS -o /dev/null -w 'api/health: %{http_code}\n' http://127.0.0.1:9000/api/health | tee -a "$LOG"
