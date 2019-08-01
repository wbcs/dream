# shouldComponentUpdate
这个生命周期钩子函数默认return true，也就是会更新的意思。

这里会不会更新指的是会不会执行render函数，如果return false  则可以不执行render使用之前的elements。否则会执行render得到新的elements，然后进行diff找出不同更新DOM。

# pureComponent
pureComponent默认会对组件的state、props进行一次shallow diff，如果和上一次完全相同，则在SCU中return false。以达到提升效率的目的。

但是这东西不能到处使用。

原因在于，如果在render中有内敛函数、对象的引用和之前不同等等，那么每次的shallow diff就没有意义了，因为一定会不同，一定会return true。就算是shallow diff也是有性能的消耗的。所以无脑的使用它有的时候反而会增加负担。