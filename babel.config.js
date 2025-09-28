// module.exports = function(api) {
//     api.cache(true);
//     return {
//         presets: [
//             ["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"
//         ],
//         plugins: [
//             [
//                 "module:react-native-dotenv",
//                 {
//                     moduleName: "@env",
//                     path: ".env",
//                     blacklist: null,
//                     whitelist: null,
//                     safe: false,
//                     allowUndefined: true,
//                 },
//             ],
//         ],
//     };
// };


module.exports = function(api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"
        ],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@": "./",
                        "@components": "./components",
                        "@app": "./app",
                        "@context": "./context",
                        "@utils": "./utils",
                        "@assets": "./assets",
                        "@firebase": "./firebase",
                        "@translations": "./translations",
                    },
                },
            ],
        ],
    };
};