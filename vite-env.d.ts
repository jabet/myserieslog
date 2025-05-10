interface ImportMeta {
    readonly env: {
        [key: string]: string | undefined;
        VITE_SUPABASE_URL:string;
        VITE_SUPABASE_ANON_KEY:string;
    };
}