# 引入hooks的动机是什么？
+ 逻辑复用：HOC会导致嵌套地狱问题、namesapce问题，render props同样存在
+ 副作用相关逻辑，有时候写多次（比如fetch data在CDM、CDU），这有可能会造成数据的不一致性
+ 因为生命周期的关系，很多不相关的副作用代码都聚合在一起,难以维护
+ class的一些问题：
  + 打包生成handler函数，体积比较大
  + 不易于tree-shaking

#  