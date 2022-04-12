# SpringBoot

## springboot自动装配原理

启动类注解：**@SpringbootApplication**，进去看会发现，它是由多个注解组成，里面包括：

@ComponentScan

@SpringbootConfiguration，里面包含了@Configuration注解，代表自己是一个Spring的配置类。

**@EnableAutoConfiguration**，关键的注解，顾名思义，允许自动配置，里面包括：

​	@AutoConfigurationPackage - 自动配置包

​	**@Import(AutoConfigurationImportSelector.class)** ，帮我们导入了`AutoConfigurationImportSelector`类

​		org.springframework.boot.autoconfigure.AutoConfigurationImportSelector#**selectImports#getCandidateConfigurations**

​		这个方法可以帮我们获取自动配置的所有类名，该方法会先去加载META_INF下面的spring.factories文件 (META-INF/spring.factories)

​		该文件下定义了一堆需要自动配置的类信息，springboot找到这些配置类的位置，去加载这些类，这些配置类可以完成以前需要手动配置的东西。

**结论：**springboot所有的自动配置类都是在启动的时候进行扫描并加载的，通过spring.factories可以找到自动配置类所在的路径，但不是所有存在于spring.factories的配置类都需要去加载，而是通过@ConditionalOnClass注解进行判断条件是否成立，条件成立才去加载配置类

- SpringBoot在启动的时候从类路径下的META-INF/spring.factories中获取EnableAutoConfiguration指定的值
- 将这些值作为自动配置类导入容器 ， 自动配置类就生效 ， 帮我们进行自动配置工作；
- 以前我们需要自己配置的东西 ， 自动配置类都帮我们解决了
- 整个J2EE的整体解决方案和自动配置都在springboot-autoconfigure的jar包中；
- 它将所有需要导入的组件以全类名的方式返回 ， 这些组件就会被添加到容器中 ；
- 它会给容器中导入非常多的自动配置类 （xxxAutoConfiguration）, 就是给容器中导入这个场景需要的所有组件 ， 并配置好这些组件 ；
- 有了自动配置类 ， 免去了我们手动编写配置注入功能组件等的工作；