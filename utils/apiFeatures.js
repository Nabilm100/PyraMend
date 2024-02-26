
class apiFeatures {
    constructor(query , querySting){
        this.query = query;
        this.querySting = querySting;
    }

    filter(){
        let queryObj = { ...this.querySting };
        const excludeFields = ['page','limit','sort','fields'];
        excludeFields.forEach(el => delete queryObj[el]);
    
        let str = JSON.stringify(queryObj);
    
          str = str.replace(/\b(lt|lte|gt|gte)\b/g, match => `$${match}`);
        
    
    
         queryObj = JSON.parse(str);
         this.query = this.query.find(queryObj);
    return this;}

    sort(){
        if(this.querySting.sort){
            const sortBy = this.querySting.sort.split(',').join(' ')
            console.log(sortBy);
            this.query = this.query.sort(sortBy);}
            else{
                this.query = this.query.sort('createdAt');
            }
    return this;}

    limitFields(){
        if(this.querySting.fields){
            const fields = this.querySting.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v');
        }
    return this;}

    paginate(){
        const page = this.querySting.page * 1 || 1;
        const limit = this.querySting.limit*1 || 100;
        const skip = (page-1) * limit;
        this.query = this.query.skip(skip).limit(limit);
       
    return this;}

}

module.exports = apiFeatures;