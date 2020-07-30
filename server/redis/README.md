# 基础命令
```sh
# string
> set key value
> get key
"value"

# map       hmget: hash map
> hmset name key0 val0 key1 val0
> hget name keyn
1) "valn"

# list
> lpush list_name val
#               start  end
> lrange list_name 0 10
1) "val"

# set
> sadd set_name val
> smembers set_name
1) "val"

# zset: sorted set
> zadd zset_name 3 third
> zadd zset_name 2 second
> zadd zset_name 4 last
> zadd zset_name 1 first
#                      start  end
> zrangebyscore zset_name 0 10
1) "first"
2) "second"
3) "third"
4) "last"

# delete
> del key

# 清空所有
flushall
```
ok，redis中的数据类型有：
+ string: 最大512M
+ list: 最长 2**32 - 1 个元素
+ hash: 最多 2**32 - 1 个 key-value
+ set: 哈希表实现 set/get O(1)，同样的也最多只能有 2**32 - 1 个元素
+ zset: 比 set 多个 score 用作排序的权重 

# 数据库
redis 支持多个数据库，每个数据库的数据不能共享。数据库的名字是从0-16(default)，不可自定。

flushall 会清空所有 redis 中的数据, 看起来 redis的数据库更像是 namespace。

# 连接远程
redis -h hostname -p port -a password