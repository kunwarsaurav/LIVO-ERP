import { NextRequest } from "next/server";


export interface PaginationInterface{
    page:number;
    limit:number;
    skip:number;
}

export interface PaginationMetaInterface {
    total:number;
    page:number;
    limit:number;
    totalPages:number;
}


const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 200;
export const pagination = (request:NextRequest) =>{
    const page = Math.max(1,Number(request.nextUrl.searchParams.get("page"))||1);
    const limit = Math.min(MAX_LIMIT,Number(request.nextUrl.searchParams.get("limit"))|| DEFAULT_LIMIT)

    const skip = (page-1)*limit;

    return {
        page,
        limit,
        skip
    }
}

export const buildPaginationMeta = (total:number,page:number,limit:number):PaginationMetaInterface=>{
    const totalPages = Math.ceil(total/limit);
    return {
        total,
        page,
        limit,
        totalPages,
    }
}