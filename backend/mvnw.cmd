@echo off
setlocal

set "BASE_DIR=%~dp0"
set "WRAPPER_PROPERTIES=%BASE_DIR%.mvn\wrapper\maven-wrapper.properties"
set "MAVEN_VERSION=3.9.9"
set "MAVEN_DIST_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%"
set "MAVEN_HOME=%MAVEN_DIST_DIR%\apache-maven-%MAVEN_VERSION%"
set "MAVEN_ZIP=%MAVEN_DIST_DIR%\apache-maven-%MAVEN_VERSION%-bin.zip"

if not exist "%WRAPPER_PROPERTIES%" (
  echo Maven Wrapper properties not found: %WRAPPER_PROPERTIES%
  exit /b 1
)

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  echo Downloading Apache Maven %MAVEN_VERSION%...
  if not exist "%MAVEN_DIST_DIR%" mkdir "%MAVEN_DIST_DIR%"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$props = Get-Content '%WRAPPER_PROPERTIES%' | Where-Object { $_ -match '^distributionUrl=' }; $url = ($props -replace '^distributionUrl=', '').Trim(); Invoke-WebRequest -Uri $url -OutFile '%MAVEN_ZIP%'; Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_DIST_DIR%' -Force"
  if errorlevel 1 (
    echo Failed to download or unpack Apache Maven.
    exit /b 1
  )
)

set "MAVEN_PROJECTBASEDIR=%BASE_DIR%"
call "%MAVEN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
