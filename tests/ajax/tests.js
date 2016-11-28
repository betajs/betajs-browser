/*
 * Next
 *  - Status Error
 *  - Test + Fix 9 & 8
 */

Helper.test({ method: "GET", origin: "same",
	          status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "GET", origin: "same",                                                                                      wrapstatus: true,
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "GET", origin: "same",                                      jsonp: true,
	          status: 200, should: "succeed", cookie: "same" });
	
Helper.test({ method: "GET", origin: "same",                                      jsonp: true,                                    wrapstatus: true,
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "GET", origin: "cross",
		      status: 200, should: "fail", cookie: "none", allowsilent: true });

Helper.test({ method: "GET", origin: "cross",                                                                                     wrapstatus: true,
              status: 200, should: "fail", cookie: "none", allowsilent: true });

Helper.test({ method: "GET", origin: "cross",                                     jsonp: true,
              status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross",                                     jsonp: true,                                    wrapstatus: true,
              status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross", servercors: true,
           	  status: 200, should: "succeed", cookie: "none" });

Helper.test({ method: "GET", origin: "cross", servercors: true,                                                                   wrapstatus: true,
          	  status: 200, should: "succeed", cookie: "none" });

Helper.test({ method: "GET", origin: "cross", servercors: true, corscreds: true, 
	          status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross", servercors: true, corscreds: true,                                                  wrapstatus: true, 
              status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross", servercors: true,                   jsonp: true,
              status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross", servercors: true,                   jsonp: true,                                    wrapstatus: true,
              status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "same",
              status: 403, should: "fail", cookie: "same" });

Helper.test({ method: "GET", origin: "same",                                                                                      wrapstatus: true,
              status: 403, should: "fail", cookie: "same" });

Helper.test({ method: "GET", origin: "same",                                      jsonp: true,
    	      status: 403, should: "fail", cookie: "same" });

Helper.test({ method: "GET", origin: "same",                                      jsonp: true,                                    wrapstatus: true,
              status: 403, should: "fail", cookie: "same" });

Helper.test({ method: "GET", origin: "cross",
              status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "GET", origin: "cross",                                                                                     wrapstatus: true,
              status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "GET", origin: "cross",                                     jsonp: true,
              status: 403, should: "fail", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross",                                     jsonp: true,                                    wrapstatus: true,
              status: 403, should: "fail", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross", servercors: true,
 	          status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "GET", origin: "cross", servercors: true,                                                                   wrapstatus: true,
              status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "GET", origin: "cross", servercors: true, corscreds: true, 
              status: 403, should: "fail", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross", servercors: true, corscreds: true,                                                  wrapstatus: true, 
              status: 403, should: "fail", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross", servercors: true,                  jsonp: true, 
              status: 403, should: "fail", cookie: "crossornone" });

Helper.test({ method: "GET", origin: "cross", servercors: true,                  jsonp: true,                                     wrapstatus: true, 
              status: 403, should: "fail", cookie: "crossornone" });



Helper.test({ method: "POST", origin: "same",
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "POST", origin: "same",                                                                                     wrapstatus: true,
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "POST", origin: "same",                                                 jsondata: true,
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "POST", origin: "same",                                                 jsondata: true,                     wrapstatus: true,
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "POST", origin: "same",                                                                 postmessage: true,
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "POST", origin: "same",                                                                 postmessage: true,  wrapstatus: true,
              status: 200, should: "succeed", cookie: "same" });

Helper.test({ method: "POST", origin: "cross",
              status: 200, should: "fail", cookie: "none" });

Helper.test({ method: "POST", origin: "cross",                                                                                    wrapstatus: true,
              status: 200, should: "fail", cookie: "none" });

Helper.test({ method: "POST", origin: "cross", servercors: true,
              status: 200, should: "succeed", cookie: "none" });

Helper.test({ method: "POST", origin: "cross", servercors: true,                                                                  wrapstatus: true,
              status: 200, should: "succeed", cookie: "none" });

Helper.test({ method: "POST", origin: "cross", servercors: true, corscreds: true,
              status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "POST", origin: "cross", servercors: true, corscreds: true,                                                 wrapstatus: true,
              status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "POST", origin: "cross", servercors: true, corscreds: true,                            postmessage: true,
              status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "POST", origin: "cross", servercors: true, corscreds: true,                            postmessage: true,   wrapstatus: true,
              status: 200, should: "succeed", cookie: "crossornone" });

Helper.test({ method: "POST", origin: "same",
              status: 403, should: "fail", cookie: "same" });

Helper.test({ method: "POST", origin: "same",                                                                                     wrapstatus: true,
              status: 403, should: "fail", cookie: "same" });



Helper.test({ method: "POST", origin: "same",                                                 jsondata: true,
              status: 403, should: "fail", cookie: "same" });

Helper.test({ method: "POST", origin: "same",                                                 jsondata: true,                     wrapstatus: true,
              status: 403, should: "fail", cookie: "same" });

/*
Helper.test({ method: "POST", origin: "same",                                                                 postmessage: true,
              status: 403, should: "fail", cookie: "same" });
*/

Helper.test({ method: "POST", origin: "cross",
              status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "POST", origin: "cross",                                                                                    wrapstatus: true,
              status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "POST", origin: "cross", servercors: true,
              status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "POST", origin: "cross", servercors: true,                                                                  wrapstatus: true,
              status: 403, should: "fail", cookie: "none" });

Helper.test({ method: "POST", origin: "cross", servercors: true, corscreds: true,
              status: 403, should: "fail", cookie: "crossornone" });

Helper.test({ method: "POST", origin: "cross", servercors: true, corscreds: true,                                                 wrapstatus: true,
              status: 403, should: "fail", cookie: "crossornone" });


/*
Helper.test({ method: "POST", origin: "cross", servercors: true, corscreds: true,                            postmessage: true,
              status: 403, should: "fail", cookie: "cross" });
*/





