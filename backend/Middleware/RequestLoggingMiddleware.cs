using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace ReconheceAi.Api.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var requestId = Guid.NewGuid().ToString("N")[..8];
            
            // Adiciona ID da requisição ao contexto
            context.Items["RequestId"] = requestId;
            
            _logger.LogInformation("Iniciando requisição {RequestId}: {Method} {Path}", 
                requestId, context.Request.Method, context.Request.Path);

            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();
                
                _logger.LogInformation("Finalizando requisição {RequestId}: {StatusCode} em {ElapsedMs}ms", 
                    requestId, context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
            }
        }
    }
}