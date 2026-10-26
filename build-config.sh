#!/usr/bin/env bash
# .env에서 브라우저용 API 키만 읽어 amplitude-config.js를 생성 (비밀키는 .env 밖으로 나가지 않음)
# 사용법: bash build-config.sh
set -e
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo ".env가 없습니다. .env.example을 복사해 키를 채워주세요." >&2
  exit 1
fi

key=$(grep -E '^AMPLITUDE_API_KEY=' .env | head -1 | cut -d= -f2- | tr -d '\r" ')
if [ -z "$key" ]; then
  echo ".env에 AMPLITUDE_API_KEY가 없습니다." >&2
  exit 1
fi

printf "// build-config.sh가 .env에서 생성한 파일입니다. 수정·커밋하지 마세요.\nwindow.AMPLITUDE_API_KEY = '%s';\n" "$key" > amplitude-config.js
echo "amplitude-config.js 생성 완료"
