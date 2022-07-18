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
​	1）使用set命令缓存锁

```
set key value ex time nx
```

​	2）使用lua脚本设置

```java
if redis.call('setNx',KEYS[1],ARGV[1]) then if redis.call('get', KEYS[1])==ARGV[1] then return redis.call('expire', KEYS[1], ARGV[2]) else return 0 end end
    
if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end
```

实现思想：使用setnx命令加锁，并使用expire给锁加一个超时时间，超过该时间，则自动释放锁；锁的value值为随机生成的id，释放锁时要判断下，是不是该锁。

使用过程中可能会出现的问题：

```
（1）业务操作异常，未能走到释放锁，锁得不到释放，可能会产生死锁

（2) try catch finally解决上一个问题，除程序抛异常外，程序崩溃，服务器宕机，重启等也可能会导致锁的释放没有执行

（3）解决上一个问题，需要给锁设置超时时间；另外加锁，设置超时时间可能并不是原子操作，在设置超时时间时，程序崩溃，未能成功设置超时时间也可能导致死锁

（4）使用lua脚本，或者set原生命令，增加ex,nx,px等参数，加锁和设置超时时间在一条命令上执行

（5）高并发场景下，可能超时时间不合理，A线程业务未处理完 ，锁自动释放，B线程获得锁，开始执行业务，A线程业务执行完释放锁，会把B线程刚加的锁给删掉了，等到B线程业务处理完，释放锁时可能就会出错

（6）解决上一个问题，就需要加锁时，value值设置为唯一值，释放锁时，通过这个唯一id，判断是不是该锁；超时时间的设置，在加锁成功后，启动一个守护线程，守护线程每隔三分之一超时时间就去延迟锁的超时时间（续命），业务处理完，要关闭守护线程

```

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