django 的 ORM 是惰性的。在以下情况会去链接DB，执行SQL查询：
1. iterate：在遍历/迭代 queryset 的时候
2. step slicing：对 queryset 进行切片的时候。`queryset[0:5:5]` 简单理解就是使用 step 的切片 的时候会 evaluate
3. Pickling/Caching
4. repr/str
5. len(queryset)：会查询出 queryset 然后在 python 层面去遍历对象返回长度
6. list(queryset)：将 queryset 转换为 list 的时候
7. bool(queryset)：至少有一个结果为 True

> 以上的情况下，会进行 SQL 查询，并生成 cache（生成之后后续的操作就不会hit DB了）。除此之外的所有对queryset的操作全部都会造成对DB的queries。比如：
  + queryset[index]/queryset[:index]: 相当于 SQL 中的 `limit/offset`
  + queryset.exists()
  + queryset.iterator()
  + values()/value_list()

具体优化策略：
+ 只使用一次的queryset直接调用iterator()不生成cache
+ bulk insert、delete、update
+ len(queryset) => queryset.count()
+ `if queryset` => `if queryset.exists()`
+ 查询一条数据时，使用带 index 的字段去检索
+ 其他减少 hit DB：
  + 利用ORM lazy特性
  + filter/exclude/F/values/value_list/annotate/aggregate/select_related/prefetch_related


# advance
Models:
```py
from django.db import models

class City(models.Model):
    name = models.CharField(max_length=100)

class Author(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    city = models.ForeignKey(City)  # 城市

class Publisher(models.Model):
    name = models.CharField(max_length=300)

class Book(models.Model):
    name = models.CharField(max_length=300)
    pages = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    author = models.ForeignKey(Author)
    publisher = models.ForeignKey(Publisher, on_delete=models.CASCADE)

class Store(models.Model):
    name = models.CharField(max_length=300)
    book = models.ManyToManyField(Book)
    
```
> city必须在SQL层面是author的foreign key，其他一样
```sql
ALTER TABLE `author` 
ADD FOREIGN KEY (city_id)
REFERENCES city(id);
```

select_related:
```py
Book.objects.all().select_related('author')
```
相当于：
```sql
SELECT book.name, ..., book.publisher, author.name, author.age, author.city
FROM book INNER JOIN author
ON (book.author_id=author.id);
```
如果要在 python 的层面拿到每个 book 的 author 信息，需要遍历 book，然后根据 author_id 再去 从 author 里查。



prefetch_related:
```py

store_queryset = Store.objects.all().prefetch_related('books')
for s in store_queryset:
    # 在此之前，prefetch_related就已经通过store所有的id，直接用 in (ids) 拿到了所有的books
    # 然后在python层面做一下filter即可
    print(s.books.all())

store_queryset = Store.objects.all()
for s in store_queryset:
    # 每次都是实时查询
    print(s.books.all())
```
prefetch_related 做了两次 query:
1. 查到所有的 store
2. 查到所有 store 对应的 books

正常的操作则是做了 `n + 1` 次的 query：
1. 查到所有 store
2. 根据当前的 store.id 查到对应的所有 books <br />
...n次
