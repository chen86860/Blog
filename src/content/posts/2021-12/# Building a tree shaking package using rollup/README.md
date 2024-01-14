# rollup-esm-template

Building a tree shaking package using rollup.

## Requirements

1. Set a `slideEffect: false` flag in `package.json`

```json
    "sideEffects": false,
```

2. Make all export to input
3. Setting output to `esm`

```js
export default {
  input: ["src/*.ts"],
  output: {
    dir: pkg.module,
    format: "esm",
  },
  plugins: [commonjs(), typescript(), resolve(), multiInput()],
};
```

4. Build it!

## Usage

```js
import { foo } from "@chen86860/rollup-esm-template";

foo();
```

For that, the `bar` function in `@chen86860/rollup-esm-template` will not build into bundle by tree shaking.

---

Related repository: [rollup-esm-template](https://github.com/chen86860/rollup-esm-template/edit/main/README.md)
