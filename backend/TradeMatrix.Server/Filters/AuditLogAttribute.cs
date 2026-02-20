using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Filters
{
    public class AuditLogAttribute : IAsyncActionFilter
    {
        private readonly IAuditService _auditService;

        public AuditLogAttribute(IAuditService auditService)
        {
            _auditService = auditService;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Execute the actual Endpoint/Action first so we know if it succeeded or threw an exception Let it run.
            var resultContext = await next();

            // We only want to log mutations (POST, PUT, DELETE) or specific sensitive GETs.
            // For now, let's log everything that isn't a GET, or log GETs to specific controllers.
            var method = context.HttpContext.Request.Method;
            
            // Optionally, skip generic GET spam (like fetching lists)
            if (method == "GET") 
            {
                var path = context.HttpContext.Request.Path.Value?.ToLower() ?? "";
                // Only log GET requests to specific high-security endpoints if needed, otherwise skip to save DB space
                if (!path.Contains("/api/audit") && !path.Contains("/api/database/backup")) 
                {
                    return; 
                }
            }

            var user = context.HttpContext.User;
            string actorName = user.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";
            string actorEmail = user.FindFirst(ClaimTypes.Email)?.Value ?? "Guest";
            string ipAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            
            string controllerName = context.RouteData.Values["controller"]?.ToString() ?? "Unknown";
            string actionName = context.RouteData.Values["action"]?.ToString() ?? "Unknown";

            string eventName = $"{controllerName}.{actionName}".ToLower();
            string resource = context.HttpContext.Request.Path;

            string status = "Success";
            string severity = "Low";

            // Determine Status based on Http Response Code
            if (resultContext.Exception != null)
            {
                status = "Failure";
                severity = "Critical";
            }
            else if (resultContext.Result is ObjectResult objResult && objResult.StatusCode >= 400)
            {
                status = "Failure";
                severity = "Medium";
                
                if (objResult.StatusCode == 401 || objResult.StatusCode == 403)
                {
                    severity = "High";
                }
            }
            else if (resultContext.Result is StatusCodeResult statusCodeResult && statusCodeResult.StatusCode >= 400)
            {
                status = "Failure";
                severity = "Medium";
            }
            
            // Capture routing data or query params as metadata
            var metadata = new Dictionary<string, object>
            {
                { "Method", method },
                { "RouteValues", context.RouteData.Values }
            };

            await _auditService.LogEventAsync(eventName, resource, actorName, actorEmail, ipAddress, status, severity, metadata);
        }
    }
}
