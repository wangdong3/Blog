# Redis  

[[toc]]

## Redis是什么  

开源的，内存中的数据结构存储系统。

基于内存又可持久化、key-value数据库。

可以用作数据库、缓存和消息中间件。

## Redis使用场景  

- 缓存，session缓存
- 消息队列
- 分布式锁

## Redis支持哪些数据结构
- String  
- list  
- hash  
- set  
- sortedset    

## Redis分布式锁  
​	1）使用setNX命令缓存锁，如果没有则设置，获得锁
​	2）设置超时时间，
​	3）锁已经存在，获取锁的到期时间，与当前时间比较，超时的话，就设置新的值

## 实现异步队列  

用List结构作为队列，rpush生产消息，当lpop没有消息时，sleep一会再重试

## 同步机制 (主从复制)

配置：

`slaveof <masterip> <masterport>`

## 哨兵机制(:hearts:)  

- 解决主从复制的缺点
- 当主节点出现故障，由Redis sentinel自动完成故障发现和转移，实现高可用


## 持久化  
- RDB   快照

  ```shell
  ##rdb配置相关
  
  #时间策略
  save 900 1
  save 300 10
  save 60 10000
  
  #文件名称
  dbfilename dump.rdb
  
  #文件保存路径
  dir ./
  
  #如果持久化出错，主进程停止写入
  stop-writes-on-bgsave-error yes
  
  # 是否对RDB文件进行压缩，默认是yes
  rdbcompression yes
  
  #是否对rdb文件进行校验，默认是yes
  rdbchecksum yes
  ```

- AOF   保存命令重新执行：包括命令的实时写入，AOF文件的重写

  命令写入--》追加到aof_buf--》同步到磁盘AOF文件。

  ```shell
  ##aof配置相关
  
  #是否开启AOF
  appendonly no
  
  # The name of the append only file (default: "appendonly.aof")
  appendfilename "appendonly.aof"
  
  #三种同步策略
  #每次接受到写命令，强制写入磁盘
  # appendfsync always
  
  #每秒写入一次
  appendfsync everysec
  #完全依赖操作系统写入
  # appendfsync no
  
  #在日志重写时，不进行命令追加操作，而是将其放到缓冲区里，避免与命令的追加造成DISK IO的冲突
  no-appendfsync-on-rewrite no
  #当前AOF文件是上次日志重写得到AOF文件大小的两倍时，自动启动新的日志重写过程
  auto-aof-rewrite-percentage 100
  #当前AOF文件启动新的日志重写过程的最小值，避免频繁重写
  auto-aof-rewrite-min-size 64mb
  
  #加载aof时如果有错如何处理
  aof-load-truncated yes
  
  # 文件重写策略
  aof-rewrite-incremental-fsync yes
  
  ```

## 常见问题  
- 缓存雪崩  大量缓存失效，请求转到数据库，造成数据库的压力；设置失效时间点均匀分布，避免雪崩；在时间上加一个随机值，使得过期时间分散；
- 缓存穿透   命中率； 缓存未命中，查询数据库空；设置默认值放到缓存里，这样就不会继续访问数据库
- 实现消息队列，队列满了怎么办，消费不完怎么办？

## 淘汰策略 

1. 设置过期中最近最少使用
2. 设置过期中将要过期的
3. 设置过期中任意数
4. 最近最少使用
5. 任意