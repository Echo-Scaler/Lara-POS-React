/**
 * Displays a user's avatar image or a fallback initial-based circle.
 *
 * @param {object} props
 * @param {string|null} props.avatar  URL or null
 * @param {string}      props.name
 * @param {string}      [props.size]  Tailwind size class, e.g. "h-10 w-10" (default)
 * @param {string}      [props.className]
 */
export default function UserAvatar({
  avatar,
  name,
  size = "h-10 w-10",
  className = "",
}) {
  if (avatar) {
    return (
      <img
        className={`${size} rounded-full object-cover border-2 border-slate-50 shadow-sm ${className}`}
        src={avatar}
        alt={name}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full bg-slate-900 text-white flex items-center justify-center font-black uppercase shadow-sm text-sm ${className}`}
    >
      {name?.charAt(0) ?? "?"}
    </div>
  );
}
