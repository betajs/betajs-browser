/*
 * Next
 *  - ERRORS
 *  - IFRAME
 *  - TESTING
 *  - REFACTOR
 */

Helper.test({ method: "GET", origin: "same",
	          status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "GET", origin: "same",                                      jsonp: true,
	          status: 200, should: "succeed", cookie: "same" });
	
Helper.test({ method: "GET", origin: "cross",
		      status: 200, should: "fail", cookie: "none" });

Helper.test({ method: "GET", origin: "cross",                                     jsonp: true,
              status: 200, should: "succeed", cookie: "cross" });

Helper.test({ method: "GET", origin: "cross", servercors: true,
           	  status: 200, should: "succeed", cookie: "none" });

Helper.test({ method: "GET", origin: "cross", servercors: true, corscreds: true, 
	          status: 200, should: "succeed", cookie: "cross" });

Helper.test({ method: "GET", origin: "cross", servercors: true,                   jsonp: true,
              status: 200, should: "succeed", cookie: "cross" });

Helper.test({ method: "GET", origin: "same",
              status: 403, should: "fail", cookie: "same" });

Helper.test({ method: "GET", origin: "same",                                      jsonp: true,
    	      status: 403, should: "fail", cookie: "same" });

Helper.test({ method: "GET", origin: "cross",
              status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "GET", origin: "cross",                                     jsonp: true,
              status: 403, should: "fail", cookie: "cross" });

Helper.test({ method: "GET", origin: "cross", servercors: true,
 	          status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "GET", origin: "cross", servercors: true, corscreds: true, 
              status: 403, should: "fail", cookie: "cross" });

Helper.test({ method: "GET", origin: "cross", servercors: true,                  jsonp: true, 
              status: 403, should: "fail", cookie: "cross" });




Helper.test({ method: "POST", origin: "same",
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "POST", origin: "same",                                                 jsondata: true,
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "POST", origin: "same",                                                                 postmessage: true,
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "POST", origin: "cross",
              status: 200, should: "fail", cookie: "none" });

Helper.test({ method: "POST", origin: "cross", servercors: true,
              status: 200, should: "succeed", cookie: "none" });

Helper.test({ method: "POST", origin: "cross", servercors: true, corscreds: true,
              status: 200, should: "succeed", cookie: "cross" });

Helper.test({ method: "POST", origin: "cross", servercors: true, corscreds: true,                            postmessage: true,
              status: 200, should: "succeed", cookie: "cross" });
