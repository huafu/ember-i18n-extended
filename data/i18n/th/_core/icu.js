var container = {};(function() {

	var dfs = {"am_pm":["ก่อนเที่ยง","หลังเที่ยง"],"day_name":["วันอาทิตย์","วันจันทร์","วันอังคาร","วันพุธ","วันพฤหัสบดี","วันศุกร์","วันเสาร์"],"day_short":["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],"era":["พ.ศ."],"era_name":["พุทธศักราช"],"month_name":["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],"month_short":["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],"order_full":"DMY","order_long":"DMY","order_medium":"DMY","order_short":"DMY"};
	var nfs = {"decimal_separator":".","grouping_separator":",","minus":"-"};
	var df = {SHORT_PADDED_CENTURY:function(d){if(d){return(((d.getDate()+101)+'').substring(1)+'/'+((d.getMonth()+101)+'').substring(1)+'/'+d.getFullYear());}},SHORT:function(d){if(d){return(d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear());}},SHORT_NOYEAR:function(d){if(d){return(d.getDate()+'/'+(d.getMonth()+1));}},SHORT_NODAY:function(d){if(d){return((d.getMonth()+1)+'/'+d.getFullYear());}},MEDIUM:function(d){if(d){return(d.getDate()+' '+dfs.month_short[d.getMonth()]+' '+d.getFullYear());}},MEDIUM_NOYEAR:function(d){if(d){return(d.getDate()+' '+dfs.month_short[d.getMonth()]);}},MEDIUM_WEEKDAY_NOYEAR:function(d){if(d){return(dfs.day_short[d.getDay()]+' '+d.getDate()+' '+dfs.month_short[d.getMonth()]);}},LONG_NODAY:function(d){if(d){return(dfs.month_name[d.getMonth()]+' '+d.getFullYear());}},LONG:function(d){if(d){return(d.getDate()+' '+dfs.month_name[d.getMonth()]+' '+d.getFullYear());}},FULL:500 Server Error

BASE INFO
=========
request.getAuthType()=null
request.getClass().getName()=org.mortbay.jetty.Request
request.getCharacterEncoding()=null
request.getContentLength()=-1
request.getContentType()=null
request.getContextPath()=
request.getLocale()=en_US
request.getMethod()=GET
request.getPathInfo()=null
request.getPathTranslated()=null
request.getProtocol()=HTTP/1.1
request.getQueryString()=object=container
request.getRemoteAddr()=195.154.74.170
request.getRemotePort()=0
request.getRemoteUser()=null
request.getRequestedSessionId()=null
request.getRequestURI()=/_api/icu_js.jsp
request.getRequestURL()=http://www.localeplanet.com/_api/icu_js.jsp
request.getScheme()=http
request.getServerName()=www.localeplanet.com
request.getServerPort()=80
request.getServletPath()=/_api/icu_js.jsp
request.isSecure()=false
UrlUtil.getGlobalDirectory()=http://www.localeplanet.com/api/th/
UrlUtil.getGlobalPath()=http://www.localeplanet.com/api/th/icu.js
UrlUtil.getGlobalUrl()=http://www.localeplanet.com/api/th/icu.js?object=container
UrlUtil.getLocalDirectory()=/api/th/
UrlUtil.getLocalFile()=icu.js
UrlUtil.getLocalPath()=/api/th/icu.js
UrlUtil.getLocalUrl()=/api/th/icu.js?object=container
UrlUtil.getQueryString()=object=container
UrlUtil.getServletDirectory()=/_api/
UrlUtil.getServletPath()=/_api/icu_js.jsp

PARAMETERS
==========
pat=FULL
object=container

HEADERS
=======
Host=www.localeplanet.com
X-Zoo=app-id=fflocale,domain=localeplanet.com
User-Agent=
X-Google-Apps-Metadata=domain=localeplanet.com
X-AppEngine-Country=FR
X-AppEngine-Region=j
X-AppEngine-City=courbevoie
X-AppEngine-CityLatLong=48.900552,2.259290
X-AppEngine-Default-Namespace=localeplanet.com

ATTRIBUTES
==========
com.google.apphosting.runtime.jetty.APP_VERSION_REQUEST_ATTR=s~localeplanet-hrds/1.373301806471563482 (type=com.google.apphosting.base.AppVersionKey)
javax.servlet.error.request_uri=/_api/icu_js.jsp (type=java.lang.String)
javax.servlet.error.servlet_name=org.apache.jsp._005fapi.df_005fjs_jsp (type=java.lang.String)
javax.servlet.error.status_code=500 (type=java.lang.Integer)
javax.servlet.forward.context_path= (type=java.lang.String)
javax.servlet.forward.query_string=object=container (type=java.lang.String)
javax.servlet.forward.request_uri=/api/th/icu.js (type=java.lang.String)
javax.servlet.forward.servlet_path=/api/th/icu.js (type=java.lang.String)
javax.servlet.include.context_path=/ (type=java.lang.String)
javax.servlet.include.request_uri=/_err/500.jsp (type=java.lang.String)
javax.servlet.include.servlet_path=/_err/500.jsp (type=java.lang.String)
javax.servlet.jsp.jspException=java.lang.Exception: Unknown field "G" at offset 17 in pattern "EEEE'ที่ 'd MMMM G yyyy" (type=java.lang.Exception)
org.mortbay.jetty.newSessionId=1brp7oaun833h (type=java.lang.String)
org.tuckey.web.filters.urlrewrite.RuleMatched=true (type=java.lang.Boolean)
urlparam=th (type=java.lang.String)

SESSION
=======
created on Wed Mar 25 00:50:29 UTC 2015
(none)

RESPONSE
========
response.getBufferSize()=1986
response.getCharacterEncoding()=UTF-8
response.getClass().getName()=org.apache.jasper.runtime.ServletResponseWrapperInclude
response.getContentType()=application/x-javascript;charset=UTF-8
response.getLocale()=en_US
response.isCommitted()=true

JSP Exception
=============
Message: Unknown field "G" at offset 17 in pattern "EEEE'ที่ 'd MMMM G yyyy"
Class:   java.lang.Exception
String:  java.lang.Exception: Unknown field "G" at offset 17 in pattern "EEEE'ที่ 'd MMMM G yyyy"
Stack: 
java.lang.Exception: Unknown field "G" at offset 17 in pattern "EEEE'ที่ 'd MMMM G yyyy"
	at org.apache.jsp._005fapi.df_005fjs_jsp.makeFunction(df_005fjs_jsp.java:108)
	at org.apache.jsp._005fapi.df_005fjs_jsp._jspService(df_005fjs_jsp.java:231)
	at org.apache.jasper.runtime.HttpJspBase.service(HttpJspBase.java:97)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:717)
	at org.mortbay.jetty.servlet.ServletHolder.handle(ServletHolder.java:511)
	at org.mortbay.jetty.servlet.ServletHandler.handle(ServletHandler.java:390)
	at org.mortbay.jetty.security.SecurityHandler.handle(SecurityHandler.java:216)
	at org.mortbay.jetty.servlet.SessionHandler.handle(SessionHandler.java:182)
	at org.mortbay.jetty.handler.ContextHandler.handle(ContextHandler.java:765)
	at org.mortbay.jetty.webapp.WebAppContext.handle(WebAppContext.java:418)
	at org.mortbay.jetty.servlet.Dispatcher.include(Dispatcher.java:192)
	at org.apache.jasper.runtime.JspRuntimeLibrary.include(JspRuntimeLibrary.java:968)
	at org.apache.jasper.runtime.PageContextImpl.include(PageContextImpl.java:621)
	at org.apache.jsp._005fapi.icu_005fjs_jsp._jspService(icu_005fjs_jsp.java:138)
	at org.apache.jasper.runtime.HttpJspBase.service(HttpJspBase.java:97)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:717)
	at org.mortbay.jetty.servlet.ServletHolder.handle(ServletHolder.java:511)
	at org.mortbay.jetty.servlet.ServletHandler.handle(ServletHandler.java:390)
	at org.mortbay.jetty.security.SecurityHandler.handle(SecurityHandler.java:216)
	at org.mortbay.jetty.servlet.SessionHandler.handle(SessionHandler.java:182)
	at org.mortbay.jetty.handler.ContextHandler.handle(ContextHandler.java:765)
	at org.mortbay.jetty.webapp.WebAppContext.handle(WebAppContext.java:418)
	at org.mortbay.jetty.servlet.Dispatcher.forward(Dispatcher.java:327)
	at org.mortbay.jetty.servlet.Dispatcher.forward(Dispatcher.java:126)
	at org.tuckey.web.filters.urlrewrite.NormalRewrittenUrl.doRewrite(NormalRewrittenUrl.java:213)
	at org.tuckey.web.filters.urlrewrite.RuleChain.handleRewrite(RuleChain.java:171)
	at org.tuckey.web.filters.urlrewrite.RuleChain.doRules(RuleChain.java:145)
	at org.tuckey.web.filters.urlrewrite.UrlRewriter.processRequest(UrlRewriter.java:92)
	at org.tuckey.web.filters.urlrewrite.UrlRewriteFilter.doFilter(UrlRewriteFilter.java:381)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1157)
	at com.localeplanet.i18n.LocaleFilter.doFilter(LocaleFilter.java:33)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1157)
	at com.google.apphosting.utils.servlet.ParseBlobUploadFilter.doFilter(ParseBlobUploadFilter.java:125)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1157)
	at com.google.apphosting.runtime.jetty.SaveSessionFilter.doFilter(SaveSessionFilter.java:35)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1157)
	at com.google.apphosting.utils.servlet.JdbcMySqlConnectionCleanupFilter.doFilter(JdbcMySqlConnectionCleanupFilter.java:60)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1157)
	at com.google.apphosting.utils.servlet.TransactionCleanupFilter.doFilter(TransactionCleanupFilter.java:43)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1157)
	at org.mortbay.jetty.servlet.ServletHandler.handle(ServletHandler.java:388)
	at org.mortbay.jetty.security.SecurityHandler.handle(SecurityHandler.java:216)
	at org.mortbay.jetty.servlet.SessionHandler.handle(SessionHandler.java:182)
	at org.mortbay.jetty.handler.ContextHandler.handle(ContextHandler.java:765)
	at org.mortbay.jetty.webapp.WebAppContext.handle(WebAppContext.java:418)
	at com.google.apphosting.runtime.jetty.AppVersionHandlerMap.handle(AppVersionHandlerMap.java:254)
	at org.mortbay.jetty.handler.HandlerWrapper.handle(HandlerWrapper.java:152)
	at org.mortbay.jetty.Server.handle(Server.java:326)
	at org.mortbay.jetty.HttpConnection.handleRequest(HttpConnection.java:542)
	at org.mortbay.jetty.HttpConnection$RequestHandler.headerComplete(HttpConnection.java:923)
	at com.google.apphosting.runtime.jetty.RpcRequestParser.parseAvailable(RpcRequestParser.java:76)
	at org.mortbay.jetty.HttpConnection.handle(HttpConnection.java:404)
	at com.google.apphosting.runtime.jetty.JettyServletEngineAdapter.serviceRequest(JettyServletEngineAdapter.java:146)
	at com.google.apphosting.runtime.JavaRuntime$RequestRunnable.run(JavaRuntime.java:527)
	at com.google.tracing.TraceContext$TraceContextRunnable.runInContext(TraceContext.java:437)
	at com.google.tracing.TraceContext$TraceContextRunnable$1.run(TraceContext.java:444)
	at com.google.tracing.CurrentContext.runInContext(CurrentContext.java:220)
	at com.google.tracing.TraceContext$AbstractTraceContextCallback.runInInheritedContextNoUnref(TraceContext.java:308)
	at com.google.tracing.TraceContext$AbstractTraceContextCallback.runInInheritedContext(TraceContext.java:300)
	at com.google.tracing.TraceContext$TraceContextRunnable.run(TraceContext.java:441)
	at com.google.apphosting.runtime.ThreadGroupPool$PoolEntry.run(ThreadGroupPool.java:251)
	at java.lang.Thread.run(Thread.java:745)


Unable to notify webmaster: The API call mail.Send() required more quota than is available.

};
	
	container = container || new Object();
	var icu = container;	
		
	icu.getCountry = function() { return "" };
	icu.getCountryName = function() { return "" };
	icu.getDateFormat = function(formatCode) { var retVal = {}; retVal.format = df[formatCode]; return retVal; };
	icu.getDateFormats = function() { return df; };
	icu.getDateFormatSymbols = function() { return dfs; };
	icu.getDecimalFormat = function(places) { var retVal = {}; retVal.format = function(n) { var ns = n < 0 ? Math.abs(n).toFixed(places) : n.toFixed(places); var ns2 = ns.split('.'); s = ns2[0]; var d = ns2[1]; var rgx = /(\d+)(\d{3})/;while(rgx.test(s)){s = s.replace(rgx, '$1' + nfs["grouping_separator"] + '$2');} return (n < 0 ? nfs["minus"] : "") + s + nfs["decimal_separator"] + d;}; return retVal; };
	icu.getDecimalFormatSymbols = function() { return nfs; };
	icu.getIntegerFormat = function() { var retVal = {}; retVal.format = function(i) { var s = i < 0 ? Math.abs(i).toString() : i.toString(); var rgx = /(\d+)(\d{3})/;while(rgx.test(s)){s = s.replace(rgx, '$1' + nfs["grouping_separator"] + '$2');} return i < 0 ? nfs["minus"] + s : s;}; return retVal; };
	icu.getLanguage = function() { return "th" };
	icu.getLanguageName = function() { return "ไทย" };
	icu.getLocale = function() { return "th" };
	icu.getLocaleName = function() { return "ไทย" };

})();export default container;