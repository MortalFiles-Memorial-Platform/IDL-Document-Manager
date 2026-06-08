import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ className = '', children, ...props }) {
    return (_jsx("button", { className: `inline-flex items-center justify-center rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`, ...props, children: children }));
}
//# sourceMappingURL=button.js.map