module.exports = {
  env: { browser: true, es2021: true },
  extends: ["airbnb", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
};
