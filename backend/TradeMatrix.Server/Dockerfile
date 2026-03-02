FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["TradeMatrix.Server.csproj", "./"]
RUN dotnet restore "TradeMatrix.Server.csproj"

# Copy the remaining source code
COPY . .
RUN dotnet build "TradeMatrix.Server.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "TradeMatrix.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose standard port for .NET 8+ containers
EXPOSE 8080

ENTRYPOINT ["dotnet", "TradeMatrix.Server.dll"]
