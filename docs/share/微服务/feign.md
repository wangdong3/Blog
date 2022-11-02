## 微服务组件之Feign

`Feign`是一种声明式服务调用组件，它在`RestTemplate`的基础上做了进一步的封装。通过`Feign`，我们只需声明一个接口，并通过注解进行简单的配置，即可实现对`HTTP`接口的绑定。

`Feign `对` Ribbon`进行了集成，通过 `Ribbon` 实现了客户端的负载均衡调用。



## OpenFeign

`OpenFeign` 是 `Spring Cloud `对 `Feign` 的二次封装，它具有 `Feign `的所有功能，并在` Feign `的基础上增加了对 `Spring MVC` 注解的支持。

### 核心注解

`@FeignClient `该注解用于通知 `OpenFeign` 组件对 `@RequestMapping` 注解下的接口进行解析，并通过动态代理的方式产生实现类，实现负载均衡和服务调用。

`@EnableFeignClients`该注解用于开启 `OpenFeign `功能，当 `Spring Cloud` 应用启动时，`OpenFeign` 会扫描标有 `@FeignClient `注解的接口，生成代理并注册到 `Spring` 容器中。



### OpenFeign远程服务调用示例

#### 搭建producer服务（被调用方）

1.创建一个`springboot`应用

（1）`pom`文件添加相关依赖

```xml
<!-- 微服务组件-eureka client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    <version>${spring.cloud.netflix.version}</version>
</dependency>
<!-- 微服务组件-ribbon -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
    <version>${spring.cloud.netflix.version}</version>
</dependency>
<!-- 微服务组件-feign -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
    <version>${spring.cloud.netflix.version}</version>
</dependency>
```

（2）配置

```properties
server.port=8091
spring.application.name=producer-service

#可以注册到eureka服务注册中心
eureka.client.enabled=true
eureka.client.service-url.defaultZone=http://admin:123456@127.0.0.1:10001/eureka
```

（3）启动类

```java
@EnableEurekaClient
@SpringBootApplication
public class ProducerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProducerApplication.class, args);
    }

}
```

（4）接口

```java
@Controller
@RequestMapping("/orderService/service")
public class UserController {

    @ResponseBody
    @RequestMapping("/get")
    public String get(){
        return "producer info";
    }
}
```

#### 搭建consumer服务（调用方）

1.创建一个`springboot`应用

（1）`pom`文件添加依赖

```xml
<!-- 微服务组件-eureka client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    <version>${spring.cloud.netflix.version}</version>
</dependency>
<!-- 微服务组件-ribbon -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
    <version>${spring.cloud.netflix.version}</version>
</dependency>
<!-- 微服务组件-feign -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
    <version>${spring.cloud.netflix.version}</version>
</dependency>
```

（2）配置

```properties
server.port=8092
spring.application.name=consumer-service
#可以注册到eureka服务注册中心
eureka.client.enabled=true

spring.security.user.name=admin
spring.security.user.password=123456
eureka.client.service-url.defaultZone=http://admin:123456@127.0.0.1:10001/eureka

#服务消费者客户端需要去检索服务
eureka.client.fetch-registry=true
```

（3）启动类

启动类上添加`@EnableFeignClients`注解开启 `OpenFeign `功能

```java
@EnableFeignClients
@SpringBootApplication
public class ConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConsumerApplication.class, args);
    }

}
```

（4）创建一个接口，使用注解`@FeignClient`，实现对服务接口的绑定，value属性值即为服务提供者的实例名称

```java
@Component
@FeignClient(value = "producer-service")
public interface FeignService {

    //value值即为producer服务的接口地址
    @RequestMapping(value = "orderService/service/get", method = RequestMethod.GET)
    String get();
}
```

（5）`controller`入口

```java
@Controller
@RequestMapping("/orderService/service")
public class UserController {

    @Autowired
    FeignService feignService;

    @ResponseBody
    @RequestMapping("/get")
    public String get(){
        return feignService.get();
    }
}
```

#### 服务启动

依次启动`eureka server`、`producer服务`、`consumer服务`

#### 接口调用测试

浏览器访问`http://localhost:8092/orderService/service/get`请求接口，返回结果如下：

![image-20221101141901165](image/feign1.png)



### OpenFeign超时控制

1.`producer`提供一个超时接口

```java
@ResponseBody
@RequestMapping("/getTimeOut")
public String getTimeOut(){
    try {
        TimeUnit.SECONDS.sleep(5);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    
    return "producer info";
}
```

2.`consumer`接口调用`producer`的超时接口

```java
@ResponseBody
@RequestMapping("/getTimeOut")
public String getTimeOut(){
    return feignService.getTimeOut();
}
```

尝试请求`http://localhost:8092/orderService/service/getTimeOut`接口，结果：

![image-20221101140538485](image/feign2.png)

`OpenFeign`客户端默认等待一秒钟，超时就会报错。

3.修改`consumer`的配置

```properties
feign.client.config.producer-service.connect-timeout=6000
feign.client.config.producer-service.read-timeout=6000
```

4.重启`consumer`

尝试请求`http://localhost:8092/orderService/service/getTimeOut`接口，返回结果如下：

![image-20221101141717957](image/feign3.png)



### OpenFeign日志增强

1.开启日志相关配置

`Feign `为每一个 `FeignClient` 都提供了一个 `feign.Logger `实例，通过它可以对 `OpenFeign` 服务绑定接口的调用情况进行监控。

```properties

# com.example.consumer.service.FeignService 即为开启@FeignClient 注解的接口的全类名
# debug：表示监听该接口的日志级别
logging.level.com.example.consumer.service.FeignService=debug
```

2.创建一个配置类

```java
@Configuration
public class ConfigOpenFeignLog {
    /**
     * OpenFeign 日志增强
     * 配置 OpenFeign 记录哪些内容
     */
    @Bean
    Logger.Level feginLoggerLevel() {
        //Logger.Level.FULL: 记录所有请求与响应的明细，包括头信息、请求体、元数据等等
        return Logger.Level.FULL;
    }
}
```

访问接口`http://localhost:8092/orderService/service/get`，查看控制台打印日志

```tex
2022-11-01 14:31:53.134 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] ---> GET http://producer-service/orderService/service/get HTTP/1.1
2022-11-01 14:31:53.135 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] ---> END HTTP (0-byte body)
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] <--- HTTP/1.1 200 (2ms)
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] cache-control: no-cache, no-store, max-age=0, must-revalidate
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] content-length: 13
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] content-type: text/plain;charset=UTF-8
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] date: Tue, 01 Nov 2022 06:31:53 GMT
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] expires: 0
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] pragma: no-cache
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] x-content-type-options: nosniff
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] x-frame-options: DENY
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] x-xss-protection: 1; mode=block
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] 
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] producer info
2022-11-01 14:31:53.138 DEBUG 62672 --- [nio-8092-exec-1] c.example.consumer.service.FeignService  : [FeignService#get] <--- END HTTP (13-byte body)

```

控制台打印了该接口请求与响应的所有明细



### 总结

本节内容主要记录了声明式的服务调用组件，`OpenFeign`如何进行远程服务调用，以及对调用服务接口的超时控制相关的配置，还有接口调用过程的日志增强...