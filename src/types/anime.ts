export type Anime={
id:string;owner_id:string;mal_id:number|null;title:string;title_th:string|null;
poster_url:string|null;aired_date:string|null;episodes:number|null;genres:string[];
finished_date:string;rating:number;review:string|null;is_featured:boolean;
created_at:string;updated_at:string;
duration_minutes?:number|null;anime_format?:string|null;watch_url?:string|null;
};
export type LibrarySettings={owner_id:string;is_public:boolean;share_slug:string;display_name:string|null};
