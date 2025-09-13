import time as tt

from scripts.TradingBots.bots import *

initial_timestamp = int(tt.time())
timestamp = int(tt.time())
minutes_to_wait = 1

def user_flow():
    account = elect_bot()
    info = get_bot_total_info(account['public_key'])
    info['amount'] = account['amount']
    info['initial_balance'] = account['initial_balance']
    decide_bot_action(account['public_key'], info, account['private_key'])

user_flow()
while True:
    if int(tt.time()) - timestamp > minutes_to_wait*60:
        timestamp = int(tt.time())
        user_flow()
