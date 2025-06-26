from fastapi import FastAPI
from .routers import videos_router

app=FastAPI()
app.include_router(videos_router)