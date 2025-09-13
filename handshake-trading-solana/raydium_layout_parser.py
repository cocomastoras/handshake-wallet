from solders.pubkey import Pubkey
from solana.rpc import api as solana_api
from solana.rpc.types import MemcmpOpts, TokenAccountOpts
import struct


# Define a function to decode u64 (64-bit unsigned integer)
def decode_u64(data, offset):
    return struct.unpack_from('<Q', data, offset)[0], offset + 8

# Define a function to decode u128 (128-bit unsigned integer)
def decode_u128(data, offset):
    return struct.unpack_from('<QQ', data, offset), offset + 16

# Define a function to decode publicKey (32-byte value)
def decode_publicKey(data, offset):
    return data[offset:offset + 32], offset + 32

# Define a function to decode a sequence of u64 (64-bit unsigned integers)
def decode_seq_u64(data, count, offset):
    values = []
    for _ in range(count):
        value, offset = decode_u64(data, offset)
        values.append(value)
    return values, offset

# Define the main decoder function
def decode_layout(data):
    offset = 0
    decoded_data = {}

    # Decoding fields according to the layout
    decoded_data["status"], offset = decode_u64(data, offset)
    decoded_data["nonce"], offset = decode_u64(data, offset)
    decoded_data["maxOrder"], offset = decode_u64(data, offset)
    decoded_data["depth"], offset = decode_u64(data, offset)
    decoded_data["baseDecimal"], offset = decode_u64(data, offset)
    decoded_data["quoteDecimal"], offset = decode_u64(data, offset)
    decoded_data["state"], offset = decode_u64(data, offset)
    decoded_data["resetFlag"], offset = decode_u64(data, offset)
    decoded_data["minSize"], offset = decode_u64(data, offset)
    decoded_data["volMaxCutRatio"], offset = decode_u64(data, offset)
    decoded_data["amountWaveRatio"], offset = decode_u64(data, offset)
    decoded_data["baseLotSize"], offset = decode_u64(data, offset)
    decoded_data["quoteLotSize"], offset = decode_u64(data, offset)
    decoded_data["minPriceMultiplier"], offset = decode_u64(data, offset)
    decoded_data["maxPriceMultiplier"], offset = decode_u64(data, offset)
    decoded_data["systemDecimalValue"], offset = decode_u64(data, offset)
    decoded_data["minSeparateNumerator"], offset = decode_u64(data, offset)
    decoded_data["minSeparateDenominator"], offset = decode_u64(data, offset)
    decoded_data["tradeFeeNumerator"], offset = decode_u64(data, offset)
    decoded_data["tradeFeeDenominator"], offset = decode_u64(data, offset)
    decoded_data["pnlNumerator"], offset = decode_u64(data, offset)
    decoded_data["pnlDenominator"], offset = decode_u64(data, offset)
    decoded_data["swapFeeNumerator"], offset = decode_u64(data, offset)
    decoded_data["swapFeeDenominator"], offset = decode_u64(data, offset)
    decoded_data["baseNeedTakePnl"], offset = decode_u64(data, offset)
    decoded_data["quoteNeedTakePnl"], offset = decode_u64(data, offset)
    decoded_data["quoteTotalPnl"], offset = decode_u64(data, offset)
    decoded_data["baseTotalPnl"], offset = decode_u64(data, offset)
    decoded_data["poolOpenTime"], offset = decode_u64(data, offset)
    decoded_data["punishPcAmount"], offset = decode_u64(data, offset)
    decoded_data["punishCoinAmount"], offset = decode_u64(data, offset)
    decoded_data["orderbookToInitTime"], offset = decode_u64(data, offset)

    # Decoding u128 fields
    decoded_data["swapBaseInAmount"], offset = decode_u128(data, offset)
    decoded_data["swapQuoteOutAmount"], offset = decode_u128(data, offset)

    # Decoding more u64 fields
    decoded_data["swapBase2QuoteFee"], offset = decode_u64(data, offset)
    decoded_data["swapQuoteInAmount"], offset = decode_u128(data, offset)
    decoded_data["swapBaseOutAmount"], offset = decode_u128(data, offset)
    decoded_data["swapQuote2BaseFee"], offset = decode_u64(data, offset)

    # Decoding publicKey fields
    decoded_data["baseVault"], offset = decode_publicKey(data, offset)
    decoded_data["quoteVault"], offset = decode_publicKey(data, offset)
    decoded_data["baseMint"], offset = decode_publicKey(data, offset)
    decoded_data["quoteMint"], offset = decode_publicKey(data, offset)
    decoded_data["lpMint"], offset = decode_publicKey(data, offset)
    decoded_data["openOrders"], offset = decode_publicKey(data, offset)
    decoded_data["marketId"], offset = decode_publicKey(data, offset)
    decoded_data["marketProgramId"], offset = decode_publicKey(data, offset)
    decoded_data["targetOrders"], offset = decode_publicKey(data, offset)
    decoded_data["withdrawQueue"], offset = decode_publicKey(data, offset)
    decoded_data["lpVault"], offset = decode_publicKey(data, offset)
    decoded_data["owner"], offset = decode_publicKey(data, offset)

    # Decoding lpReserve and padding
    decoded_data["lpReserve"], offset = decode_u64(data, offset)
    decoded_data["padding"], offset = decode_seq_u64(data, 3, offset)

    return decoded_data

# Define Solana RPC Endpoint
SOLANA_CLIENT = solana_api.Client("https://mainnet.helius-rpc.com/?api-key=")
# Raydium AMM V4 Program ID
RAYDIUM_AMM_V4_PROGRAM_ID = Pubkey.from_string("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8")

# Define Token Mints
SOL_MINT = Pubkey.from_string("So11111111111111111111111111111111111111112")
TOKEN_MINT = Pubkey.from_string("HEHT1eKNsTnuMAQaSM4ac8r3ynckmquxA3hUun5Npump")

# Sort token mints lexicographically (Raydium requires this)
sorted_mints = sorted([SOL_MINT, TOKEN_MINT], key=lambda x: str(x))
base_mint, quote_mint = sorted_mints

LIQUIDITY_STATE_LAYOUT_V4_SPAN = 752
LIQUIDITY_STATE_LAYOUT_V4_OFFSET_OF_BASE_MINT = 400
LIQUIDITY_STATE_LAYOUT_V4_OFFSET_OF_QUOTE_MINT = 432

# Define filters for both possible token orders
filters = [
    LIQUIDITY_STATE_LAYOUT_V4_SPAN,
    MemcmpOpts(offset=LIQUIDITY_STATE_LAYOUT_V4_OFFSET_OF_BASE_MINT, bytes=str(base_mint)),
    MemcmpOpts(offset=LIQUIDITY_STATE_LAYOUT_V4_OFFSET_OF_QUOTE_MINT, bytes=str(quote_mint))
]

reverse_filters = [
    LIQUIDITY_STATE_LAYOUT_V4_SPAN,
    MemcmpOpts(offset=LIQUIDITY_STATE_LAYOUT_V4_OFFSET_OF_BASE_MINT, bytes=str(quote_mint)),
    MemcmpOpts(offset=LIQUIDITY_STATE_LAYOUT_V4_OFFSET_OF_QUOTE_MINT, bytes=str(base_mint))
]

response = SOLANA_CLIENT.get_program_accounts(RAYDIUM_AMM_V4_PROGRAM_ID, filters=filters)
response_reverse = SOLANA_CLIENT.get_program_accounts(RAYDIUM_AMM_V4_PROGRAM_ID, filters=reverse_filters)
rsp = response_reverse.value + response.value

for account in rsp:
    pair = str(account.pubkey)
    layout = decode_layout(account.account.data)
    base_vault = Pubkey.from_bytes(layout['baseVault'])
    quote_vault = Pubkey.from_bytes(layout['quoteVault'])
    print(pair)
    print(base_vault)
    print(quote_vault)
