```py
class MyClass:
  __slots__ = ('only_key',)

  @property
  def name(self):
    return self.name

  @name.setter
  def name(self, name):
    self.name = name
```