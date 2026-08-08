import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auto-memoizes components and hooks. The codebase passes all of the
  // compiler's rules, so no manual useMemo/useCallback is needed.
  reactCompiler: true,
};

export default nextConfig;
