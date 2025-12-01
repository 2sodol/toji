<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Image Metadata Analysis</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background-color: #f5f5f5; }
        h1 { color: #333; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; padding: 20px; }
        .error { color: red; font-weight: bold; }
        .log-box { background: #2b2b2b; color: #f0f0f0; padding: 15px; border-radius: 5px; font-family: monospace; max-height: 300px; overflow-y: auto; margin-top: 10px; }
        .log-item { margin: 5px 0; border-bottom: 1px solid #444; padding-bottom: 2px; }
        .meta-info { display: flex; gap: 20px; margin-bottom: 15px; }
        .meta-item { background: #e3f2fd; padding: 10px 15px; border-radius: 5px; font-weight: bold; color: #1565c0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 Image Metadata Analysis</h1>
        
        <c:if test="${not empty error}">
            <div class="card error">
                ${error}
            </div>
        </c:if>

        <c:forEach var="img" items="${images}">
            <div class="card">
                <h2>File: ${img.fileName}</h2>
                
                <div class="meta-info">
                    <div class="meta-item">
                        Latitude: ${img.latitude != null ? img.latitude : 'N/A'}
                    </div>
                    <div class="meta-item">
                        Longitude: ${img.longitude != null ? img.longitude : 'N/A'}
                    </div>
                </div>

                <h3>Analysis Log</h3>
                <div class="log-box">
                    <c:forEach var="log" items="${img.xmpLog}">
                        <div class="log-item">${log}</div>
                    </c:forEach>
                    <c:if test="${not empty img.error}">
                        <div class="log-item error">${img.error}</div>
                    </c:if>
                </div>
            </div>
        </c:forEach>
        
        <c:if test="${empty images and empty error}">
            <div class="card">
                <p>No images found or analyzed.</p>
            </div>
        </c:if>
    </div>
</body>
</html>
