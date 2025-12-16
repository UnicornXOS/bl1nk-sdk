import os
import time
import jwt
import requests
from github import Github, Auth

class GitHubClient:
    def __init__(self, installation_id):
        self.app_id = os.getenv("GITHUB_APP_ID")
        self.private_key = os.getenv("GITHUB_PRIVATE_KEY")
        self.installation_id = installation_id
        self.client = self._get_client()

    def _get_jwt(self):
        now = int(time.time())
        payload = {"iat": now - 60, "exp": now + 600, "iss": self.app_id}
        return jwt.encode(payload, self.private_key, algorithm="RS256")

    def _get_client(self):
        jwt_token = self._get_jwt()
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github+json"
        }
        # ขอ Token สำหรับ Installation นี้โดยเฉพาะ
        url = f"https://api.github.com/app/installations/{self.installation_id}/access_tokens"
        res = requests.post(url, headers=headers)
        res.raise_for_status()
        
        token = res.json()["token"]
        return Github(auth=Auth.Token(token))

    def list_files(self, limit=100):
        # ดึง Repo ทั้งหมดที่ App ติดตั้งอยู่
        # (Demo: เลือกอันแรก หรือต้องให้ User เลือกผ่าน Chat)
        # สมมติเอาอันแรกที่เจอ
        repos = self.client.get_installation(self.installation_id).get_repos()
        if repos.totalCount == 0:
            return ["No repositories found."]
            
        repo = repos[0] # Target Repo
        
        files = []
        contents = repo.get_contents("")
        while contents:
            file_content = contents.pop(0)
            if file_content.type == "dir":
                contents.extend(repo.get_contents(file_content.path))
            else:
                files.append(file_content.path)
            if len(files) >= limit: break
        return files