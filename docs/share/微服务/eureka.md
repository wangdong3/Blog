## Eureka服务注册中心

`Eureka` 是 微服务组件之一，在微服务架构里面，作为服务注册中心，负责服务的注册与发现。

`Eureka`采用`CS`架构，包括两部分：`server`和`client`；

`server`就是真正意义上的服务注册中心，提供注册和发现功能；`client`即所有微服务实例，`client`在启动之后会将自身信息注册到`eureka server`；

### server

服务端项目搭建

1.创建`springboot`工程

（1）`pom`文件

引入`Eureka`依赖包

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        <version>2.2.4.RELEASE</version>
    </dependency>
</dependencies>
```

（2）启动类配置

```java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class, ElasticSearchRestHealthIndicatorAutoConfiguration.class})
@EnableEurekaServer
public class EurekaApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaApplication.class, args);
    }

    @EnableWebSecurity
    static class WebSecurityConfig extends WebSecurityConfigurerAdapter {
        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http.csrf().ignoringAntMatchers("/eureka/**");
            super.configure(http);
        }
    }
}
```

`@EnableEurekaServer`启动类上加该注解，标明当前服务作为`eureka server`，其他微服务启动时可将服务注册到该注册中心服务。

（3）配置文件

```properties
#实例名称
spring.application.name=eurekaserver
#端口
server.port=10001

spring.security.user.name=admin
spring.security.user.password=123456

#eureka相关配置
eureka.instance.hostname=127.0.0.1
eureka.instance.instance-id=${eureka.instance.hostname}:${server.port}
eureka.instance.prefer-ip-address=true

#是否向注册中心注册自己
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.client.service-url.defaultZone=http://admin:123456@${eureka.instance.hostname}:${server.port}/eureka/

```

启动`eureka`服务端项目，访问注册中心管理界面

![image-20221031155601651](image/eureka1.png)

### client

客户端项目搭建

1.创建普通`springboot`项目

（1）pom文件

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>

    <!-- 微服务组件-eureka client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        <version>2.2.4.RELEASE</version>
    </dependency>
</dependencies>
```

（2）启动类

```java
@EnableEurekaClient
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class, ElasticSearchRestHealthIndicatorAutoConfiguration.class})
public class ProducerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProducerApplication.class, args);
    }

}
```

使用` @EnableEurekaClient` 注解，对该微服务进行服务注册

（3）配置文件

```properties
server.port=8091
spring.application.name=producer-service

#可以注册到eureka服务注册中心
eureka.client.enabled=true

#eureka-config
eureka.client.service-url.defaultZone=http://admin:123456@127.0.0.1:10001/eureka
```

2.启动`eureka`客户端项目

3.访问`eureka`服务

![image-20221031160238955](image/eureka2.png)

红框圈起来的即是成功注册到`eureka`的客户端服务。

### 总结

本文主要讲述`eureka`服务注册中心，`CS`架构的模式，并通过代码示例演示其在微服务架构中是如何进行工作的。

