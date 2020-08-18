import * as pulumi from "@pulumi/pulumi";
import { InfraConfig } from "../src/config";

const mockConfig: InfraConfig = {
  digitalocean: {
    registryToken: "testRegistryToken",
  },
  kafka: {
    brokers: "testKafkaBrokers",
    apiKey: "testKafkaApiKey",
    apiSecret: "testKafkaApiSecret",
  },
  rendezvous: {
    organizationId: "testOrganizationId",
    services: [
      {
        id: "testServiceId",
        businessTopic: "testBusinessTopic",
        collectionTopic: "testCollectionTopic",
        models: [
          {
            id: "testModelId",
            image: "testModelImage",
          },
        ],
      },
    ],
  },
};

jest.mock("../src/config", () => ({
  _esModule: true,
  default: mockConfig,
}));

pulumi.runtime.setMocks({
  newResource: function (
    type: string,
    name: string,
    inputs: any
  ): { id: string; state: any } {
    return {
      id: inputs.name + "_id",
      state: inputs,
    };
  },
  call: function (token: string, args: any, provider?: string) {
    return args;
  },
});

describe("Infrastructure", function () {
  let infra: typeof import("../src/index");

  beforeAll(async function () {
    // It's important to import the program _after_ the mocks are defined.
    infra = await import("../src/index");
  });

  describe("rendezvous-gateway", function () {
    it("should deploy a krakend container", function (done) {
      const { spec } = infra.gateway.deployment.deployment.spec.template;
      pulumi.all([spec.containers]).apply(([containers]) => {
        if (!containers.find((container) => container.name === "krakend")) {
          done(
            new Error(
              "Rendezvous gateway deployment does not contain a krakend container"
            )
          );
        } else {
          done();
        }
      });
    });
  });
});
