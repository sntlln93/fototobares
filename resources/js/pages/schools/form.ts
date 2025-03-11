export type SchoolFormData = {
    school: {
        name: string;
        level: string;
        user_id?: number;
    };
    principal?: { name?: string; phone?: string };
    address: {
        street?: string;
        number?: string;
        neighborhood?: string;
        city: string;
    };
};
