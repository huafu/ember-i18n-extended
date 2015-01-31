export default500 Server Error

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
request.getQueryString()=name=Y
request.getRemoteAddr()=195.154.74.170
request.getRemotePort()=0
request.getRemoteUser()=null
request.getRequestedSessionId()=null
request.getRequestURI()=/_err/500.jsp
request.getRequestURL()=http://www.localeplanet.com/_err/500.jsp
request.getScheme()=http
request.getServerName()=www.localeplanet.com
request.getServerPort()=80
request.getServletPath()=/_err/500.jsp
request.isSecure()=false
UrlUtil.getGlobalDirectory()=http://www.localeplanet.com/api/sr-Latn-RS/
UrlUtil.getGlobalPath()=http://www.localeplanet.com/api/sr-Latn-RS/currencymap.json
UrlUtil.getGlobalUrl()=http://www.localeplanet.com/api/sr-Latn-RS/currencymap.json?name=Y
UrlUtil.getLocalDirectory()=/api/sr-Latn-RS/
UrlUtil.getLocalFile()=currencymap.json
UrlUtil.getLocalPath()=/api/sr-Latn-RS/currencymap.json
UrlUtil.getLocalUrl()=/api/sr-Latn-RS/currencymap.json?name=Y
UrlUtil.getQueryString()=name=Y
UrlUtil.getServletDirectory()=/_err/
UrlUtil.getServletPath()=/_err/500.jsp

PARAMETERS
==========
name=Y

HEADERS
=======
Host=www.localeplanet.com
X-Zoo=app-id=fflocale,domain=localeplanet.com
User-Agent=
X-Google-Apps-Metadata=domain=localeplanet.com
X-AppEngine-Country=FR
X-AppEngine-Region=j
X-AppEngine-City=puteaux
X-AppEngine-CityLatLong=48.884748,2.239640
X-AppEngine-Default-Namespace=localeplanet.com

ATTRIBUTES
==========
com.google.apphosting.runtime.jetty.APP_VERSION_REQUEST_ATTR=s~localeplanet-hrds/1.373301806471563482 (type=com.google.apphosting.base.AppVersionKey)
javax.servlet.error.request_uri=/_api/currencymap_json.jsp (type=java.lang.String)
javax.servlet.error.servlet_name=org.apache.jsp._005fapi.currencymap_005fjson_jsp (type=java.lang.String)
javax.servlet.error.status_code=500 (type=java.lang.Integer)
javax.servlet.forward.context_path= (type=java.lang.String)
javax.servlet.forward.query_string=name=Y (type=java.lang.String)
javax.servlet.forward.request_uri=/api/sr-Latn-RS/currencymap.json (type=java.lang.String)
javax.servlet.forward.servlet_path=/api/sr-Latn-RS/currencymap.json (type=java.lang.String)
javax.servlet.jsp.jspException=com.ibm.icu.util.UResourceTypeMismatchException:  (type=com.ibm.icu.util.UResourceTypeMismatchException)
org.mortbay.jetty.newSessionId=mmbx4ln7s0k8 (type=java.lang.String)
org.tuckey.web.filters.urlrewrite.RuleMatched=true (type=java.lang.Boolean)
urlparam=sr-Latn-RS (type=java.lang.String)

SESSION
=======
created on Fri Jan 30 11:05:22 UTC 2015
(none)

RESPONSE
========
response.getBufferSize()=0
response.getCharacterEncoding()=utf-8
response.getClass().getName()=org.tuckey.web.filters.urlrewrite.UrlRewriteWrappedResponse
response.getContentType()=text/plain; charset=utf-8
response.getLocale()=en_US
response.isCommitted()=false

JSP Exception
=============
Message: 
Class:   com.ibm.icu.util.UResourceTypeMismatchException
String:  com.ibm.icu.util.UResourceTypeMismatchException: 
Stack: 
com.ibm.icu.util.UResourceTypeMismatchException: 
	at com.ibm.icu.util.UResourceBundle.getString(UResourceBundle.java:608)
	at com.ibm.icu.impl.ICUCurrencyDisplayInfoProvider$ICUCurrencyDisplayInfo.getPluralName(ICUCurrencyDisplayInfoProvider.java:108)
	at com.ibm.icu.util.Currency.getName(Currency.java:579)
	at org.apache.jsp._005fapi.currencymap_005fjson_jsp._jspService(currencymap_005fjson_jsp.java:136)
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
	at com.google.apphosting.runtime.JavaRuntime$RequestRunnable.run(JavaRuntime.java:484)
	at com.google.tracing.TraceContext$TraceContextRunnable.runInContext(TraceContext.java:438)
	at com.google.tracing.TraceContext$TraceContextRunnable$1.run(TraceContext.java:445)
	at com.google.tracing.CurrentContext.runInContext(CurrentContext.java:220)
	at com.google.tracing.TraceContext$AbstractTraceContextCallback.runInInheritedContextNoUnref(TraceContext.java:309)
	at com.google.tracing.TraceContext$AbstractTraceContextCallback.runInInheritedContext(TraceContext.java:301)
	at com.google.tracing.TraceContext$TraceContextRunnable.run(TraceContext.java:442)
	at com.google.apphosting.runtime.ThreadGroupPool$PoolEntry.run(ThreadGroupPool.java:251)
	at java.lang.Thread.run(Thread.java:724)


;