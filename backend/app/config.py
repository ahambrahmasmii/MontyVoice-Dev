from passlib.context import CryptContext
import boto3


# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# S3 configuration
s3_client = boto3.client("s3")
BUCKET_NAME = "montyvoice-backimages"
cognito_client = boto3.client('cognito-idp', region_name='us-east-1')