## nginx

高性能HTTP和反向代理服务器。（因为高效的网路io模型）

why：（1）支持高并发连接（5万并发）（2）内存消耗少（3）开源（4）使用上，配置简单，支持热部署（5）稳定性高，宕机概率很低

## 具体使用：

配置：主配置文件 `nginx.conf`

反向代理配置：

```conf
//设置服务名称，可以proxy_pass指令中使用的代理服务器，默认的负载均衡是轮询
upstream "servername" {
	server "ip:port weight= max_fails= fail_timeout=";
	server "ip:port weight= max_fails= fail_timeout=";
	server "ip:port weight= max_fails= fail_timeout=";
	......
}

upstream "servername" {
	ip_hash;
	server "ip:port";
	server "ip:port";
	server "ip:port down";
	......
}

server {
	listen "port";
	server_name "server_name";
	
	location /
	{
		proxy_pass http://"servername"；
		proxy_set_header Host "server_name"
	}
}
```

