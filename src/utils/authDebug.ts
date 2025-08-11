// Debug utility to help diagnose authentication issues
export const debugAuth = () => {
  console.log('🔍 AUTH DEBUG REPORT');
  console.log('==================');
  
  // Check localStorage contents
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userData = localStorage.getItem('user_data');
  
  console.log('📦 LocalStorage Contents:');
  console.log('- access_token:', accessToken ? 'EXISTS' : 'MISSING');
  console.log('- refresh_token:', refreshToken ? 'EXISTS' : 'MISSING');
  console.log('- user_data:', userData ? 'EXISTS' : 'MISSING');
  
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp <= currentTime;
      
      console.log('🔑 Access Token Info:');
      console.log('- Expires at:', new Date(payload.exp * 1000).toLocaleString());
      console.log('- Current time:', new Date(currentTime * 1000).toLocaleString());
      console.log('- Is expired:', isExpired);
      console.log('- Time until expiry:', payload.exp - currentTime, 'seconds');
    } catch (error) {
      console.log('❌ Failed to parse access token:', error);
    }
  }
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 User Data:');
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- Name:', user.name);
    } catch (error) {
      console.log('❌ Failed to parse user data:', error);
    }
  }
  
  console.log('==================');
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
}
