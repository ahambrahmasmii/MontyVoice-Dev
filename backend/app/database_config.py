#import statements
import pymysql
import os
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    connection = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        db=os.getenv('DB_NAME'),
        cursorclass=DictCursor
    )
    return connection

def get_db():
    db = get_connection()
    try:
        yield db
    finally:
        db.close()