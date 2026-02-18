namespace TradeMatrix.Server.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public List<string>? Errors { get; set; }

        public ApiResponse(bool success, T? data = default, string? message = null, List<string>? errors = null)
        {
            Success = success;
            Data = data;
            Message = message;
            Errors = errors;
        }

        public static ApiResponse<T> SuccessResponse(T data, string? message = null)
        {
            return new ApiResponse<T>(true, data, message);
        }

        public static ApiResponse<T> ErrorResponse(string message, List<string>? errors = null)
        {
            return new ApiResponse<T>(false, default, message, errors);
        }
    }

    public class PaginatedResponse<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public int Pages { get; set; }

        public PaginatedResponse(IEnumerable<T> data, int page, int pageSize, int total)
        {
            Data = data;
            Page = page;
            PageSize = pageSize;
            Total = total;
            Pages = (int)Math.Ceiling(total / (double)pageSize);
        }
    }
}
