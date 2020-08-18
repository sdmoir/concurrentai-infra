import * as pulumi from "@pulumi/pulumi";

interface DigitalOceanConfig {
  registryToken: string;
}

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

export interface RendezvousConfig {
  organizationId: string;
  region: string;
  services: [ServiceConfig];
}

export interface InfraConfig {
  isMinikube: boolean;
  digitalocean: DigitalOceanConfig;
  pulsar: PulsarConfig;
  rendezvous: RendezvousConfig;
}

const config = new pulumi.Config();

const infraConfig: InfraConfig = {
  isMinikube: config.getBoolean("isMinikube") || false,
  digitalocean: config.requireObject<DigitalOceanConfig>("digitalocean"),
  pulsar: config.requireObject<PulsarConfig>("pulsar"),
  rendezvous: config.requireObject<RendezvousConfig>("rendezvous"),
};

export default infraConfig;
