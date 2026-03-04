// 1. import axios
import axios from "axios";

// 2. Cấu hình instance chứa các config
const httpRequest = axios.create({
    baseURL: "http://localhost:3001/api",
});

axios.interceptors.response.use((response) => {
    return response.data;
});

let isRefreshing = false;
let failedQueue = [];

/* Thêm Request lỗi vào hàng chờ */
const addToQueue = (resolve, reject) => {
    failedQueue.push({ resolve, reject });
};

/* Xử lý hàng đợi sau khi Refresh Token xong! */
const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

/* Hàm gọi Refresh Token */
const refreshAccessToken = async (baseURL) => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
            refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = response.data;
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        return access_token;
    } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw error;
    }
};

/* ==========================================================
 * httpRequest interceptors
 * ==========================================================*/

/* Request */
httpRequest.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    (error) => Promise.reject(error),
);

/* Response */
httpRequest.interceptors.response.use(
    (response) => {
        return response.data;
    },
    /* Refreshing... */
    async (error) => {
        const originalRequest = error.config;
        if (error.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                addToQueue(resolve, reject);
            })
                .then(() => {
                    return httpRequest(originalRequest);
                })
                .catch((error) => Promise.reject(error));
        }
        isRefreshing = true;
        try {
            await refreshAccessToken(originalRequest.baseURL);
            processQueue(null);
            return httpRequest(originalRequest);
        } catch (error) {
            processQueue(error);
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    },
);

export default httpRequest;
