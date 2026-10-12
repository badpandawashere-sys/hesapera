import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // pdfjs-dist 3.x'in yalnız Node ortamında kullandığı opsiyonel `canvas`
      // bağımlılığı tarayıcı paketinde gereksizdir; boş modüle yönlendirilir.
      canvas: "./lib/empty-module.ts",
    },
  },
  outputFileTracingIncludes: {
    '/raybilgi/5600/export': ['./data/raybilgi/**/*'],
  },
};

export default nextConfig;
