import * as pulumi from "@pulumi/pulumi";

interface PulsarConfig {
  url: string;
}

export interface ModelConfig {
  id: string;
  live: boolean;
  type: string;
  config: {
    image: string;
  };
}

export interface ServiceConfig {
  id: string;
  models: [ModelConfig];
}

export interface ConcurrentAiConfig {
  organizationId: string;
  region: string;
  services: [ServiceConfig];
}

export interface InfraConfig {
  isMinikube: boolean;
  pulsar: PulsarConfig;
  concurrentai: ConcurrentAiConfig;
}

const config = new pulumi.Config();

const infraConfig: InfraConfig = {
  isMinikube: config.getBoolean("isMinikube") || false,
  pulsar: config.requireObject<PulsarConfig>("pulsar"),
  concurrentai: config.requireObject<ConcurrentAiConfig>("concurrentai"),
};

export default infraConfig;
