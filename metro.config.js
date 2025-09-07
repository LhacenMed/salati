// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require("nativewind/metro");
// // const { withExpo } = require("@expo/config");

// const config = getDefaultConfig(__dirname);
// config.resolver.sourceExts.push("cjs");
// config.resolver.unstable_enablePackageExports = false;

// module.exports = withNativeWind(config, { input: "./global.css" });

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add SVG transformer
const { transformer, resolver } = config;

config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
};

module.exports = withNativeWind(config, { input: "./global.css" });