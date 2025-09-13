from firebase_admin import initialize_app, credentials, firestore
import json
from collections import defaultdict

firebase_auth_config = {
  "type": "service_account",
  "project_id": "handshake-wallet-prod",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "",
  "universe_domain": "googleapis.com"
}

cred = credentials.Certificate(firebase_auth_config)
initialize_app(credential=cred)
firestore_client = firestore.client()

networks_configs = {
    doc.id: doc.to_dict()
    for doc in list(firestore_client.collection('networks').stream())
}
networks_ids = list(networks_configs.keys())
print(f"Available networks IDs: {networks_ids}")


def get_token_firestore_id(token_address: str, network_id: str):
    return f"{token_address}:{networks_configs[network_id].get('label').lower()}"


local_storage = defaultdict(lambda: defaultdict(dict))


def get_wallet_asset_history(wallet_address: str, token_address: str, network_id: str, store_locally: bool = False):
    """
    :param wallet_address:
    :param token_address:
    :param network_id:
    :return: Returns a dictionary with the following fields:
               - amount_purchased : float
               - amount_purchased_lossless: str
               - amount_sold: float
               - amount_sold_lossless: str
               - amount_traded: float
               - amount_traded_lossless: str
    """
    fields = ['amount_purchased', 'amount_purchased_lossless', 'amount_sold', 'amount_sold_lossless', 'amount_traded', 'amount_traded_lossless']
    token_id = get_token_firestore_id(token_address, network_id)
    asset_history_doc = firestore_client.collection('wallets').document(wallet_address).collection('assets').document(token_id).get()
    if asset_history_doc.exists:
        asset_history_dict = asset_history_doc.to_dict()
        for field in list(asset_history_dict.keys()):
            if field not in fields:
                asset_history_dict.pop(field)

        if store_locally:
            local_storage[network_id][wallet_address][token_address] = asset_history_dict

        return asset_history_dict


def get_wallet_history(wallet_address: str, network_id: str, store_locally: bool = False):
    """
    :param wallet_address:
    :param token_address:
    :param network_id:
    :return: Returns a nested dictionary with token addresses as keys and values dictionaries with:
               - amount_purchased : float
               - amount_purchased_lossless: str
               - amount_sold: float
               - amount_sold_lossless: str
               - amount_traded: float
               - amount_traded_lossless: str
    """
    fields = ['amount_purchased', 'amount_purchased_lossless', 'amount_sold', 'amount_sold_lossless', 'amount_traded', 'amount_traded_lossless']
    asset_history_dict ={}
    assets_history_docs = firestore_client.collection('wallets').document(wallet_address).collection('assets').get()
    for asset_history_doc in assets_history_docs:
        if asset_history_doc.exists:
            token_address = asset_history_doc.id.split(":")[0]
            asset_history_dict = asset_history_doc.to_dict()
            for field in list(asset_history_dict.keys()):
                if field not in fields:
                    asset_history_dict.pop(field)

            if store_locally:
                local_storage[network_id][wallet_address][token_address] = asset_history_dict

    return asset_history_dict

