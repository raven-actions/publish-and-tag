import * as core from '@actions/core';
export function createInputProxy() {
    return new Proxy({}, {
        get(_, name) {
            // When we attempt to get `inputs.___`, instead
            // we call `core.getInput`.
            return core.getInput(name);
        },
        getOwnPropertyDescriptor() {
            // We need to overwrite this to ensure that
            // keys are enumerated
            return {
                enumerable: true,
                configurable: true,
                writable: false
            };
        },
        ownKeys() {
            const keys = Object.keys(process.env);
            const filtered = keys.filter((key) => key.startsWith('INPUT_'));
            return filtered;
        }
    });
}
//# sourceMappingURL=inputs.js.map