from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "Skatteuttag")
    app_env: str = os.getenv("APP_ENV", "development")
    app_host: str = os.getenv("APP_HOST", "0.0.0.0")
    app_port: int = int(os.getenv("APP_PORT", "31847"))
    app_base_url: str = os.getenv("APP_BASE_URL", "http://10.20.30.100:31847")
    security_contact: str = os.getenv(
        "SECURITY_CONTACT",
        "https://github.com/danielfaldt/skatteuttag/issues",
    )


settings = Settings()
