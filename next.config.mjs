/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 's2.googleusercontent.com',
				port: '',
				pathname: '/s2/**',
			},
		],
	},
};

export default nextConfig;
