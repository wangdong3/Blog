## Ribbon负载均衡

与`Nginx`这样的服务端负载均衡器不同，`Ribbon`是一个基于`HTTP`和`TCP`的客户端负载均衡器，其实现逻辑通过代码在客户端实现，因此，不需要单独搭建负载均衡服务器；

将`ribbon`和`eureka`组合使用时，`ribbon`会从`eureka`获取注册的服务端列表，然后通过负载均衡策略将请求分摊给每个服务提供者。

### 网关服务

搭建一个网关服务`gateway`

1.启动类

```java
@RibbonClient(name = "xxxService")
@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    @LoadBalanced  //在客户端使用 RestTemplate 请求服务端时，开启负载均衡（Ribbon）
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
```

两个关键注解：

`@RibbonClient`注解，指定将要分发的服务实例名称；

`@LoadBalanced` 让`RestTemplate`在请求时拥有客户端负载均衡的能力；

2.配置

```properties
server.port=8090
spring.application.name=gateway
```

3.网关接口层示例

```java
@Controller
@RequestMapping("/gateway")
public class WebController {

    @Autowired
    private RestTemplate restTemplate;

    //负载示例, 调用xxxService两个微服务
    @ResponseBody
    @RequestMapping("/getxxxService")  // RestTemplate 已经被 Ribbon 代理
    public String getxxxService(){

        //restTemplate调用url： 微服务实例名称 + 微服务接口路径
        String applicationName = xxxService;
        String apiUrl = "/userService/doAction"
        String res = restTemplate.getForObject("http://" + applicationName + apiUrl, String.class);
       
        return res;
    }
}
```

### 分发服务

搭建分发服务`xxxService`集群，用于接收网关的分发请求

#### `xxxService`集群实例1

1.配置

```properties
server.port=8092
spring.application.name=xxxService
```

2.接口

```java
@Controller
@RequestMapping("/userService")
public class UserController {

    @ResponseBody
    @RequestMapping("/doAction")
    public String doAction() {
        return "service01";
    }
}
```

#### `xxxService`集群实例2

1.配置

```properties
server.port=8091
spring.application.name=xxxService
```

2.接口

```java
@Controller
@RequestMapping("/userService")
public class UserController {
    
    @ResponseBody
    @RequestMapping("/doAction")
    public String doAction() {
        return "service02";
    }
}
```



### 测试

请求接口 `http://localhost:8090/gateway/getxxxService`

> 请求会分发到分发服务，使用的`Ribbon`默认的轮询算法

返回结果

```
service01
service02
service01
service02
...
...
```

### 负载均衡策略

`Spring Cloud Ribbon` 提供了一个` IRule` 接口，该接口主要用来定义负载均衡策略，它有 7 个默认实现类，每一个实现类都是一种负载均衡策略。

|      | 实现类                      | 负载均衡策略                                                 |
| ---- | --------------------------- | ------------------------------------------------------------ |
| 1    | `RoundRobinRule`            | 按照线性轮询策略，即按照一定的顺序依次选取服务实例           |
| 2    | `RandomRule`                | 随机选取一个服务实例                                         |
| 3    | `RetryRule`                 | 按照线性轮询的策略来获取服务，如果服务实例失效，会在指定的时间重试获取，超过时间仍未获取到则返回null |
| 4    | `WeightedResponseTimeRule`  | 根据平均响应时间，对每个服务计算权重，响应时间短的权重会高，被请求的概率越大 |
| 5    | `BestAvailableRule`         | 过滤故障或失效实例，选择并发量最小的服务实例                 |
| 6    | `AvailabilityFilteringRule` | 先过滤掉故障或失效的服务实例，然后再选择并发量较小的服务实例 |
| 7    | `ZoneAvoidanceRule`         | 综合判断服务所在区域（zone）的性能和服务的可用性，来选择服务实例 |

当然，也可以扩展`AbstractLoadBalancerRule` 类，来自定义负载均衡策略；

```java
public class MyRandomRule extends AbstractLoadBalancerRule {
	@Override
    public Server choose(Object key) {
        //todo
    }
}
```
定义负载均衡策略的配置类
```java
/** Ribbon 负载均衡策略的配置类**/
@Configuration
public class MySelfRibbonRuleConfig {
    @Bean
    public IRule myRule() {
        //自定义 Ribbon 负载均衡策略
        return new MyRandomRule(); 
    }
}
```

在启动类上使用 `RibbonClient` 注解，在该微服务启动时，就会自动去加载我们自定义的` Ribbon` 配置类，使配置生效

`name `为需要定制负载均衡策略的微服务名称

`configuration` 为定制的负载均衡策略的配置类

```java
@RibbonClient(name = "xxxService", configuration = MySelfRibbonRuleConfig.class)
@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
```