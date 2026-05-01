export const setAuthData = (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-updated'));
    }
};

export const getAuthData = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return {
        user: user ? JSON.parse(user) : null,
        token: token || null
    };
};

export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-updated'));
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
