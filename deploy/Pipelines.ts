import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
    run,
}: HardhatRuntimeEnvironment) {
    await run("deploy:purePipeline");

    await run("deploy:aaveV3Pipeline");
};

export default deployFunction;

deployFunction.tags = ["Pipelines", "Production"];
