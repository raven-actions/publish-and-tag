import * as core from '@actions/core';
export function createOutputProxy() {
    return new Proxy({}, {
        set(originalObject, name, value) {
            // When we attempt to set `outputs.___`, instead
            // we call `core.setOutput`.
            core.setOutput(name, value);
            originalObject[name] = value;
            return true;
        },
        getOwnPropertyDescriptor() {
            return {
                enumerable: false,
                configurable: true,
                writable: true
            };
        }
    });
}
//# sourceMappingURL=outputs.js.map