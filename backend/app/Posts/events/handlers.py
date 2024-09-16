# import boto3
# import json

# client = boto3.client('events')

# def put_event(post_id, action_type):
#     response = client.put_events(
#         Entries=[
#             {
#                 'Source': 'com.montyvoice.posts',
#                 'DetailType': 'Post Event',
#                 'Detail': json.dumps({
#                     'post_id': post_id,
#                     'action_type': action_type
#                 }),
#                 'EventBusName': 'default'
#             }
#         ]
#     )
#     return response



# import json
# import boto3
# from db_utils import get_user_id_by_email, delete_post_from_db
# from Services import process_post_creation, process_post_deletion

# Initialize the DynamoDB client
# dynamodb = boto3.client('dynamodb')

# def process_event(event, context):
#     """
#     Handler for AWS EventBridge events related to post operations.
#     """
#     try:
#         # Extract the event details
#         detail = event.get('detail', {})
#         action_type = detail.get('action_type', 'UNKNOWN')
#         post_id = detail.get('post_id')
#         email = detail.get('email')

#         if not post_id or not action_type:
#             raise ValueError("Missing required parameters for event processing")

#         print(f"Processing event: {json.dumps(event)}")

#         if action_type == "create":
#             handle_post_creation(post_id, email)
        
#         elif action_type == "delete":
#             handle_post_deletion(post_id, email)
        
#         else:
#             print(f"Unknown action type: {action_type}")
#             return {
#                 "statusCode": 400,
#                 "body": json.dumps({"message": "Unknown action type"})
#             }

#         return {
#             "statusCode": 200,
#             "body": json.dumps({"message": "Event processed successfully"})
#         }

#     except Exception as e:
#         print(f"Error processing event: {str(e)}")
#         return {
#             "statusCode": 500,
#             "body": json.dumps({"message": "Error processing event", "error": str(e)})
#         }

# def handle_post_creation(post_id, email):
#     """
#     Handle post creation events.
#     """
#     user_id = get_user_id_by_email(email)
#     if user_id:
#         process_post_creation(post_id, user_id)
#     else:
#         print(f"User with email {email} not found")

# def handle_post_deletion(post_id, email):
#     """
#     Handle post deletion events.
#     """
#     user_id = get_user_id_by_email(email)
#     if user_id:
#         delete_post_from_db(post_id, user_id)
#     else:
#         print(f"User with email {email} not found")

