#!/bin/sh

#1.서버실행
./app -mode=rest &

# 2. 다른 노드가 실행되는지 확인 (7초 동안 서버 상태를 확인)
echo "Waiting for the servers to start..."

for i in {1..5}; do
    # curl을 사용하여 서버 상태 확인 (HTTP 응답이 200이면 서버가 정상적으로 실행 중)
    if curl -s http://blockchain-node1:4004/healthcheck | grep "OK" > /dev/null; then
        echo "Server on port 4004 is up and running!"
        break
    else
        echo "Waiting for server on port 4004..."
        sleep 1  # 서버가 실행되기까지 기다림
    fi
done
for i in {1..5}; do
    # curl을 사용하여 서버 상태 확인 (HTTP 응답이 200이면 서버가 정상적으로 실행 중)
    if curl -s http://blockchain-node2:4005/healthcheck | grep "OK" > /dev/null; then
        echo "Server on port 4005 is up and running!"
        break
    else
        echo "Waiting for server on port 4005..."
        sleep 1  # 서버가 실행되기까지 기다림
    fi
done
for i in {1..5}; do
    # curl을 사용하여 서버 상태 확인 (HTTP 응답이 200이면 서버가 정상적으로 실행 중)
    if curl -s http://blockchain-node3:4006/healthcheck | grep "OK" > /dev/null; then
        echo "Server on port 4006 is up and running!"
        break
    else
        echo "Waiting for server on port 4006..."
        sleep 1  # 서버가 실행되기까지 기다림
    fi
done

# 3. 서버가 실행 중이면 API 요청
if [ $? -eq 0 ]; then
  echo "Sending API request..."
  curl -X POST http://blockchain-node1:4004/peers -d '{"address":"blockchain-node2", "port":"4005"}' -H "Content-Type: application/json"
  curl -X POST http://blockchain-node1:4004/peers -d '{"address":"blockchain-node3", "port":"4006"}' -H "Content-Type: application/json"
else
  echo "Server failed to start or no response"
  exit 1
fi
