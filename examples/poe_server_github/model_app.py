import os
from modal import App, Image, asgi_app, Secret, Mount
from src.bot import bot_app

# Environment Setup
image = Image.debian_slim().pip_install(
    "fastapi-poe", "google-genai", "PyGithub", "requests", "pyjwt", "cryptography", "jinja2"
)

app = App("bl1nk-architect-server")

# Mount files
src_mount = Mount.from_local_dir("src", remote_path="/root/src")
utils_mount = Mount.from_local_dir("utils", remote_path="/root/utils")

@app.function(
    image=image, 
    mounts=[src_mount, utils_mount],
    secrets=[Secret.from_name("bl1nk-secrets")]
)
@asgi_app()
def fastapi_app():
    return bot_app()