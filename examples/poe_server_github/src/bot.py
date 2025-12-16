from fastapi import FastAPI
import fastapi_poe as fp
from src.auth import auth_router, is_user_authenticated, get_login_url
from src.orchestrator import run_architect_workflow

class Bl1nkBot(fp.PoeBot):
    async def get_response(self, request: fp.QueryRequest):
        # 1. Yield Meta Event (ตาม Spec เพื่อบอกว่าเป็น Markdown)
        yield fp.MetaResponse(content_type="text/markdown", linkify=True)

        user_id = request.user_id
        
        # 2. Check Auth: ถ้ายังไม่เชื่อม GitHub App ให้ส่ง Link
        if not is_user_authenticated(user_id):
            login_url = get_login_url(user_id)
            yield fp.PartialResponse(text=f"""
🔒 **Authentication Required**

To analyze your private repositories, Bl1nk needs access via the GitHub App.

👉 [**Click here to Authorize GitHub Access**]({login_url})

_After authorizing, please reply with "Start" again._
            """)
            return

        # 3. ถ้า Auth แล้ว ให้เริ่ม Workflow
        last_message = request.query[-1].content
        
        # ส่ง Status บอก User ว่าเริ่มงานแล้ว
        yield fp.PartialResponse(text="🏗️ **Bl1nk Architect Initialized**\n\n_Connecting to GitHub & Gemini Deep Research..._\n\n")

        # 4. เรียก Orchestrator ให้ทำงาน (Stream ผลลัพธ์กลับมา)
        async for chunk in run_architect_workflow(last_message, user_id):
            yield fp.PartialResponse(text=chunk)

    async def get_settings(self, setting: fp.SettingsRequest) -> fp.SettingsResponse:
        # Declare ว่าเราจะใช้ Bot ตัวไหนบ้าง (ตาม Spec)
        return fp.SettingsResponse(
            server_bot_dependencies={"Gemini-1.5-Pro": 1},
            allow_attachments=True,
            introduction_message="Hello! I am **Bl1nk Architect**. Please login to GitHub to start auditing your codebase."
        )

def bot_app():
    app = FastAPI()
    app.include_router(auth_router) # รวม Auth Routes
    fp.make_app(Bl1nkBot(), access_key=os.environ.get("POE_ACCESS_KEY"), app=app)
    return app