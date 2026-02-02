@echo off
title Mosquitto MQTT Control Menu

:menu
cls
echo ====================================
echo       MOSQUITTO MQTT CONTROL
echo ====================================
echo.
echo  [1] Jalankan Mosquitto (langsung)
echo  [2] Stop Proses MQTT (port 1883)
echo  [3] Hapus Semua Log Mosquitto
echo  [4] Keluar
echo.
set /p pilihan= Pilih menu [1-4] :

if "%pilihan%"=="1" goto startmqtt
if "%pilihan%"=="2" goto stopmqtt
if "%pilihan%"=="3" goto hapuslog
if "%pilihan%"=="4" exit
goto menu

:startmqtt
@echo off
title Mosquitto MQTT Starter
echo ====================================
echo    CEK DAN BERSIHKAN PORT 1883
echo ====================================
netstat -ano | findstr :1883

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :1883') do (
    echo Menutup PID %%a ...
    taskkill /PID %%a /F
)

echo.
echo ====================================
echo     JALANKAN MOSQUITTO BROKER
echo ====================================
cd "C:\Program Files\mosquitto"
start cmd /k "mosquitto -v -c "C:\Program Files\mosquitto\mosquitto.conf""
powershell -Command "Add-Type -AssemblyName PresentationFramework;[System.Windows.MessageBox]::Show('Mosquitto berhasil dijalankan!')"
pause
goto menu

:stopmqtt
echo.
echo ===============================
echo    Stop proses di port 1883
echo ===============================

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :1883') do (
    echo Menutup PID %%a ...
    taskkill /PID %%a /F
)

sc query mosquitto | find "RUNNING" >nul
if %errorlevel%==0 (
    net stop mosquitto
    echo Service Mosquitto dihentikan.
) else (
    echo Tidak ada service Mosquitto yang aktif.
)

powershell -Command "Add-Type -AssemblyName PresentationFramework;[System.Windows.MessageBox]::Show('Proses Mosquitto dihentikan!')"
pause
goto menu

:hapuslog
echo.
echo ===============================
echo    Hapus semua log Mosquitto
echo ===============================

cd "C:\Program Files\mosquitto"
del /f /q mosquitto_*.log

echo Semua log berhasil dihapus.
powershell -Command "Add-Type -AssemblyName PresentationFramework;[System.Windows.MessageBox]::Show('Semua log Mosquitto dihapus!')"
pause
goto menu