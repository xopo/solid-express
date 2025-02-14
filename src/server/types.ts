export type Thumbnail = {
    url: string;
    preference: number;
    id: string;
};

export type User = {
    id: number;
    name: string;
};

export type MediaDataType = {
    categories: string[];
    channel_id: string;
    channel_url: string;
    description: string;
    duration: number;
    duration_string: string;
    epoch: number;
    id: string;
    is_live: boolean;
    original_url: string;
    tags: string[];
    thumbnail: string;
    thumbnails: Thumbnail[];
    title: string;
    upload_date: string;
    upload_url: string;
    uploader_url: string;
    uploader: string;
    url: string;
};
