# SS-TMK — Transport Security Monitoring Gateway Specification

[English](README.en.md) | [Русский](README.md)

**Published documentation:** https://ekatmoz88-alt.github.io/ss-tmk-specification/

Technical documentation for the object-level transport-security monitoring and control system gateway.

## Scope

The repository contains a historical integration specification describing XML/WSDL service operations such as `AddEvent`, `AddEventEx`, `GetKnownCoords` and `GetKnownStrategies`. A separate Python MCP/JSON-RPC adapter is also documented in `sc_tmk_gateway.md` and `mcp_server.py`; the MCP adapter must not be confused with the historical SOAP/XML service contract.

## Documentation

- [SS-TMK gateway specification](sc_tmk_gateway.md) — MCP tools and adapter behavior.
- [Historical service/API description](README.md) — system context and SOAP/XML/WSDL methods.

## Evidence and limitations

Examples and sample sensor identifiers should be treated as illustrative unless supported by source configuration or operational evidence. The repository does not establish a live production gateway or deployed transport-security installation.

## Tags

`ss-tmk` · `transport-security` · `integration-gateway` · `soap` · `wsdl` · `xml` · `mcp-adapter`
