/**
 * useAuth hook — convenience wrapper for AuthContext.
 */

import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
