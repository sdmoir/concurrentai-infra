import * as k8s from "@pulumi/kubernetes";

import config, { ServiceConfig, ModelConfig } from "../config";
import { provider } from "../cluster/provider";
import { secret as registrySecret } from "../cluster/registry";

export function createModelExecutor(
  serviceConfig: ServiceConfig,
  modelConfig: ModelConfig
) {
  const fullModelExecutorId = `rendezvous-${serviceConfig.id}-model-${modelConfig.id}-executor`;
  const metadata = { name: fullModelExecutorId };
  const appLabels = { run: fullModelExecutorId };

  const deployment = new k8s.apps.v1.Deployment(
    `${fullModelExecutorId}-deployment`,
    {
      metadata: metadata,
      spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
          metadata: { labels: appLabels },
          spec: {
            containers: [
              {
                name: "model-executor",
                image: `registry.digitalocean.com/concurrent-ai/rendezvous-model-executor:latest`,
                imagePullPolicy: "Always",
                env: [
                  {
                    name: "ORGANIZATION_ID",
                    value: config.rendezvous.organizationId,
                  },
                  {
                    name: "SERVICE_ID",
                    value: serviceConfig.id,
                  },
                  {
                    name: "MODEL_ID",
                    value: modelConfig.id,
                  },
                  {
                    name: "MODEL_ENDPOINT",
                    value: `http://rendezvous-${serviceConfig.id}-model-${modelConfig.id}/invocations`,
                  },
                  {
                    name: "PULSAR_URL",
                    value: config.pulsar.url,
                  },
                ],
              },
            ],
            imagePullSecrets: [
              {
                name: registrySecret.metadata.name,
              },
            ],
          },
        },
      },
    },
    {
      provider,
    }
  );

  return {
    deployment,
  };
}
