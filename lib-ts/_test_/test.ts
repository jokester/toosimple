import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';

@suite class TestSuite {
    @test
    testSync() {
    }

    @test
    async testAsync() {
    }
}
