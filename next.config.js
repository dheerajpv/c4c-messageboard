/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    reactStrictMode: false, // without this, in dev mode components render twice - making two socket connections!
};

module.exports = nextConfig;
