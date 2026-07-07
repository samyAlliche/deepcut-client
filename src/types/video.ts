export default interface Video {
  videoId: string;
  url: string;
  title: string;
  thumbnail: {
    url: string;
  };
  publishedAt: string;
}
export interface ApiResponse {
  count: number;
  picks: Video[];
}
