export default function SidebarHeader() {
  return (
    <div className="flex items-center justify-between w-full px-4 pt-6 pb-4 border-b border-gray-200">
      <div className="flex items-center">
        <div className="rounded-lg">
          <svg
            width="50"
            height="50"
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_i_71_1474)">
              <path
                d="M37.9167 23.3333V11.6667C37.9167 10.8403 38.1967 10.1481 38.7567 9.59C39.3167 9.03194 40.0089 8.75194 40.8333 8.75H58.3333C59.1597 8.75 59.8529 9.03 60.4129 9.59C60.9729 10.15 61.2519 10.8422 61.25 11.6667V23.3333C61.25 24.1597 60.97 24.8529 60.41 25.4129C59.85 25.9729 59.1578 26.2519 58.3333 26.25H40.8333C40.0069 26.25 39.3147 25.97 38.7567 25.41C38.1986 24.85 37.9186 24.1578 37.9167 23.3333ZM8.75 35V11.6667C8.75 10.8403 9.03 10.1481 9.59 9.59C10.15 9.03194 10.8422 8.75194 11.6667 8.75H29.1667C29.9931 8.75 30.6862 9.03 31.2463 9.59C31.8062 10.15 32.0853 10.8422 32.0833 11.6667V35C32.0833 35.8264 31.8033 36.5196 31.2433 37.0796C30.6833 37.6396 29.9911 37.9186 29.1667 37.9167H11.6667C10.8403 37.9167 10.1481 37.6367 9.59 37.0767C9.03194 36.5167 8.75194 35.8244 8.75 35ZM37.9167 58.3333V35C37.9167 34.1736 38.1967 33.4814 38.7567 32.9233C39.3167 32.3653 40.0089 32.0853 40.8333 32.0833H58.3333C59.1597 32.0833 59.8529 32.3633 60.4129 32.9233C60.9729 33.4833 61.2519 34.1756 61.25 35V58.3333C61.25 59.1597 60.97 59.8529 60.41 60.4129C59.85 60.9729 59.1578 61.2519 58.3333 61.25H40.8333C40.0069 61.25 39.3147 60.97 38.7567 60.41C38.1986 59.85 37.9186 59.1578 37.9167 58.3333ZM8.75 58.3333V46.6667C8.75 45.8403 9.03 45.1481 9.59 44.59C10.15 44.0319 10.8422 43.7519 11.6667 43.75H29.1667C29.9931 43.75 30.6862 44.03 31.2463 44.59C31.8062 45.15 32.0853 45.8422 32.0833 46.6667V58.3333C32.0833 59.1597 31.8033 59.8529 31.2433 60.4129C30.6833 60.9729 29.9911 61.2519 29.1667 61.25H11.6667C10.8403 61.25 10.1481 60.97 9.59 60.41C9.03194 59.85 8.75194 59.1578 8.75 58.3333ZM14.5833 32.0833H26.25V14.5833H14.5833V32.0833ZM43.75 55.4167H55.4167V37.9167H43.75V55.4167ZM43.75 20.4167H55.4167V14.5833H43.75V20.4167ZM14.5833 55.4167H26.25V49.5833H14.5833V55.4167Z"
                fill="#155DFC"
              />
            </g>
            <defs>
              <filter
                id="filter0_i_71_1474"
                x="0"
                y="0"
                width="70"
                height="74"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite
                  in2="hardAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
                />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  mode="normal"
                  in2="shape"
                  result="effect1_innerShadow_71_1474"
                />
              </filter>
            </defs>
          </svg>
        </div>
        <div className="pl-3">
          <h1 className="text-lg font-semibold text-blue-700 whitespace-nowrap">
            Ling Tien Kung
          </h1>
          <p className="text-sm text-gray-500">Admin Dashboard</p>
        </div>
      </div>
    </div>
  );
}
