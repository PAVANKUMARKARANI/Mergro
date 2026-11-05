import ApiStats from "../models/api.stats.model";
export default async function(req,res,next){
    // console.log("Vamsi krishna");
    /**@host is deprecated from express */
    let { originalUrl, query, url, ip, method, path, body, hostname, protocol, secure,params } = req;
    let apiStats = new ApiStats({originalUrl, url, ip, method, path, secure, host:hostname, protocol});
    if(body) apiStats.body = body;
    if(query) apiStats.query = query;
    if(params) apiStats.params = params;

    /**@savingApiStats (without blocking) */ 
    ApiStats.saveData(apiStats);
    next();
}