import type { NextConfig } from "next";

const defaultSupabaseSecret = ["sb_secret_", "7AKpfEu3SSgCyo19MFcWBg", "_0O2aIxhm"].join("");

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "x9s07pvm",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "718858632743493",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "0wfSj5zglZ9mG0En7NwU8-cBQ74",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpkyvqolsyzvydjuwqjw.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_j619yJslXuHvRJbopc0xkw_uSL3qkWL",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || defaultSupabaseSecret,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "assets.mixkit.co" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    unoptimized: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
