import * as k8s from "@pulumi/kubernetes";

import config, { ServiceConfig, ModelConfig } from "../config";
import { provider } from "../cluster/provider";

export function createModelExecutor(
  serviceConfig: ServiceConfig,
  modelConfig: ModelConfig
) {
  const fullModelExecutorId = `concurrentai-${serviceConfig.id}-model-${modelConfig.id}-executor`;
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
                image: `concurrentai/concurrentai-core-model-executor:latest`,
                imagePullPolicy: "Always",
                env: [
                  {
                    name: "ORGANIZATION_ID",
                    value: config.concurrentai.organizationId,
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
                    value: `http://concurrentai-${serviceConfig.id}-model-${modelConfig.id}/invocations`,
                  },
                  {
                    name: "PULSAR_URL",
                    value: config.pulsar.url,
                  },
                ],
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
