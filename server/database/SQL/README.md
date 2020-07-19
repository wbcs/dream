# column
新增：
```sql
-- 在 some_column 后 添加一列 column_name，类型是 int
ALTER TABLE `table_name` ADD COLUMN `cloumn_name` int NOT NULL DEFAULT '0' COMMENT '' AFTER `some_column`;
```

修改：
```sql
ALTER TABLE `table` MODIFY `column` int NOT NULL DEFAULT '0' COMMENT '';
```
