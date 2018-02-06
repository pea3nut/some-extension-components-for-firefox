@echo off

reg add HKLM\SOFTWARE\Mozilla\NativeMessagingHosts\native_launcher /d %cd%\native\manifest.json /f

if %errorlevel%==0 (
	echo Success.
) else (
	echo Try run as administrator.
)

pause