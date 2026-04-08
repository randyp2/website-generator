package com.webgen.webgen_backend.util;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.Locale;

/**
 * Centralized URL safety checks used by external portfolio publish/screenshot
 * paths to reduce SSRF risk.
 */
public final class ExternalUrlSafetyValidator {

    private static final String SCHEME_HTTP = "http";
    private static final String SCHEME_HTTPS = "https";

    private ExternalUrlSafetyValidator() {
    }

    /**
     * Parse, normalize and validate an external URL.
     * Accepts only public http/https hosts.
     */
    public static String normalizeAndValidateExternalUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new IllegalArgumentException("externalUrl is required for external publish");
        }

        URI uri = parseAbsoluteUri(rawUrl.trim());
        String scheme = normalizedScheme(uri);

        if (!isHttpScheme(scheme))
            throw new IllegalArgumentException("externalUrl must use http or https");


        if (uri.getRawUserInfo() != null)
            throw new IllegalArgumentException("externalUrl cannot contain user credentials");


        String host = uri.getHost();
        if (host == null || host.isBlank())
            throw new IllegalArgumentException("externalUrl must include a valid hostname");


        if (!isPublicHost(host))
            throw new IllegalArgumentException("externalUrl must resolve to a public internet host");


        return uri.toString();
    }

    /**
     * Used by request interception in screenshot capture.
     * Allows non-network schemes used by browsers, and only public http/https
     * hosts for network requests.
     */
    public static boolean isSafeRequestUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return false;
        }

        URI uri;
        try {
            uri = parseAbsoluteUri(rawUrl.trim());
        } catch (IllegalArgumentException ex) {
            return false;
        }

        String scheme = normalizedScheme(uri);
        if (scheme == null || scheme.isBlank()) {
            return false;
        }

        if ("about".equals(scheme) || "blob".equals(scheme) || "data".equals(scheme)) {
            return true;
        }

        if (!isHttpScheme(scheme)) {
            return false;
        }

        if (uri.getRawUserInfo() != null) {
            return false;
        }

        String host = uri.getHost();
        return host != null && !host.isBlank() && isPublicHost(host);
    }

    private static URI parseAbsoluteUri(String value) {
        try {
            URI uri = new URI(value);
            if (!uri.isAbsolute()) {
                throw new IllegalArgumentException("externalUrl must be an absolute URL");
            }
            return uri;
        } catch (URISyntaxException ex) {
            throw new IllegalArgumentException("externalUrl must be a valid URL");
        }
    }

    private static String normalizedScheme(URI uri) {
        if (uri.getScheme() == null) return null;
        return uri.getScheme().toLowerCase(Locale.ROOT);
    }

    private static boolean isHttpScheme(String scheme) {
        return SCHEME_HTTP.equals(scheme) || SCHEME_HTTPS.equals(scheme);
    }

    private static boolean isPublicHost(String rawHost) {
        String host = rawHost.toLowerCase(Locale.ROOT).trim();

        if (host.equals("localhost")
                || host.endsWith(".localhost")
                || host.endsWith(".local")) {
            return false;
        }

        InetAddress[] addresses;
        try {
            addresses = InetAddress.getAllByName(host);
        } catch (UnknownHostException ex) {
            return false;
        }

        if (addresses.length == 0) return false;

        for (InetAddress address : addresses) {
            if (isBlockedAddress(address)) {
                return false;
            }
        }

        return true;
    }

    private static boolean isBlockedAddress(InetAddress address) {
        if (address.isAnyLocalAddress()
                || address.isLoopbackAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()
                || address.isMulticastAddress()) {
            return true;
        }

        if (address instanceof Inet4Address ipv4) {
            return isBlockedIpv4(ipv4);
        }

        if (address instanceof Inet6Address ipv6) {
            return isBlockedIpv6(ipv6);
        }

        return true;
    }

    private static boolean isBlockedIpv4(Inet4Address address) {
        byte[] bytes = address.getAddress();
        int first = Byte.toUnsignedInt(bytes[0]);
        int second = Byte.toUnsignedInt(bytes[1]);
        int third = Byte.toUnsignedInt(bytes[2]);

        // 0.0.0.0/8
        if (first == 0) return true;

        // 100.64.0.0/10 (carrier-grade NAT)
        if (first == 100 && second >= 64 && second <= 127) return true;

        // 192.0.0.0/24 (IETF protocol assignments)
        if (first == 192 && second == 0 && third == 0) return true;

        // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (documentation ranges)
        if (first == 192 && second == 0 && third == 2) return true;
        if (first == 198 && second == 51 && third == 100) return true;
        if (first == 203 && second == 0 && third == 113) return true;

        // 198.18.0.0/15 (benchmarking)
        if (first == 198 && (second == 18 || second == 19)) return true;

        // 224.0.0.0/4 (multicast and reserved)
        return first >= 224;
    }

    private static boolean isBlockedIpv6(Inet6Address address) {
        byte[] bytes = address.getAddress();

        // IPv4-mapped IPv6 (::ffff:x.x.x.x)
        if (isIpv4MappedIpv6(bytes)) {
            byte[] ipv4 = new byte[] { bytes[12], bytes[13], bytes[14], bytes[15] };
            try {
                InetAddress mapped = InetAddress.getByAddress(ipv4);
                if (mapped instanceof Inet4Address mappedIpv4) {
                    return isBlockedIpv4(mappedIpv4)
                            || mappedIpv4.isLoopbackAddress()
                            || mappedIpv4.isSiteLocalAddress()
                            || mappedIpv4.isLinkLocalAddress()
                            || mappedIpv4.isAnyLocalAddress();
                }
                return true;
            } catch (UnknownHostException ex) {
                return true;
            }
        }

        int first = Byte.toUnsignedInt(bytes[0]);
        int second = Byte.toUnsignedInt(bytes[1]);
        int third = Byte.toUnsignedInt(bytes[2]);
        int fourth = Byte.toUnsignedInt(bytes[3]);

        // fc00::/7 (unique local addresses)
        if ((first & 0xFE) == 0xFC) return true;

        // 2001:db8::/32 (documentation range)
        return first == 0x20 && second == 0x01 && third == 0x0D && fourth == 0xB8;
    }

    private static boolean isIpv4MappedIpv6(byte[] bytes) {
        if (bytes.length != 16) return false;
        for (int i = 0; i < 10; i++) {
            if (bytes[i] != 0x00) return false;
        }
        return bytes[10] == (byte) 0xFF && bytes[11] == (byte) 0xFF;
    }
}
