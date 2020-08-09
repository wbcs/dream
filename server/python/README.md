# hello world
```py
# app.py
def application(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/html')])
    body = '<h1>Hello World!</h1>'
    return [body.encode('utf-8')]
# server.py
from wsgiref.simple_server import make_server
from app import application

server = make_server(ip, port, application)
print('Your app is running on %s', port)
server.serve_forever()
```
> 一个使用 python 写的原生web server就OK了。再复杂的框架的入口都是这样子的，无非是对http body 的解析，对DB的CRUD等等做了一些抽象、封装提高开发效率罢了。

# 语法tips
+ package: 可以理解成是一个文件夹，文件夹下要有一个 `__init__.py` 文件来表示当前目录是一个py的包
+ 垃圾回收机制采用引用计数：因为存在循环引用的情况，所以还配合**循环垃圾收集器**共同处理内存的回收。

## string
py3中的string默认是使用Unicode编码，所以一个字符对应的是多个byte。计算机在处理字符的时候，在内存里都会把字符转换成Unicode。

# tips

+ 日期转换：
```py
from datetime import datetime
# str parse to time
date_str = '2020 08/04 11:04:45'
format_str = '%Y %m/%d %H:%M:%S'
date_time = datetime.strptime(date_str, format_str)

# time format to str

```
> datetime 可以直接进行比较，加减运算

+ 日期偏移：
```py
from datetime import timedelta

forward_days = 3
delta = timedelta(days=forward_days)
forward_days_later = datetime.now() + delta

# 还支持这些：
class timedalta:
    def __init__(self, days: float = ..., seconds: float = ..., microseconds: float = ...,
                milliseconds: float = ..., minutes: float = ..., hours: float = ...,
                weeks: float = ...) -> None: ...
```

+ 时间戳

```py
import time
from datetime import datetime
dt = datetime(year, month, day)
# 对于python3：
timestamp = dt.timestamp()

# 对于python2：
date_time = datetime(year, month, day)
timestamp = time.mktime(date_time.timetuple())

# 转回去
datetime.fromtimestamp(timestamp)
```