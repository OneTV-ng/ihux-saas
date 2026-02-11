
const nextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'http://sv3.local',
  ],
  async redirects() {
    return [
    
      // Signup redirects
      {
        source: '/signup',
        destination: '/auth/signup',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: '/auth/signup',
        permanent: true,
      },
      // Signin redirects
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/signin',
        destination: '/auth/signin',
        permanent: true,
      },
  
        {
        source: '/auth/sign',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/auth/login',
        destination: '/auth/signin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
