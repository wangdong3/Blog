## Zuul

`Zuul`是`Netflix`开源的微服务网关组件，负责网络请求路由和过滤；



### 概念

#### 路由

`zuul`作为一个外部访问的统一入口，转发网络请求到指定的的微服务实例；

`zuul`从服务注册中心`eureka`获取到所有已经注册的微服务实例的信息，在接收到外部请求时，根据路由规则将匹配到的请求关键字映射到具体的微服务实例接口路径，以此能够调用具体的微服务。

#### 过滤

`zuul`对外部的网络请求进行一个预处理，做一些请求校验等操作；

> `zuul`的核心是过滤器，大部分功能依赖过滤器来实现

#### 过滤器

`Zuul`中定义了4种标准过滤器类型

- `PRE` 在请求之前进行过滤，可以做一些身份认证、参数验证、认证鉴权、限流等
- `ROUTING` 将请求路由到微服务
- `POST` 请求路由到微服务之后执行
- `ERROR` 在其他过滤器发生错误时执行，可以做全局异常处理

我们也可以通过扩展`ZuulFilter`抽象类，来自定义过滤器

```java
@Component
@Slf4j
public class CustomizeZuulFilter extends ZuulFilter {
    //返回过滤器的类型(pre、route、post、error)
    @Override
    public String filterType() {
        return FilterConstants.PRE_TYPE;
    }

    //指定过滤器的执行顺序
    @Override
    public int filterOrder() {
        return 1;
    }

    //该过滤器是否要执行，true表示执行, false表示不执行
    @Override
    public boolean shouldFilter() {
        return true;
    }

    //过滤器的具体逻辑
    @Override
    public Object run() throws ZuulException {
        log.info("过滤请求...");
        return null;
    }
}
```



### 实战演练

1.准备`eureka`服务，用于服务注册管理；

2.搭建两台业务服务，实例名称分别为`producer-service`、`consumer-service`，并且注册到`eureka`；

`producer-service`、`consumer-service`分别提供接口

```java
@Controller
@RequestMapping("/orderService/service")
public class ProduceController {
    @ResponseBody
    @RequestMapping("/get")
    public String get(){
        return "producer info";
    }
}

```

```java
@RequestMapping("/orderService/service")
public class ConsumeController {
    @ResponseBody
    @RequestMapping("/get")
    public String get(){
        return "consumer info";
    }
}

```

3.搭建网关服务

（1）引入依赖

```xml
<!-- 微服务组件-网关 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-zuul</artifactId>
    <version>${spring.cloud.netflix.version}</version>
</dependency>
```

（2）配置

服务自身配置、注册`eureka`、路由配置

```properties
server.port=8090
spring.application.name=gateway
eureka.client.enabled=true

#eureka-config
spring.security.user.name=admin
spring.security.user.password=123456
eureka.client.service-url.defaultZone=http://admin:123456@127.0.0.1:10001/eureka
eureka.client.fetch-registry=true

#路由配置
zuul.routes.producer-service.path=/producerService/**
zuul.routes.consumer-service.path=/consumerService/**
```

（3）启动类

使用`@EnableZuulProxy`注解，启用网关功能

```java
@EnableZuulProxy
@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

}
```

4.访问测试

浏览器请求：`http://localhost:8090/producerService/orderService/service/get`，返回结果：

![image-20221102101311374](image/zuul1.png)

浏览器请求：`http://localhost:8090/consumerService/orderService/service/get`，返回结果：

![image-20221102101642938](image/zuul2.png)

`/producerService/**`的请求路由到了`producer-service`服务；

`/consumerService/**`的请求路由到了`consumer-service`服务；

如果我们自定义了过滤器，与此同时，控制台会打印过滤器的日志信息；

```tex
2022-11-02 11:14:57.532  INFO 58616 --- [nio-8090-exec-1] c.e.gateway.config.CustomizeZuulFilter   : 过滤请求...
```



### 总结

本节主要讲述了微服务网关组件`zuul`的相关概念，包括`zuul`的路由和过滤功能，结合代码演练学习`zuul`在微服务项目中如何使用。