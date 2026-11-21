import mongoose, { AnyKeys, CreateOptions, DeleteResult, HydratedDocument, Model, Mongoose, MongooseBaseQueryOptions, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult } from "mongoose";
import { IUser } from "../interface/user.interface";
import { IPaginage } from "../interface/paginage.interface";

export abstract class DatabaseRepository<TRowDocument> {
  constructor(protected model: Model<TRowDocument>) {}
  //create
  async create({
    data,
  }: {
    data: AnyKeys<TRowDocument>;
  }): Promise<HydratedDocument<TRowDocument>>;
  async create({
    data,
    options,
  }: {
    data: AnyKeys<TRowDocument>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<TRowDocument>[]>;
  async create({
    data,
    options,
  }: {
    data: AnyKeys<TRowDocument> | AnyKeys<TRowDocument>[];
    options?: CreateOptions;
  }): Promise<
    HydratedDocument<TRowDocument> | HydratedDocument<TRowDocument>[]
  > {
    return await this.model.create(data as any, options);
  }
  async createOne({
    data,
    options = {},
  }: {
    data: AnyKeys<TRowDocument>;
    options?: CreateOptions;
  }): Promise<HydratedDocument<TRowDocument>> {
    const [doc] = await this.create({ data: [data], options });
    return doc as HydratedDocument<TRowDocument>;
  }


  //Finders
  async findOne({filter , projection={} , options}:{ 
    filter: QueryFilter<TRowDocument>,
    projection?: ProjectionType<TRowDocument> | null | undefined,
    options?: QueryOptions & {lean ?: false} |null |undefined }):Promise<HydratedDocument<TRowDocument> | undefined | null>{

    const doc = this.model.findOne(filter , projection )
    if(options?.Populate){
       doc.populate(options.populate as PopulateOptions[])
    }
    return await doc.exec()
  }

// findById
async findById({
    id,
    projection,
    options = {},
}: {
    id:mongoose.Types.ObjectId | string,
    projection?: ProjectionType<TRowDocument> | null | undefined,
    options?: QueryOptions<TRowDocument>,
}): Promise<HydratedDocument<TRowDocument> | null> {

    return await this.model.findById(
        id,
        projection,
        options
    );
}
  
async find({
    filter ,
    projection,
    options = {},
}: {
    filter: QueryFilter<TRowDocument>,
    projection?: ProjectionType<TRowDocument> | null | undefined,
    options?: QueryOptions<TRowDocument>,
}): Promise<HydratedDocument<TRowDocument>[]> {

    return await this.model.find(
        filter,
        projection,
        options
    );
}


async countDocuments({
    filter = {},
}: {
    filter: QueryFilter<TRowDocument>,
}): Promise<number> {

    return await this.model.countDocuments(filter);
}


  //paginate 
async paginate({
    filter,
    projection,
    options = {},
    page,
    limit,
}: {
    filter: QueryFilter<TRowDocument>,
    projection?: ProjectionType<TRowDocument> | null | undefined,
    options?: QueryOptions<TRowDocument>,
    page: number,
    limit: number,
}): Promise<IPaginage<HydratedDocument<TRowDocument>>> {

    const skip = (page - 1) * limit;

    const count = await this.countDocuments({ filter });

    const pages = Math.ceil(count / limit);

    const docs = await this.find({
        filter,
        projection,
        options: {
            skip,
            limit,
            ...options,
        },
    });

    return {
        count,
        limit,
        pages,
        currentPage: page,
        docs,
    };
}


// updateMany
async updateMany(
    {
        filter = {},
        update,
        options
    }: {
        filter: QueryFilter<TRowDocument>,
        update: UpdateQuery<TRowDocument> | UpdateWithAggregationPipeline,
        options?: MongooseUpdateQueryOptions<TRowDocument> | null
    }
): Promise<UpdateWriteOpResult> {

    return this.model.updateMany(filter, update, options);
}


async updateOne(
    {
        filter = {},
        update,
        options
    }: {
        filter: QueryFilter<TRowDocument>,
        update: UpdateQuery<TRowDocument> | UpdateWithAggregationPipeline,
        options?: MongooseUpdateQueryOptions<TRowDocument> | null
    }
): Promise<UpdateWriteOpResult> {

    return this.model.updateOne(filter, update, options);
}

// findOneAndUpdate
async findOneAndUpdate(
    {
        filter = {},
        update,
        options = {}
    }: {
        filter: QueryFilter<TRowDocument>,
        update: UpdateQuery<TRowDocument> | UpdateWithAggregationPipeline,
        options?: QueryOptions<TRowDocument> | null
    }
): Promise<HydratedDocument<TRowDocument> | null> {

    return this.model.findOneAndUpdate(
        filter,
        update,
       {...options,
          returnDocument : "after"
        }
    );
}

// findByIdAndUpdate
async findByIdAndUpdate(
    {
        id,
        update,
        options = {}
    }: {
        id: mongoose.Types.ObjectId | string,
        update: UpdateQuery<TRowDocument> | UpdateWithAggregationPipeline,
        options?: QueryOptions<TRowDocument>
    }
): Promise<HydratedDocument<TRowDocument> | null> {

    return this.model.findByIdAndUpdate(
        id,
        update,
        options
    );
}

// findByIdAndDelete
async findByIdAndDelete({
    id,
    options = {}
}: {
    id: mongoose.Types.ObjectId | string,
    options?: QueryOptions<TRowDocument>
}): Promise<HydratedDocument<TRowDocument> | null> {

    return this.model.findByIdAndDelete(id, options);
}
// deleteOne
async deleteOne({
    filter = {},
}: {
    filter: QueryFilter<TRowDocument>,
}): Promise<DeleteResult> {

    return this.model.deleteOne(filter);
}
// deleteMany
async deleteMany({
    filter = {}
}: {
    filter: QueryFilter<TRowDocument>,
}): Promise<DeleteResult> {
    return this.model.deleteMany(filter);
}

}
