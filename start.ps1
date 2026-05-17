Write-Host "Starting Backend on port 8001..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload --port 8001"

Write-Host "Starting Frontend on port 5173..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Both servers are starting in new windows."
Write-Host "Backend will be at http://localhost:8001"
Write-Host "Frontend will be at http://localhost:5173"
