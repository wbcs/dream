# 分组查询

- `SELECT * FROM table_name;`:

```
+-----+---------+-------+------------+
| id  | site_id | count | date       |
+-----+---------+-------+------------+
|   1 |       1 |    45 | 2016-05-10 |
|   2 |       3 |   100 | 2016-05-13 |
|   3 |       1 |   230 | 2016-05-14 |
|   4 |       2 |    10 | 2016-05-14 |
|   5 |       5 |   205 | 2016-05-14 |
|   6 |       4 |    13 | 2016-05-15 |
|   7 |       3 |   220 | 2016-05-15 |
|   8 |       5 |   545 | 2016-05-16 |
|   9 |       3 |   201 | 2016-05-17 |
+-----+---------+-------+------------+
```

我想要查找各个 site_id 对应的总 count：

```sql
SELECT site_id, SUM(count) AS sums
FROM `table_name` GROUP BY site_id;
```

对应到 python 的 orm：

```py
from django.db.models import Count

Model.objects.filter(**filters).annotate(sums=Count('count')).values('site_id', 'count')
```
