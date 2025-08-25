
export enum Role {
    User = 'user',
    AI = 'ai',
}

export interface Message {
    role: Role;
    text: string;
}

export enum Status {
    Idle = 'idle',
    Listening = 'listening',
    Processing = 'processing',
    Speaking = 'speaking',
}
