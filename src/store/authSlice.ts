import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession, AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  /** `checking` until the refresh-cookie session restore has finished on app load. */
  status: 'checking' | 'authenticated' | 'guest';
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'checking',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthSession>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'authenticated';
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'guest';
    },
  },
});

export const { setSession, setAccessToken, clearSession } = authSlice.actions;
export default authSlice.reducer;
