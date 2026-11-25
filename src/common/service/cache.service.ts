import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config";


export class CacheService {
    
    private readonly client : RedisClientType;
    constructor(){
        this.client = createClient({url : REDIS_URI})
           this.connect()
    }
    async connect (){
        try {
            await this.client.connect()
            console.log("redis connected 😘");      
            
        } catch (error) {
            console.log("fail to connect on redis");
            
        }
    }
    
    async set ({ key , value, ttl = undefined } : {key:string , value:any, ttl?:number|undefined}){
      if (typeof value === "object") {
        value = JSON.stringify(value);
      }
      return await this.client.set(key, value, ...(ttl ? [{ EX: ttl }] : []));
    };

    async get ({ key }:{key:string}){
      let value:any = await this.client.get(key);
    
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    };


    async exists ({ key }:{key:string}){
      return await this.client.exists(key);
    };
    async update ({ key, value, ttl = undefined }: {key:string , value:any, ttl?:number}){
      if (!(await this.exists({ key }))) {
        return 0;
      }
      return this.set({ key, value, ttl });
    };
    async del ({ key }:{key:string | string[]}){
      return await this.client.del(key);
    };
    async keys ({ prefix } :{prefix : string}) {
      return await this.client.keys(`${prefix}*`);
    };
    async expire ({ key, ttl }: {key:string , ttl:number}){
      return await this.client.expire(key, ttl);
    };
    async ttl ({ key } : {key:string}){
      return await this.client.ttl(key);
    };
    async incBy ({ key, value = 1 }: {key:string , value?:any}){
      return await this.client.incrBy(key, value);
    };
    
}

export const cachService  = new CacheService()