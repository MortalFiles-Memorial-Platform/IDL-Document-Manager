import { jsx as _jsx } from "react/jsx-runtime";
export function Input({ className = '', ...props }) {
    return _jsx("input", { className: `w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 ${className}`, ...props });
}
//# sourceMappingURL=input.js.map