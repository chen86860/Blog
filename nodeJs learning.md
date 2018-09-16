# 视图和静态文件

##### Express 是靠中间件来处理静态文件和试图。它是一种模块化的手段，使得请求的处理更加容易

##### static 中间件可以将一个或多个目录指派为包含静态资源的目录，其中静态资源不经过任何的特殊处理直接发送给客户端

例:

`app.use(express.static(__dirname+'/public'));//路径中没有public,其对客户端是隐藏的`

### npm 包：项目所依赖的 npm 包放在 node_modules 目录下

#####package.json：
１.描述项目和列出依赖项
版本好之前的插入符号（^）：表明在下一个主要版本之前都可以使用。如"express"：^4.0.0,表明在版本 4.0.0~4.9.9 之前都可以使用
２.存放项目的元数据
项目名称，作者，授权信息

## Node 模块

### 提供模块化的封装的机制

#### 创建自己的模块

```javascript
/**
 * Created by jack on 7/28/16.
 */
var fortuneCookie = [
  'Conquer your fear or they will conquer you',
  'Reiver need springs',
  "Do not fear what you don't konw.",
  'You will have a pleasant superise',
  'whenever possible,keep it simple',
]
//使得全局变量可见。必须加到exports上
exports.getFortune = function() {
  var idx = Math.floor(random() * fortuneCookie.length)
  return fortuneCookie[idx]
}
```

# 质量保证

Grunt 自动化测试

## 请求和响应对象

HTTP 请求方法集合（HTTP verbs），POST 和 GET 最为常见

## 请求报头

```
//get usragent
router.get('/about/useragent', function (req, res, next) {
    // res.set('Content-Type', 'text.plain');
    var s = '';
    for (var name in req.headers)s += name + ':' + req.headers[name] + '\n';
    res.render('userAgent', {title: "useragent", content: s})
});
```

## 响应报头

```
//禁用ｘ-power-by 头部信息
app.disable('x-powered-by)
```

## 请求对象　 request

- req.params
  一个数组，包含命名过的路由器参数。
- req.params(name)
  返回命名的路由参数，或者 GET、POST 请求参数
- req.query
  一个对象，包含以键值对存放的查询字符串参数
- req,body
  一个对象，包含 POST 请求参数。可以使用 body-parse 中间元获取内容
- req,route
  当前匹配的路由信息，主要用于路由调试
- req,cookie/req,singnedCookies
  一个对象，包含从客户端传递过来的 cookie
- req.headers
  从客户端传来的请求报头
- req.accepts([types])
  用来确定客户端是否接受一个或一组指定的类型
- req.ip
  客户端的 ip 地址
- req,path
  请求路径
- req.host
  用来返回客户端所报告的主机名。但是客户端可以伪造。
- req,xhr
  一个简单的属性，如果使用 Ajax 发起将会返回 true
- req.protocol
  用户标识请求的协议
- req.secure
  判断链接是否安全。https 协议
- req.url/req.orifinalUrl
  返回路径和查询字符串，不包含协议，主机和端口号。req.originalUrl 可以重写
- req.acceptedLanguages
  返回客户端首选的语言

## 响应对象

#### Node 核心对象 http.ServerResponse 的实例

- res.status(code)
  设置 HTTP 状态码
- res.set(name,value)
  设置响应头部
- res.cookie(name,value,[options]),res,clearCookie(name,[options])
  设置或清除客户端 cookie 值。需要中间元支持
- res,redirect([status,url])
  重定向浏览器，默认 302
- res.send(body),res.send(status,body)
  向客户端发送响应，状态码可选
- res.json(json),res.json(status,json)
  向客户端发送 JSON 及可选状态码
- res.jsonp(json),res.jsonp(status,json)
  向客户端发送 JSON Ｐ及可选状态码
- res,type(type)
  设置 Content-Type 信息
- res.format(object)
  根据接受请求报头发送不同的内容。API 的主要用途。
- res,attachment([filename]),res.download(path,[filename],[callback])
  res.attachment 设置报头。res.download 指定下载内容
- res.sendFile(path,[option],[callback])
  －－－－
- res.links(links)
  设置链接响应报头。
- res.locals,res.render(view,[locals],callback)
  res.locals 是一个对象，包含用于渲染视图的默认上下文。res.render 使用配置的模板引擎渲染视图。

# 内容小结

###　内容渲染

```
    //基本用法
    ａpp.get('/about',function(req,res){
            res,render('about');
    })'

    //200以外的响应代码
     app.get('/error',function(req.res){
        res.status(500);
        res.render('error');
     });

     //将上下文传递给视图，包括查询字符串。cookie和session值
      app.get('/greeting',function(req.res){
        res,render('about',{
            message:'welcome',
            style:req,query.style,
            userid:req.cookie.userid,
            username:req.session.username,
        });
      });

      //渲染存文本输出
        app.get('/test',function(req.res){
        res.type('text/plain');
        res.send('this is a test');
            });

      //添加错误处理程序
        //所有路由的方法结尾
        app.use(function(err,req.res,next){
            console.error(err,stack);
            res,status(500),render('error');
        });

        //404
        //app.use(function(req,res){
            res.status(404),render('non founf');
        })


        //处理表单
        //基本表单处理
        //必须引入中间件body-parser
        app.post('/process-contact'.function(req,res){
            console.log('Recived contact from'+req.body,name+'<'+req.body.email+'>');
            //
            res.redirect(303,'thanks');
        });

        //更强大的表单处理
        app.post('process-contact',function(req.res){
            console.log('Recived contact from'+req.body,name+'<'+req.body.email+'>');
            try{
                //save to databse;

                return res.xht ? res.render({success:true}):res.redirect(303,'thanks you');
                }
                catch(ex)｛
                    return res.xhr?
                    res.json({error:'Databases error'});
                    res.redirect(303,'database error');
                ｝;
        });


```

#Express 表单处理
引入中间元 body-paeser 来解析 URL 编码。
  
-布尔值，0，空字符串，，NaN,null,undifined 都等价于 false -其他值都等价于 true
