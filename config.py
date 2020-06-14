class Config(object):
    DEBUG = False
    TESTING = False
    DB_HOST = "localhost"
    DB_NAME = "production-db"
    DB_USERNAME = "username"
    DB_PASSWORD = "password"

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True

    DB_HOST = "localhost"
    DB_NAME = "development-db"
    DB_USERNAME = "username"
    DB_PASSWORD = "password"

class TestingConfig(Config):
    TESTING = True

    DB_HOST = "localhost"
    DB_NAME = "testing-db"
    DB_USERNAME = "username"
    DB_PASSWORD = "password"