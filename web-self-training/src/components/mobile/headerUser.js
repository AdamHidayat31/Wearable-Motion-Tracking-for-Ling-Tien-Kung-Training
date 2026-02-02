export default function HeaderUser({ className = "" }) {
  return (
    <div
      className={
        `flex items-center justify-center w-full border-b border-gray-200 pt-2 pb-4 mb-3` +
        ` ${className}`
      }
    >
      <div className="flex items-center">
        <div className="pl-3 text-center">
          <h1
            className="text-2xl font-semibold whitespace-nowrap"
            style={{ color: "#87B5DF" }}
          >
            Ling Tien Kung
          </h1>
          <p className="text-sm text-gray-500">Motion Tracking System</p>
        </div>
      </div>
    </div>
  );
}
