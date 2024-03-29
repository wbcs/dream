# 调度算法的演进

`Fiber`架构使用了`expirationTime`作为任务优先级的判断标志，越小优先级越高（根据`expirationTime - 当前时间`来判断）。

它需要让高优先级的任务先执行，采用的办法是根据代码的执行顺序往更新队列 push 任务，也就是说这个更新队列只是一个普通的队列。

在更新的过程中判断优先级，跳过优先级不高的任务，仅仅执行高优先级任务。但是这么做就会导致`state`的不一致。所以如果在某个任务前面还有未被执行的任务，即使当前任务被执行，也不会被 T 出队列。

等到高优先级任务执行完毕，找到更新队列中第一个还未执行的任务，以它的`state`作为`baseState`，然后依次合并`state`就可以保证`state`的一致性了。

> 所以有的任务会被执行多次，
