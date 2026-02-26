export const API_BASE_url = "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_url}/auth/login`,
    REGISTER: `${API_BASE_url}/auth/register`,
    ME: `${API_BASE_url}/auth/me`,
    RESUME_ANALYZE: `${API_BASE_url}/resume/analyze`,
    ROADMAP_GENERATE: `${API_BASE_url}/roadmap/generate`,
    PROFILE_SAVE: `${API_BASE_url}/profile/save`,
    PROFILE_ME: `${API_BASE_url}/profile/me`,
    JOBS_MATCHED: (id) => `${API_BASE_url}/jobs/matched/${id}`,
    APPLY: `${API_BASE_url}/apply/`,
    APPLY_STATUS: `${API_BASE_url}/apply/status`,
    APPLY_EMAIL: `${API_BASE_url}/apply/email`,
    CHAT_MESSAGE: `${API_BASE_url}/chat/message`,
};
