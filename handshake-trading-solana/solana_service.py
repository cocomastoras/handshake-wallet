import base64

from flask import Flask, Blueprint, request, jsonify
import logging
import json
import solana
from solana.rpc.api import Client as SolanaClient, Pubkey, Keypair
from solana.rpc.commitment import Commitment
import struct
from dataclasses import dataclass

key = Keypair()
print(key)
print(key.pubkey())
httpx_logger = logging.getLogger('httpx')
httpx_logger.setLevel(logging.WARNING)

logging.basicConfig(level=logging.INFO)

SOL_NATIVE_ADDRESS = "So11111111111111111111111111111111111111112"
HELIUS_RPC_URL = "https://mainnet.helius-rpc.com"
HELIUS_API_URL = 'https://api.helius.xyz'
HELIUS_API_KEY = '2242b61b-67b9-4963-8b0e-d379de5b05ee'

api_blueprint = Blueprint("solana_api", __name__, url_prefix="/solana")

webhooks_indexer_blueprint = Blueprint("solana_webhook_indexer", __name__, url_prefix="/solana/webhooks")


@dataclass
class BondingCurveAccount:
    discriminator: int
    virtual_token_reserves: int
    virtual_sol_reserves: int
    real_token_reserves: int
    real_sol_reserves: int
    token_total_supply: int
    complete: bool

    @staticmethod
    def from_buffer(buffer: bytes) -> "BondingCurveAccount":
        # Unpack data from the buffer. "Q" is for unsigned long long (8 bytes) and "?" for bool (1 byte).
        data = struct.unpack("<6Q?", buffer)
        print(data)
        return BondingCurveAccount(
            discriminator=data[0],
            virtual_token_reserves=data[1],
            virtual_sol_reserves=data[2],
            real_token_reserves=data[3],
            real_sol_reserves=data[4],
            token_total_supply=data[5],
            complete=data[6]

        )


@webhooks_indexer_blueprint.route('/create_pool', methods=['POST'])
def webhooks():
    try:
        data = request.get_json()
        if len(data['events']) > 0:
            events = data['events']
            name = events[0]['name']
            if name == 'PoolCreated' and (events[0]['data']['tokenAMint'] == SOL_NATIVE_ADDRESS or events[0]['data'][
                'tokenBMint'] == SOL_NATIVE_ADDRESS):
                logging.info(json.dumps(data, indent=2))
        return jsonify({}), 200
        token_info = {}
        events = data['events']
        # logging.info(json.dumps(events, indent=2))
        token_info['metadata'] = events[0]['data']
        token_info['dev_address'] = events[0]['data']['user']
        token_info['bonding_curve'] = events[0]['data']['bondingCurve']
        rpc_url = f"{HELIUS_RPC_URL}?api-key={HELIUS_API_KEY}"
        connection = SolanaClient(rpc_url, Commitment("confirmed"))
        bonding_curve = connection.get_account_info(solana.rpc.api.Pubkey.from_string(token_info['bonding_curve']))
        data_decoded = BondingCurveAccount.from_buffer(bonding_curve.value.data)
        token_info['virtualSolReserves'] = data_decoded.virtual_sol_reserves
        token_info['virtualTokenReserves'] = data_decoded.virtual_token_reserves
        token_info['total_supply'] = data_decoded.token_total_supply
        # FOR PRICE SOLRESERVES/TOKENRESRVES, LIQ 2X SOLRESRVES, MCAP PRICE_SUPPLY
        if len(events) > 1:
            token_info['dev_native_total'] = events[1]['data']['solAmount']
            token_info['dev_token_total'] = events[1]['data']['tokenAmount']
        else:
            token_info['dev_native_total'] = 0
            token_info['dev_token_total'] = 0
        logging.info(json.dumps(token_info, indent=2))
        return jsonify({}), 200
    except Exception as e:
        logging.error(e)
        return jsonify({'error': 'Error processing webhook'}), 500


@webhooks_indexer_blueprint.route('/swap', methods=['POST'])
def webhooksSwap():
    try:
        data = request.get_json()
        print(data)
        return jsonify({}), 200
        if len(data['events']) > 0:
            events = data['events']
            name = events[0]['name']
            if name == 'PoolCreated' and (events[0]['data']['tokenAMint'] == SOL_NATIVE_ADDRESS or events[0]['data'][
                'tokenBMint'] == SOL_NATIVE_ADDRESS):
                logging.info(json.dumps(data, indent=2))
        return jsonify({}), 200
        token_info = {}
        events = data['events']
        # logging.info(json.dumps(events, indent=2))
        token_info['metadata'] = events[0]['data']
        token_info['dev_address'] = events[0]['data']['user']
        token_info['bonding_curve'] = events[0]['data']['bondingCurve']
        rpc_url = f"{HELIUS_RPC_URL}?api-key={HELIUS_API_KEY}"
        connection = SolanaClient(rpc_url, Commitment("confirmed"))
        bonding_curve = connection.get_account_info(solana.rpc.api.Pubkey.from_string(token_info['bonding_curve']))
        data_decoded = BondingCurveAccount.from_buffer(bonding_curve.value.data)
        token_info['virtualSolReserves'] = data_decoded.virtual_sol_reserves
        token_info['virtualTokenReserves'] = data_decoded.virtual_token_reserves
        token_info['total_supply'] = data_decoded.token_total_supply
        # FOR PRICE SOLRESERVES/TOKENRESRVES, LIQ 2X SOLRESRVES, MCAP PRICE_SUPPLY
        if len(events) > 1:
            token_info['dev_native_total'] = events[1]['data']['solAmount']
            token_info['dev_token_total'] = events[1]['data']['tokenAmount']
        else:
            token_info['dev_native_total'] = 0
            token_info['dev_token_total'] = 0
        logging.info(json.dumps(token_info, indent=2))
        return jsonify({}), 200
    except Exception as e:
        logging.error(e)
        return jsonify({'error': 'Error processing webhook'}), 500


app = Flask(__name__)

app.register_blueprint(webhooks_indexer_blueprint)
app.register_blueprint(api_blueprint)
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)


