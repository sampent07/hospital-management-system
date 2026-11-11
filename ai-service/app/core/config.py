from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart OPD AI Inference Service"
    MODEL_VERSION: str = "v1.0.0-rl-baseline"
    INFERENCE_SEED: int = 42

    class Config:
        env_file = ".env"


settings = Settings()
