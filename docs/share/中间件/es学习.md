# ElasticSearch  

## 一、ES了解  

### 是什么  
es是一个**实时**分布式搜索和分析引擎，它让你以前所未有的**速度**处理大数据成为可能。

-  使用场景  
es用于**全文搜索**、**结构化搜索**、**分析**以及将这三者混合使用

### 安装  
[https://www.elastic.co/cn/downloads/elasticsearch](https://www.elastic.co/cn/downloads/elasticsearch ) 
下载、解压、启动

- 集群和节点  
节点是一个运行着es的实例。集群是一组具有相同cluster.name的节点集合。

### 与Elasticsearch交互  

#### Java API  
es为Java提供两种客户端：node client，transport client。
- **节点客户端(node client)**：
节点客户端以无数据节点(none data node)身份加入集群，换言之，它自己不存储任何数据，但是它知道数据在集群中的具
体位置，并且能够直接转发请求到对应的节点上。

- **传输客户端(Transport client)**：
这个更轻量的传输客户端能够发送请求到远程集群。它自己不加入集群，只是简单转发请求给集群中的节点。

两个Java客户端都通过9300端口与集群交互，使用Elasticsearch传输协议(Elasticsearch Transport Protocol)。集群中的节点之间也通过9300端口进行通信。如果此端口未开放，你的节点将不能组成集群。

#### 基于HTTP协议，以JSON为数据交互格式的RESTful API

举例说明，为了计算集群中的文档数量，我们可以这样做
<http://172.23.20.116:9200/_count?pretty>

返回信息：

```json
{
    "count": 2,
    "_shards": {
        "total": 7,
        "successful": 7,
        "skipped": 0,
        "failed": 0
    }
}
```

### 面向文档  
Elasticsearch是面向文档(document oriented)的，这意味着它可以存储整个对象或文档(document)。然而它不仅仅是存储，还会索引(index)每个文档的内容使之可以被搜索。在Elasticsearch中，你可以对文档（而非成行成列的数据）进行索引、搜索、排序、过滤。这种理解数据的方式与以往完全不同，这也是Elasticsearch能够执行复杂的全文搜索的原因之一。

ELasticsearch使用Javascript对象符号(JavaScript Object Notation)，也就是JSON，作为文档序列化格式。JSON现在已经被大多语言所支持，而且已经成为NoSQL领域的标准格式。它简洁、简单且容易阅读。

以下使用JSON文档来表示一个用户对象：  
```json
{
    "email": "john@smith.com",
    "first_name": "John",
    "last_name": "Smith",
    "info": {
        "bio": "Eco-warrior and defender of the weak",
        "age": 25,
        "interests": [
            "dolphins",
            "whales"
        ]
    },
    "join_date": "2014/05/01"
}
```

### 索引-->类型-->文档  

**索引** 含义的区分：

- 索引（名词）
如上文所述，一个索引(index)就像是传统关系数据库中的数据库，它是相关文档存储的地方，index的复数是indices 或indexes。

- 索引（动词）
「索引一个文档」表示把一个文档存储到索引（名词）里，以便它可以被检索或者查询。这很像SQL中的 INSERT 关键字，差别是，如果文档已经存在，新的文档将覆盖旧的文档。

- 倒排索引
传统数据库为特定列增加一个索引，例如B-Tree索引来加速检索。Elasticsearch和Lucene使用一种叫做倒排索引(inverted index)的数据结构来达到相同目的。

> 默认情况下，文档中的所有字段都会被索引（拥有一个倒排索引），只有这样他们才是可被搜索的。

> Elasticsearch集群可以包含多个索引(indexes)（数据库），每一个索引可以包含多个类型(types)（表），每一个类型包含多个文档(documents)（行），然后每个文档包含多个字段(Fields)（列）。

***例子***：创建员工目录  

- 为每个员工的文档(document)建立索引，每个文档包含了相应员工的所有信息。
- 每个文档的类型为 employee 。
- employee 类型归属于索引 megacorp 。
- megacorp 索引存储在Elasticsearch集群中

`PUT /megacorp/employee/1`

```json
{
	"first_name" : "John",
	"last_name" : "Smith",
	"age" : 25,
	"about" : "I love to go rock climbing",
	"interests": [ "sports", "music" ]
}
```

**检索文档**  

`GET /megacorp/employee/1`
响应的内容中包含一些文档的元信息，John Smith的原始JSON文档包含在 _source 字段中

```json
{
    "_index": "megacorp",
    "_type": "employee",
    "_id": "1",
    "_version": 1,
    "_seq_no": 0,
    "_primary_term": 1,
    "found": true,
    "_source": {
        "first_name": "John",
        "last_name": "Smith",
        "age": 25,
        "about": "I love to go rock climbing",
        "interests": [
            "sports",
            "music"
        ]
    }
}
```
> 我们通过HTTP方法 GET 来检索文档，同样的，我们可以使用 DELETE 方法删除文档，使用 HEAD 方法检查某文档是否存在。如果想更新已存在的文档，我们只需再 PUT 一次。


**简单搜索**  
*例如搜索全部员工*

`GET /megacorp/employee/_search`  
```json
{
    "took": 3,
    "timed_out": false,
    "_shards": {
        "total": 1,
        "successful": 1,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 2,
            "relation": "eq"
        },
        "max_score": 1,
        "hits": [
            {
                "_index": "megacorp",
                "_type": "employee",
                "_id": "2",
                "_score": 1,
                "_source": {
                    "first_name": "Jane",
                    "last_name": "Smith",
                    "age": 32,
                    "about": "I like to collect rock albums",
                    "interests": [
                        "music"
                    ]
                }
            },
            {
                "_index": "megacorp",
                "_type": "employee",
                "_id": "3",
                "_score": 1,
                "_source": {
                    "first_name": "Douglas",
                    "last_name": "Fir",
                    "age": 35,
                    "about": "I like to build cabinets",
                    "interests": [
                        "forestry"
                    ]
                }
            }
        ]
    }
}
```
> 在结尾使用关键字 _search 来取代原来的文档ID。响应内容的 hits 数组中包含了我们所有的三个文档。默认情况下搜索会返回前10个结果。

接下来，让我们搜索姓氏中包含“Smith”的员工。要做到这一点，我们将在命令行中使用轻量级的搜索方法。这种方法常被称作查询字符串(query string)搜索，因为我们像传递URL参数一样去传递查询语句
`GET /megacorp/employee/_search?q=last_name:Smith`
在请求中依旧使用 _search 关键字，然后将查询语句传递给参数 q= 。这样就可以得到所有姓氏为Smith的结果：
```json
{
    "took": 2,
    "timed_out": false,
    "_shards": {
        "total": 1,
        "successful": 1,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 1,
            "relation": "eq"
        },
        "max_score": 0.6931472,
        "hits": [
            {
                "_index": "megacorp",
                "_type": "employee",
                "_id": "2",
                "_score": 0.6931472,
                "_source": {
                    "first_name": "Jane",
                    "last_name": "Smith",
                    "age": 32,
                    "about": "I like to collect rock albums",
                    "interests": [
                        "music"
                    ]
                }
            }
        ]
    }
}
```

**使用DSL语句查询**  
> 查询字符串搜索是便于通过命令行完成点对点(ad hoc)的搜索，但是它也有局限性（参阅简单搜索章节）。Elasticsearch提供更加丰富且灵活的查询语言叫做DSL查询(Query DSL),它允许你构建更加复杂、强大的搜索。

> DSL(Domain Specific Language领域特定语言)指定JSON做为请求体。我们可以这样表示之前关于“Smith”的查询:

```json
{
    "query": {
        "match": {
            "last_name": "Smith"
        }
    }
}
```
这会返回与之前查询相同的结果。你可以看到有些东西做了改变，我们不再使用查询字符串(query string)做为参数，而是使用请求体代替。这个请求体使用JSON表示，其中使用了 match 语句（查询类型之一，其余我们将在接下来的章节学习到）


**更复杂的搜索**  
我们让搜索变的复杂一些。我们依旧想要找到姓氏为“Smith”的员工，但是我们只想得到年龄大于30岁的员工。我们的语句将做一些改变用来添加过滤器(filter),它允许我们有效的执行一个结构化搜索：
```json
{
    "query": {
        "filtered": {
            "filter": {
                "range": {
                    "age": {
                        "gt": 30
                    }
                }
            },
            "query": {
                "match": {
                    "last_name": "smith"
                }
            }
        }
    }
}
```

**全文搜索**  
到目前为止搜索都很简单：简单的名字，通过年龄筛选。让我们尝试一种更高级的搜索，全文搜索——一种传统数据库很难实现的功能。
*搜索所有喜欢“rock climbing”的员工：*
`GET /megacorp/employee/_search`
```json
{
	"query" : {
		"match" : {
			"about" : "rock climbing"
		}
	}
}
```
> Elasticsearch根据相关评分排序，相关评分是根据文档与语句的匹配度来得出  


**短语搜索**  
匹配确切的单词序列或者短语(phrases)
`GET /megacorp/employee/_search`
```json
{
	"query" : {
		"match_phrase" : {
			"about" : "rock climbing"
		}
	}
}
```

**高亮我们的搜索**  
从每个搜索结果中高亮(highlight)匹配到的关键字，以便用户可以知道为什么文档这样匹配查询。Elasticsearch中高亮片段是非常容易的。
增加 highlight 参数：
`GET /megacorp/employee/_search`
```json
{
    "query": {
        "match_phrase": {
            "about": "rock climbing"
        }
    },
    "highlight": {
        "fields": {
            "about": {}
        }
    }
}
```

**分析**  

Elasticsearch把这项功能叫做聚合(aggregations)，它允许你在数据基础上生成复杂的统计。它很像SQL中的 GROUP BY 但是功能更强大
`GET /megacorp/employee/_search`
```json
{
	"aggs": {
		"all_interests": {
			"terms": { "field": "interests" }
		}
	}
}
```
返回结果：
```json
{
	...
	"hits": { ... },
	"aggregations": {
		"all_interests": {
			"buckets": [
				{
					"key": "music",
					"doc_count": 2
				},
				{
					"key": "forestry",
					"doc_count": 1
				},
				{
					"key": "sports",
					"doc_count": 1
				}
			]
		}
	}
}
```

*聚合也允许分级汇总。例如，让我们统计每种兴趣下职员的平均年龄：*
`GET /megacorp/employee/_search`
```json
{
    "aggs": {
        "all_interests": {
            "terms": {
                "field": "interests"
            },
            "aggs": {
                "avg_age": {
                    "avg": {
                        "field": "age"
                    }
                }
            }
        }
    }
}
```

返回结果：
```json
...
"all_interests": {
	"buckets": [
		{
			"key": "music",
			"doc_count": 2,
			"avg_age": {
				"value": 28.5
			}
		},
		{
			"key": "forestry",
			"doc_count": 1,
			"avg_age": {
				"value": 35
			}
		},
		{
			"key": "sports",
			"doc_count": 1,
			"avg_age": {
				"value": 25
			}
		}
	]
}
```



## 问题：

**match** **term** 全词匹配，分词匹配

**索引分配分片**：根据数据量做分片，一个分片多少数据量

