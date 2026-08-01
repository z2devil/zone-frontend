#!/usr/bin/env swift

import Foundation
import Security

enum KeychainHelperError: Error, CustomStringConvertible {
  case usage
  case status(OSStatus)

  var description: String {
    switch self {
    case .usage:
      return "usage: zone-keychain.swift <get|set|delete> <service> <account>"
    case .status(let status):
      let message = SecCopyErrorMessageString(status, nil) as String? ?? "unknown"
      return "Keychain error \(status): \(message)"
    }
  }
}

func baseQuery(service: String, account: String) -> [String: Any] {
  [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: service,
    kSecAttrAccount as String: account,
  ]
}

func getSecret(service: String, account: String) throws -> Data? {
  var query = baseQuery(service: service, account: account)
  query[kSecReturnData as String] = true
  query[kSecMatchLimit as String] = kSecMatchLimitOne
  var result: CFTypeRef?
  let status = SecItemCopyMatching(query as CFDictionary, &result)
  if status == errSecItemNotFound { return nil }
  guard status == errSecSuccess, let data = result as? Data else {
    throw KeychainHelperError.status(status)
  }
  return data
}

func setSecret(service: String, account: String, secret: Data) throws {
  let query = baseQuery(service: service, account: account)
  let update = [kSecValueData as String: secret]
  let updateStatus = SecItemUpdate(query as CFDictionary, update as CFDictionary)
  if updateStatus == errSecSuccess { return }
  guard updateStatus == errSecItemNotFound else {
    throw KeychainHelperError.status(updateStatus)
  }

  var item = query
  item[kSecValueData as String] = secret
  let addStatus = SecItemAdd(item as CFDictionary, nil)
  guard addStatus == errSecSuccess else {
    throw KeychainHelperError.status(addStatus)
  }
}

func deleteSecret(service: String, account: String) throws -> Bool {
  let status = SecItemDelete(baseQuery(service: service, account: account) as CFDictionary)
  if status == errSecItemNotFound { return false }
  guard status == errSecSuccess else { throw KeychainHelperError.status(status) }
  return true
}

do {
  guard CommandLine.arguments.count == 4 else { throw KeychainHelperError.usage }
  let action = CommandLine.arguments[1]
  let service = CommandLine.arguments[2]
  let account = CommandLine.arguments[3]

  switch action {
  case "get":
    if let secret = try getSecret(service: service, account: account) {
      FileHandle.standardOutput.write(secret)
    } else {
      Foundation.exit(44)
    }
  case "set":
    let secret = FileHandle.standardInput.readDataToEndOfFile()
    guard !secret.isEmpty else { throw KeychainHelperError.usage }
    try setSecret(service: service, account: account, secret: secret)
  case "delete":
    if !(try deleteSecret(service: service, account: account)) {
      Foundation.exit(44)
    }
  default:
    throw KeychainHelperError.usage
  }
} catch {
  FileHandle.standardError.write(Data("\(error)\n".utf8))
  Foundation.exit(1)
}
