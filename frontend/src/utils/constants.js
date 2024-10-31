import UserData from "../views/plugin/UserData";

export const API_BASE_URL = `http://127.0.0.1:8000/api/v1/`;
export const userId = UserData()?.user_id;
export const PAYPAL_CLIENT_ID = "Ac16q6a-9GyRdRYFfzA1hQonmJ2cU7mJ5u_UEWYhBlmTLzZ9OsBTd_gz93WwXVwFldGRDQxCBm3XXf0j";
export const teacherId = UserData()?.teacher_id; 