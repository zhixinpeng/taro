"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THIRD_PARTY_COMPONENTS = exports.resetGlobals = exports.globals = exports.errors = exports.usedComponents = void 0;
exports.usedComponents = new Set();
exports.errors = [];
exports.globals = {
    hasCatchTrue: false
};
exports.resetGlobals = () => {
    exports.globals.hasCatchTrue = false;
    // tslint:disable-next-line: no-use-before-declare
    exports.THIRD_PARTY_COMPONENTS.clear();
};
exports.THIRD_PARTY_COMPONENTS = new Set();
//# sourceMappingURL=global.js.map