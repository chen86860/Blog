# ECMAScript 提案使用小记

> Any application that can be written in JavaScript, will eventually be written in JavaScript. — Atwood's Law

### 2019-07-27 更新:

optional chaining 和 nullish coalescing 提案已进入 Stage 3 阶段 ，并且TypeScript 3.7 将支持optional chaining 语法（https://github.com/microsoft/TypeScript/issues/16）。

此外，文中的『可选属性』或『可选函数』命名方式不准确，翻译成“可选链”或者根据贺老的说法 nullish-aware property access / call 来翻译更为合适些。

以下为原文：

---

## 1. optional chaining

前端一个常见的编程模式是使用短路检查来获取具有 tree 结构的值/方法。例如：

```javascript
// 获取 list 对象
res && res.data && res.data.list
// 调用 sendBeacon 方法
navigator.sendBeacon && navigator.sendBeacon('/log', analyticsData())
```

为了处理 deep tree 结构，我们不得不通过逐层去判断，在代码简洁性和编程模式上大打折扣，做了太多 Repeat 的工作，所以就有了 optional chaining 这个提案，但在其他语言不是个新东西，类似[Swift](https://docs.swift.org/swift-book/LanguageGuide/OptionalChaining.html)、[C#](https://msdn.microsoft.com/en-us/library/dn986595.aspx)已实现类似的功能了。

### 语法

```javascript
obj?.prop // 访问静态可选属性 optional static property access
obj?.[expr] // 访问动态可选属性 optional dynamic property access
func?.(...args) // 访问可选函数
```

由此，开始的例子就可以这么写：

```js
// 获取 list 对象
res?.data?.list
// 调用 sendBeacon 方法
navigator?.sendBeacon('/log', analyticsData())
```

目前这个提案位于 Stage 2 阶段，很大概率会纳入正式规范，可以配合 Babel 插件 [@babel/plugin-proposal-optional-chaining](https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining) 进行食用。

具体技术细节请参考 [tc39/proposal-optional-chaining](https://github.com/tc39/proposal-optional-chaining)

## 2. nullish coalescing

另一个常见的编程模式上在获取具有 tree 结构的属性上，使用 `||` 操作符来设定默认值。例如：

```js
const list = res.data.list || []
```

既当 `||` 左边的值为 falsy 时，返回右边的默认值，对于值为 `undefined` 或 `null` 这样 falsy 值是没问题的，但在某些场景下， `0` 、`''` 、 `false` 是程序所期望的 falsy 值，不应该拿到默认值，所以就有了 nullish coalescing 的提案，解决有意义的 falsy 值被忽略的问题。

### 语法

```js
falsyValue ?? 'default value'
```

使用上，只对于 `undefined` 和 `null` 获取默认值：

```javascript
const undefinedValue = response.settings.undefinedValue ?? 'some other default' // result: 'some other default'
const nullValue = response.settings.nullValue ?? 'some other default' // result: 'some other default'
const headerText = response.settings.headerText ?? 'Hello, world!' // result: ''
const animationDuration = response.settings.animationDuration ?? 300 // result: 0
const showSplashScreen = response.settings.showSplashScreen ?? true // result: false
```

这个提案同样位于 Stage 2，可配合 [@babel/plugin-proposal-nullish-coalescing-operator](https://babeljs.io/docs/en/babel-plugin-proposal-nullish-coalescing-operator) 进行食用。

具体技术细节请参考 [[tc39](https://github.com/tc39)/proposal-nullish-coalescing](https://github.com/tc39/proposal-nullish-coalescing)

### 3. pipeline operator

管道操作符在 Unix 操作系统、F#、[julia](https://docs.julialang.org/en/v1/base/base/#Base.:|>), 都有相应的实现，其目标是简化函数调用过程，增加代码的可读性：

#### 语法

```js
someValue |> fn1 [|fn2 |fn2...]
```

例如，想要将字符串复制一次+首字母大写+追加 ！号，我们可以有这几个函数：

```js
function doubleSay(str) {
  return str + ', ' + str
}
function capitalize(str) {
  return str[0].toUpperCase() + str.substring(1)
}
function exclaim(str) {
  return str + '!'
}
```

在这之前，可通过函数嵌套调用：

```js
let result = exclaim(capitalize(doubleSay('hello')))
result //=> "Hello, hello!"
```

而使用了管道操作符：

```js
let result = 'hello' |> doubleSay |> capitalize |> exclaim
result //=> "Hello, hello!"
```

目前这个提案位于 Stage 1 阶段，原因是争议[比较大](https://github.com/tc39/proposal-pipeline-operator/wiki), 食用的话请配合[@babel/plugin-proposal-pipeline-operator](https://babeljs.io/docs/en/babel-plugin-proposal-pipeline-operator)

参考：[tc39/proposal-pipeline-operator](https://github.com/tc39/proposal-pipeline-operator)

## EOF

提案是为了建设功能更日臻完善的 ES 而准备的，具有举足长远的意义，感兴趣的小伙伴可关注官方[**仓库**](https://github.com/tc39/proposals) 追踪最新动态。;)

以上。
