(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_components_screens_fe50faa1._.js", {

"[project]/src/components/screens/SettingsPanel.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/components/screens/SettingsPanel.tsx
__turbopack_context__.s({
    "SettingsPanel": (()=>SettingsPanel)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/sheet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/switch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-client] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paintbrush$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Paintbrush$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/paintbrush.js [app-client] (ecmascript) <export default as Paintbrush>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/key-round.js [app-client] (ecmascript) <export default as KeyRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/separator.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/themes.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
function SettingsPanel({ isOpen, onOpenChange }) {
    _s();
    const { state, dispatch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"])();
    const { selectedThemeId, isDarkMode, userGoogleAiApiKey } = state;
    const [apiKeyInput, setApiKeyInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(userGoogleAiApiKey || "");
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SettingsPanel.useEffect": ()=>{
            setApiKeyInput(userGoogleAiApiKey || "");
        }
    }["SettingsPanel.useEffect"], [
        userGoogleAiApiKey
    ]);
    const toggleThemeMode = ()=>{
        dispatch({
            type: 'SET_DARK_MODE',
            payload: !isDarkMode
        });
    };
    const handleThemeChange = (themeId)=>{
        dispatch({
            type: 'SET_THEME_ID',
            payload: themeId
        });
    };
    const handleSaveApiKey = ()=>{
        const trimmedKey = apiKeyInput.trim();
        if (trimmedKey) {
            dispatch({
                type: 'SET_USER_API_KEY',
                payload: trimmedKey
            });
            toast({
                title: "API Key Saved",
                description: "Your Google AI API Key has been saved locally.",
                variant: "default"
            });
        } else {
            dispatch({
                type: 'SET_USER_API_KEY',
                payload: null
            });
            toast({
                title: "API Key Cleared",
                description: "Your Google AI API Key has been cleared.",
                variant: "default"
            });
        }
    };
    const handleClearApiKey = ()=>{
        setApiKeyInput("");
        dispatch({
            type: 'SET_USER_API_KEY',
            payload: null
        });
        toast({
            title: "API Key Cleared",
            description: "Your Google AI API Key has been cleared.",
            variant: "default"
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetContent"], {
        side: "right",
        className: "w-[90vw] sm:w-[400px] flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetHeader"], {
                className: "p-4 border-b",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetTitle"], {
                        className: "flex items-center gap-2 text-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                lineNumber: 70,
                                columnNumber: 21
                            }, this),
                            " Settings"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                        lineNumber: 69,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetDescription"], {
                        children: "Customize your game experience."
                    }, void 0, false, {
                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                        lineNumber: 72,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                lineNumber: 68,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-grow p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                children: [
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-medium border-b pb-1",
                                children: "Appearance"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                lineNumber: 79,
                                columnNumber: 22
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between space-x-2 p-3 border rounded-md bg-muted/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "dark-mode",
                                        className: "flex items-center gap-2 font-medium cursor-pointer",
                                        children: [
                                            isDarkMode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                                lineNumber: 82,
                                                columnNumber: 40
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                                lineNumber: 82,
                                                columnNumber: 71
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: isDarkMode ? "Dark Mode" : "Light Mode"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                                lineNumber: 83,
                                                columnNumber: 26
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 81,
                                        columnNumber: 24
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Switch"], {
                                        id: "dark-mode",
                                        checked: isDarkMode,
                                        onCheckedChange: toggleThemeMode,
                                        "aria-label": `Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 85,
                                        columnNumber: 24
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                lineNumber: 80,
                                columnNumber: 22
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paintbrush$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Paintbrush$3e$__["Paintbrush"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                                lineNumber: 94,
                                                columnNumber: 68
                                            }, this),
                                            " Color Theme"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 94,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            " ",
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["THEMES"].map((theme)=>{
                                                const primaryColor = `hsl(${theme.light['--primary']})`;
                                                const accentColor = `hsl(${theme.light['--accent']})`;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "outline",
                                                    size: "sm",
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("justify-start h-auto py-1.5 px-2 text-xs items-center", selectedThemeId === theme.id && "ring-2 ring-ring ring-offset-2 ring-offset-background"),
                                                    onClick: ()=>handleThemeChange(theme.id),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-4 h-4 rounded-sm mr-2 border shrink-0",
                                                            style: {
                                                                background: `linear-gradient(to bottom right, ${primaryColor} 0%, ${primaryColor} 50%, ${accentColor} 50%, ${accentColor} 100%)`
                                                            },
                                                            "aria-hidden": "true"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                                            lineNumber: 110,
                                                            columnNumber: 38
                                                        }, this),
                                                        theme.name
                                                    ]
                                                }, theme.id, true, {
                                                    fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                                    lineNumber: 100,
                                                    columnNumber: 34
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 95,
                                        columnNumber: 26
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: "Select a visual theme for the interface."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 122,
                                        columnNumber: 26
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                lineNumber: 93,
                                columnNumber: 22
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                        lineNumber: 78,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {}, void 0, false, {
                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                        lineNumber: 126,
                        columnNumber: 18
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-medium border-b pb-1 flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 131,
                                        columnNumber: 25
                                    }, this),
                                    " API Configuration"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                lineNumber: 130,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "api-key-input",
                                        children: "Google AI API Key"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 134,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: "api-key-input",
                                        type: "password",
                                        value: apiKeyInput,
                                        onChange: (e)=>setApiKeyInput(e.target.value),
                                        placeholder: "Enter your Google GenAI API Key",
                                        className: "text-sm"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 135,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: "Your API key is stored locally in your browser and is used for AI-powered features. It is not sent to our servers."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 143,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 mt-1",
                                        children: userGoogleAiApiKey ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-green-600 flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                                    lineNumber: 149,
                                                    columnNumber: 98
                                                }, this),
                                                " API Key is set."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                            lineNumber: 149,
                                            columnNumber: 33
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-destructive flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                                    lineNumber: 151,
                                                    columnNumber: 100
                                                }, this),
                                                " API Key is not set."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                            lineNumber: 151,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 147,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                lineNumber: 133,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: handleSaveApiKey,
                                        size: "sm",
                                        className: "flex-1",
                                        children: "Save API Key"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 156,
                                        columnNumber: 25
                                    }, this),
                                    userGoogleAiApiKey && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: handleClearApiKey,
                                        variant: "destructive",
                                        size: "sm",
                                        children: "Clear API Key"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                        lineNumber: 160,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                lineNumber: 155,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground italic",
                                children: "Note: Currently, the game uses a pre-configured API key for AI interactions. User-provided keys will be enabled for AI calls in a future update."
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                                lineNumber: 165,
                                columnNumber: 22
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                        lineNumber: 129,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                lineNumber: 76,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetFooter"], {
                className: "border-t pt-4 p-3",
                children: [
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "outline",
                        onClick: ()=>onOpenChange(false),
                        children: "Close"
                    }, void 0, false, {
                        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                        lineNumber: 174,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/SettingsPanel.tsx",
                lineNumber: 173,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/screens/SettingsPanel.tsx",
        lineNumber: 67,
        columnNumber: 9
    }, this);
}
_s(SettingsPanel, "1aelC15Ve+FOk+ArC5n19Je5rvM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = SettingsPanel;
var _c;
__turbopack_context__.k.register(_c, "SettingsPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/screens/MainMenu.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "MainMenu": (()=>MainMenu)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderClock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-clock.js [app-client] (ecmascript) <export default as FolderClock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dices$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Dices$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dices.js [app-client] (ecmascript) <export default as Dices>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.js [app-client] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$SettingsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/screens/SettingsPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/sheet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dropdown-menu.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function MainMenu() {
    _s();
    const { dispatch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"])();
    const [isSettingsOpen, setIsSettingsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MainMenu.useEffect": ()=>{
            console.log("MainMenu component mounted.");
        }
    }["MainMenu.useEffect"], []);
    const handleNewGameFlow = (adventureType)=>{
        console.log(`MainMenu: Starting new game flow for type: ${adventureType}`);
        dispatch({
            type: "RESET_GAME"
        });
        dispatch({
            type: "SET_ADVENTURE_TYPE",
            payload: adventureType
        });
        if (adventureType === "Coop") {
            dispatch({
                type: "SET_GAME_STATUS",
                payload: "CoopLobby"
            });
        } else if (adventureType === "Randomized") {
            // For Randomized, go to Character Creation first.
            dispatch({
                type: "SET_GAME_STATUS",
                payload: "CharacterCreation"
            });
        } else {
            // For Custom and Immersed, go to Adventure Setup first.
            dispatch({
                type: "SET_GAME_STATUS",
                payload: "AdventureSetup"
            });
        }
    };
    const handleViewSaved = ()=>{
        console.log("MainMenu: Handling View Saved Adventures button click.");
        dispatch({
            type: "SET_GAME_STATUS",
            payload: "ViewSavedAdventures"
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center min-h-screen p-4 bg-background relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sheet"], {
                open: isSettingsOpen,
                onOpenChange: setIsSettingsOpen,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetTrigger"], {
                        asChild: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            size: "icon",
                            className: "absolute top-4 right-4 z-10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                    className: "h-6 w-6 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/MainMenu.tsx",
                                    lineNumber: 57,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "sr-only",
                                    children: "Open Settings"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/MainMenu.tsx",
                                    lineNumber: 58,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/MainMenu.tsx",
                            lineNumber: 56,
                            columnNumber: 12
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$SettingsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SettingsPanel"], {
                        isOpen: isSettingsOpen,
                        onOpenChange: setIsSettingsOpen
                    }, void 0, false, {
                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/MainMenu.tsx",
                lineNumber: 54,
                columnNumber: 8
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CardboardCard"], {
                className: "w-full max-w-md text-center shadow-xl border-2 border-foreground/20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        className: "border-b border-foreground/10 pb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                            className: "text-4xl font-bold text-foreground mb-4 font-['Comic_Sans_MS',_'Chalkboard_SE',_'Marker_Felt',_sans-serif]",
                            children: "Endless Tales"
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/MainMenu.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "flex flex-col gap-4 pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                        asChild: true,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            size: "lg",
                                            className: "bg-accent hover:bg-accent/90 text-accent-foreground w-full",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                    className: "mr-2 h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/MainMenu.tsx",
                                                    lineNumber: 75,
                                                    columnNumber: 19
                                                }, this),
                                                " Start New Adventure ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    className: "ml-auto h-4 w-4 opacity-70"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/MainMenu.tsx",
                                                    lineNumber: 75,
                                                    columnNumber: 73
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/MainMenu.tsx",
                                            lineNumber: 74,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                                        lineNumber: 73,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                        className: "w-[calc(100%-2rem)] sm:w-[364px] max-w-md",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                onClick: ()=>handleNewGameFlow("Randomized"),
                                                className: "cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dices$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Dices$3e$__["Dices"], {
                                                        className: "mr-2 h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Randomized Adventure"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/screens/MainMenu.tsx",
                                                lineNumber: 79,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                onClick: ()=>handleNewGameFlow("Custom"),
                                                className: "cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                                                        className: "mr-2 h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                                                        lineNumber: 83,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Custom Adventure"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/screens/MainMenu.tsx",
                                                lineNumber: 82,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                                onClick: ()=>handleNewGameFlow("Immersed"),
                                                className: "cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                        className: "mr-2 h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                                                        lineNumber: 86,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Immersed Adventure"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/screens/MainMenu.tsx",
                                                lineNumber: 85,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                                        lineNumber: 78,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/MainMenu.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "lg",
                                onClick: handleViewSaved,
                                variant: "secondary",
                                className: "w-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderClock$3e$__["FolderClock"], {
                                        className: "mr-2 h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                                        lineNumber: 97,
                                        columnNumber: 15
                                    }, this),
                                    " View Saved Adventures"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/MainMenu.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardFooter"], {
                        className: "pt-4 justify-center flex-col items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground mb-2",
                                children: "v0.1.0 - Alpha"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/MainMenu.tsx",
                                lineNumber: 101,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://ko-fi.com/K3K31ELFCW",
                                target: "_blank",
                                rel: "noopener noreferrer",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "https://storage.ko-fi.com/cdn/kofi5.png?v=6",
                                    alt: "Buy Me a Coffee at ko-fi.com",
                                    width: 150,
                                    height: 36,
                                    style: {
                                        border: '0px',
                                        height: '36px',
                                        width: 'auto'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/MainMenu.tsx",
                                    lineNumber: 103,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/MainMenu.tsx",
                                lineNumber: 102,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/MainMenu.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/MainMenu.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "mt-8 text-sm text-muted-foreground text-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "An AI-powered text adventure where your choices shape the story."
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/MainMenu.tsx",
                    lineNumber: 114,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/screens/MainMenu.tsx",
                lineNumber: 113,
                columnNumber: 8
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/screens/MainMenu.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_s(MainMenu, "EBoi7ee4s+404RCeA9W4bLvV+zM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"]
    ];
});
_c = MainMenu;
var _c;
__turbopack_context__.k.register(_c, "MainMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/screens/CharacterCreation.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/components/screens/CharacterCreation.tsx
__turbopack_context__.s({
    "CharacterCreation": (()=>CharacterCreation)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hookform/resolvers/zod/dist/zod.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lodash$2f$lodash$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lodash/lodash.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tabs.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$generate$2d$character$2d$description$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/flows/generate-character-description.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/alert.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/separator.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$character$2f$StatAllocationInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/character/StatAllocationInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/game-initial-state.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$character$2f$BasicCharacterForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/character/BasicCharacterForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$character$2f$TextCharacterForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/character/TextCharacterForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icons$2f$HandDrawnIcons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icons/HandDrawnIcons.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Module-level variables to hold context for Zod schema, updated by useEffect
let currentGlobalAdventureType = null;
let currentGlobalCharacterOriginType = undefined;
// --- Zod Schema for Validation ---
const baseCharacterSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["object"])({
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"])().min(1, "Character name is required.").max(50, "Name too long (max 50).")
});
const commaSeparatedMaxItems = (max, message)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"])().transform((val)=>val === undefined || val === "" ? [] : val.split(',').map((s)=>s.trim()).filter(Boolean)).refine((arr)=>arr.length <= max, {
        message
    }).transform((arr)=>arr.join(', ')) // Convert back to string for form state
    .optional().transform((val)=>val || ""); // Ensure it's an empty string if undefined
const basicCreationSchemaFields = {
    creationType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["literal"])("basic"),
    class: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"])().max(30, "Class name too long (max 30).").optional().transform((val)=>val || ""),
    traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
    knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
    background: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"])().max(100, "Background too long (max 100).").optional().transform((val)=>val || ""),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"])().optional().transform((val)=>val || "")
};
const basicCreationSchema = baseCharacterSchema.extend(basicCreationSchemaFields);
const textCreationSchemaFields = {
    creationType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["literal"])("text"),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"])().optional(),
    // The following are for AI to potentially fill, so initially optional from user's perspective
    class: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"])().max(30, "Class name too long (max 30).").optional().transform((val)=>val || ""),
    traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
    knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
    background: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"])().max(100, "Background too long (max 100).").optional().transform((val)=>val || "")
};
const textCreationSchema = baseCharacterSchema.extend(textCreationSchemaFields);
const combinedSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["discriminatedUnion"])("creationType", [
    basicCreationSchema,
    textCreationSchema
]).superRefine((data, ctx)=>{
    const advType = currentGlobalAdventureType;
    const originType = currentGlobalCharacterOriginType;
    if (data.creationType === "basic") {
        if (advType !== "Immersed" && (!data.class || data.class.trim() === "")) {
            ctx.addIssue({
                code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZodIssueCode"].custom,
                message: "Class is required for Randomized/Custom adventures.",
                path: [
                    "class"
                ]
            });
        }
    } else if (data.creationType === "text") {
        const descLength = data.description?.trim().length ?? 0;
        const minDescLength = advType === "Immersed" && originType === "original" ? 10 : 10;
        if (descLength < minDescLength) {
            let msg = `Description (min ${minDescLength} chars) is required for AI profile generation.`;
            if (advType === "Immersed" && originType === "original") {
                msg = `Original Character Concept (min ${minDescLength} chars in description box) is required.`;
            } else if (advType !== "Immersed") {
                // Only require if text tab is active and it's not an existing immersed character
                msg = `Description (min ${minDescLength} chars) is required for AI profile generation in Randomized/Custom modes when using text-based creation.`;
            }
            ctx.addIssue({
                code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZodIssueCode"].custom,
                message: msg,
                path: [
                    "description"
                ]
            });
        }
    }
});
const staticDefaultValues = {
    creationType: "basic",
    name: "",
    class: "",
    traits: "",
    knowledge: "",
    background: "",
    description: ""
};
function CharacterCreation() {
    _s();
    const { state, dispatch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"])();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const formRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [creationType, setCreationType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("basic");
    const calculateRemainingPoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CharacterCreation.useCallback[calculateRemainingPoints]": (currentStats)=>{
            const allocatedTotal = currentStats.strength + currentStats.stamina + currentStats.wisdom;
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOTAL_STAT_POINTS"] - allocatedTotal;
        }
    }["CharacterCreation.useCallback[calculateRemainingPoints]"], []);
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CharacterCreation.useState": ()=>{
            const characterContextStats = state.character?.stats;
            const initial = characterContextStats ? {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialCharacterStats"],
                ...characterContextStats
            } : {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialCharacterStats"]
            };
            if (initial.strength + initial.stamina + initial.wisdom > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOTAL_STAT_POINTS"] || initial.strength < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIN_STAT_VALUE"] || initial.stamina < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIN_STAT_VALUE"] || initial.wisdom < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIN_STAT_VALUE"]) {
                return {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialCharacterStats"]
                };
            }
            return initial;
        }
    }["CharacterCreation.useState"]);
    const [remainingPoints, setRemainingPoints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CharacterCreation.useState": ()=>calculateRemainingPoints(stats)
    }["CharacterCreation.useState"]);
    const [statError, setStatError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isRandomizing, setIsRandomizing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [randomizationComplete, setRandomizationComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isGenerating, setIsGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { register, handleSubmit, formState, reset, watch, setValue, trigger, getValues } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["zodResolver"])(combinedSchema),
        mode: "onChange",
        defaultValues: staticDefaultValues
    });
    const { errors, isValid: formIsValid, isDirty, dirtyFields } = formState;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CharacterCreation.useEffect": ()=>{
            const newAdvType = state.adventureSettings.adventureType;
            const newOriginType = state.adventureSettings.characterOriginType;
            let needsValidationTrigger = false;
            if (currentGlobalAdventureType !== newAdvType) {
                currentGlobalAdventureType = newAdvType;
                needsValidationTrigger = true;
            }
            if (currentGlobalCharacterOriginType !== newOriginType) {
                currentGlobalCharacterOriginType = newOriginType;
                needsValidationTrigger = true;
            }
            if (needsValidationTrigger && formRef.current) {
                trigger();
            }
        }
    }["CharacterCreation.useEffect"], [
        state.adventureSettings.adventureType,
        state.adventureSettings.characterOriginType,
        trigger
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CharacterCreation.useEffect": ()=>{
            if (isRandomizing || isGenerating) return;
            const newFormValues = {
                creationType
            };
            const isImmersedMode = state.adventureSettings.adventureType === "Immersed";
            const isOriginalCharacterImmersed = isImmersedMode && state.adventureSettings.characterOriginType === "original";
            if (state.character) {
                newFormValues.name = state.character.name || "";
                newFormValues.class = state.character.class || "";
                newFormValues.traits = Array.isArray(state.character.traits) ? state.character.traits.join(', ') : "";
                newFormValues.knowledge = Array.isArray(state.character.knowledge) ? state.character.knowledge.join(', ') : "";
                newFormValues.background = state.character.background || "";
                newFormValues.description = state.character.aiGeneratedDescription || state.character.description || "";
            }
            if (isOriginalCharacterImmersed && state.adventureSettings.playerCharacterConcept && !dirtyFields.description) {
                newFormValues.description = state.adventureSettings.playerCharacterConcept;
            }
            if (isImmersedMode) {
                newFormValues.class = ""; // Class is not user-defined for Immersed
            } else if (!dirtyFields.class && !newFormValues.class) {
                newFormValues.class = "Adventurer";
            }
            const currentFormState = getValues();
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lodash$2f$lodash$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isEqual(newFormValues, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lodash$2f$lodash$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].pick(currentFormState, Object.keys(newFormValues))) || creationType !== currentFormState.creationType) {
                reset(newFormValues, {
                    keepDirtyValues: true,
                    keepValues: true
                });
                setTimeout({
                    "CharacterCreation.useEffect": ()=>trigger()
                }["CharacterCreation.useEffect"], 50);
            }
        }
    }["CharacterCreation.useEffect"], [
        state.character,
        state.adventureSettings.adventureType,
        state.adventureSettings.characterOriginType,
        state.adventureSettings.playerCharacterConcept,
        creationType,
        reset,
        getValues,
        trigger,
        isDirty,
        dirtyFields,
        isRandomizing,
        isGenerating
    ]);
    const handleStatChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CharacterCreation.useCallback[handleStatChange]": (newStats)=>{
            const newRemaining = calculateRemainingPoints(newStats);
            setStats(newStats);
            setRemainingPoints(newRemaining);
            if (newRemaining < 0) {
                setStatError(`${Math.abs(newRemaining)} point(s) over limit.`);
            } else if (newRemaining > 0) {
                setStatError(null);
            } else {
                setStatError(null);
            }
        }
    }["CharacterCreation.useCallback[handleStatChange]"], [
        calculateRemainingPoints
    ]);
    const randomizeStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CharacterCreation.useCallback[randomizeStats]": ()=>{
            let pointsLeft = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOTAL_STAT_POINTS"];
            const newAllocatedStats = {
                strength: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIN_STAT_VALUE"],
                stamina: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIN_STAT_VALUE"],
                wisdom: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIN_STAT_VALUE"]
            };
            pointsLeft -= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIN_STAT_VALUE"] * 3;
            const allocatedStatKeys = [
                'strength',
                'stamina',
                'wisdom'
            ];
            while(pointsLeft > 0){
                const availableKeys = allocatedStatKeys.filter({
                    "CharacterCreation.useCallback[randomizeStats].availableKeys": (key)=>newAllocatedStats[key] < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAX_STAT_VALUE"]
                }["CharacterCreation.useCallback[randomizeStats].availableKeys"]);
                if (availableKeys.length === 0) break;
                const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
                newAllocatedStats[randomKey]++;
                pointsLeft--;
            }
            let currentTotal = newAllocatedStats.strength + newAllocatedStats.stamina + newAllocatedStats.wisdom;
            if (currentTotal !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOTAL_STAT_POINTS"]) {
                let diff = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOTAL_STAT_POINTS"] - currentTotal;
                const sortedByVal = allocatedStatKeys.sort({
                    "CharacterCreation.useCallback[randomizeStats].sortedByVal": (a, b)=>newAllocatedStats[a] - newAllocatedStats[b]
                }["CharacterCreation.useCallback[randomizeStats].sortedByVal"]);
                while(diff !== 0 && sortedByVal.length > 0){
                    const keyToAdjust = diff > 0 ? sortedByVal[0] : sortedByVal[sortedByVal.length - 1];
                    const change = Math.sign(diff);
                    if (change > 0 && newAllocatedStats[keyToAdjust] < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAX_STAT_VALUE"] || change < 0 && newAllocatedStats[keyToAdjust] > __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIN_STAT_VALUE"]) {
                        newAllocatedStats[keyToAdjust] += change;
                        diff -= change;
                    } else {
                        if (diff > 0) sortedByVal.shift();
                        else sortedByVal.pop();
                    }
                }
            }
            const finalStats = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialCharacterStats"],
                ...newAllocatedStats
            };
            handleStatChange(finalStats);
        }
    }["CharacterCreation.useCallback[randomizeStats]"], [
        handleStatChange
    ]);
    const randomizeAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CharacterCreation.useCallback[randomizeAll]": async ()=>{
            setIsRandomizing(true);
            setRandomizationComplete(false);
            setError(null);
            const randomNames = [
                "Anya",
                "Borin",
                "Carys",
                "Darian",
                "Elara",
                "Fendrel",
                "Gorok",
                "Silas",
                "Lyra",
                "Roric"
            ];
            const randomClasses = [
                "Warrior",
                "Rogue",
                "Mage",
                "Scout",
                "Scholar",
                "Wanderer",
                "Guard",
                "Tinkerer",
                "Healer",
                "Bard",
                "Adventurer"
            ];
            const randomTraitsPool = [
                "Brave",
                "Curious",
                "Cautious",
                "Impulsive",
                "Loyal",
                "Clever",
                "Resourceful",
                "Quiet",
                "Stern",
                "Generous",
                "Witty",
                "Pessimistic"
            ];
            const randomKnowledgePool = [
                "Herbalism",
                "Local Lore",
                "Survival",
                "Trading",
                "Ancient Runes",
                "Beasts",
                "Smithing",
                "First Aid",
                "Navigation",
                "City Secrets"
            ];
            const randomBackgrounds = [
                "Farmer",
                "Orphan",
                "Noble Exile",
                "Street Urchin",
                "Acolyte",
                "Guard",
                "Merchant's Child",
                "Hermit",
                "Former Soldier",
                "Traveling Minstrel"
            ];
            const randomDescriptions = [
                "A weary traveler, eyes sharp as a hawk, their cloak patched from countless journeys, forever seeking forgotten paths and lost knowledge.",
                "A cheerful youth hailing from a small, secluded village, somewhat naive to the wider world but brimming with an infectious eagerness for adventure.",
                "A stern and reserved individual, a faded scar across their cheek tells a silent story of a past they refuse to speak of.",
                "A dedicated scholar, almost comically obsessed with forgotten lore and ancient prophecies, rarely seen without a satchel overflowing with dusty tomes and cryptic maps.",
                "A skilled artisan, hands calloused yet remarkably deft, always ready to craft, repair, or ingeniously repurpose whatever materials are at hand."
            ];
            const name = randomNames[Math.floor(Math.random() * randomNames.length)];
            const currentAdvType = state.adventureSettings.adventureType;
            const isImmersedOriginal = currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original";
            const fieldsToSet = {
                name
            };
            fieldsToSet.creationType = creationType;
            if (creationType === 'basic') {
                fieldsToSet.class = currentAdvType !== "Immersed" ? randomClasses[Math.floor(Math.random() * randomClasses.length)] : "";
                fieldsToSet.traits = randomTraitsPool.sort({
                    "CharacterCreation.useCallback[randomizeAll]": ()=>0.5 - Math.random()
                }["CharacterCreation.useCallback[randomizeAll]"]).slice(0, Math.floor(Math.random() * 3) + 2).join(', ');
                fieldsToSet.knowledge = randomKnowledgePool.sort({
                    "CharacterCreation.useCallback[randomizeAll]": ()=>0.5 - Math.random()
                }["CharacterCreation.useCallback[randomizeAll]"]).slice(0, Math.floor(Math.random() * 3) + 1).join(', ');
                fieldsToSet.background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
                fieldsToSet.description = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
            } else {
                let desc = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
                if (isImmersedOriginal && state.adventureSettings.playerCharacterConcept) {
                    desc = `An original character for ${state.adventureSettings.universeName || 'chosen universe'}: A ${randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)]} named ${name}. ${desc}`;
                }
                fieldsToSet.description = desc;
                fieldsToSet.class = currentAdvType !== "Immersed" ? "Adventurer" : "";
                fieldsToSet.traits = randomTraitsPool.sort({
                    "CharacterCreation.useCallback[randomizeAll]": ()=>0.5 - Math.random()
                }["CharacterCreation.useCallback[randomizeAll]"]).slice(0, Math.floor(Math.random() * 2) + 1).join(', ');
                fieldsToSet.knowledge = randomKnowledgePool.sort({
                    "CharacterCreation.useCallback[randomizeAll]": ()=>0.5 - Math.random()
                }["CharacterCreation.useCallback[randomizeAll]"]).slice(0, Math.floor(Math.random() * 2)).join(', ');
                fieldsToSet.background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
            }
            for(const key in fieldsToSet){
                setValue(key, fieldsToSet[key], {
                    shouldDirty: true,
                    shouldValidate: true
                });
            }
            randomizeStats();
            await new Promise({
                "CharacterCreation.useCallback[randomizeAll]": (res)=>setTimeout(res, 50)
            }["CharacterCreation.useCallback[randomizeAll]"]);
            setIsRandomizing(false);
            setRandomizationComplete(true);
            toast({
                title: "Character Randomized!",
                description: `Created a new character: ${name}. Review and adjust as needed.`
            });
            setTimeout({
                "CharacterCreation.useCallback[randomizeAll]": ()=>setRandomizationComplete(false)
            }["CharacterCreation.useCallback[randomizeAll]"], 1200);
            trigger();
        }
    }["CharacterCreation.useCallback[randomizeAll]"], [
        creationType,
        randomizeStats,
        setValue,
        state.adventureSettings.adventureType,
        state.adventureSettings.characterOriginType,
        state.adventureSettings.universeName,
        state.adventureSettings.playerCharacterConcept,
        toast,
        trigger
    ]);
    const handleGenerateDescription = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CharacterCreation.useCallback[handleGenerateDescription]": async ()=>{
            await trigger([
                "name",
                "description"
            ]);
            const currentFormValues = getValues();
            const currentName = currentFormValues.name;
            const currentDescValue = currentFormValues.description;
            const currentAdvType = state.adventureSettings.adventureType;
            const universeNameForAI = currentAdvType === "Immersed" ? state.adventureSettings.universeName : undefined;
            const playerCharacterConceptForAI = currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original" ? currentDescValue || state.adventureSettings.playerCharacterConcept : undefined;
            if (!currentName?.trim()) {
                toast({
                    title: "Name Required",
                    description: "Please enter a character name.",
                    variant: "destructive"
                });
                return;
            }
            const minDescLength = currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original" ? 10 : 10;
            if (!currentDescValue || currentDescValue.trim().length < minDescLength) {
                let msg = `Description (min ${minDescLength} chars) is required for AI profile generation.`;
                if (currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original") {
                    msg = `Original Character Concept (min ${minDescLength} chars in description box) is required.`;
                }
                toast({
                    title: "Input Required",
                    description: msg,
                    variant: "destructive"
                });
                return;
            }
            setError(null);
            setIsGenerating(true);
            try {
                const aiInput = {
                    characterDescription: currentDescValue,
                    isImmersedMode: currentAdvType === "Immersed",
                    universeName: universeNameForAI,
                    playerCharacterConcept: playerCharacterConceptForAI,
                    userApiKey: state.userGoogleAiApiKey
                };
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$generate$2d$character$2d$description$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCharacterDescription"])(aiInput);
                setValue("description", result.detailedDescription || currentDescValue, {
                    shouldDirty: true,
                    shouldValidate: true
                });
                setValue("traits", (Array.isArray(result.inferredTraits) ? result.inferredTraits.join(', ') : result.inferredTraits) || currentFormValues.traits, {
                    shouldDirty: true,
                    shouldValidate: true
                });
                setValue("knowledge", (Array.isArray(result.inferredKnowledge) ? result.inferredKnowledge.join(', ') : result.inferredKnowledge) || currentFormValues.knowledge, {
                    shouldDirty: true,
                    shouldValidate: true
                });
                setValue("background", result.inferredBackground || currentFormValues.background, {
                    shouldDirty: true,
                    shouldValidate: true
                });
                if (currentAdvType !== "Immersed") {
                    setValue("class", result.inferredClass || "Adventurer", {
                        shouldDirty: true,
                        shouldValidate: true
                    });
                } else {
                    setValue("class", result.inferredClass || "Immersed Protagonist", {
                        shouldDirty: true,
                        shouldValidate: true
                    });
                }
                dispatch({
                    type: "SET_AI_DESCRIPTION",
                    payload: result.detailedDescription
                });
                toast({
                    title: "AI Profile Generated!",
                    description: "Character details updated."
                });
                await trigger();
            } catch (err) {
                console.error("CharacterCreation: AI generation failed:", err);
                setError("Failed to generate profile. The AI might be busy or encountered an error.");
                const errorMessage = err instanceof Error ? err.message : String(err);
                toast({
                    title: "AI Generation Failed",
                    description: errorMessage,
                    variant: "destructive"
                });
            } finally{
                setIsGenerating(false);
            }
        }
    }["CharacterCreation.useCallback[handleGenerateDescription]"], [
        getValues,
        setValue,
        trigger,
        dispatch,
        toast,
        state.adventureSettings,
        state.userGoogleAiApiKey
    ]);
    const onSubmit = (data)=>{
        setError(null);
        if (remainingPoints !== 0) {
            setStatError(`Please allocate all ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOTAL_STAT_POINTS"]} stat points. ${remainingPoints > 0 ? `${remainingPoints} point(s) remaining.` : `${Math.abs(remainingPoints)} point(s) over limit.`}`);
            toast({
                title: "Stat Allocation Incomplete",
                description: statError || "Stat allocation issue.",
                variant: "destructive"
            });
            return;
        }
        setStatError(null);
        trigger().then((isFormCurrentlyValid)=>{
            if (!isFormCurrentlyValid) {
                const fieldErrorMessages = Object.entries(errors).map(([key, err])=>{
                    if (err && typeof err === 'object' && 'message' in err) {
                        return `${key}: ${err.message}`;
                    }
                    return null;
                }).filter(Boolean);
                const flatErrors = Object.values(errors).map((e)=>e?.message).filter(Boolean).join('; ');
                toast({
                    title: "Validation Error",
                    description: fieldErrorMessages.join('; ') || flatErrors || "Please correct the highlighted fields.",
                    variant: "destructive"
                });
                return;
            }
            const finalName = data.name;
            let finalClass = data.class || "Adventurer";
            if (state.adventureSettings.adventureType === "Immersed") {
                finalClass = data.class || state.character?.class || state.adventureSettings.playerCharacterConcept || "Immersed Protagonist";
            }
            const finalTraits = (data.traits || "").split(',').map((t)=>t.trim()).filter(Boolean);
            const finalKnowledge = (data.knowledge || "").split(',').map((k)=>k.trim()).filter(Boolean);
            const finalBackground = data.background ?? "";
            const finalDescription = data.description || "";
            const finalAiGeneratedDescription = state.character?.aiGeneratedDescription === finalDescription ? state.character.aiGeneratedDescription : undefined;
            const characterDataToDispatch = {
                name: finalName,
                class: finalClass,
                description: finalDescription,
                traits: finalTraits,
                knowledge: finalKnowledge,
                background: finalBackground,
                stats: {
                    ...stats
                },
                aiGeneratedDescription: finalAiGeneratedDescription
            };
            dispatch({
                type: "CREATE_CHARACTER",
                payload: characterDataToDispatch
            });
            if (state.adventureSettings.adventureType === "Randomized") {
                dispatch({
                    type: "SET_GAME_STATUS",
                    payload: "AdventureSetup"
                });
            } else {
                dispatch({
                    type: "START_GAMEPLAY"
                });
            }
        });
    };
    const handleBackToMenu = ()=>{
        dispatch({
            type: "RESET_GAME"
        });
    };
    const showCharacterDefinitionForms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterCreation.useMemo[showCharacterDefinitionForms]": ()=>{
            const advType = state.adventureSettings.adventureType;
            const originType = state.adventureSettings.characterOriginType;
            return advType !== "Immersed" || advType === "Immersed" && originType === "original";
        }
    }["CharacterCreation.useMemo[showCharacterDefinitionForms]"], [
        state.adventureSettings.adventureType,
        state.adventureSettings.characterOriginType
    ]);
    const isProceedButtonDisabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CharacterCreation.useMemo[isProceedButtonDisabled]": ()=>{
            const nameValid = !!watch("name")?.trim();
            const generalDisabled = isGenerating || isRandomizing || remainingPoints !== 0 || statError !== null && remainingPoints !== 0;
            let specificFormFieldsValid = true;
            if (showCharacterDefinitionForms) {
                specificFormFieldsValid = formIsValid;
            }
            return generalDisabled || !nameValid || !specificFormFieldsValid;
        }
    }["CharacterCreation.useMemo[isProceedButtonDisabled]"], [
        isGenerating,
        isRandomizing,
        remainingPoints,
        statError,
        formIsValid,
        errors,
        watch,
        showCharacterDefinitionForms
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CharacterCreation.useEffect": ()=>{
            currentGlobalAdventureType = state.adventureSettings.adventureType;
            currentGlobalCharacterOriginType = state.adventureSettings.characterOriginType;
            trigger();
        }
    }["CharacterCreation.useEffect"], [
        state.adventureSettings.adventureType,
        state.adventureSettings.characterOriginType,
        trigger
    ]);
    if (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "existing" && !showCharacterDefinitionForms) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-screen p-4 bg-background",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CardboardCard"], {
                className: "w-full max-w-md text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                            className: "text-2xl flex items-center justify-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "w-6 h-6 animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                    lineNumber: 457,
                                    columnNumber: 100
                                }, this),
                                " Loading Character..."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                            lineNumber: 457,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                        lineNumber: 457,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted-foreground",
                                children: [
                                    "Preparing your adventure as ",
                                    state.adventureSettings.playerCharacterConcept,
                                    " in ",
                                    state.adventureSettings.universeName,
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 459,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground mt-2",
                                children: "You should be taken to the game shortly."
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 460,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                        lineNumber: 458,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardFooter"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleBackToMenu,
                            className: "w-full",
                            variant: "outline",
                            children: "Back to Main Menu"
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                            lineNumber: 463,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                        lineNumber: 462,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                lineNumber: 456,
                columnNumber: 13
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
            lineNumber: 455,
            columnNumber: 9
        }, this);
    }
    const proceedButtonText = state.adventureSettings.adventureType === "Randomized" ? "Proceed to Adventure Setup" : "Start Adventure";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center min-h-screen p-4 bg-background",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit(onSubmit),
            className: "w-full max-w-2xl",
            ref: formRef,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CardboardCard"], {
                className: "shadow-xl border-2 border-foreground/20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        className: "border-b border-foreground/10 pb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                className: "text-3xl font-bold text-center flex items-center justify-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                        className: "w-7 h-7"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 480,
                                        columnNumber: 25
                                    }, this),
                                    " Create Your Adventurer"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 479,
                                columnNumber: 21
                            }, this),
                            state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "original" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-center text-muted-foreground mt-1",
                                children: [
                                    " Mode: Immersed (Original Character) in ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold",
                                        children: state.adventureSettings.universeName || "chosen universe"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 483,
                                        columnNumber: 127
                                    }, this),
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 483,
                                        columnNumber: 226
                                    }, this),
                                    "Your Initial Concept: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "italic",
                                        children: state.adventureSettings.playerCharacterConcept || watch("description")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 483,
                                        columnNumber: 253
                                    }, this),
                                    " "
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 483,
                                columnNumber: 25
                            }, this),
                            (state.adventureSettings.adventureType === "Randomized" || state.adventureSettings.adventureType === "Custom") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-center text-muted-foreground mt-1",
                                children: [
                                    " Mode: ",
                                    state.adventureSettings.adventureType,
                                    " Adventure "
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 486,
                                columnNumber: 26
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                        lineNumber: 478,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-6 pt-6",
                        children: [
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                                variant: "destructive",
                                className: "mb-4",
                                children: [
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 490,
                                        columnNumber: 80
                                    }, this),
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertTitle"], {
                                        children: "Error"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 490,
                                        columnNumber: 116
                                    }, this),
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                        children: error
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 490,
                                        columnNumber: 147
                                    }, this),
                                    " "
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 490,
                                columnNumber: 33
                            }, this),
                            showCharacterDefinitionForms ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tabs"], {
                                value: creationType,
                                onValueChange: (value)=>{
                                    const newCreationType = value;
                                    setCreationType(newCreationType);
                                    setValue("creationType", newCreationType, {
                                        shouldValidate: true
                                    });
                                },
                                className: "w-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsList"], {
                                        className: "grid w-full grid-cols-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                                value: "basic",
                                                children: "Basic Fields"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                lineNumber: 499,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                                value: "text",
                                                children: "Text Description (AI Assist)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                lineNumber: 500,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 498,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                                        value: "basic",
                                        className: "space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$character$2f$BasicCharacterForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BasicCharacterForm"], {
                                            register: register,
                                            errors: errors,
                                            adventureType: state.adventureSettings.adventureType
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                            lineNumber: 503,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 502,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                                        value: "text",
                                        className: "space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$character$2f$TextCharacterForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextCharacterForm"], {
                                            register: register,
                                            errors: errors,
                                            onGenerateDescription: handleGenerateDescription,
                                            isGenerating: isGenerating,
                                            watchedName: watch("name"),
                                            watchedDescription: watch("description")
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                            lineNumber: 506,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 505,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 493,
                                columnNumber: 25
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 518,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertTitle"], {
                                        children: "Stat Allocation Only"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 519,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                        children: "Character details are pre-defined or AI-generated for this mode. Please allocate stats."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 520,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 517,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {}, void 0, false, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 525,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-semibold flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                        lineNumber: 529,
                                                        columnNumber: 93
                                                    }, this),
                                                    "Allocate Stats (",
                                                    stats.strength + stats.stamina + stats.wisdom,
                                                    " / ",
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TOTAL_STAT_POINTS"],
                                                    " Points)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                lineNumber: 529,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-sm font-medium ${statError && remainingPoints !== 0 ? 'text-destructive' : remainingPoints === 0 ? 'text-green-600' : 'text-muted-foreground'}`,
                                                children: statError && remainingPoints !== 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                            lineNumber: 531,
                                                            columnNumber: 117
                                                        }, this),
                                                        " ",
                                                        statError,
                                                        " "
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                    lineNumber: 531,
                                                    columnNumber: 74
                                                }, this) : remainingPoints === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex items-center gap-1 text-green-600",
                                                    children: [
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                            lineNumber: 532,
                                                            columnNumber: 121
                                                        }, this),
                                                        " All points allocated! "
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                    lineNumber: 532,
                                                    columnNumber: 63
                                                }, this) : `${remainingPoints} point(s) remaining.`
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                lineNumber: 530,
                                                columnNumber: 30
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 528,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$character$2f$StatAllocationInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatAllocationInput"], {
                                                label: "Strength",
                                                statKey: "strength",
                                                value: stats.strength,
                                                onChange: (key, val)=>handleStatChange({
                                                        ...stats,
                                                        [key]: val
                                                    }),
                                                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icons$2f$HandDrawnIcons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HandDrawnStrengthIcon"],
                                                disabled: isGenerating || isRandomizing,
                                                remainingPoints: remainingPoints
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                lineNumber: 537,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$character$2f$StatAllocationInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatAllocationInput"], {
                                                label: "Stamina",
                                                statKey: "stamina",
                                                value: stats.stamina,
                                                onChange: (key, val)=>handleStatChange({
                                                        ...stats,
                                                        [key]: val
                                                    }),
                                                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icons$2f$HandDrawnIcons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HandDrawnStaminaIcon"],
                                                disabled: isGenerating || isRandomizing,
                                                remainingPoints: remainingPoints
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                lineNumber: 546,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$character$2f$StatAllocationInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatAllocationInput"], {
                                                label: "Wisdom",
                                                statKey: "wisdom",
                                                value: stats.wisdom,
                                                onChange: (key, val)=>handleStatChange({
                                                        ...stats,
                                                        [key]: val
                                                    }),
                                                Icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icons$2f$HandDrawnIcons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HandDrawnMagicIcon"],
                                                disabled: isGenerating || isRandomizing,
                                                remainingPoints: remainingPoints
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                lineNumber: 555,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 536,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 527,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                        lineNumber: 489,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardFooter"], {
                        className: "flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-foreground/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                onClick: handleBackToMenu,
                                variant: "outline",
                                "aria-label": "Back to Main Menu",
                                className: "w-full sm:w-auto",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        className: "mr-2 h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 570,
                                        columnNumber: 25
                                    }, this),
                                    " Back to Main Menu"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 569,
                                columnNumber: 22
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row gap-2 w-full sm:w-auto",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipProvider"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                                                    asChild: true,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        type: "button",
                                                        onClick: randomizeAll,
                                                        variant: "secondary",
                                                        "aria-label": "Randomize All Character Fields and Stats",
                                                        className: "relative overflow-hidden w-full sm:w-auto",
                                                        disabled: isRandomizing || isGenerating || !showCharacterDefinitionForms,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                                className: `mr-2 h-4 w-4 ${isRandomizing ? 'animate-spin' : ''}`
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                                lineNumber: 584,
                                                                columnNumber: 41
                                                            }, this),
                                                            isRandomizing ? 'Randomizing...' : 'Randomize All',
                                                            randomizationComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                className: "absolute right-2 h-4 w-4 text-green-500 opacity-100 transition-opacity duration-300"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                                lineNumber: 586,
                                                                columnNumber: 67
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                        lineNumber: 576,
                                                        columnNumber: 38
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                    lineNumber: 575,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            children: "Generate random character details and stats."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                            lineNumber: 590,
                                                            columnNumber: 37
                                                        }, this),
                                                        !showCharacterDefinitionForms && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-muted-foreground",
                                                            children: "(Character details pre-defined/AI-gen for this mode.)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                            lineNumber: 591,
                                                            columnNumber: 71
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                    lineNumber: 589,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                            lineNumber: 574,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 573,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "submit",
                                        className: "bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto",
                                        disabled: isProceedButtonDisabled,
                                        "aria-label": "Save character and proceed",
                                        children: [
                                            state.adventureSettings.adventureType === "Randomized" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                className: "mr-2 h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                lineNumber: 601,
                                                columnNumber: 87
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                                className: "mr-2 h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                                lineNumber: 601,
                                                columnNumber: 128
                                            }, this),
                                            proceedButtonText
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                        lineNumber: 595,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                                lineNumber: 572,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                        lineNumber: 568,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/CharacterCreation.tsx",
                lineNumber: 477,
                columnNumber: 13
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/screens/CharacterCreation.tsx",
            lineNumber: 476,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/screens/CharacterCreation.tsx",
        lineNumber: 475,
        columnNumber: 5
    }, this);
}
_s(CharacterCreation, "QGdkvSSpsh14wAo0kQf/EBSJ84Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"]
    ];
});
_c = CharacterCreation;
var _c;
__turbopack_context__.k.register(_c, "CharacterCreation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/screens/AdventureSetup.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/components/screens/AdventureSetup.tsx
__turbopack_context__.s({
    "AdventureSetup": (()=>AdventureSetup)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/switch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/radio-group.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.js [app-client] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dices$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Dices$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dices.js [app-client] (ecmascript) <export default as Dices>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skull.js [app-client] (ecmascript) <export default as Skull>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scroll-text.js [app-client] (ecmascript) <export default as ScrollText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-alert.js [app-client] (ecmascript) <export default as ShieldAlert>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$atom$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Atom$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/atom.js [app-client] (ecmascript) <export default as Atom>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$drama$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Drama$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/drama.js [app-client] (ecmascript) <export default as Drama>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$puzzle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Puzzle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/puzzle.js [app-client] (ecmascript) <export default as Puzzle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-plus.js [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-check.js [app-client] (ecmascript) <export default as UserCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-client] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/alert.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$generate$2d$character$2d$description$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/flows/generate-character-description.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$suggest$2d$existing$2d$characters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/flows/suggest-existing-characters.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$suggest$2d$original$2d$character$2d$concepts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/flows/suggest-original-character-concepts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/game-initial-state.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gameUtils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function AdventureSetup() {
    _s();
    const { state, dispatch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"])();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const adventureTypeFromContext = state.adventureSettings.adventureType;
    // Common settings
    const [permanentDeath, setPermanentDeath] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.permanentDeath ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialAdventureSettings"].permanentDeath);
    const [difficulty, setDifficulty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.difficulty ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialAdventureSettings"].difficulty);
    // Custom Adventure settings
    const [worldType, setWorldType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.worldType ?? "");
    const [mainQuestline, setMainQuestline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.mainQuestline ?? "");
    const [genreTheme, setGenreTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.genreTheme ?? "");
    const [magicSystem, setMagicSystem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.magicSystem ?? "");
    const [techLevel, setTechLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.techLevel ?? "");
    const [dominantTone, setDominantTone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.dominantTone ?? "");
    const [startingSituation, setStartingSituation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.startingSituation ?? "");
    const [combatFrequency, setCombatFrequency] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.combatFrequency ?? "Medium");
    const [puzzleFrequency, setPuzzleFrequency] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.puzzleFrequency ?? "Medium");
    const [socialFocus, setSocialFocus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.socialFocus ?? "Medium");
    // Immersed Adventure settings
    const [universeName, setUniverseName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.universeName ?? "");
    const [playerCharacterConcept, setPlayerCharacterConcept] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.playerCharacterConcept ?? "");
    const [characterOriginType, setCharacterOriginType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(state.adventureSettings.characterOriginType ?? 'original');
    // Component state
    const [customError, setCustomError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoadingImmersedCharacter, setIsLoadingImmersedCharacter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSuggestingNameLoading, setIsSuggestingNameLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdventureSetup.useEffect": ()=>{
            // This effect ensures that local state for settings is in sync with game context
            // This is useful if the user navigates away and comes back
            setPermanentDeath(state.adventureSettings.permanentDeath ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialAdventureSettings"].permanentDeath);
            setDifficulty(state.adventureSettings.difficulty ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialAdventureSettings"].difficulty);
            if (state.adventureSettings.adventureType === "Custom") {
                setWorldType(state.adventureSettings.worldType ?? "");
                setMainQuestline(state.adventureSettings.mainQuestline ?? "");
                setGenreTheme(state.adventureSettings.genreTheme ?? "");
                setMagicSystem(state.adventureSettings.magicSystem ?? "");
                setTechLevel(state.adventureSettings.techLevel ?? "");
                setDominantTone(state.adventureSettings.dominantTone ?? "");
                setStartingSituation(state.adventureSettings.startingSituation ?? "");
                setCombatFrequency(state.adventureSettings.combatFrequency ?? "Medium");
                setPuzzleFrequency(state.adventureSettings.puzzleFrequency ?? "Medium");
                setSocialFocus(state.adventureSettings.socialFocus ?? "Medium");
            } else if (state.adventureSettings.adventureType === "Immersed") {
                setUniverseName(state.adventureSettings.universeName ?? "");
                setPlayerCharacterConcept(state.adventureSettings.playerCharacterConcept ?? "");
                setCharacterOriginType(state.adventureSettings.characterOriginType ?? 'original');
            }
            setCustomError(null);
        }
    }["AdventureSetup.useEffect"], [
        state.adventureSettings
    ]);
    const validateSettings = ()=>{
        if (adventureTypeFromContext === "Custom") {
            if (!worldType.trim()) {
                setCustomError("World Type is required.");
                return false;
            }
            if (!mainQuestline.trim()) {
                setCustomError("Main Questline is required.");
                return false;
            }
            if (!genreTheme) {
                setCustomError("Genre/Theme is required.");
                return false;
            }
            if (!magicSystem) {
                setCustomError("Magic System is required.");
                return false;
            }
            if (!techLevel) {
                setCustomError("Technological Level is required.");
                return false;
            }
            if (!dominantTone) {
                setCustomError("Dominant Tone is required.");
                return false;
            }
            if (!startingSituation.trim()) {
                setCustomError("Starting Situation is required.");
                return false;
            }
        } else if (adventureTypeFromContext === "Immersed") {
            if (!universeName.trim()) {
                setCustomError("Universe Name is required.");
                return false;
            }
            if (characterOriginType === 'existing' && !playerCharacterConcept.trim()) {
                setCustomError("Existing Character's Name is required.");
                return false;
            }
            if (characterOriginType === 'original' && !playerCharacterConcept.trim()) {
                setCustomError("Original Character Concept/Role is required.");
                return false;
            }
        }
        setCustomError(null);
        return true;
    };
    const handleSuggestName = async ()=>{
        if (!universeName.trim()) {
            toast({
                title: "Universe Name Required",
                description: "Please enter a universe name to get suggestions.",
                variant: "destructive"
            });
            return;
        }
        setIsSuggestingNameLoading(true);
        setCustomError(null);
        try {
            let suggestions = [];
            if (characterOriginType === 'existing') {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$suggest$2d$existing$2d$characters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suggestExistingCharacters"])({
                    universeName,
                    userApiKey: state.userGoogleAiApiKey
                });
                suggestions = result.suggestedNames || [];
            } else {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$suggest$2d$original$2d$character$2d$concepts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suggestOriginalCharacterConcepts"])({
                    universeName,
                    userApiKey: state.userGoogleAiApiKey
                });
                suggestions = result.suggestedConcepts || [];
            }
            if (suggestions.length > 0) {
                let newSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
                if (suggestions.length > 1 && newSuggestion === playerCharacterConcept) {
                    const otherSuggestions = suggestions.filter((s)=>s !== playerCharacterConcept);
                    if (otherSuggestions.length > 0) {
                        newSuggestion = otherSuggestions[Math.floor(Math.random() * otherSuggestions.length)];
                    }
                }
                setPlayerCharacterConcept(newSuggestion);
                toast({
                    title: "Suggestion Applied!",
                    description: `Suggested: ${newSuggestion}`
                });
            } else {
                toast({
                    title: "No Suggestions",
                    description: "Could not find suggestions for this universe.",
                    variant: "default"
                });
            }
        } catch (err) {
            console.error("AdventureSetup: Failed to get name/concept suggestion:", err);
            toast({
                title: "Suggestion Error",
                description: "Could not fetch suggestions at this time.",
                variant: "destructive"
            });
        } finally{
            setIsSuggestingNameLoading(false);
        }
    };
    const handleProceed = async ()=>{
        setCustomError(null);
        if (!adventureTypeFromContext) {
            toast({
                title: "Adventure Type Missing",
                description: "Please return to main menu and select an adventure type.",
                variant: "destructive"
            });
            dispatch({
                type: "SET_GAME_STATUS",
                payload: "MainMenu"
            });
            return;
        }
        if (!validateSettings()) {
            toast({
                title: "Settings Incomplete",
                description: customError || `Please fill all required details for ${adventureTypeFromContext} adventure.`,
                variant: "destructive"
            });
            return;
        }
        const finalDifficulty = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VALID_ADVENTURE_DIFFICULTY_LEVELS"].includes(difficulty) ? difficulty : "Normal";
        const settingsPayload = {
            adventureType: adventureTypeFromContext,
            permanentDeath,
            difficulty: finalDifficulty,
            worldType,
            mainQuestline,
            genreTheme,
            magicSystem,
            techLevel,
            dominantTone,
            startingSituation,
            combatFrequency,
            puzzleFrequency,
            socialFocus,
            universeName,
            playerCharacterConcept,
            characterOriginType
        };
        dispatch({
            type: "SET_ADVENTURE_SETTINGS",
            payload: settingsPayload
        });
        // --- FLOW LOGIC ---
        if (state.character && (adventureTypeFromContext === "Randomized" || adventureTypeFromContext === "Immersed")) {
            // Randomized or Immersed with existing character -> START GAMEPLAY
            dispatch({
                type: "START_GAMEPLAY"
            });
            toast({
                title: "Adventure Starting!",
                description: "The world awaits..."
            });
        } else if (adventureTypeFromContext === "Custom") {
            // Custom flow -> GO TO CHARACTER CREATION
            dispatch({
                type: "SET_GAME_STATUS",
                payload: "CharacterCreation"
            });
            toast({
                title: "Adventure Setup Complete!",
                description: "Now, create your adventurer."
            });
        } else if (adventureTypeFromContext === "Immersed") {
            // Immersed flow (original character) -> GENERATE CHARACTER THEN START
            setIsLoadingImmersedCharacter(true);
            toast({
                title: "Fetching Character Lore...",
                description: `Preparing ${playerCharacterConcept} from ${universeName}...`
            });
            try {
                const aiProfile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$generate$2d$character$2d$description$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCharacterDescription"])({
                    characterDescription: playerCharacterConcept,
                    isImmersedMode: true,
                    universeName: universeName,
                    playerCharacterConcept: playerCharacterConcept,
                    userApiKey: state.userGoogleAiApiKey
                });
                const baseStats = {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialCharacterState"].stats
                };
                const randomStr = Math.floor(Math.random() * 5) + 3;
                const randomSta = Math.floor(Math.random() * 5) + 3;
                const randomWis = 15 - randomStr - randomSta;
                const finalStats = {
                    strength: randomStr,
                    stamina: randomSta,
                    wisdom: Math.max(1, randomWis)
                };
                const newCharacter = {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initialCharacterState"],
                    name: playerCharacterConcept,
                    description: aiProfile.detailedDescription || `Playing as ${playerCharacterConcept} from the universe of ${universeName}.`,
                    class: aiProfile.inferredClass || "Immersed Protagonist",
                    traits: aiProfile.inferredTraits || [],
                    knowledge: aiProfile.inferredKnowledge || [],
                    background: aiProfile.inferredBackground || `A character from the universe of ${universeName}.`,
                    stats: finalStats,
                    aiGeneratedDescription: aiProfile.detailedDescription,
                    maxHealth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(finalStats),
                    currentHealth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(finalStats),
                    maxStamina: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(finalStats),
                    currentStamina: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(finalStats),
                    maxMana: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMaxMana"])(finalStats, aiProfile.inferredKnowledge || []),
                    currentMana: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMaxMana"])(finalStats, aiProfile.inferredKnowledge || []),
                    learnedSkills: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStarterSkillsForClass"])(aiProfile.inferredClass || "Immersed Protagonist"),
                    xpToNextLevel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateXpToNextLevel"])(1),
                    skillTree: null,
                    skillTreeStage: 0
                };
                dispatch({
                    type: "CREATE_CHARACTER",
                    payload: newCharacter
                });
                dispatch({
                    type: "START_GAMEPLAY"
                });
                toast({
                    title: "Adventure Starting!",
                    description: `Stepping into the shoes of ${playerCharacterConcept} in the universe of ${universeName}!`
                });
            } catch (err) {
                console.error("AdventureSetup: Failed to generate immersed character profile:", err);
                toast({
                    title: "Character Profile Error",
                    description: "Could not retrieve character details. Please try again or define an original character.",
                    variant: "destructive"
                });
            } finally{
                setIsLoadingImmersedCharacter(false);
            }
        } else {
            console.error("AdventureSetup: Unhandled proceed logic. State:", state.status, "AdventureType:", adventureTypeFromContext, "Character exists:", !!state.character);
            toast({
                title: "Navigation Error",
                description: "Could not determine the next step.",
                variant: "destructive"
            });
        }
    };
    const handleBack = ()=>{
        dispatch({
            type: "RESET_GAME"
        });
    };
    if (!adventureTypeFromContext) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-screen p-4 bg-background",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CardboardCard"], {
                className: "w-full max-w-md text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                className: "text-2xl flex items-center justify-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        className: "w-6 h-6 text-destructive"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                        lineNumber: 244,
                                        columnNumber: 101
                                    }, this),
                                    " Error"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                lineNumber: 244,
                                columnNumber: 30
                            }, this),
                            " "
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                        lineNumber: 244,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: [
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted-foreground",
                                children: "Adventure type not selected. Please return to the main menu and choose an adventure type."
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                lineNumber: 245,
                                columnNumber: 31
                            }, this),
                            " "
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                        lineNumber: 245,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardFooter"], {
                        children: [
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: handleBack,
                                className: "w-full",
                                children: " Back to Main Menu "
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                lineNumber: 246,
                                columnNumber: 30
                            }, this),
                            " "
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                        lineNumber: 246,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                lineNumber: 243,
                columnNumber: 14
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
            lineNumber: 242,
            columnNumber: 9
        }, this);
    }
    const getAdventureTypeIcon = ()=>{
        switch(adventureTypeFromContext){
            case "Randomized":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dices$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Dices$3e$__["Dices"], {
                    className: "w-5 h-5 text-green-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                    lineNumber: 254,
                    columnNumber: 35
                }, this);
            case "Custom":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                    className: "w-5 h-5 text-blue-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                    lineNumber: 255,
                    columnNumber: 31
                }, this);
            case "Immersed":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                    className: "w-5 h-5 text-purple-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                    lineNumber: 256,
                    columnNumber: 33
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                    className: "w-5 h-5"
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                    lineNumber: 257,
                    columnNumber: 25
                }, this);
        }
    };
    const proceedButtonText = adventureTypeFromContext === "Custom" ? "Proceed to Character Creation" : "Start Adventure";
    const isProceedDisabled = isLoadingImmersedCharacter || isSuggestingNameLoading || adventureTypeFromContext === 'Custom' && (!worldType.trim() || !mainQuestline.trim() || !genreTheme || !magicSystem || !techLevel || !dominantTone || !startingSituation.trim()) || adventureTypeFromContext === 'Immersed' && (!universeName.trim() || !playerCharacterConcept.trim());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center min-h-screen p-4 bg-background",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CardboardCard"], {
            className: "w-full max-w-2xl shadow-xl border-2 border-foreground/20",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                    className: "border-b border-foreground/10 pb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                            className: "text-3xl font-bold text-center flex items-center justify-center gap-2",
                            children: [
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                    className: "w-7 h-7"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 272,
                                    columnNumber: 105
                                }, this),
                                " Adventure Setup "
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground text-center flex items-center justify-center gap-1.5 mt-1",
                            children: [
                                "Selected Type: ",
                                getAdventureTypeIcon(),
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: adventureTypeFromContext
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 274,
                                    columnNumber: 54
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 273,
                            columnNumber: 12
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                    lineNumber: 271,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "space-y-6 pt-6",
                    children: [
                        customError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                            variant: "destructive",
                            children: [
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                    children: customError
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 278,
                                    columnNumber: 59
                                }, this),
                                " "
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 278,
                            columnNumber: 29
                        }, this),
                        adventureTypeFromContext === "Randomized" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4 pt-2 text-center",
                            children: [
                                state.character && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-foreground",
                                    children: [
                                        "Character '",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold",
                                            children: state.character.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 282,
                                            columnNumber: 88
                                        }, this),
                                        "' is ready. Finalize your adventure settings below."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 282,
                                    columnNumber: 38
                                }, this),
                                !state.character && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground italic",
                                    children: "A unique world will be generated for your character."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 283,
                                    columnNumber: 39
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 281,
                            columnNumber: 14
                        }, this),
                        adventureTypeFromContext === "Custom" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4 border-t border-foreground/10 pt-6 mt-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-semibold mb-4 border-b pb-2",
                                    children: "Customize Your Adventure"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 289,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "worldType",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 293,
                                                                    columnNumber: 91
                                                                }, this),
                                                                " World Type"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 293,
                                                            columnNumber: 28
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                            id: "worldType",
                                                            value: worldType,
                                                            onChange: (e)=>setWorldType(e.target.value),
                                                            placeholder: "e.g., Forgotten Kingdom",
                                                            className: customError && !worldType.trim() ? 'border-destructive' : ''
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 294,
                                                            columnNumber: 28
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 292,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "mainQuestline",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__["ScrollText"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 297,
                                                                    columnNumber: 95
                                                                }, this),
                                                                " Main Questline (Goal)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 297,
                                                            columnNumber: 28
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                            id: "mainQuestline",
                                                            value: mainQuestline,
                                                            onChange: (e)=>setMainQuestline(e.target.value),
                                                            placeholder: "e.g., Find the Lost Artifact",
                                                            className: customError && !mainQuestline.trim() ? 'border-destructive' : ''
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 298,
                                                            columnNumber: 28
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 296,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "genreTheme",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 301,
                                                                    columnNumber: 93
                                                                }, this),
                                                                " Genre/Theme"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 301,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                            value: genreTheme,
                                                            onValueChange: (v)=>setGenreTheme(v),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                    id: "genreTheme",
                                                                    className: customError && !genreTheme ? 'border-destructive' : '',
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                        placeholder: "Select genre..."
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                        lineNumber: 303,
                                                                        columnNumber: 131
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 303,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "High Fantasy",
                                                                            children: "High Fantasy"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 305,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Dark Fantasy",
                                                                            children: "Dark Fantasy"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 305,
                                                                            columnNumber: 95
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Sci-Fi (Cyberpunk)",
                                                                            children: "Sci-Fi (Cyberpunk)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 306,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Sci-Fi (Space Opera)",
                                                                            children: "Sci-Fi (Space Opera)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 306,
                                                                            columnNumber: 107
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Post-Apocalyptic",
                                                                            children: "Post-Apocalyptic"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 307,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Horror",
                                                                            children: "Horror"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 307,
                                                                            columnNumber: 103
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Mystery",
                                                                            children: "Mystery"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 308,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Urban Fantasy",
                                                                            children: "Urban Fantasy"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 308,
                                                                            columnNumber: 85
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 304,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 302,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 300,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "magicSystem",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 313,
                                                                    columnNumber: 94
                                                                }, this),
                                                                " Magic System"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 313,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                            value: magicSystem,
                                                            onValueChange: (v)=>setMagicSystem(v),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                    id: "magicSystem",
                                                                    className: customError && !magicSystem ? 'border-destructive' : '',
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                        placeholder: "Select magic system..."
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                        lineNumber: 315,
                                                                        columnNumber: 133
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 315,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "High Magic (Common & Powerful)",
                                                                            children: "High Magic"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 317,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Low Magic (Rare & Subtle)",
                                                                            children: "Low Magic"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 317,
                                                                            columnNumber: 111
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Elemental Magic",
                                                                            children: "Elemental Magic"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 318,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Psionics",
                                                                            children: "Psionics"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 318,
                                                                            columnNumber: 101
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "No Magic",
                                                                            children: "No Magic"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 318,
                                                                            columnNumber: 151
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 316,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 314,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "startingSituation",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 323,
                                                                    columnNumber: 100
                                                                }, this),
                                                                " Starting Situation"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 323,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                            id: "startingSituation",
                                                            value: startingSituation,
                                                            onChange: (e)=>setStartingSituation(e.target.value),
                                                            placeholder: "e.g., Waking up with amnesia",
                                                            className: customError && !startingSituation.trim() ? 'border-destructive' : ''
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 324,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 322,
                                                    columnNumber: 24
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 291,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "techLevel",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$atom$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Atom$3e$__["Atom"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 329,
                                                                    columnNumber: 92
                                                                }, this),
                                                                " Technological Level"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 329,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                            value: techLevel,
                                                            onValueChange: (v)=>setTechLevel(v),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                    id: "techLevel",
                                                                    className: customError && !techLevel ? 'border-destructive' : '',
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                        placeholder: "Select tech level..."
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                        lineNumber: 331,
                                                                        columnNumber: 129
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 331,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Primitive",
                                                                            children: "Primitive"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 333,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Medieval",
                                                                            children: "Medieval"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 333,
                                                                            columnNumber: 89
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Renaissance",
                                                                            children: "Renaissance"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 334,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Industrial",
                                                                            children: "Industrial"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 334,
                                                                            columnNumber: 93
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Modern",
                                                                            children: "Modern"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 335,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Futuristic",
                                                                            children: "Futuristic"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 335,
                                                                            columnNumber: 83
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 332,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 330,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "dominantTone",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$drama$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Drama$3e$__["Drama"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 340,
                                                                    columnNumber: 95
                                                                }, this),
                                                                " Dominant Tone"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 340,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                            value: dominantTone,
                                                            onValueChange: (v)=>setDominantTone(v),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                    id: "dominantTone",
                                                                    className: customError && !dominantTone ? 'border-destructive' : '',
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                        placeholder: "Select tone..."
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                        lineNumber: 342,
                                                                        columnNumber: 135
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 342,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Heroic & Optimistic",
                                                                            children: "Heroic & Optimistic"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 344,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Grim & Perilous",
                                                                            children: "Grim & Perilous"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 344,
                                                                            columnNumber: 109
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Mysterious & Eerie",
                                                                            children: "Mysterious & Eerie"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 345,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Comedic & Lighthearted",
                                                                            children: "Comedic & Lighthearted"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 345,
                                                                            columnNumber: 107
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Serious & Political",
                                                                            children: "Serious & Political"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 346,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 343,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 341,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "combatFrequency",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 351,
                                                                    columnNumber: 98
                                                                }, this),
                                                                " Combat Frequency"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 351,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                            value: combatFrequency,
                                                            onValueChange: (v)=>setCombatFrequency(v),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                    id: "combatFrequency",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                        placeholder: "Select combat frequency..."
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                        lineNumber: 353,
                                                                        columnNumber: 69
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 353,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "High",
                                                                            children: "High"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 355,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Medium",
                                                                            children: "Medium"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 355,
                                                                            columnNumber: 79
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Low",
                                                                            children: "Low"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 355,
                                                                            columnNumber: 125
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "None (Focus on Puzzles/Social)",
                                                                            children: "None (Focus on Puzzles/Social)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 356,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 354,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 352,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 350,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "puzzleFrequency",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$puzzle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Puzzle$3e$__["Puzzle"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 361,
                                                                    columnNumber: 98
                                                                }, this),
                                                                " Puzzle/Riddle Frequency"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 361,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                            value: puzzleFrequency,
                                                            onValueChange: (v)=>setPuzzleFrequency(v),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                    id: "puzzleFrequency",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                        placeholder: "Select puzzle frequency..."
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                        lineNumber: 363,
                                                                        columnNumber: 69
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 363,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "High",
                                                                            children: "High"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 365,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Medium",
                                                                            children: "Medium"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 365,
                                                                            columnNumber: 79
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Low",
                                                                            children: "Low"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 365,
                                                                            columnNumber: 125
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 364,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 362,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 360,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "socialFocus",
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 370,
                                                                    columnNumber: 94
                                                                }, this),
                                                                " Social Interaction Focus"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 370,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                            value: socialFocus,
                                                            onValueChange: (v)=>setSocialFocus(v),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                    id: "socialFocus",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                        placeholder: "Select social focus..."
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                        lineNumber: 372,
                                                                        columnNumber: 65
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 372,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "High (Many NPCs, Dialogue Choices)",
                                                                            children: "High"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 374,
                                                                            columnNumber: 37
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Medium",
                                                                            children: "Medium"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 374,
                                                                            columnNumber: 109
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                            value: "Low (More Exploration/Combat)",
                                                                            children: "Low"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                            lineNumber: 374,
                                                                            columnNumber: 155
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                                    lineNumber: 373,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 371,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 369,
                                                    columnNumber: 24
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 327,
                                            columnNumber: 20
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 290,
                                    columnNumber: 16
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 288,
                            columnNumber: 13
                        }, this),
                        adventureTypeFromContext === "Immersed" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4 border-t border-foreground/10 pt-6 mt-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-semibold mb-4 border-b pb-2",
                                    children: "Immersed Adventure Details"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 384,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: "universeName",
                                            className: "flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 386,
                                                    columnNumber: 86
                                                }, this),
                                                " Universe Name"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 386,
                                            columnNumber: 20
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            id: "universeName",
                                            value: universeName,
                                            onChange: (e)=>setUniverseName(e.target.value),
                                            placeholder: "e.g., Star Wars, Lord of the Rings, Hogwarts",
                                            className: customError && !universeName.trim() ? 'border-destructive' : ''
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 387,
                                            columnNumber: 20
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 385,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioGroup"], {
                                    value: characterOriginType,
                                    onValueChange: (value)=>{
                                        setCharacterOriginType(value);
                                        setPlayerCharacterConcept("");
                                    },
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            className: "text-base font-medium",
                                            children: "Character Origin:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 394,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioGroupItem"], {
                                                    value: "existing",
                                                    id: "origin-existing"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 396,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                    htmlFor: "origin-existing",
                                                    className: "flex items-center gap-1 cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 397,
                                                            columnNumber: 109
                                                        }, this),
                                                        " Play as Existing Character"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 397,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 395,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$radio$2d$group$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioGroupItem"], {
                                                    value: "original",
                                                    id: "origin-original"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 400,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                    htmlFor: "origin-original",
                                                    className: "flex items-center gap-1 cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 401,
                                                            columnNumber: 109
                                                        }, this),
                                                        " Create Original Character"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 401,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 399,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 390,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: "playerCharacterConcept",
                                            className: "flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scroll$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ScrollText$3e$__["ScrollText"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 406,
                                                    columnNumber: 97
                                                }, this),
                                                characterOriginType === 'existing' ? "Existing Character's Name" : "Your Original Character Concept/Role"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 406,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                    id: "playerCharacterConcept",
                                                    value: playerCharacterConcept,
                                                    onChange: (e)=>setPlayerCharacterConcept(e.target.value),
                                                    placeholder: characterOriginType === 'existing' ? "e.g., Harry Potter, Luke Skywalker" : "e.g., A rebel pilot, a new student at Hogwarts",
                                                    className: `flex-grow ${customError && !playerCharacterConcept.trim() ? 'border-destructive' : ''}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 410,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    type: "button",
                                                    variant: "outline",
                                                    size: "icon",
                                                    onClick: handleSuggestName,
                                                    disabled: isSuggestingNameLoading || !universeName.trim(),
                                                    "aria-label": "Suggest Character Name/Concept",
                                                    children: isSuggestingNameLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "h-4 w-4 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 54
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__["Lightbulb"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 101
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 416,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 409,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 405,
                                    columnNumber: 16
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 383,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4 border-t border-foreground/10 pt-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                    htmlFor: "difficulty-select",
                                    className: "text-xl font-semibold flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__["ShieldAlert"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 432,
                                            columnNumber: 110
                                        }, this),
                                        "Select Difficulty"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 432,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                    value: difficulty,
                                    onValueChange: (value)=>setDifficulty(value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                            id: "difficulty-select",
                                            className: "w-full",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                placeholder: "Select difficulty..."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                lineNumber: 434,
                                                columnNumber: 78
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 434,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                    value: "Easy",
                                                    children: "Easy - Fewer challenges, more forgiving."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 436,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                    value: "Normal",
                                                    children: "Normal - A balanced experience."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 437,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                    value: "Hard",
                                                    children: "Hard - Tougher encounters, requires strategy."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 438,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                    value: "Nightmare",
                                                    children: "Nightmare - Extreme challenge, for veterans."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 439,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 435,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 433,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: "Difficulty affects challenge level, AI behavior, and potential events."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 442,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 431,
                            columnNumber: 12
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4 border-t border-foreground/10 pt-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                    className: "text-xl font-semibold flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__["Skull"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 446,
                                            columnNumber: 78
                                        }, this),
                                        "Choose Challenge Mode"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 446,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between space-x-2 p-4 border-2 rounded-md bg-card/50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                    htmlFor: "permanent-death",
                                                    className: "font-medium flex items-center gap-1 cursor-pointer",
                                                    children: [
                                                        " ",
                                                        permanentDeath ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skull$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Skull$3e$__["Skull"], {
                                                            className: "w-4 h-4 text-destructive"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 449,
                                                            columnNumber: 133
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                            className: "w-4 h-4 text-green-600"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                            lineNumber: 449,
                                                            columnNumber: 181
                                                        }, this),
                                                        " ",
                                                        permanentDeath ? "Permanent Death" : "Respawn Enabled",
                                                        " "
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 449,
                                                    columnNumber: 18
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-muted-foreground pr-2",
                                                    children: [
                                                        " ",
                                                        permanentDeath ? "Your adventure ends permanently if you die." : "You can respawn at a checkpoint before death.",
                                                        " "
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                                    lineNumber: 450,
                                                    columnNumber: 18
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 448,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Switch"], {
                                            id: "permanent-death",
                                            checked: permanentDeath,
                                            onCheckedChange: setPermanentDeath,
                                            "aria-label": `Toggle ${permanentDeath ? 'Permanent Death off' : 'Permanent Death on'}`
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                            lineNumber: 452,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 447,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 445,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                    lineNumber: 277,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardFooter"], {
                    className: "flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-foreground/10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            onClick: handleBack,
                            disabled: isLoadingImmersedCharacter || isSuggestingNameLoading,
                            children: [
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    className: "mr-2 h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 457,
                                    columnNumber: 125
                                }, this),
                                " Back to Main Menu "
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 457,
                            columnNumber: 12
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleProceed,
                            disabled: isProceedDisabled,
                            className: "bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto",
                            children: [
                                (isLoadingImmersedCharacter || isSuggestingNameLoading) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "mr-2 h-4 w-4 animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                                    lineNumber: 459,
                                    columnNumber: 73
                                }, this),
                                isLoadingImmersedCharacter ? "Preparing Character..." : isSuggestingNameLoading ? "Suggesting..." : proceedButtonText
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                            lineNumber: 458,
                            columnNumber: 12
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/screens/AdventureSetup.tsx",
                    lineNumber: 456,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/screens/AdventureSetup.tsx",
            lineNumber: 270,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/screens/AdventureSetup.tsx",
        lineNumber: 269,
        columnNumber: 5
    }, this);
}
_s(AdventureSetup, "wHRrzlzKM5G7F/STkBdhpD5CZI0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = AdventureSetup;
var _c;
__turbopack_context__.k.register(_c, "AdventureSetup");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/screens/Gameplay.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/components/screens/Gameplay.tsx
__turbopack_context__.s({
    "Gameplay": (()=>Gameplay)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$narrate$2d$adventure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/flows/narrate-adventure.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$summarize$2d$adventure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/flows/summarize-adventure.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$assess$2d$action$2d$difficulty$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/flows/assess-action-difficulty.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$generate$2d$skill$2d$tree$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/flows/generate-skill-tree.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$attempt$2d$crafting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/flows/attempt-crafting.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game-state-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$SettingsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/screens/SettingsPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$LeftPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/game/LeftPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$NarrationDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/gameplay/NarrationDisplay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$ActionInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/gameplay/ActionInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$GameplayActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/gameplay/GameplayActions.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$CraftingDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/gameplay/CraftingDialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$ClassChangeDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/gameplay/ClassChangeDialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$MobileSheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/gameplay/MobileSheet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$mobile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-mobile.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/sheet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tooltip.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// --- Dice Roller Service (Embedded) ---
const localRollDie = (sides)=>{
    if (sides < 1) throw new Error("Sides must be at least 1.");
    return Math.floor(Math.random() * sides) + 1;
};
const localGetDiceRollFunction = (diceType)=>{
    switch(diceType?.toLowerCase()){
        case 'd6':
            return ()=>localRollDie(6);
        case 'd10':
            return ()=>localRollDie(10);
        case 'd20':
            return ()=>localRollDie(20);
        case 'd100':
            return ()=>localRollDie(100);
        case 'none':
        default:
            return null;
    }
};
// --- End Dice Roller Service ---
const GENERIC_BRANCHING_CHOICES = [
    {
        text: "Look around more closely.",
        consequenceHint: "May reveal new details."
    },
    {
        text: "Consider your next move carefully.",
        consequenceHint: "Take a moment to think."
    },
    {
        text: "Check your inventory.",
        consequenceHint: "Review your belongings."
    },
    {
        text: "Rest for a moment.",
        consequenceHint: "Conserve your strength."
    }
];
const INITIAL_ACTION_STRING = "Begin the adventure by looking around.";
function Gameplay() {
    _s();
    const { state, dispatch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"])();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const { character, currentNarration, currentGameStateString, storyLog, adventureSettings, inventory, currentAdventureId, isGeneratingSkillTree: contextIsGeneratingSkillTree, turnCount, userGoogleAiApiKey } = state;
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // For subsequent narrations
    const [isInitialLoading, setIsInitialLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true); // Specifically for the first narration
    const [isEnding, setIsEnding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSaving, setIsSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAssessingDifficulty, setIsAssessingDifficulty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isRollingDice, setIsRollingDice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isCraftingLoading, setIsCraftingLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [localIsGeneratingSkillTree, setLocalIsGeneratingSkillTree] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [lastPlayerAction, setLastPlayerAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [diceResult, setDiceResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [diceType, setDiceType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("None");
    const [pendingClassChange, setPendingClassChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [branchingChoices, setBranchingChoices] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(GENERIC_BRANCHING_CHOICES);
    const [isCraftingDialogOpen, setIsCraftingDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const initialSetupAttemptedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({});
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$mobile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIsMobile"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Gameplay.useEffect": ()=>{
            if (contextIsGeneratingSkillTree !== localIsGeneratingSkillTree) {
                setLocalIsGeneratingSkillTree(contextIsGeneratingSkillTree);
            }
        }
    }["Gameplay.useEffect"], [
        contextIsGeneratingSkillTree,
        localIsGeneratingSkillTree
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Gameplay.useEffect": ()=>{
            console.log("Gameplay: currentAdventureId changed or component mounted. Resetting relevant states. New ID:", currentAdventureId);
            setIsInitialLoading(true);
            setError(null);
            setLastPlayerAction(null); // Reset last action for new adventure
            setBranchingChoices(GENERIC_BRANCHING_CHOICES);
            // Reset the attempted flag for the new adventure
            if (currentAdventureId) {
                initialSetupAttemptedRef.current = {
                    [currentAdventureId]: false
                };
            } else {
                initialSetupAttemptedRef.current = {};
            }
        }
    }["Gameplay.useEffect"], [
        currentAdventureId
    ]);
    const handleEndAdventure = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[handleEndAdventure]": async (finalNarrationEntry, characterIsDefeated = false)=>{
            if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || localIsGeneratingSkillTree || contextIsGeneratingSkillTree || isCraftingLoading) return;
            console.log("Gameplay: Initiating end adventure. Defeated:", characterIsDefeated);
            setIsEnding(true);
            setError(null);
            toast({
                title: characterIsDefeated ? "Character Defeated" : "Ending Adventure",
                description: "Summarizing your tale..."
            });
            const finalLogToSummarize = [
                ...storyLog
            ];
            if (finalNarrationEntry && (!storyLog.length || storyLog[storyLog.length - 1].narration !== finalNarrationEntry.narration)) {
                finalLogToSummarize.push(finalNarrationEntry);
            }
            let summary = characterIsDefeated ? "Your character has been defeated." : "Your adventure has concluded.";
            const hasLog = finalLogToSummarize.length > 0;
            if (hasLog && character) {
                const fullStory = finalLogToSummarize.map({
                    "Gameplay.useCallback[handleEndAdventure].fullStory": (log, index)=>`[Turn ${index + 1}]\n${log.narration}`
                }["Gameplay.useCallback[handleEndAdventure].fullStory"]).join("\n\n---\n\n");
                if (fullStory.trim().length > 0) {
                    try {
                        const summaryResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$summarize$2d$adventure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["summarizeAdventure"])({
                            story: fullStory,
                            userApiKey: userGoogleAiApiKey
                        });
                        summary = summaryResult.summary;
                        toast({
                            title: "Summary Generated",
                            description: "View your adventure outcome."
                        });
                    } catch (summaryError) {
                        console.error("Gameplay: Summarize adventure error:", summaryError);
                        summary = `Could not generate a summary due to an error: ${summaryError.message || 'Unknown error'}. ${summary}`;
                        toast({
                            title: "Summary Error",
                            description: "Failed to generate summary.",
                            variant: "destructive"
                        });
                    }
                }
            }
            dispatch({
                type: "END_ADVENTURE",
                payload: {
                    summary,
                    finalNarration: finalNarrationEntry
                }
            });
            setIsEnding(false);
        }
    }["Gameplay.useCallback[handleEndAdventure]"], [
        isLoading,
        isEnding,
        isSaving,
        isAssessingDifficulty,
        isRollingDice,
        localIsGeneratingSkillTree,
        contextIsGeneratingSkillTree,
        storyLog,
        dispatch,
        toast,
        character,
        isCraftingLoading,
        userGoogleAiApiKey
    ]);
    const handlePlayerAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[handlePlayerAction]": async (action, isInitialAction = false)=>{
            console.log(`Gameplay: handlePlayerAction called. Action: "${action.substring(0, 50)}...", isInitialAction: ${isInitialAction}`);
            if (!character) {
                toast({
                    title: "Error",
                    description: "Character data is missing.",
                    variant: "destructive"
                });
                if (isInitialAction) setIsInitialLoading(false);
                console.error("Gameplay: Character is null in handlePlayerAction.");
                return;
            }
            setLastPlayerAction(action); // Store the action being processed
            if (isInitialAction) {
                setIsInitialLoading(true);
                console.log("Gameplay: handlePlayerAction - Initial action. isInitialLoading set to true.");
            } else {
                setIsLoading(true);
            }
            setError(null);
            setDiceResult(null);
            setDiceType("None");
            let actionWithDice = action;
            let assessedDifficulty = "Normal";
            let requiresRoll = false;
            let rollFunction = null;
            try {
                if (character.class === 'admin000') {
                    // Dev commands are now handled synchronously inside Gameplay.tsx to directly dispatch state changes
                    return;
                }
                const actionLower = action.trim().toLowerCase();
                const isPassiveAction = [
                    INITIAL_ACTION_STRING.toLowerCase(),
                    "look",
                    "look around",
                    "check inventory",
                    "check status",
                    "check relationships",
                    "check reputation"
                ].includes(actionLower);
                if (!isInitialAction && !isPassiveAction) {
                    setIsAssessingDifficulty(true);
                    toast({
                        title: "Assessing Challenge...",
                        duration: 1000
                    });
                    await new Promise({
                        "Gameplay.useCallback[handlePlayerAction]": (resolve)=>setTimeout(resolve, 150)
                    }["Gameplay.useCallback[handlePlayerAction]"]);
                    const repString = character.reputation ? Object.entries(character.reputation).map({
                        "Gameplay.useCallback[handlePlayerAction]": ([f, s])=>`${f}: ${s}`
                    }["Gameplay.useCallback[handlePlayerAction]"]).join(', ') || 'None' : 'None';
                    const relString = character.npcRelationships ? Object.entries(character.npcRelationships).map({
                        "Gameplay.useCallback[handlePlayerAction]": ([n, s])=>`${n}: ${s}`
                    }["Gameplay.useCallback[handlePlayerAction]"]).join(', ') || 'None' : 'None';
                    const capabilitiesSummary = `Lvl: ${character.level}. Class: ${character.class}. Stage: ${character.skillTreeStage}. Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, WIS ${character.stats.wisdom}. Health: ${character.currentHealth}/${character.maxHealth}. Action STA: ${character.currentStamina}/${character.maxStamina}. Mana: ${character.currentMana}/${character.maxMana}. Traits: ${character.traits.join(', ') || 'None'}. Knowledge: ${character.knowledge.join(', ') || 'None'}. Background: ${character.background}. Inventory: ${inventory.map({
                        "Gameplay.useCallback[handlePlayerAction]": (i)=>i.name
                    }["Gameplay.useCallback[handlePlayerAction]"]).join(', ') || 'Empty'}. Learned Skills: ${character.learnedSkills.map({
                        "Gameplay.useCallback[handlePlayerAction]": (s)=>s.name
                    }["Gameplay.useCallback[handlePlayerAction]"]).join(', ') || 'None'}. Rep: ${repString}. Rel: ${relString}`;
                    const assessmentInput = {
                        playerAction: action,
                        characterCapabilities: capabilitiesSummary,
                        characterClass: character.class,
                        currentSituation: currentNarration?.narration || "At the beginning of the scene.",
                        gameStateSummary: currentGameStateString,
                        gameDifficulty: adventureSettings.difficulty,
                        turnCount: turnCount,
                        userApiKey: userGoogleAiApiKey
                    };
                    const assessmentResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$assess$2d$action$2d$difficulty$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assessActionDifficulty"])(assessmentInput);
                    setIsAssessingDifficulty(false);
                    assessedDifficulty = assessmentResult.difficulty;
                    setDiceType(assessmentResult.suggestedDice);
                    rollFunction = localGetDiceRollFunction(assessmentResult.suggestedDice);
                    requiresRoll = assessedDifficulty !== "Trivial" && assessedDifficulty !== "Impossible" && rollFunction !== null;
                    toast({
                        title: `Action Difficulty: ${assessedDifficulty}`,
                        description: assessmentResult.reasoning.substring(0, 100),
                        duration: 1500
                    });
                    await new Promise({
                        "Gameplay.useCallback[handlePlayerAction]": (resolve)=>setTimeout(resolve, 200)
                    }["Gameplay.useCallback[handlePlayerAction]"]);
                    if (assessedDifficulty === "Impossible") {
                        const impossibleActionLog = {
                            narration: `Narrator: Your attempt to "${action}" is deemed impossible. ${assessmentResult.reasoning}`,
                            updatedGameState: currentGameStateString,
                            timestamp: Date.now(),
                            branchingChoices: GENERIC_BRANCHING_CHOICES
                        };
                        dispatch({
                            type: "UPDATE_NARRATION",
                            payload: impossibleActionLog
                        });
                        setBranchingChoices(GENERIC_BRANCHING_CHOICES);
                        toast({
                            title: "Action Impossible",
                            description: assessmentResult.reasoning,
                            variant: "destructive",
                            duration: 4000
                        });
                        return; // Return early as the action doesn't proceed to narration
                    }
                } else {
                    requiresRoll = false;
                    assessedDifficulty = "Trivial";
                    setDiceType("None");
                }
                if (requiresRoll && rollFunction) {
                    setIsRollingDice(true);
                    toast({
                        title: `Rolling ${diceType}...`,
                        duration: 1000
                    });
                    await new Promise({
                        "Gameplay.useCallback[handlePlayerAction]": (resolve)=>setTimeout(resolve, 200)
                    }["Gameplay.useCallback[handlePlayerAction]"]);
                    const roll = rollFunction();
                    setDiceResult(roll);
                    const numericDiceType = parseInt(diceType.substring(1), 10);
                    if (!isNaN(numericDiceType) && numericDiceType > 0) {
                        actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll Result: ${roll}/${numericDiceType})`;
                    } else {
                        actionWithDice += ` (Difficulty: ${assessedDifficulty}, Roll: ${roll})`;
                    }
                    await new Promise({
                        "Gameplay.useCallback[handlePlayerAction]": (resolve)=>setTimeout(resolve, 100)
                    }["Gameplay.useCallback[handlePlayerAction]"]);
                    setIsRollingDice(false);
                    await new Promise({
                        "Gameplay.useCallback[handlePlayerAction]": (resolve)=>setTimeout(resolve, 1400)
                    }["Gameplay.useCallback[handlePlayerAction]"]); // Time for user to see dice result
                    setDiceResult(null); // Clear dice result
                } else if (!isPassiveAction && assessedDifficulty !== "Impossible" && diceType !== 'None') {
                    actionWithDice += ` (Difficulty: ${assessedDifficulty}, No Roll Required)`;
                }
                let skillTreeSummaryForAI = null;
                if (character.skillTree && character.skillTreeStage >= 0) {
                    const currentStageData = character.skillTree.stages.find({
                        "Gameplay.useCallback[handlePlayerAction].currentStageData": (s)=>s.stage === character.skillTreeStage
                    }["Gameplay.useCallback[handlePlayerAction].currentStageData"]);
                    skillTreeSummaryForAI = {
                        className: character.skillTree.className,
                        stageCount: character.skillTree.stages.length,
                        availableSkillsAtCurrentStage: currentStageData ? currentStageData.skills.map({
                            "Gameplay.useCallback[handlePlayerAction]": (s)=>s.name
                        }["Gameplay.useCallback[handlePlayerAction]"]) : []
                    };
                }
                const reputationString = character.reputation ? JSON.stringify(character.reputation) : "{}";
                const npcRelationshipsString = character.npcRelationships ? JSON.stringify(character.npcRelationships) : "{}";
                const inputForAI = {
                    character: {
                        name: character.name,
                        class: character.class,
                        description: character.description,
                        traits: character.traits,
                        knowledge: character.knowledge,
                        background: character.background,
                        stats: character.stats,
                        currentHealth: character.currentHealth,
                        maxHealth: character.maxHealth,
                        currentStamina: character.currentStamina,
                        maxStamina: character.maxStamina,
                        currentMana: character.currentMana,
                        maxMana: character.maxMana,
                        level: character.level,
                        xp: character.xp,
                        xpToNextLevel: character.xpToNextLevel,
                        reputationString,
                        npcRelationshipsString,
                        skillTreeSummary: skillTreeSummaryForAI,
                        skillTreeStage: character.skillTreeStage,
                        learnedSkills: character.learnedSkills.map({
                            "Gameplay.useCallback[handlePlayerAction]": (s)=>s.name
                        }["Gameplay.useCallback[handlePlayerAction]"]),
                        aiGeneratedDescription: character.aiGeneratedDescription
                    },
                    playerChoice: actionWithDice,
                    gameState: currentGameStateString,
                    previousNarration: storyLog.length > 0 ? storyLog[storyLog.length - 1].narration : undefined,
                    adventureSettings: adventureSettings,
                    turnCount: turnCount,
                    userApiKey: userGoogleAiApiKey
                };
                const narrationResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$narrate$2d$adventure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["narrateAdventure"])(inputForAI);
                // Fallback handling is now mostly inside narrateAdventureFlow, but we check again
                if (narrationResult && narrationResult.narration && narrationResult.updatedGameState) {
                    const gainedSkillTyped = narrationResult.gainedSkill ? {
                        ...narrationResult.gainedSkill,
                        type: narrationResult.gainedSkill.type === 'Starter' || narrationResult.gainedSkill.type === 'Learned' ? narrationResult.gainedSkill.type : 'Learned'
                    } : undefined;
                    const logEntryPayload = {
                        ...narrationResult,
                        timestamp: Date.now(),
                        gainedSkill: gainedSkillTyped
                    };
                    dispatch({
                        type: "UPDATE_NARRATION",
                        payload: logEntryPayload
                    });
                    setBranchingChoices(narrationResult.branchingChoices ?? GENERIC_BRANCHING_CHOICES);
                    // Toasts for positive feedback
                    if (narrationResult.dynamicEventTriggered) toast({
                        title: "Dynamic Event!",
                        description: narrationResult.dynamicEventTriggered,
                        duration: 4000,
                        className: "border-purple-500"
                    });
                    if (narrationResult.xpGained && narrationResult.xpGained > 0) toast({
                        title: `Gained ${narrationResult.xpGained} XP!`,
                        duration: 3000,
                        className: "bg-yellow-100 dark:bg-yellow-900 border-yellow-500"
                    });
                    if (narrationResult.reputationChange) {
                        const { faction, change } = narrationResult.reputationChange;
                        const dir = change > 0 ? 'increased' : 'worsened';
                        toast({
                            title: `Reputation with ${faction} ${dir} by ${Math.abs(change)}!`,
                            duration: 3000
                        });
                    }
                    if (narrationResult.npcRelationshipChange) {
                        const { npcName, change } = narrationResult.npcRelationshipChange;
                        const dir = change > 0 ? 'improved' : 'worsened';
                        toast({
                            title: `Relationship with ${npcName} ${dir} by ${Math.abs(change)}!`,
                            duration: 3000
                        });
                    }
                    if (narrationResult.progressedToStage && narrationResult.progressedToStage > character.skillTreeStage) {
                        const stageName = character.skillTree?.stages.find({
                            "Gameplay.useCallback[handlePlayerAction]": (s)=>s.stage === narrationResult.progressedToStage
                        }["Gameplay.useCallback[handlePlayerAction]"])?.stageName || `Stage ${narrationResult.progressedToStage}`;
                        toast({
                            title: "Skill Stage Increased!",
                            description: `You've reached ${stageName} (Stage ${narrationResult.progressedToStage})!`,
                            duration: 4000,
                            className: "bg-purple-100 dark:bg-purple-900 border-purple-500"
                        });
                    }
                    if (narrationResult.gainedSkill) toast({
                        title: "Skill Learned!",
                        description: `You gained: ${narrationResult.gainedSkill.name}!`,
                        duration: 4000
                    });
                    if (narrationResult.suggestedClassChange && narrationResult.suggestedClassChange !== character.class && adventureSettings.adventureType !== "Immersed") setPendingClassChange(narrationResult.suggestedClassChange);
                    const updatedChar = state.character; // This will be updated after dispatch
                    if (narrationResult.isCharacterDefeated && updatedChar && updatedChar.currentHealth <= 0) {
                        if (adventureSettings.permanentDeath) {
                            await handleEndAdventure(logEntryPayload, true);
                        } else {
                            dispatch({
                                type: "RESPAWN_CHARACTER",
                                payload: {
                                    narrationMessage: `${character.name} was defeated but managed to escape death's grasp this time!`
                                }
                            });
                            toast({
                                title: "Defeated!",
                                description: "You narrowly escaped death! Your health and resources are restored.",
                                variant: "destructive",
                                duration: 5000
                            });
                        }
                    }
                } else {
                    // This path should ideally not be hit if narrateAdventureFlow has robust fallbacks.
                    setError("Narration failed: AI did not return a valid response. Try a different action or retry.");
                    setBranchingChoices(GENERIC_BRANCHING_CHOICES);
                    toast({
                        title: "Narration Error",
                        description: "AI failed to respond. Please try again.",
                        variant: "destructive"
                    });
                }
            } catch (err) {
                console.error("Gameplay: Error in handlePlayerAction:", err);
                setError(`An unexpected error occurred while processing your action: ${err.message}`);
                setBranchingChoices(GENERIC_BRANCHING_CHOICES); // Ensure choices are available even on error
                toast({
                    title: "Unexpected Error",
                    description: "Something went wrong processing your action.",
                    variant: "destructive"
                });
            } finally{
                if (isInitialAction) {
                    console.log("Gameplay: handlePlayerAction - Initial action finished, isInitialLoading set to false.");
                    setIsInitialLoading(false);
                }
                setIsLoading(false);
                if (isAssessingDifficulty) setIsAssessingDifficulty(false);
                if (isRollingDice) setIsRollingDice(false);
                console.log(`Gameplay: handlePlayerAction finished. Action: "${action.substring(0, 50)}...". Loading states reset.`);
            }
        }
    }["Gameplay.useCallback[handlePlayerAction]"], [
        character,
        inventory,
        isLoading,
        isEnding,
        isSaving,
        isAssessingDifficulty,
        isRollingDice,
        localIsGeneratingSkillTree,
        contextIsGeneratingSkillTree,
        currentGameStateString,
        currentNarration,
        storyLog,
        adventureSettings,
        turnCount,
        dispatch,
        toast,
        handleEndAdventure,
        isCraftingLoading,
        userGoogleAiApiKey
    ]);
    const handleRetryNarration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[handleRetryNarration]": ()=>{
            let actionToRetry = lastPlayerAction;
            let isRetryInitial = false;
            if (!actionToRetry && storyLog.length === 0) {
                actionToRetry = INITIAL_ACTION_STRING;
                isRetryInitial = true;
                console.log("Gameplay: Retrying initial narration because no last action and story log is empty.");
            } else if (actionToRetry === INITIAL_ACTION_STRING) {
                isRetryInitial = true;
            }
            if (actionToRetry) {
                toast({
                    title: "Retrying AI Narration...",
                    description: `Re-sending action: "${actionToRetry.substring(0, 30)}..."`
                });
                handlePlayerAction(actionToRetry, isRetryInitial);
            } else {
                toast({
                    title: "Cannot Retry",
                    description: "No previous action to retry, and initial narration was already attempted.",
                    variant: "destructive"
                });
            }
        }
    }["Gameplay.useCallback[handleRetryNarration]"], [
        lastPlayerAction,
        handlePlayerAction,
        toast,
        storyLog.length
    ]);
    const triggerSkillTreeGeneration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[triggerSkillTreeGeneration]": async (charClass)=>{
            if (!charClass || adventureSettings.adventureType === "Immersed") {
                if (contextIsGeneratingSkillTree) dispatch({
                    type: "SET_SKILL_TREE_GENERATING",
                    payload: false
                });
                setLocalIsGeneratingSkillTree(false);
                return character?.skillTree || null;
            }
            if (character && character.skillTree && character.skillTree.className === charClass) {
                if (contextIsGeneratingSkillTree) dispatch({
                    type: "SET_SKILL_TREE_GENERATING",
                    payload: false
                });
                setLocalIsGeneratingSkillTree(false);
                return character.skillTree;
            }
            dispatch({
                type: "SET_SKILL_TREE_GENERATING",
                payload: true
            });
            setLocalIsGeneratingSkillTree(true);
            setError(null);
            toast({
                title: "Generating Skill Tree...",
                description: `Crafting abilities for the ${charClass} class...`,
                duration: 3000
            });
            try {
                const skillTreeResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$generate$2d$skill$2d$tree$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSkillTree"])({
                    characterClass: charClass,
                    userApiKey: userGoogleAiApiKey
                });
                if (skillTreeResult && skillTreeResult.stages.length === 5) {
                    dispatch({
                        type: "SET_SKILL_TREE",
                        payload: {
                            class: charClass,
                            skillTree: skillTreeResult
                        }
                    });
                    toast({
                        title: "Skill Tree Generated!",
                        description: `The path of the ${charClass} is set.`
                    });
                    return skillTreeResult;
                } else {
                    toast({
                        title: "Skill Tree Error",
                        description: "Using default progression (AI fallback used).",
                        variant: "default"
                    });
                    return skillTreeResult; // Return fallback if AI provided one
                }
            } catch (err) {
                setError(`Skill Tree Error: ${err.message}. Using default progression.`);
                toast({
                    title: "Skill Tree Error",
                    description: "Could not generate skill tree. Default progression used.",
                    variant: "destructive"
                });
                return null;
            } finally{
                dispatch({
                    type: "SET_SKILL_TREE_GENERATING",
                    payload: false
                });
                setLocalIsGeneratingSkillTree(false);
            }
        }
    }["Gameplay.useCallback[triggerSkillTreeGeneration]"], [
        dispatch,
        toast,
        adventureSettings.adventureType,
        character,
        contextIsGeneratingSkillTree,
        userGoogleAiApiKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Gameplay.useEffect": ()=>{
            const performInitialSetup = {
                "Gameplay.useEffect.performInitialSetup": async ()=>{
                    if (!character || !currentAdventureId || initialSetupAttemptedRef.current[currentAdventureId]) {
                        if (isInitialLoading) setIsInitialLoading(false); // Stop loading if prerequisites are missing
                        return;
                    }
                    initialSetupAttemptedRef.current[currentAdventureId] = true;
                    console.log(`Gameplay Initial Setup: Starting for adventure ${currentAdventureId}.`);
                    // Step 1: Generate Skill Tree if needed
                    let skillTreeReady = adventureSettings.adventureType === "Immersed" || !!character.skillTree;
                    if (!skillTreeReady) {
                        console.log("Gameplay Initial Setup: Skill tree needed for class:", character.class);
                        await triggerSkillTreeGeneration(character.class);
                        // Re-check state after dispatch
                        const updatedCharacter = state.character;
                        skillTreeReady = adventureSettings.adventureType === "Immersed" || !!updatedCharacter?.skillTree;
                        console.log("Gameplay Initial Setup: Skill tree generation attempt finished. Ready:", skillTreeReady);
                    }
                    // Step 2: Trigger initial narration only after skill tree is ready and if no story exists
                    if (skillTreeReady && storyLog.length === 0) {
                        console.log("Gameplay Initial Setup: Conditions met for initial narration. Calling handlePlayerAction.");
                        await handlePlayerAction(INITIAL_ACTION_STRING, true);
                    } else {
                        // If story log already has entries (e.g., from a loaded game), we don't need initial narration.
                        console.log("Gameplay Initial Setup: Story log has entries or skill tree failed. Skipping initial narration.");
                        setIsInitialLoading(false);
                    }
                }
            }["Gameplay.useEffect.performInitialSetup"];
            performInitialSetup().catch({
                "Gameplay.useEffect": (err)=>{
                    console.error("Gameplay: Fatal error during initial setup:", err);
                    setError("A critical error occurred while starting the adventure. Please try again.");
                    setIsInitialLoading(false);
                }
            }["Gameplay.useEffect"]);
        }
    }["Gameplay.useEffect"], [
        character,
        currentAdventureId,
        adventureSettings.adventureType,
        triggerSkillTreeGeneration,
        handlePlayerAction,
        storyLog.length,
        state.character,
        isInitialLoading
    ]);
    const handleSaveGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[handleSaveGame]": async ()=>{
            if (isLoading || isEnding || isSaving || !currentAdventureId || !character) return;
            setIsSaving(true);
            toast({
                title: "Saving Progress..."
            });
            await new Promise({
                "Gameplay.useCallback[handleSaveGame]": (resolve)=>setTimeout(resolve, 500)
            }["Gameplay.useCallback[handleSaveGame]"]);
            try {
                dispatch({
                    type: "SAVE_CURRENT_ADVENTURE"
                });
                toast({
                    title: "Game Saved!",
                    description: `Progress for "${character.name}" saved.`,
                    variant: "default"
                });
            } catch (err) {
                toast({
                    title: "Save Failed",
                    description: "Could not save progress.",
                    variant: "destructive"
                });
            } finally{
                setIsSaving(false);
            }
        }
    }["Gameplay.useCallback[handleSaveGame]"], [
        dispatch,
        toast,
        isLoading,
        isEnding,
        isSaving,
        currentAdventureId,
        character
    ]);
    const handleCrafting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[handleCrafting]": async (goal, ingredients)=>{
            if (!character || isCraftingLoading) return;
            setIsCraftingLoading(true);
            toast({
                title: "Attempting to craft...",
                description: `Trying to make: ${goal}`
            });
            const inventoryListNames = inventory.map({
                "Gameplay.useCallback[handleCrafting].inventoryListNames": (item)=>item.name
            }["Gameplay.useCallback[handleCrafting].inventoryListNames"]);
            const skills = character.learnedSkills.map({
                "Gameplay.useCallback[handleCrafting].skills": (s)=>s.name
            }["Gameplay.useCallback[handleCrafting].skills"]);
            const craftingInput = {
                characterKnowledge: character.knowledge,
                characterSkills: skills,
                inventoryItems: inventoryListNames,
                desiredItem: goal,
                usedIngredients: ingredients
            };
            try {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$attempt$2d$crafting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["attemptCrafting"])(craftingInput);
                toast({
                    title: result.success ? "Crafting Successful!" : "Crafting Failed!",
                    description: result.message,
                    variant: result.success ? "default" : "destructive",
                    duration: 5000
                });
                let narrationText = `You attempted to craft ${goal} using ${ingredients.join(', ')}. ${result.message}`;
                if (result.success && result.craftedItem) {
                    narrationText = `You successfully crafted a ${result.craftedItem.quality ? result.craftedItem.quality + ' ' : ''}${result.craftedItem.name}! ${result.message}`;
                }
                dispatch({
                    type: 'UPDATE_CRAFTING_RESULT',
                    payload: {
                        narration: narrationText,
                        consumedItems: result.consumedItems,
                        craftedItem: result.success ? result.craftedItem : null,
                        newGameStateString: currentGameStateString
                    }
                });
                setIsCraftingDialogOpen(false);
            } catch (err) {
                let userFriendlyError = `Crafting attempt failed. Please try again later.`;
                if (err.message?.includes('400 Bad Request') || err.message?.includes('invalid argument')) userFriendlyError = "Crafting failed: Invalid materials or combination? The AI was unable to process the request.";
                else if (err.message) userFriendlyError = `Crafting Error: ${err.message.substring(0, 100)}`;
                toast({
                    title: "Crafting Error",
                    description: userFriendlyError,
                    variant: "destructive"
                });
                setIsCraftingDialogOpen(false);
            } finally{
                setIsCraftingLoading(false);
            }
        }
    }["Gameplay.useCallback[handleCrafting]"], [
        character,
        inventory,
        dispatch,
        toast,
        currentGameStateString,
        isCraftingLoading
    ]);
    const handleConfirmClassChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[handleConfirmClassChange]": async (newClass)=>{
            if (!character || !newClass || localIsGeneratingSkillTree || adventureSettings.adventureType === "Immersed") return;
            setPendingClassChange(null);
            toast({
                title: `Becoming a ${newClass}...`,
                description: "Generating new skill path...",
                duration: 2000
            });
            let newSkillTreeResult = null;
            try {
                dispatch({
                    type: "SET_SKILL_TREE_GENERATING",
                    payload: true
                });
                setLocalIsGeneratingSkillTree(true);
                newSkillTreeResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$flows$2f$generate$2d$skill$2d$tree$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSkillTree"])({
                    characterClass: newClass,
                    userApiKey: userGoogleAiApiKey
                });
                if (newSkillTreeResult && newSkillTreeResult.stages.length === 5) {
                    dispatch({
                        type: "CHANGE_CLASS_AND_RESET_SKILLS",
                        payload: {
                            newClass,
                            newSkillTree: newSkillTreeResult
                        }
                    });
                    toast({
                        title: `Class Changed to ${newClass}!`,
                        description: "Your abilities and progression have been reset."
                    });
                } else {
                    toast({
                        title: "Class Change Failed",
                        description: `Could not generate skill tree for ${newClass}. Class change aborted.`,
                        variant: "destructive"
                    });
                }
            } catch (err) {
                toast({
                    title: "Class Change Error",
                    description: `Could not generate skill tree for ${newClass}. Class change aborted.`,
                    variant: "destructive"
                });
            } finally{
                dispatch({
                    type: "SET_SKILL_TREE_GENERATING",
                    payload: false
                });
                setLocalIsGeneratingSkillTree(false);
            }
        }
    }["Gameplay.useCallback[handleConfirmClassChange]"], [
        character,
        dispatch,
        toast,
        localIsGeneratingSkillTree,
        adventureSettings.adventureType,
        userGoogleAiApiKey
    ]);
    const handleGoBack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[handleGoBack]": ()=>{
            if (isLoading || isEnding || isSaving) return;
            toast({
                title: "Returning to Main Menu...",
                description: "Abandoning current adventure."
            });
            dispatch({
                type: "RESET_GAME"
            });
        }
    }["Gameplay.useCallback[handleGoBack]"], [
        isLoading,
        isEnding,
        isSaving,
        dispatch,
        toast
    ]);
    const handleSuggestAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[handleSuggestAction]": ()=>{
            if (isLoading || isEnding || isSaving || !character) return;
            const learnedSkillNames = character.learnedSkills.map({
                "Gameplay.useCallback[handleSuggestAction].learnedSkillNames": (s)=>s.name
            }["Gameplay.useCallback[handleSuggestAction].learnedSkillNames"]);
            const baseSuggestions = [
                "Look around",
                "Examine surroundings",
                "Check inventory",
                "Check status",
                "Check relationships",
                "Check reputation",
                "Move north",
                "Move east",
                "Move south",
                "Move west",
                "Talk to [NPC Name]",
                "Ask about [Topic]",
                "Examine [Object]",
                "Pick up [Item]",
                "Use [Item]",
                "Drop [Item]",
                "Open [Door/Chest]",
                "Search the area",
                "Rest here",
                "Wait for a while",
                "Attack [Target]",
                "Defend yourself",
                "Flee"
            ];
            const skillSuggestions = learnedSkillNames.map({
                "Gameplay.useCallback[handleSuggestAction].skillSuggestions": (name)=>`Use skill: ${name}`
            }["Gameplay.useCallback[handleSuggestAction].skillSuggestions"]);
            const suggestions = [
                ...baseSuggestions,
                ...skillSuggestions
            ];
            const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            toast({
                title: "Suggestion",
                description: `Try: "${suggestion}"`,
                duration: 3000
            });
        }
    }["Gameplay.useCallback[handleSuggestAction]"], [
        isLoading,
        isEnding,
        isSaving,
        character,
        toast
    ]);
    const processDevCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[processDevCommand]": (action)=>{
            if (!character) return;
            let devNarration = `(Developer Mode) Player chose: "${action}".`;
            const command = action.trim().toLowerCase();
            const parts = command.split(' ');
            const baseCommand = parts[0];
            const value = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
            const updates = {};
            let xpGained;
            if (baseCommand === '/xp' && value) {
                const amount = parseInt(value, 10);
                if (!isNaN(amount)) {
                    xpGained = amount;
                    devNarration += ` Granted ${amount} XP.`;
                } else {
                    devNarration += " - Invalid XP amount.";
                }
            } else if (baseCommand === '/stage' && value) {
                const stageNum = parseInt(value, 10);
                if (!isNaN(stageNum) && stageNum >= 0 && stageNum <= 4) {
                    updates.skillTreeStage = stageNum;
                    devNarration += ` Set skill stage to ${stageNum}.`;
                } else {
                    devNarration += " - Invalid stage number (0-4).";
                }
            } else if (baseCommand === '/health' && value) {
                const amount = parseInt(value, 10);
                if (!isNaN(amount)) {
                    const newHealth = Math.max(0, Math.min(character.maxHealth, character.currentHealth + amount));
                    updates.currentHealth = newHealth;
                    devNarration += ` Adjusted health by ${amount}. New health: ${newHealth}.`;
                } else {
                    devNarration += " - Invalid health amount.";
                }
            } else if (baseCommand === '/stamina' && value) {
                const amount = parseInt(value, 10);
                if (!isNaN(amount)) {
                    updates.currentStamina = Math.max(0, Math.min(character.maxStamina, character.currentStamina + amount));
                    devNarration += ` Adjusted action stamina by ${amount}.`;
                } else {
                    devNarration += " - Invalid action stamina amount.";
                }
            } else if (baseCommand === '/mana' && value) {
                const amount = parseInt(value, 10);
                if (!isNaN(amount)) {
                    updates.currentMana = Math.max(0, Math.min(character.maxMana, character.currentMana + amount));
                    devNarration += ` Adjusted mana by ${amount}.`;
                } else {
                    devNarration += " - Invalid mana amount.";
                }
            } else if (baseCommand === '/addtrait' && value) {
                updates.traits = [
                    ...character.traits,
                    value
                ];
                devNarration += ` Added trait: ${value}.`;
            } else if (baseCommand === '/addknowledge' && value) {
                updates.knowledge = [
                    ...character.knowledge,
                    value
                ];
                devNarration += ` Added knowledge: ${value}.`;
            } else if (baseCommand === '/addskill' && value) {
                updates.learnedSkills = [
                    ...character.learnedSkills,
                    {
                        name: value,
                        description: "Developer added skill",
                        type: 'Learned'
                    }
                ];
                devNarration += ` Added skill: ${value}.`;
            } else {
                devNarration += " Action processed. Dev restrictions bypassed.";
            }
            if (Object.keys(updates).length > 0) dispatch({
                type: "UPDATE_CHARACTER",
                payload: updates
            });
            if (xpGained) dispatch({
                type: "GRANT_XP",
                payload: xpGained
            });
            const devLogEntry = {
                narration: devNarration,
                updatedGameState: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateGameStateString"])(currentGameStateString, character, inventory, turnCount + 1),
                timestamp: Date.now(),
                branchingChoices: GENERIC_BRANCHING_CHOICES
            };
            dispatch({
                type: "UPDATE_NARRATION",
                payload: devLogEntry
            });
            setBranchingChoices(GENERIC_BRANCHING_CHOICES);
        }
    }["Gameplay.useCallback[processDevCommand]"], [
        character,
        currentGameStateString,
        inventory,
        turnCount,
        dispatch
    ]);
    // New useEffect to handle dev commands
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Gameplay.useEffect": ()=>{
            if (character?.class === 'admin000' && lastPlayerAction && lastPlayerAction.startsWith('/')) {
                processDevCommand(lastPlayerAction);
                setLastPlayerAction(null); // Clear after processing
            }
        }
    }["Gameplay.useEffect"], [
        lastPlayerAction,
        character,
        processDevCommand
    ]);
    if (!character) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-screen p-4 gap-4",
            children: [
                " ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "h-12 w-12 animate-spin text-primary"
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/Gameplay.tsx",
                    lineNumber: 585,
                    columnNumber: 101
                }, this),
                " ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg text-muted-foreground",
                    children: "Loading Character Data..."
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/Gameplay.tsx",
                    lineNumber: 585,
                    columnNumber: 161
                }, this),
                " ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    onClick: ()=>dispatch({
                            type: 'RESET_GAME'
                        }),
                    variant: "outline",
                    children: " Return to Main Menu "
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/Gameplay.tsx",
                    lineNumber: 585,
                    columnNumber: 236
                }, this),
                " "
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/screens/Gameplay.tsx",
            lineNumber: 585,
            columnNumber: 18
        }, this);
    }
    const renderReputation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[renderReputation]": (rep)=>{
            if (!rep || Object.keys(rep).length === 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground italic",
                children: "None"
            }, void 0, false, {
                fileName: "[project]/src/components/screens/Gameplay.tsx",
                lineNumber: 589,
                columnNumber: 59
            }, this);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "list-none pl-0",
                children: [
                    " ",
                    Object.entries(rep).map({
                        "Gameplay.useCallback[renderReputation]": ([faction, score])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex justify-between items-center text-xs",
                                children: [
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            faction,
                                            ":"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/Gameplay.tsx",
                                        lineNumber: 590,
                                        columnNumber: 172
                                    }, this),
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `font-medium ${score > 10 ? 'text-green-600' : score < -10 ? 'text-destructive' : ''}`,
                                        children: score
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/Gameplay.tsx",
                                        lineNumber: 590,
                                        columnNumber: 196
                                    }, this),
                                    " "
                                ]
                            }, faction, true, {
                                fileName: "[project]/src/components/screens/Gameplay.tsx",
                                lineNumber: 590,
                                columnNumber: 99
                            }, this)
                    }["Gameplay.useCallback[renderReputation]"]),
                    " "
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/Gameplay.tsx",
                lineNumber: 590,
                columnNumber: 18
            }, this);
        }
    }["Gameplay.useCallback[renderReputation]"], []);
    const renderNpcRelationships = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Gameplay.useCallback[renderNpcRelationships]": (rels)=>{
            if (!rels || Object.keys(rels).length === 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground italic",
                children: "None"
            }, void 0, false, {
                fileName: "[project]/src/components/screens/Gameplay.tsx",
                lineNumber: 594,
                columnNumber: 61
            }, this);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "list-none pl-0",
                children: [
                    " ",
                    Object.entries(rels).map({
                        "Gameplay.useCallback[renderNpcRelationships]": ([npcName, score])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex justify-between items-center text-xs",
                                children: [
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            npcName,
                                            ":"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/screens/Gameplay.tsx",
                                        lineNumber: 595,
                                        columnNumber: 173
                                    }, this),
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `font-medium ${score > 20 ? 'text-green-600' : score < -20 ? 'text-destructive' : ''}`,
                                        children: score
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/Gameplay.tsx",
                                        lineNumber: 595,
                                        columnNumber: 197
                                    }, this),
                                    " "
                                ]
                            }, npcName, true, {
                                fileName: "[project]/src/components/screens/Gameplay.tsx",
                                lineNumber: 595,
                                columnNumber: 100
                            }, this)
                    }["Gameplay.useCallback[renderNpcRelationships]"]),
                    " "
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/screens/Gameplay.tsx",
                lineNumber: 595,
                columnNumber: 18
            }, this);
        }
    }["Gameplay.useCallback[renderNpcRelationships]"], []);
    const anyLoading = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || localIsGeneratingSkillTree || contextIsGeneratingSkillTree || isCraftingLoading || isInitialLoading;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col md:flex-row min-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$LeftPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LeftPanel"], {
                    character: character,
                    inventory: inventory,
                    isGeneratingSkillTree: localIsGeneratingSkillTree || contextIsGeneratingSkillTree,
                    turnCount: turnCount,
                    renderReputation: renderReputation,
                    renderNpcRelationships: renderNpcRelationships
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/Gameplay.tsx",
                    lineNumber: 603,
                    columnNumber: 18
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex flex-col p-4 overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$MobileSheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MobileSheet"], {
                            character: character,
                            inventory: inventory,
                            isGeneratingSkillTree: localIsGeneratingSkillTree || contextIsGeneratingSkillTree,
                            turnCount: turnCount,
                            renderReputation: renderReputation,
                            renderNpcRelationships: renderNpcRelationships,
                            onSettingsOpen: ()=>setIsDesktopSettingsOpen(true)
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/Gameplay.tsx",
                            lineNumber: 605,
                            columnNumber: 22
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$NarrationDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NarrationDisplay"], {
                            storyLog: storyLog,
                            isLoading: isLoading,
                            isAssessingDifficulty: isAssessingDifficulty,
                            isRollingDice: isRollingDice,
                            isGeneratingSkillTree: localIsGeneratingSkillTree || contextIsGeneratingSkillTree,
                            isEnding: isEnding,
                            isSaving: isSaving,
                            isCraftingLoading: isCraftingLoading,
                            diceResult: diceResult,
                            diceType: diceType,
                            error: error,
                            branchingChoices: branchingChoices,
                            handlePlayerAction: handlePlayerAction,
                            isInitialLoading: isInitialLoading,
                            onRetryNarration: handleRetryNarration
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/Gameplay.tsx",
                            lineNumber: 606,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$ActionInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionInput"], {
                            onSubmit: handlePlayerAction,
                            onSuggest: handleSuggestAction,
                            onCraft: ()=>setIsCraftingDialogOpen(true),
                            disabled: anyLoading || character.class === 'admin000'
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/Gameplay.tsx",
                            lineNumber: 607,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$GameplayActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameplayActions"], {
                            onSave: handleSaveGame,
                            onAbandon: handleGoBack,
                            onEnd: ()=>handleEndAdventure(undefined, character.currentHealth <= 0),
                            onSettings: ()=>setIsDesktopSettingsOpen(true),
                            disabled: anyLoading,
                            isMobile: isMobile,
                            currentAdventureId: currentAdventureId
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/Gameplay.tsx",
                            lineNumber: 608,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$ClassChangeDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ClassChangeDialog"], {
                            isOpen: !!pendingClassChange,
                            onOpenChange: (open)=>!open && setPendingClassChange(null),
                            character: character,
                            pendingClassChange: pendingClassChange,
                            onConfirm: handleConfirmClassChange
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/Gameplay.tsx",
                            lineNumber: 609,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$gameplay$2f$CraftingDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CraftingDialog"], {
                            isOpen: isCraftingDialogOpen,
                            onOpenChange: setIsCraftingDialogOpen,
                            inventory: inventory,
                            onCraft: handleCrafting
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/Gameplay.tsx",
                            lineNumber: 610,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sheet"], {
                            open: isDesktopSettingsOpen,
                            onOpenChange: setIsDesktopSettingsOpen,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$SettingsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SettingsPanel"], {
                                isOpen: isDesktopSettingsOpen,
                                onOpenChange: setIsDesktopSettingsOpen
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/Gameplay.tsx",
                                lineNumber: 612,
                                columnNumber: 24
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/Gameplay.tsx",
                            lineNumber: 611,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/screens/Gameplay.tsx",
                    lineNumber: 604,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/screens/Gameplay.tsx",
            lineNumber: 602,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/screens/Gameplay.tsx",
        lineNumber: 601,
        columnNumber: 9
    }, this);
}
_s(Gameplay, "nXMm30kFa7oJPcRRhniWYnHCrxo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$mobile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIsMobile"]
    ];
});
_c = Gameplay;
var _c;
__turbopack_context__.k.register(_c, "Gameplay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/screens/AdventureSummary.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/components/screens/AdventureSummary.tsx
__turbopack_context__.s({
    "AdventureSummary": (()=>AdventureSummary)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/scroll-area.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/accordion.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function AdventureSummary() {
    _s();
    const { state, dispatch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"])();
    const { adventureSummary, storyLog, character } = state;
    const handleMainMenu = ()=>{
        dispatch({
            type: "RESET_GAME"
        }); // Reset game state fully
    };
    // TODO: Implement saving/loading logic if required later
    // const handleSaveStory = () => { ... }
    // const handleViewSavedStories = () => { ... }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center min-h-screen p-4 bg-background",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CardboardCard"], {
            className: "w-full max-w-2xl shadow-xl border-2 border-foreground/20",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                    className: "border-b border-foreground/10 pb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                        className: "text-3xl font-bold text-center flex items-center justify-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                className: "w-7 h-7"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                lineNumber: 31,
                                columnNumber: 14
                            }, this),
                            " Adventure Ended",
                            character && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xl font-medium text-muted-foreground",
                                children: [
                                    " - ",
                                    character.name,
                                    "'s Tale"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                lineNumber: 32,
                                columnNumber: 28
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "space-y-6 pt-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-semibold flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                            lineNumber: 38,
                                            columnNumber: 75
                                        }, this),
                                        " Summary of Your Journey"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                    lineNumber: 38,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollArea"], {
                                    className: "h-40 rounded-md border p-3 bg-muted/30 border-foreground/10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm whitespace-pre-wrap leading-relaxed",
                                        children: adventureSummary || "No summary was generated for this adventure."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                        lineNumber: 40,
                                        columnNumber: 18
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                    lineNumber: 39,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Accordion"], {
                            type: "single",
                            collapsible: true,
                            className: "w-full border-t border-foreground/10 pt-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccordionItem"], {
                                value: "detailed-log",
                                className: "border-b-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                                        className: "text-xl font-semibold hover:no-underline",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                                    lineNumber: 49,
                                                    columnNumber: 21
                                                }, this),
                                                " View Full Story Log"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                            lineNumber: 48,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                        lineNumber: 47,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccordionContent"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollArea"], {
                                            className: "h-64 rounded-md border p-3 bg-muted/30 border-foreground/10",
                                            children: storyLog.length > 0 ? storyLog.map((log, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-3 pb-3 border-b border-border/50 last:border-b-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-semibold text-muted-foreground",
                                                            children: [
                                                                "Turn ",
                                                                index + 1,
                                                                " ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs",
                                                                    children: [
                                                                        "(",
                                                                        new Date(log.timestamp || Date.now()).toLocaleTimeString(),
                                                                        ")"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                                                    lineNumber: 57,
                                                                    columnNumber: 101
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                                            lineNumber: 57,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm whitespace-pre-wrap mt-1 leading-relaxed",
                                                            children: log.narration
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                                            lineNumber: 58,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, log.timestamp ? `log-${log.timestamp}-${index}` : `log-fallback-${index}`, true, {
                                                    fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                                    lineNumber: 56,
                                                    columnNumber: 23
                                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-muted-foreground italic",
                                                children: "No detailed story log was recorded for this adventure."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                                lineNumber: 64,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                            lineNumber: 53,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                        lineNumber: 52,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardFooter"], {
                    className: "flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t border-foreground/10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: handleMainMenu,
                        className: "bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                className: "mr-2 h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                                lineNumber: 76,
                                columnNumber: 15
                            }, this),
                            " Back to Main Menu"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                        lineNumber: 75,
                        columnNumber: 12
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/AdventureSummary.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/screens/AdventureSummary.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/screens/AdventureSummary.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(AdventureSummary, "0Ezd+lYqYM4Ze1hEY5mBTpMQDZc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"]
    ];
});
_c = AdventureSummary;
var _c;
__turbopack_context__.k.register(_c, "AdventureSummary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/screens/SavedAdventuresList.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/components/screens/SavedAdventuresList.tsx
__turbopack_context__.s({
    "SavedAdventuresList": (()=>SavedAdventuresList)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/GameContext.tsx [app-client] (ecmascript)"); // Import main context hook
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/scroll-area.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/game/CardboardCard.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/alert.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/alert-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderClock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-clock.js [app-client] (ecmascript) <export default as FolderClock>"); // Added Award, Thumbs icons, Users icon
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open-text.js [app-client] (ecmascript) <export default as BookOpenText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$question$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldQuestion$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-question.js [app-client] (ecmascript) <export default as ShieldQuestion>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$pulse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartPulse$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart-pulse.js [app-client] (ecmascript) <export default as HeartPulse>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thumbs-up.js [app-client] (ecmascript) <export default as ThumbsUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/award.js [app-client] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$formatDistanceToNow$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/formatDistanceToNow.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
// Helper to render reputation summary
const renderReputationSummary = (reputation)=>{
    if (!reputation) return 'None';
    const entries = Object.entries(reputation);
    if (entries.length === 0) return 'None';
    // Show first 2 factions for brevity
    return entries.slice(0, 2).map(([faction, score])=>`${faction}: ${score}`).join(', ') + (entries.length > 2 ? '...' : '');
};
// Helper to render NPC relationship summary
const renderNpcRelationshipSummary = (relationships)=>{
    if (!relationships) return 'None';
    const entries = Object.entries(relationships);
    if (entries.length === 0) return 'None';
    // Show first 2 NPCs for brevity
    return entries.slice(0, 2).map(([npc, score])=>`${npc}: ${score}`).join(', ') + (entries.length > 2 ? '...' : '');
};
function SavedAdventuresList() {
    _s();
    const { state, dispatch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"])();
    const { savedAdventures } = state;
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const handleLoad = (adventure)=>{
        dispatch({
            type: "LOAD_ADVENTURE",
            payload: adventure
        });
        toast({
            title: "Loading Adventure...",
            description: "Resuming your journey."
        });
    };
    const handleDelete = (id, characterName)=>{
        dispatch({
            type: "DELETE_ADVENTURE",
            payload: id
        });
        toast({
            title: "Adventure Deleted",
            description: `Removed the saved game for ${characterName}.`,
            variant: "destructive"
        });
    };
    const handleBack = ()=>{
        dispatch({
            type: "SET_GAME_STATUS",
            payload: "MainMenu"
        });
    };
    const sortedAdventures = [
        ...savedAdventures
    ].sort((a, b)=>b.saveTimestamp - a.saveTimestamp); // Show newest first
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center justify-center min-h-screen p-4 bg-background",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CardboardCard"], {
            className: "w-full max-w-2xl shadow-xl border-2 border-foreground/20",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                    className: "border-b border-foreground/10 pb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                        className: "text-3xl font-bold text-center flex items-center justify-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderClock$3e$__["FolderClock"], {
                                className: "w-7 h-7"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this),
                            " Saved Adventures"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "pt-6",
                    children: sortedAdventures.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                lineNumber: 78,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertTitle"], {
                                children: "No Saved Games"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                lineNumber: 79,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                children: "You haven't saved any adventures yet. Start a new game and save your progress!"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                lineNumber: 80,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                        lineNumber: 77,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollArea"], {
                        className: "h-[60vh] pr-3",
                        children: [
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: sortedAdventures.map((adventure)=>{
                                    const char = adventure.character; // Ensure character exists
                                    const currentStage = char?.skillTreeStage ?? 0;
                                    const stageData = char?.skillTree?.stages[currentStage];
                                    const stageName = stageData?.stageName ?? `Stage ${currentStage}`;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$CardboardCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CardboardCard"], {
                                        className: "p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/60 border border-foreground/10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-lg font-semibold truncate",
                                                                title: adventure.characterName,
                                                                children: adventure.characterName
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 98,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-bold text-primary ml-2 flex-shrink-0",
                                                                children: [
                                                                    "Lvl ",
                                                                    char?.level ?? '?'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 99,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                        lineNumber: 97,
                                                        columnNumber: 28
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1",
                                                                title: "Class",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$question$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldQuestion$3e$__["ShieldQuestion"], {
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 105,
                                                                        columnNumber: 37
                                                                    }, this),
                                                                    " ",
                                                                    char?.class || 'Unknown'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 104,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-0.5",
                                                                title: `Skill Stage: ${stageName}`,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 108,
                                                                        columnNumber: 37
                                                                    }, this),
                                                                    " ",
                                                                    stageName,
                                                                    " (",
                                                                    currentStage,
                                                                    "/4)"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 107,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1",
                                                                title: "Stamina",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$pulse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartPulse$3e$__["HeartPulse"], {
                                                                        className: "w-3 h-3 text-green-600"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 111,
                                                                        columnNumber: 37
                                                                    }, this),
                                                                    " ",
                                                                    char?.currentStamina ?? '?',
                                                                    "/",
                                                                    char?.maxStamina ?? '?'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 110,
                                                                columnNumber: 33
                                                            }, this),
                                                            (char?.maxMana ?? 0) > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1",
                                                                title: "Mana",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                        className: "w-3 h-3 text-blue-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 115,
                                                                        columnNumber: 41
                                                                    }, this),
                                                                    " ",
                                                                    char?.currentMana ?? '?',
                                                                    "/",
                                                                    char?.maxMana ?? '?'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 114,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                        lineNumber: 103,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1",
                                                                title: "Experience Points",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                                                                        className: "w-3 h-3 text-yellow-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 123,
                                                                        columnNumber: 37
                                                                    }, this),
                                                                    " ",
                                                                    char?.xp ?? '?',
                                                                    "/",
                                                                    char?.xpToNextLevel ?? '?',
                                                                    " XP"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 122,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1",
                                                                title: "Reputation",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__["ThumbsUp"], {
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 126,
                                                                        columnNumber: 37
                                                                    }, this),
                                                                    " Rep: ",
                                                                    renderReputationSummary(char?.reputation)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 125,
                                                                columnNumber: 34
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1",
                                                                title: "NPC Relationships",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                        className: "w-3 h-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 129,
                                                                        columnNumber: 37
                                                                    }, this),
                                                                    " Rel: ",
                                                                    renderNpcRelationshipSummary(char?.npcRelationships)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 128,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                        lineNumber: 121,
                                                        columnNumber: 28
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-muted-foreground mt-1",
                                                        children: [
                                                            "Saved ",
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$formatDistanceToNow$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDistanceToNow"])(new Date(adventure.saveTimestamp), {
                                                                addSuffix: true
                                                            })
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 28
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground mt-1",
                                                        children: [
                                                            adventure.statusBeforeSave === 'AdventureSummary' ? 'Finished' : 'In Progress',
                                                            " | ",
                                                            adventure.adventureSettings.adventureType,
                                                            " (",
                                                            adventure.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn',
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                        lineNumber: 137,
                                                        columnNumber: 28
                                                    }, this),
                                                    adventure.inventory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground mt-1 flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 142,
                                                                columnNumber: 37
                                                            }, this),
                                                            " ",
                                                            adventure.inventory.length,
                                                            " item(s)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                        lineNumber: 141,
                                                        columnNumber: 33
                                                    }, this),
                                                    adventure.statusBeforeSave === 'AdventureSummary' && adventure.adventureSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground italic mt-1 border-t pt-1 line-clamp-2",
                                                        children: [
                                                            "Summary: ",
                                                            adventure.adventureSummary
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                        lineNumber: 146,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                lineNumber: 95,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-2 flex-shrink-0 mt-2 sm:mt-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "default",
                                                        size: "sm",
                                                        onClick: ()=>handleLoad(adventure),
                                                        className: "bg-accent hover:bg-accent/90 text-accent-foreground",
                                                        children: [
                                                            adventure.statusBeforeSave === 'AdventureSummary' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenText$3e$__["BookOpenText"], {
                                                                className: "mr-1 h-4 w-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 158,
                                                                columnNumber: 82
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                                className: "mr-1 h-4 w-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 158,
                                                                columnNumber: 125
                                                            }, this),
                                                            adventure.statusBeforeSave === 'AdventureSummary' ? 'View' : 'Load'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialog"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogTrigger"], {
                                                                asChild: true,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                    variant: "destructive",
                                                                    size: "sm",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                        className: "h-4 w-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 164,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                    lineNumber: 163,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 162,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogContent"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogHeader"], {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogTitle"], {
                                                                                children: "Delete Saved Game?"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                                lineNumber: 169,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogDescription"], {
                                                                                children: [
                                                                                    'Are you sure you want to delete the saved adventure for "',
                                                                                    adventure.characterName,
                                                                                    '"? This action cannot be undone.'
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                                lineNumber: 170,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 168,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogFooter"], {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogCancel"], {
                                                                                children: "Cancel"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                                lineNumber: 175,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogAction"], {
                                                                                onClick: ()=>handleDelete(adventure.id, adventure.characterName),
                                                                                className: "bg-destructive hover:bg-destructive/90",
                                                                                children: "Delete"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                                lineNumber: 176,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                        lineNumber: 174,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                                lineNumber: 167,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                        lineNumber: 161,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                                lineNumber: 151,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, adventure.id, true, {
                                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                        lineNumber: 94,
                                        columnNumber: 23
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                lineNumber: 86,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                        lineNumber: 85,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardFooter"], {
                    className: "flex justify-start pt-6 border-t border-foreground/10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "outline",
                        onClick: handleBack,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                className: "mr-2 h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                                lineNumber: 192,
                                columnNumber: 13
                            }, this),
                            " Back to Main Menu"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
                    lineNumber: 190,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
            lineNumber: 69,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/screens/SavedAdventuresList.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_s(SavedAdventuresList, "6dnIlJCMNQ/SKS97wr2/o39LTvQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = SavedAdventuresList;
var _c;
__turbopack_context__.k.register(_c, "SavedAdventuresList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_components_screens_fe50faa1._.js.map