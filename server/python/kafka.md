# kafka 运行环境

```sh
➜ brew install kafka
```

如果报错说需要 java 环境，那就：

```sh
➜ brew cask install homebrew/cask-versions/adoptopenjdk8
```

然后启动 kafka:

```sh
# 我的版本是 2.5.0
➜ cd /usr/local/Cellar/kafka/:version
# 启动 zookeeper
➜ ./bin/zookeeper-server-start /usr/local/etc/kafka/zookeeper.properties
# 启动 kafka server
➜ ./bin/kafka-server-start /usr/local/etc/kafka/server.properties
```

创建 topic：

```sh
# 这里名字是 wb-topic
# kafka 默认端口是 2181
➜ ./bin/kafka-topics --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic wb-topic
# 查看创建的 topic
➜ ./bin/kafka-topics --list --zookeeper localhost:2181
wb-topic
```

# python kafka

```sh
➜ pip2 install kafka
```

Producer:

```py
from kafka import KafkaProducer
import time

brokers, topic = 'localhost:9092', 'test-kafka'

def start():
    while True:
        print(" --- produce ---")
        time.sleep(10)
        producer.send('topic', key=b'foo', value=b'bar')
        producer.flush()
 
 
if __name__ == '__main__':
    producer = KafkaProducer(bootstrap_servers=brokers)
    start()
    producer.close()
```

Consumer:

```py
from kafka import KafkaConsumer

brokers, topic = 'localhost:9092', 'test-kafka'

if __name__ == '__main__':
    consumer = KafkaConsumer(topic, group_id='test-consumer-group', bootstrap_servers=[brokers])
  for msg in consumer:
    print("key=%s, value=%s" % (msg.key, msg.value))
```

最后分别跑 producer、consumer。
