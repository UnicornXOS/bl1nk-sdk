from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse
import os

auth_router = APIRouter()

# In-Memory Storage สำหรับ Demo (Production ควรใช้ Redis)
# Mapping: poe_user_id -> installation_id
USER_SESSIONS = {}

def is_user_authenticated(poe_user_id: str) -> bool:
    return poe_user_id in USER_SESSIONS

def get_installation_id(poe_user_id: str):
    return USER_SESSIONS.get(poe_user_id)

def get_login_url(poe_user_id: str) -> str:
    # ส่ง poe_user_id ไปเป็น state เพื่อให้ GitHub ส่งกลับมาตอน Callback
    app_name = os.getenv("GITHUB_APP_NAME")
    return f"https://github.com/apps/{app_name}/installations/new?state={poe_user_id}"

@auth_router.get("/auth/callback")
async def auth_callback(installation_id: str, state: str):
    # GitHub จะ Redirect กลับมาที่นี่หลังจาก User กด Install
    # state คือ poe_user_id ที่เราฝากไว้
    USER_SESSIONS[state] = installation_id
    
    return HTMLResponse("""
    <body style="background:#0d1117; color:#c9d1d9; font-family:sans-serif; text-align:center; padding-top:50px;">
        <h1>✅ Connected!</h1>
        <p>You can close this window and go back to Poe.</p>
    </body>
    """)

# รับ Webhook (Optional - เพื่ออัปเดตสิทธิ์ถ้ามีการเปลี่ยนแปลง)
@auth_router.post("/github/webhook")
async def github_webhook(request: Request):
    return {"status": "ok"}