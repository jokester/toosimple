import { suite, test } from "mocha-typescript";
import { expect } from "chai";

import { Deferred } from '../util';

@suite
class Test_Deferred {
    @test
    async resolve_fulfill() {
        const p = new Deferred<string>();
        expect(p.resolved).to.eq(false);
        p.fulfill("hey");

        expect(p.resolved).to.eq(true);
        expect(await p.toPromise()).to.eq("hey");

        p.fulfill("ho");
        expect(await p.toPromise()).to.eq("hey");

        p.reject(1);
        expect(await p.toPromise()).to.eq("hey");
    }

    @test
    async resolve_reject() {
        const p = new Deferred<string>();
        expect(p.resolved).to.eq(false);
        p.reject("ho");
        expect(p.resolved).to.eq(true);

        let reason: any;
        try {
            await p.toPromise();
            expect(1).to.eq(0, "should not be here");
        } catch (e) {
            reason = e;
        }

        expect(reason).to.eq("ho");
    }

    @test
    async strict() {
        const p = new Deferred<string>(true);

        p.fulfill("");
        expect(() => p.fulfill("3")).to.throw("already resolved");
        expect(() => p.reject("3")).to.throw("already resolved");
    }
}
