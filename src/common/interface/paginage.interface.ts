export interface IPaginage<T>{
    count:number;
        limit:number;
        pages:number;
        currentPage:number;
        docs: T[]
}