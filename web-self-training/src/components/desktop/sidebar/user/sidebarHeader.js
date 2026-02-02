export default function SidebarHeader() {
  return (
    <div className="flex items-center justify-between w-full px-4 pt-6 pb-4 border-b border-gray-200">
      <div className="flex items-center">
        <div className="pl-3">
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
