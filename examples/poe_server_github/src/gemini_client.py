import os
import asyncio
from google import genai

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

async def deep_research_task(prompt: str):
    try:
        # Start Research
        interaction = client.interactions.create(
            input=prompt,
            agent='deep-research-pro-preview-12-2025', # ตาม Doc 16-12-2025
            background=True
        )
        
        # Polling Loop
        while True:
            # ใช้ Async sleep เพื่อไม่ให้ block server bot
            await asyncio.sleep(5) 
            
            check = client.interactions.get(interaction.id)
            if check.status == "completed":
                return check.outputs[-1].text
            elif check.status == "failed":
                return f"Research Error: {check.error}"
                
    except Exception as e:
        return f"Gemini API Error: {str(e)}"