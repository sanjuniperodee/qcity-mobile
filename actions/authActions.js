export const loginSuccess = (user, token) => ({
    type: 'LOGIN_SUCCESS',
    payload: { user, token },
  });

export const logout = () => ({
    type: 'LOGOUT',
  });

export const setAuthToken = (token) => ({
    type: 'SET_AUTH_TOKEN',
    payload: token,
  });

  