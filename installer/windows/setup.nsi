; SPDX-License-Identifier: Apache-2.0
; mycelium-for-forma Windows installer — NSIS 3.x + MUI2 + nsDialogs
Unicode True

!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!define APP_NAME      "Mycelium for Forma"
!define APP_VERSION   "0.1.0"
!define APP_PUBLISHER "Mycelium / OpenAEC"
!define APP_EXE       "mycelium-for-forma.exe"
!define UNREG_KEY     "Software\Microsoft\Windows\CurrentVersion\Uninstall\MyceliumForForma"

Name         "${APP_NAME} ${APP_VERSION}"
OutFile      "..\..\dist\mycelium-for-forma-setup.exe"
InstallDir   "$PROGRAMFILES64\${APP_NAME}"
RequestExecutionLevel admin

!define MUI_ABORTWARNING

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\..\LICENSE"
Page custom CredPage CredPageLeave
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

; ── Credentials page ──────────────────────────────────────────────────────────
Var hDialog
Var hTokenInput
Var hProjectInput
Var FormaToken
Var FormaProjectId

Function CredPage
  !insertmacro MUI_HEADER_TEXT "Forma Credentials" \
    "Enter your Autodesk Platform Services (APS) credentials."
  nsDialogs::Create 1018
  Pop $hDialog
  ${If} $hDialog == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel}  0   0u 100%  10u "FORMA_TOKEN (APS OAuth Bearer token):"
  Pop $0
  ${NSD_CreateText}   0  13u 100%  14u ""
  Pop $hTokenInput

  ${NSD_CreateLabel}  0  33u 100%  10u "FORMA_PROJECT_ID (your Forma project URN or ID):"
  Pop $0
  ${NSD_CreateText}   0  46u 100%  14u ""
  Pop $hProjectInput

  ${NSD_CreateLabel}  0  67u 100%  18u \
    "You can leave these blank and edit %APPDATA%\mycelium-for-forma\.env after install. \
Generate a token at https://aps.autodesk.com"
  Pop $0

  nsDialogs::Show
FunctionEnd

Function CredPageLeave
  ${NSD_GetText} $hTokenInput   $FormaToken
  ${NSD_GetText} $hProjectInput $FormaProjectId
FunctionEnd

; ── Install ────────────────────────────────────────────────────────────────────
Section
  SectionIn RO
  SetOutPath "$INSTDIR"
  File "..\..\dist\mycelium-for-forma-win-x64.exe"
  Rename "$INSTDIR\mycelium-for-forma-win-x64.exe" "$INSTDIR\${APP_EXE}"

  ; Write credentials to %APPDATA%\mycelium-for-forma\.env
  CreateDirectory "$APPDATA\mycelium-for-forma"
  FileOpen  $0 "$APPDATA\mycelium-for-forma\.env" w
  FileWrite $0 "FORMA_TOKEN=$FormaToken$\r$\n"
  FileWrite $0 "FORMA_PROJECT_ID=$FormaProjectId$\r$\n"
  FileClose $0

  ; Start Menu shortcuts
  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\Run Connector.lnk"    "$INSTDIR\${APP_EXE}"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\Edit Credentials.lnk" \
    "notepad.exe" "$APPDATA\mycelium-for-forma\.env"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk"        "$INSTDIR\uninstall.exe"

  ; Desktop shortcut
  CreateShortcut "$DESKTOP\Mycelium for Forma.lnk" "$INSTDIR\${APP_EXE}"

  ; Uninstaller + Add/Remove Programs entry
  WriteUninstaller "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "${UNREG_KEY}" "DisplayName"     "${APP_NAME}"
  WriteRegStr HKLM "${UNREG_KEY}" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegStr HKLM "${UNREG_KEY}" "DisplayVersion"  "${APP_VERSION}"
  WriteRegStr HKLM "${UNREG_KEY}" "Publisher"       "${APP_PUBLISHER}"
  WriteRegStr HKLM "${UNREG_KEY}" "InstallLocation" "$INSTDIR"
SectionEnd

; ── Uninstall ──────────────────────────────────────────────────────────────────
Section "Uninstall"
  Delete "$INSTDIR\${APP_EXE}"
  Delete "$INSTDIR\uninstall.exe"
  RMDir  "$INSTDIR"
  Delete "$SMPROGRAMS\${APP_NAME}\Run Connector.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\Edit Credentials.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk"
  RMDir  "$SMPROGRAMS\${APP_NAME}"
  Delete "$DESKTOP\Mycelium for Forma.lnk"
  DeleteRegKey HKLM "${UNREG_KEY}"
SectionEnd
