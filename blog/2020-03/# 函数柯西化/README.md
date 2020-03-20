# 函数柯里化

## 什么是函数柯里化(curry)

简单例子， 给定一个基本函数

```js
const add = (x, y) => x + y;
```

如何实现 add(1)(2)(3)?

```js
const add = x => y => z => x + y + z;
```

## 函数柯里化实现
