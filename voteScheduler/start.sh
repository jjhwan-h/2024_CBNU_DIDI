#!/bin/sh

# 1. 데이터베이스 마이그레이션 실행
echo "Running database migrations..."
./app migrate

# 마이그레이션이 성공적으로 완료되었는지 확인
if [ $? -ne 0 ]; then
  echo "Migration failed, exiting..."
  exit 1
fi

# 2. 애플리케이션 서버 시작
echo "Starting the server..."
./app serve
