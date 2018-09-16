module.exports = {
  "extends": ["standard", "react-app"],
  "rules": {
    "comma-dangle": 0,
    "space-before-function-paren": 0,
    "jsx-a11y/href-no-hash": "off",
    "jsx-a11y/anchor-is-valid": ["warn", { "aspects": ["invalidHref"] }]
  }
}