module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    // Including the `@babel/plugin-transform-private-methods` plugin allows tests to pass (and
    // maybe actually needed at runtime, too - idk) as of react-native v0.74. Maybe
    // `metro-react-native-babel-preset` just needs updated to include it?
    ["@babel/plugin-transform-private-methods", { loose: true }],
  ],
};
