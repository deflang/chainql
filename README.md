# infura-mcp 🌱

[![GitHub stars](https://img.shields.io/github/stars/deflang/infura-mcp?style=social)](https://github.com/deflang/infura-mcp/stargazers)
[![PyPI version](https://img.shields.io/pypi/v/infura-mcp)](https://pypi.org/project/infura-mcp/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/deflang/infura-mcp/ci.yml?branch=main)](https://github.com/deflang/infura-mcp/actions)
[![License](https://img.shields.io/github/license/deflang/infura-mcp)](./LICENSE)

**Natural language → Ethereum on-chain data, instantly.**

infura-mcp is a MCP server that lets developers query Ethereum blockchain data using Infura APIs

> ⭐ If you find infura-mcp useful, please **star this repo**! Your support is crucial for our growth and helps us improve faster.

This project is not sponsored or supported by [Infura](https://www.infura.io) in any way.

---

## Develop

1. Install the dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

---

## Available Tools

Note :
1. All the read only tools are prefixed with **get** while remaining are write tools.
2. **write tools** are disabled by default but can be enabled by setting **WRITE_TOOLS_ENABLED=false** in the env

The following tools are available in infura-mcp.

- `eth_get_accounts`
- `eth_get_balance`
- `eth_get_blob_base_fee`
- `eth_get_block_by_hash`
- `eth_get_block_by_number`
- `eth_get_block_number`
- `eth_get_block_receipts`
- `eth_get_block_transaction_count_by_hash`
- `eth_get_block_transaction_count_by_number`
- `eth_get_code`
- `eth_get_fee_history`
- `eth_get_gas_estimate`
- `eth_get_gas_price`
- `eth_get_logs`
- `eth_get_proof`
- `eth_get_storage_at`
- `eth_get_transaction_by_block_hash_and_index`
- `eth_get_transaction_by_block_number_and_index`
- `eth_get_transaction_by_hash`
- `eth_get_transaction_count`
- `eth_get_transaction_receipt`
- `eth_get_uncle_by_block_hash_and_index`
- `eth_get_uncle_by_block_number_and_index`
- `eth_get_uncle_count_by_block_hash`
- `eth_get_uncle_count_by_block_number`
- `eth_get_work`
- `eth_get_hashrate`
- `eth_max_priority_fee_per_gas`
- `eth_get_mining_status`
- `eth_get_protocol_version`
- `eth_send_raw_transaction`
- `eth_get_simulated_transactions`