#!/bin/sh

#1.서버실행
./app -mode=rest &

# 2. 다른 노드가 실행되는지 확인 (7초 동안 서버 상태를 확인)
echo "Waiting for the servers to start..."
check_server_health() {
    local port=$1
    local name=$2
    local retries=5

    for i in $(seq 1 $retries); do
        if curl -s http://blockchain-node$name:$port/healthcheck | grep "OK" > /dev/null; then
            echo "Server on port $port is up and running!"
            return 0
        else
            echo "Waiting for server on port $port..."
            sleep 1
        fi
    done

    return 1
}

# Check health of each server
check_server_health 4004 1 || { echo "Server on port 4004 failed to start."; exit 1; }
check_server_health 4005 2 || { echo "Server on port 4005 failed to start."; exit 1; }
check_server_health 4006 3 || { echo "Server on port 4006 failed to start."; exit 1; }


# 3. 서버가 실행 중이면 API 요청
echo "Sending API request..."
curl -X POST http://blockchain-node1:4004/peers -d '{"address":"blockchain-node2", "port":"4005"}' -H "Content-Type: application/json"
curl -X POST http://blockchain-node1:4004/peers -d '{"address":"blockchain-node3", "port":"4006"}' -H "Content-Type: application/json"

wait