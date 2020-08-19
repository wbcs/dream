# 修改record
```sql
UPDATE `table_name`
SET column1=value1,column2=value2,...
WHERE some_column=some_value;
```

# table 本身
## column
新增：
```sql
ALTER TABLE `table_name`
ADD `column_name` VARCHAR(10) NOT NULL DEFAULT '' COMMENT ''
[, ADD `column_name` VARCHAR(10) NOT NULL DEFAULT '' COMMENT '']
[AFTER `other_column`];
```

修改：
```sql
ALTER TABLE `table` MODIFY `column` int NOT NULL DEFAULT '0' COMMENT '';
```

# 记录
+ 添加一条记录：
```sql
INSERT INTO `table_name` (column, ...) VALUES (val, ...);
```
