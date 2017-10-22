"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Fast computation for (a ⊗ k), when (a ⊕ b) forms a monoid
 *
 * @see https://jokester.io/post/2017-03/monoid-fast-exp/
 */
function fastMul(id, mplus, a, k) {
    if ((k >>> 0) !== k || !(k > 0))
        throw new Error("exp must be positive integer");
    let ans = id;
    while (k > 0) {
        if (k % 2 === 1) {
            ans = mplus(ans, a);
            k--;
        }
        else {
            a = mplus(a, a);
            k /= 2;
        }
    }
    return ans;
}
exports.fastMul = fastMul;
