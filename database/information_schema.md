# MYSQL的infomation_schema
`information_schema` 这这个数据库中保存了 `MySQL` 服务器所有数据库的信息。
如数据库名，数据库的表，表栏的数据类型与访问权限等。
再简单点，这台 `MySQL` 服务器上，到底有哪些数据库、各个数据库有哪些表，
每张表的字段类型是什么，各个数据库要什么权限才能访问，等等信息都保存在 `information_schema` 里面。

+ schemata中的列schema_name记录了所有数据库的名字
+ tables中的列table_schema记录了所有数据库的名字
+ tables中的列table_name记录了所有数据库的表的名字
+ columns中的列table_schema记录了所有数据库的名字
+ columns中的列table_name记录了所有数据库的表的名字
+ columns中的列column_name记录了所有数据库的表的列的名字


比如说要删除某个DB中所有的table，那自动生成SQL就是：
```sql
select concat('DROP TABLE IF EXISTS ', table_name, ';')
from information_schema.tables
where table_schema = 'your_db_name';
SET FOREIGN_KEY_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 1;
```

