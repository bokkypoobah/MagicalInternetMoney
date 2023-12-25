(function () {
    if (typeof module !== 'undefined') {
        BN = module.require('bn.js')
        randomBytes = module.require('crypto').randomBytes
    } else {
        // bn.js must have been included by the main html file
        randomBytes = length => window.crypto.getRandomValues(new Uint8Array(length))
        window.Secp256k1 = exports = {}
    }

    function uint256(x, base) {
        return new BN(x, base)
    }

    function rnd(P) {
        return uint256(randomBytes(32)).umod(P)//TODO red
    }

    const A  = uint256(0)
    const B  = uint256(7)
    const GX = uint256("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16)
    const GY = uint256("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16)
    const P  = uint256("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16)
    const N  = uint256("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16)
    //const RED = BN.red(P)
    const _0 = uint256(0)
    const _1 = uint256(1)

    // function for elliptic curve multiplication in jacobian coordinates using Double-and-add method
    function ecmul(_p, _d) {
        let R = [_0,_0,_0]

        //return (0,0) if d=0 or (x1,y1)=(0,0)
        if (_d == 0 || ((_p[0] == 0) && (_p[1] == 0)) ) {
            return R
        }
        let T = [
            _p[0], //x-coordinate temp
            _p[1], //y-coordinate temp
            _p[2], //z-coordinate temp
        ]

        const d = _d.clone()
        while (d != 0) {
            if (d.testn(0)) {  //if last bit is 1 add T to result
                R = ecadd(T,R)
            }
            T = ecdouble(T);    //double temporary coordinates
            d.iushrn(1);      //"cut off" last bit
        }

        return R
    }

    function mulmod(a, b, P) {
        return a.mul(b).umod(P)//TODO red
    }

    function addmod(a, b, P) {
        return a.add(b).umod(P)//TODO red
    }

    function invmod(a, P) {
        return a.invm(P)//TODO redq
    }

    function mulG(k) {
        const GinJ = AtoJ(GX, GY)
        const PUBinJ = ecmul(GinJ, k)
        return JtoA(PUBinJ)
    }

    function assert(cond, msg) {
        if (!cond) {
            throw Error("assertion failed: " + msg)
        }
    }

    function ecsign(d, z) {
        assert(d != 0, "d must not be 0")
        assert(z != 0, "z must not be 0")
        while (true) {
            const k = rnd(P)
            const R = mulG(k)
            if (R[0] == 0) continue
            const s = mulmod(invmod(k, N), addmod(z, mulmod(R[0], d, N), N), N)
            if (s == 0) continue
            //FIXME: why do I need this
            if (s.testn(255)) continue
            return {r: toHex(R[0]), s: toHex(s), v: R[1].testn(0) ? 1 : 0}
        }
    }

    function JtoA(p) {
        const zInv = invmod(p[2], P)
        const zInv2 = mulmod(zInv, zInv, P)
        return [mulmod(p[0], zInv2, P), mulmod(p[1], mulmod(zInv, zInv2, P), P)]
    }

    //point doubling for elliptic curve in jacobian coordinates
    //formula from https://en.wikibooks.org/wiki/Cryptography/Prime_Curve/Jacobian_Coordinates
    function ecdouble(_p) {
        if (_p[1] == 0) {
            //return point at infinity
            return [_1, _1, _0]
        }

        const z2 = mulmod(_p[2], _p[2], P)
        const m = addmod(mulmod(A, mulmod(z2, z2, P), P), mulmod(uint256(3), mulmod(_p[0], _p[0], P), P), P)
        const y2 = mulmod(_p[1], _p[1], P)
        const s = mulmod(uint256(4), mulmod(_p[0], y2, P), P)

        const x = addmod(mulmod(m, m, P), negmod(mulmod(s, uint256(2), P), P), P)
        return [
            x,
            addmod(mulmod(m, addmod(s, negmod(x, P), P), P), negmod(mulmod(uint256(8), mulmod(y2, y2, P), P), P), P),
            mulmod(uint256(2), mulmod(_p[1], _p[2], P), P)
        ]
    }

    function negmod(a, P) {
        return P.sub(a)
    }

    // point addition for elliptic curve in jacobian coordinates
    // formula from https://en.wikibooks.org/wiki/Cryptography/Prime_Curve/Jacobian_Coordinates
    function ecadd(_p, _q) {
        if (_q[0] == 0 && _q[1] == 0 && _q[2] == 0) {
            return _p
        }

        let z2 = mulmod(_q[2], _q[2], P)
        const u1 = mulmod(_p[0], z2, P)
        const s1 = mulmod(_p[1], mulmod(z2, _q[2], P), P)
        z2 = mulmod(_p[2], _p[2], P)
        let u2 = mulmod(_q[0], z2, P)
        let s2 = mulmod(_q[1], mulmod(z2, _p[2], P), P)

        if (u1.eq(u2)) {
            if (!s1.eq(s2)) {
                //return point at infinity
                return [_1, _1, _0]
            }
            else {
                return ecdouble(_p)
            }
        }

        u2 = addmod(u2, negmod(u1, P), P)
        z2 = mulmod(u2, u2, P)
        const t2 = mulmod(u1, z2, P)
        z2 = mulmod(u2, z2, P)
        s2 = addmod(s2, negmod(s1, P), P)
        const x = addmod(addmod(mulmod(s2, s2, P), negmod(z2, P), P), negmod(mulmod(uint256(2), t2, P), P), P)
        return [
            x,
            addmod(mulmod(s2, addmod(t2, negmod(x, P), P), P), negmod(mulmod(s1, z2, P), P), P),
            mulmod(u2, mulmod(_p[2], _q[2], P), P)
        ]
    }

    function AtoJ(x, y) {
        return [
            uint256(x),
            uint256(y),
            _1
        ]
    }

    function isValidPoint(x, y) {
        const yy = addmod(mulmod(mulmod(x, x, P), x, P), B, P)
        return yy.eq(mulmod(y, y, P))
    }

    function toHex(bn) {
        return ('00000000000000000000000000000000000000000000000000000000000000000000000000000000' + bn.toString(16)).slice(-64)
    }

    function decompressKey(x, yBit) {
        let redP = BN.red('k256');
        x = x.toRed(redP)
        const y = x.redMul(x).redMul(x).redAdd(B.toRed(redP)).redSqrt()
        const sign = y.testn(0)
        return (sign != yBit ? y.redNeg() : y).fromRed()
    }

    function generatePublicKeyFromPrivateKeyData(pk) {
        const p = mulG(pk)
        return {x: toHex(p[0]), y: toHex(p[1])}
    }

    function ecrecover(recId, sigr, sigs, message) {
        assert(recId >= 0 && recId <= 3, "recId must be 0..3")
        assert(sigr != 0, "sigr must not be 0")
        assert(sigs != 0, "sigs must not be 0")
        // 1.0 For j from 0 to h   (h == recId here and the loop is outside this function)
        //   1.1 Let x = r + jn
        const x = addmod(uint256(sigr), P.muln(recId >> 1), P)
        //   1.2. Convert the integer x to an octet string X of length mlen using the conversion routine
        //        specified in Section 2.3.7, where mlen = ⌈(log2 p)/8⌉ or mlen = ⌈m/8⌉.
        //   1.3. Convert the octet string (16 set binary digits)||X to an elliptic curve point R using the
        //        conversion routine specified in Section 2.3.4. If this conversion routine outputs “invalid”, then
        //        do another iteration of Step 1.
        //
        // More concisely, what these points mean is to use X as a compressed public key.
        if (x.gte(P)) {
            // Cannot have point co-ordinates larger than this as everything takes place modulo Q.
            return null
        }
        // Compressed keys require you to know an extra bit of data about the y-coord as there are two possibilities.
        // So it's encoded in the recId.
        const y = decompressKey(x, (recId & 1) == 1)
        //   1.4. If nR != point at infinity, then do another iteration of Step 1 (callers responsibility).
        // if (!R.mul(N).isInfinity())
        //     return null
        //   1.5. Compute e from M using Steps 2 and 3 of ECDSA signature verification.
        const e = uint256(message)
        //   1.6. For k from 1 to 2 do the following.   (loop is outside this function via iterating recId)
        //   1.6.1. Compute a candidate public key as:
        //               Q = mi(r) * (sR - eG)
        //
        // Where mi(x) is the modular multiplicative inverse. We transform this into the following:
        //               Q = (mi(r) * s ** R) + (mi(r) * -e ** G)
        // Where -e is the modular additive inverse of e, that is z such that z + e = 0 (mod n). In the above equation
        // ** is point multiplication and + is point addition (the EC group operator).
        //
        // We can find the additive inverse by subtracting e from zero then taking the mod. For example the additive
        // inverse of 3 modulo 11 is 8 because 3 + 8 mod 11 = 0, and -3 mod 11 = 8.
        const eNeg = negmod(e, N)
        const rInv = invmod(sigr, N)
        const srInv = mulmod(rInv, sigs, N)
        const eNegrInv = mulmod(rInv, eNeg, N)
        const R = AtoJ(x, y)
        const G = AtoJ(GX, GY)
        const qinJ = ecadd(ecmul(G, eNegrInv), ecmul(R, srInv))
        const p = JtoA(qinJ)
        return {x: toHex(p[0]), y: toHex(p[1])}
    }

    function ecverify (Qx, Qy, sigr, sigs, z) {
        if (sigs == 0 || sigr == 0) {
            return false
        }
        const w = invmod(sigs, N)
        const u1 = mulmod(z, w, N)
        const u2 = mulmod(sigr, w, N)
        const Q = AtoJ(Qx, Qy)
        const G = AtoJ(GX, GY)
        const RinJ = ecadd(ecmul(G, u1), ecmul(Q, u2))
        const r = JtoA(RinJ)
        return sigr.eq(r[0])
    }

    exports.uint256 = uint256
    exports.ecsign = ecsign
    exports.ecrecover = ecrecover
    exports.generatePublicKeyFromPrivateKeyData = generatePublicKeyFromPrivateKeyData
    exports.decompressKey = decompressKey
    exports.isValidPoint = isValidPoint
    exports.ecverify = ecverify
})()
