

树形结构结果查询：比如我的表有个parent_id和name字段，我想找当前table中各个字段的parent_id对应的name：
```sql
select a.id, a.name, b.name as parent_name
from `table_name` as a
inner join `table_name` as b
on a.parent_id=b.id
where xxxx;
```

