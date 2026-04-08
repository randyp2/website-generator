import { describe, expect, it } from "vitest"

import { formatFileSize } from "./fileHelpers"

describe("formatFileSize", () => {
  it('returns "0 Bytes" for a zero-byte file', () => {
    expect(formatFileSize(0)).toBe("0 Bytes")
  })

  it("formats sub-kilobyte sizes in bytes", () => {
    expect(formatFileSize(1)).toBe("1 Bytes")
    expect(formatFileSize(512)).toBe("512 Bytes")
    expect(formatFileSize(1023)).toBe("1023 Bytes")
  })

  it("formats exact kilobyte boundaries", () => {
    expect(formatFileSize(1024)).toBe("1 KB")
    expect(formatFileSize(2048)).toBe("2 KB")
  })

  it("formats fractional megabytes to two decimals", () => {
    // 1.5 MB = 1.5 * 1024 * 1024 = 1572864
    expect(formatFileSize(1572864)).toBe("1.5 MB")
    // 2.5 MB
    expect(formatFileSize(2621440)).toBe("2.5 MB")
  })

  it("formats exact gigabyte boundaries", () => {
    // 1 GB = 1024 * 1024 * 1024
    expect(formatFileSize(1073741824)).toBe("1 GB")
  })

  it("rounds to two decimal places", () => {
    // 1.333 KB -> 1365 bytes -> 1365/1024 = 1.3330... -> "1.33 KB"
    expect(formatFileSize(1365)).toBe("1.33 KB")
  })
})
