import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,

  async redirects() {
    // Old admin URLs (from before the public / admin split) — keep
    // existing bookmarks and any external links working.
    return [
      { source: "/channels", destination: "/admin/channels", permanent: true },
      { source: "/recording", destination: "/admin/recording", permanent: true },
      { source: "/archives", destination: "/admin/archives", permanent: true },
      {
        source: "/archives/:id",
        destination: "/admin/archives/:id",
        permanent: true,
      },
      {
        source: "/local-replay",
        destination: "/admin/local-replay",
        permanent: true,
      },
      { source: "/settings", destination: "/admin/settings", permanent: true },
    ];
  },
};

export default nextConfig;
