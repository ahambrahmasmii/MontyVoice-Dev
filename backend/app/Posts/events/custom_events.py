# import json
# import boto3

# event_bridge = boto3.client('events')

# def publish_event(detail_type, detail):
#     event_bridge.put_events(
#         Entries=[
#             {
#                 'Source': 'com.montyvoicee.posts',
#                 'DetailType': detail_type,
#                 'Detail': json.dumps(detail),
#                 'EventBusName': 'default'
#             }
#         ]
#     )
