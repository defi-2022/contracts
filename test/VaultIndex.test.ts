import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { deployments, ethers, network, run } from "hardhat";
import { ERC20Mock, Factory, VaultIndex } from "../typechain";
import { both } from "./shared/utils";
import { displayIndex } from "./shared/indexUtils";

const { getContract, getContractAt, getSigners } = ethers;
const { MaxUint256 } = ethers.constants;
const { parseUnits } = ethers.utils;

describe("Test Indexes", function () {
    let owner: SignerWithAddress, other: SignerWithAddress;
    let usdc: ERC20Mock,
        usdt: ERC20Mock,
        dai: ERC20Mock,
        busd: ERC20Mock,
        factory: Factory;
    let snapshotId: any;

    before(async function () {
        [owner, other] = await getSigners();

        await deployments.fixture();

        await run("setup");

        usdc = await getContract("USDC");
        usdt = await getContract("USDT");
        dai = await getContract("DAI");
        busd = await getContract("BUSD");
        factory = await getContract("Factory");
    });

    beforeEach(async function () {
        snapshotId = await network.provider.request({
            method: "evm_snapshot",
            params: [],
        });
    });

    afterEach(async function () {
        snapshotId = await network.provider.request({
            method: "evm_revert",
            params: [snapshotId],
        });
    });

    describe("Index with pure tokens", function () {
        let indexName: string,
            indexSymbol: string,
            components: { vault: string; targetWeight: number }[],
            weights: number[],
            weightsTotal: number,
            buyCurrency: ERC20Mock,
            buyAmount: BigNumberish;
        let index: VaultIndex;

        this.beforeEach(async function () {
            indexName = "MyIndex";
            indexSymbol = "MID";
            components = [
                { vault: usdc.address, targetWeight: 300 },
                { vault: usdt.address, targetWeight: 300 },
                { vault: dai.address, targetWeight: 300 },
            ];
            weights = [1, 1, 1];
            weightsTotal = 3;
            buyCurrency = usdc;
            buyAmount = parseUnits("100", 6);

            const { reply } = await both(factory, "createIndex", [
                indexName,
                indexSymbol,
                components,
            ]);
            index = await getContractAt("VaultIndex", reply);

            await usdc.mint(owner.address, parseUnits("100", 6));
            await usdc.approve(index.address, MaxUint256);
            await index.deposit(usdc.address, parseUnits("100", 6));
        });

        it("index parameters should be correct", async function () {
            expect(await index.name()).to.equal(indexName);
            expect(await index.symbol()).to.equal(indexSymbol);

            for (let i = 0; i < components.length; i++) {
                const component = await index.components(i);
                expect(component.vault).to.equal(components[i].vault);
                expect(component.targetWeight).to.equal(
                    components[i].targetWeight
                );
            }

            await displayIndex(index);
        });

        it("rebalancing should work", async function () {
            await index.rebalanceFromTo(1, 2, 50, 100);

            await displayIndex(index);
        });

        it("removing with rebalancing should work", async function () {
            await index.removeComponent(2);

            await displayIndex(index);
        });

        it("adding with rebalancing should work", async function () {
            await index.addComponent({
                vault: busd.address,
                targetWeight: 100,
            });

            await displayIndex(index);
        });
    });
});