export interface Message {
    server_date: string;
    phone: string;
    message: string;
    dest: string;
}

export interface LoginResponse {
    responseStatus: string;
    token?: string;
    message?: string;
}

export interface MessagesResponse {
    responseStatus: string;
    rows?: Message[];
    message?: string;
}
