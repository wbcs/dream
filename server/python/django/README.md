# url
## ROOT_URLCONF
配置 URL 的模块：
```py
import os
# 默认是 yourproject.urls
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your.path.module')
```
在 `your.path.module` 中的 `ROOT_URLCONF` 的值就是 `URL` 映射表所在模块。

## url 到 view 的映射:
```py
# py3
from django.http import HttpResponse
from django.urls import path

class View:
  @staticmethod
  def home(req):
    return HttpResponse('home')
  @staticmethod
  def article(req, id):
    print('article id is:' + str(id))
    return HttpResponse('article' + str(id))

urlpatterns = [
  path('', View.home),
  path('article/<int:id>/', View.article)
]
```

比如： `/article/1234` 就会被第二个router捕获，然后 django 会调用： `View.article(req, id = 1234)`

上使用了 int 的路径转换器，还有 [这些](https://docs.djangoproject.com/zh-hans/3.0/topics/http/urls/#path-converters)

+ 正则匹配：
```py
from django.conf.urls import (
  HttpResponse,
  url
)
# 这样就能匹配 /prefix/十个小写字母/
urlpatterns = [
  url(r'prefix/(?P<hehe>[a-z]{10})')
]
```

+ include:
```py
path('fuck/', include([
  url(r'(?P<some>.*)/', you)
]))
```

# 包管理
和npm类似的，py的包管理是pip
```sh
requirements.txt <-> package.json
pip install -r requirements.txt <-> npm install
npm init <-> jango-admin startproject projectname
```

# 一些命令
```sh
django-admin startproject project_name
python manage.py runserver [ip:port]
# 创建migration相关文件
python manage.py makemigrations polls
# 根据model生成对应的sql
python manage.py sqlmigrate polls 0001
# 执行迁移工作，根据migration激活
python manage.py migrate
```

使用定义好的models：
```sh
# 不直接使用python，是因为这样可以根据manage.py中的setting文件
# 根据设置的各种环境变量来引入对应的包，就不是直接全局的了
python manage.py shell
```
比如现在定义了一个model：
```py
from django.db import models

class Fuck(models.Model):
  shit = models.CharFields(max_length=100)
```

```py
obj = Fuck(shit='fuck you mother, bitch')
Fuck.objects.all()
obj.id # 主键
obj.shit = 'fuck you again'
obj.save()
```
