from web3 import Web3
from abi import router_abi, multicall_abi

rpc = "https://base.meowrpc.com"
w3 = Web3(Web3.HTTPProvider(rpc))

contract_address = w3.to_checksum_address('0x21D3bEB73880feF23Fdc322e679E8bDb630740Df')
router = w3.eth.contract(address=contract_address, abi=router_abi)

multicall_address = w3.to_checksum_address('0x3B2E67Ab462e6d2C70A6a08aB7648e96c9D95c60')
multicall = w3.eth.contract(address=multicall_address, abi=multicall_abi)

network_to_tokens = {
    'base': [
        '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
        '0x2Da56AcB9Ea78330f947bD57C54119Debda7AF71',
        '0x532f27101965dd16442E59d40670FaF5eBB142E4',
        '0x9a26F5433671751C3276a065f57e5a02D2817973',
        '0xdb6e0e5094A25a052aB6845a9f1e486B9A9B3DdE',
        '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
        '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4',
        '0xB1a03EdA10342529bBF8EB700a06C60441fEf25d',
        '0x50dA645f148798F68EF2d7dB7C1CB22A6819bb2C',
        '0xb56d0839998Fd79EFCD15c27cF966250AA58D6D3'
    ]
}
