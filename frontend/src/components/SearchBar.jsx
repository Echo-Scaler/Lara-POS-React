import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Reusable search input with a built-in clear button.
 *
 * @param {object} props
 * @param {string}   props.value
 * @param {Function} props.onChange
 * @param {Function} [props.onClear]
 * @param {string}   [props.placeholder]
 * @param {string}   [props.className]    extra class on the wrapper div
 */
export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <input
        type="text"
        autoComplete="off"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm font-semibold text-gray-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      {value && onClear && (
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
