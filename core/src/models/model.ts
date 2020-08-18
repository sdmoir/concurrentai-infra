import * as k8s from "@pulumi/kubernetes";

import { ModelConfig, ServiceConfig } from "../config";
import { provider } from "../cluster/provider";

export function createModelService(
  serviceConfig: ServiceConfig,
  modelConfig: ModelConfig
) {
  const fullModelId = `${serviceConfig.id}-model-${modelConfig.id}`;
  const metadata = { name: `concurrentai-${fullModelId}` };
  const appLabels = { run: `concurrentai-${fullModelId}` };

  const deployment = new k8s.apps.v1.Deployment(
    `concurrentai-${fullModelId}-deployment`,
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
                name: "model",
                ports: [{ containerPort: 8080 }],
                image: modelConfig.config.image,
                imagePullPolicy: "Always",
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

  const service = new k8s.core.v1.Service(
    `concurrentai-${fullModelId}-service`,
    {
      metadata: metadata,
      spec: {
        ports: [{ port: 80, targetPort: 8080 }],
        selector: appLabels,
      },
    },
    {
      provider,
    }
  );

  return {
    deployment,
    service,
  };
}
