var helpers = require('../helpers');
var request = require('request');
var constants = require('../constants');
var preferences = require('../preferences').preferences;

exports.searchByTitle = function(req,res){
    
    var searchQuery = req.body.query;
    var url = constants.queries.search();
    var searchData = buildSearchQuery(searchQuery,false);
   var headers = helpers.setHeaders(url,searchData);
    request(headers,function(error,response,body){
        
        return res.send(body.hits.hits);
    });  
    
};



exports.deepSearch = function(req,res){
    
    var url = constants.queries.search();
	var pageNo = parseInt(req.params.page);
	var query = req.body.query;
    var headers = helpers.setHeaders(url,getSearchPostsQueryData(pageNo,preferences.searchPageSize,true,query));
    //use query strings to pass parameters
    request(headers,function(error,response,body){
		
		
        var resultCount = constants.queries.paginationSize - 1;
        var results = body.hits;
        var dataToRender = buildResponse(results.hits.slice(0,resultCount),pageNo,body.hits.hits.length,query);
		return res.render(constants.views.searchResults,dataToRender);
    });
    
    
};

function getSearchPostsQueryData(pageNo,paginationSize,isDeepSearch,searchQuery){  
	
	var queryData = buildSearchQuery(searchQuery,isDeepSearch);
	queryData.fields = preferences.searchResultsFileds;
    return helpers.pagination.buildPaginationQuery(pageNo,paginationSize,queryData);
}

function buildResponse(data,pageNo,total){
       var items = {};
    
    items.hits = helpers.prepareSearchResponse(data); 
    items.hasPrevious = helpers.pagination.hasPrevButton(pageNo);
    items.hasNext = helpers.pagination.hasNextButton(pageNo,total,constants.queries.paginationSize);
	items.isFirstPage = helpers.pagination.isFirstPage(items.hasPrevious);
	return items;
}

function buildSearchQuery(searchTerm,isDeepSearch){
    
var query = {  
    "fields" : ["title","wordCount"],
    "size":constants.queries.searchSize,
    "query":{
        "bool":{
            
                "should":[
            {
                "match":{
                    "title":{
                        "query": searchTerm,
                        "operator": "and"    
                    }
                }
            },
                    {
                        "match_phrase" :{
                            
                            "postHtml":{
                            
                            "query" : searchTerm
                                
                         }
                    
                        }        
                    }
                ]
            }
        }
    };
    
    return query;
}  
 