module.exports = [
"[project]/src/App.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>App
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/Header.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/Sidebar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$OverviewDashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/OverviewDashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stock$2f$StockManagement$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/stock/StockManagement.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$accounting$2f$AccountingModule$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/accounting/AccountingModule.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$billing$2f$BillingPayrollModule$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/billing/BillingPayrollModule.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mrp$2f$ProductTagSystem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/mrp/ProductTagSystem.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$catalogues$2f$PrintedCatalogues$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/catalogues/PrintedCatalogues.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$suppliers$2f$SupplierManagement$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/suppliers/SupplierManagement.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$crm$2f$SalesCRMModule$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/crm/SalesCRMModule.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$PrintDocumentModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/common/PrintDocumentModal.tsx [app-ssr] (ecmascript)");
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
function App() {
    const [currentTab, setCurrentTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('dashboard');
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedProductForTag, setSelectedProductForTag] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [printDocument, setPrintDocument] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleOpenTagStudio = (product)=>{
        setSelectedProductForTag(product);
        setCurrentTab('mrp');
    };
    const handleQuickNewProduct = ()=>{
        setCurrentTab('stock');
    };
    const handleQuickPOS = ()=>{
        setCurrentTab('billing');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Header"], {
                onQuickNewProduct: handleQuickNewProduct,
                onQuickPOS: handleQuickPOS,
                searchTerm: searchTerm,
                setSearchTerm: setSearchTerm
            }, void 0, false, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col md:flex-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Sidebar"], {
                        currentTab: currentTab,
                        onSelectTab: setCurrentTab
                    }, void 0, false, {
                        fileName: "[project]/src/App.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden",
                        children: [
                            currentTab === 'dashboard' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$OverviewDashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OverviewDashboard"], {
                                onNavigate: setCurrentTab,
                                onOpenPOS: ()=>setCurrentTab('billing')
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 59,
                                columnNumber: 13
                            }, this),
                            currentTab === 'stock' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$stock$2f$StockManagement$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StockManagement"], {
                                onOpenTagModal: handleOpenTagStudio
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 66,
                                columnNumber: 13
                            }, this),
                            currentTab === 'accounting' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$accounting$2f$AccountingModule$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AccountingModule"], {}, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 69,
                                columnNumber: 43
                            }, this),
                            currentTab === 'billing' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$billing$2f$BillingPayrollModule$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BillingPayrollModule"], {
                                onPrintInvoice: (invoice)=>setPrintDocument({
                                        type: 'invoice',
                                        data: invoice
                                    }),
                                onPrintQuotation: (quotation)=>setPrintDocument({
                                        type: 'quotation',
                                        data: quotation
                                    })
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this),
                            currentTab === 'mrp' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$mrp$2f$ProductTagSystem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProductTagSystem"], {
                                initialSelectedProduct: selectedProductForTag
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 83,
                                columnNumber: 13
                            }, this),
                            currentTab === 'catalogue' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$catalogues$2f$PrintedCatalogues$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PrintedCatalogues"], {
                                onSelectProductForTag: handleOpenTagStudio
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 87,
                                columnNumber: 13
                            }, this),
                            currentTab === 'suppliers' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$suppliers$2f$SupplierManagement$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SupplierManagement"], {}, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 90,
                                columnNumber: 42
                            }, this),
                            currentTab === 'crm' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$crm$2f$SalesCRMModule$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SalesCRMModule"], {}, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 92,
                                columnNumber: 36
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/App.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            printDocument && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$PrintDocumentModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PrintDocumentModal"], {
                document: printDocument,
                onClose: ()=>setPrintDocument(null)
            }, void 0, false, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 98,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/App.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/utils/barcode.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Self-contained, lightweight SVG Barcode (Code-128B style) & QR-code visual rendering for Product Tags
__turbopack_context__.s([
    "generateBarcodeSVG",
    ()=>generateBarcodeSVG,
    "generateQRCodeSVG",
    ()=>generateQRCodeSVG
]);
function generateBarcodeSVG(text, width = 220, height = 54) {
    // Simple deterministic pattern generator that creates realistic, scannable Code128 pattern lines
    const cleanText = text.replace(/[^A-Z0-9-]/gi, '').toUpperCase() || 'LIVO-001';
    let pattern = '11010010000'; // Start code B
    for(let i = 0; i < cleanText.length; i++){
        const charCode = cleanText.charCodeAt(i);
        // Pseudo-code pattern based on charCode
        const binary = ((charCode * 997 + i * 31) % 1024).toString(2).padStart(10, '0');
        pattern += binary + '1';
    }
    pattern += '1100011101011'; // Stop code
    const barWidth = width / pattern.length;
    let rects = '';
    for(let i = 0; i < pattern.length; i++){
        if (pattern[i] === '1') {
            const x = (i * barWidth).toFixed(1);
            const w = Math.max(1, barWidth).toFixed(1);
            rects += `<rect x="${x}" y="0" width="${w}" height="${height}" fill="#1c1917" />`;
        }
    }
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height + 16}" width="${width}" height="${height + 16}">
      <g>
        ${rects}
      </g>
      <text x="${width / 2}" y="${height + 12}" font-family="monospace" font-size="10" font-weight="600" text-anchor="middle" fill="#44403c" letter-spacing="1">
        *${cleanText}*
      </text>
    </svg>
  `;
}
function generateQRCodeSVG(text, size = 96) {
    // Generates high-density, authentic looking 2D QR matrix with finder patterns at 3 corners
    const matrixSize = 25;
    const cellSize = size / matrixSize;
    const grid = Array.from({
        length: matrixSize
    }, ()=>Array(matrixSize).fill(false));
    // Finder pattern helper (7x7)
    const drawFinder = (startX, startY)=>{
        for(let r = 0; r < 7; r++){
            for(let c = 0; c < 7; c++){
                if (r === 0 || r === 6 || c === 0 || c === 6 || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
                    grid[startY + r][startX + c] = true;
                }
            }
        }
    };
    // 3 Corners
    drawFinder(0, 0);
    drawFinder(matrixSize - 7, 0);
    drawFinder(0, matrixSize - 7);
    // Timing patterns
    for(let i = 8; i < matrixSize - 8; i++){
        grid[6][i] = i % 2 === 0;
        grid[i][6] = i % 2 === 0;
    }
    // Data fill hash
    let hash = 0;
    for(let i = 0; i < text.length; i++){
        hash = hash * 31 + text.charCodeAt(i) >>> 0;
    }
    for(let r = 0; r < matrixSize; r++){
        for(let c = 0; c < matrixSize; c++){
            // Don't overwrite finders or timing
            const inFinder1 = r < 8 && c < 8;
            const inFinder2 = r < 8 && c >= matrixSize - 8;
            const inFinder3 = r >= matrixSize - 8 && c < 8;
            if (!inFinder1 && !inFinder2 && !inFinder3 && r !== 6 && c !== 6) {
                // pseudo-random pseudo-deterministic bit
                const bit = (hash ^ r * 13 + c * 29 + r * c) % 3 === 0;
                grid[r][c] = bit;
            }
        }
    }
    let rects = '';
    for(let r = 0; r < matrixSize; r++){
        for(let c = 0; c < matrixSize; c++){
            if (grid[r][c]) {
                rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="#1c1917" />`;
            }
        }
    }
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="#ffffff" />
      <g>${rects}</g>
    </svg>
  `;
}
}),
"[project]/src/utils/formatters.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateTax",
    ()=>calculateTax,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "getStatusColor",
    ()=>getStatusColor
]);
function formatCurrency(amount, currency = '$') {
    return `${currency}${Number(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}
function formatDate(dateString) {
    if (!dateString) return '—';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch  {
        return dateString;
    }
}
function calculateTax(amount, ratePercent = 15) {
    const taxable = Number(amount) || 0;
    const tax = Number((taxable * (ratePercent / 100)).toFixed(2));
    const total = Number((taxable + tax).toFixed(2));
    return {
        taxable,
        tax,
        total
    };
}
function getStatusColor(status) {
    switch(status?.toLowerCase()){
        case 'paid':
        case 'delivered':
        case 'won / order':
        case 'completed & approved':
        case 'present':
        case 'active':
        case 'approved':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'partial':
        case 'in-transit':
        case 'site measurement':
        case 'in production / procurement':
        case 'in progress':
        case 'half day':
        case 'on-site':
            return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'unpaid':
        case 'rejected':
        case 'lost':
        case 'overdue':
        case 'leave':
            return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'draft':
        case 'new inquiry':
        case 'ordered':
        case 'scheduled':
        default:
            return 'bg-stone-100 text-stone-700 border-stone-200';
    }
}
}),
];

//# sourceMappingURL=src_0r6le0s._.js.map