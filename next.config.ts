import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Archive was merged into Writing. permanent: true => 308.
      { source: "/archive", destination: "/writing#archive", permanent: true },
    ];
  },
};

export default nextConfig;
