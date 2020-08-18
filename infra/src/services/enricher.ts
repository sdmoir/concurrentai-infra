import * as k8s from "@pulumi/kubernetes";

import config, { ServiceConfig } from "../config";
import { provider } from "../cluster/provider";

export function createModelEnricher(serviceConfig: ServiceConfig) {
  const metadata = { name: `concurrentai-${serviceConfig.id}-model-enricher` };
  const appLabels = { run: `concurrentai-${serviceConfig.id}-model-enricher` };

  const deployment = new k8s.apps.v1.Deployment(
    `concurrentai-${serviceConfig.id}-model-enricher-deployment`,
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
                name: "model-enricher",
                image: `concurrentai/concurrentai-core-model-enricher:latest`,
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
