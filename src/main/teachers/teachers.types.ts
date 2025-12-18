export type TeacherBody = {
    name: string,
    phone: string,
    subjects: string,
    class: string
}

export type baseTeacherReturn = {
    success: boolean,
    message: string
}

export type decodedBody = { 
    name: string; 
    phone: string; 
    subjects: string; 
    class: string;
}