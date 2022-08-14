树形结构结果查询：比如我的表有个 parent_id 和 name 字段，我想找当前 table 中各个字段的 parent_id 对应的 name：

```sql
select a.id, a.name, b.name as parent_name
from `table_name` as a
inner join `table_name` as b
on a.parent_id=b.id
where xxxx;
```
