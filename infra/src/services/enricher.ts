import * as k8s from "@pulumi/kubernetes";

import config, { ServiceConfig } from "../config";
import { provider } from "../cluster/provider";
import { secret as registrySecret } from "../cluster/registry";

export function createModelEnricher(serviceConfig: ServiceConfig) {
  const metadata = { name: `rendezvous-${serviceConfig.id}-model-enricher` };
  const appLabels = { run: `rendezvous-${serviceConfig.id}-model-enricher` };

  const deployment = new k8s.apps.v1.Deployment(
    `rendezvous-${serviceConfig.id}-model-enricher-deployment`,
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
                image: `registry.digitalocean.com/concurrent-ai/rendezvous-model-enricher:latest`,
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
