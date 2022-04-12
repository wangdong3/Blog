

## 安全性

1.使用HTTPS协议，服务端配置SSL证书

2.生成APPId：应用唯一标识，APPkey：公钥，APPsecret：私钥，第三方接入认证的参数

3.生成签名：md5(appkey,appsecret,timestamp,requestdata)

4.post请求：

基于Apache cxf框架实现rest接口

```
@POST
@Path("xxxurlname/{appid}/{timestamp}/{digest}/{msgid}
```

5.校验

APPId校验（从Redis里获取）

Md5.encode(appkey,appsecret,timestamp,requestdata)，计算签名，与客户端传进来的进行对比

## 幂等性

全局唯一id

记录调用次数，存Redis

## 数据规范

1.版本控制：`https://ip:port//v1/xxx`

2.响应状态码

3.统一响应数据格式