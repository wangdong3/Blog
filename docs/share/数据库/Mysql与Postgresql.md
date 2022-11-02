## Postgresql 与 MySQL 比较

> 二者都是比较强大的数据库，选择使用哪一个数据库需要结合实际业务需求，综合考量。

### 历史

`MySQL`有着特殊的经历，故存在多版本（社区版、商业版、企业版）；而`postgresql`则是单一完整的版本，完全开源。

### 支持平台

二者都支持运行在`Linux`，`Windows`，`Mac`等多个操作系统

### 二者底层特性

#### 库存储引擎

`postgresql`单一存储引擎；`MySQL`有`Innodb `、 `MyISAM`等多个存储引擎，以适应不同的业务场景；

#### 对数据的管理

`Postgresql`对数据管理的可靠性要求极高，同样，数据一致性和完整性优先级也很高。`MySQL`的可靠性相对低一些；

#### 表连接算法

`Postgresql`有着更强劲的优化器，支持`hash join`、`nested loop`、`sort merge join`；`MySQL`支持`nested loop`，8.0版本开始支持`hash join`

`MySQL`

1. `NESTED LOOP`
   - 简单嵌套循环连接（`Simple Netsted-Loop Join`）
   - 索引嵌套循环连接（`Index Nested Loops Join`）
   - 基于块的嵌套循环连接（`Block Nested-Loop Join`）
   - 批量键访问联接（`Batched Key Access Join`）

2. `Hash Join`（8.0版本引入）

`Postgresql`

1. `NESTED LOOP`

2. `HASH JOIN`

3. `SORT MERGE JOIN`

### 应用场景

`Postgresql`适合更严格的企业应用；`MySQL`适合数据可靠性要求低，业务相对简单的的互联网应用；

### 面向开发使用

- 数据类型：支持多种丰富的数据类型，能够满足各个业务场景的使用；

- 索引类型：`MySQL`取决于存储引擎，`postgresql`支持四种索引（`b-tree`、`hash`、`gin`、`gist`）；

- 查询能力：`Mysql`对于大数据量的读操作很快；`postgresql`支持更为复杂的查询，有很强大的查询优化器；

- 字段扩展：`MySQL`增加列需重建表和索引，`postgresql`在数据字典中增加表定义；
  