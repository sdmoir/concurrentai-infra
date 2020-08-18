import * as k8s from "@pulumi/kubernetes";

import config, { ServiceConfig } from "../config";
import { provider } from "../cluster/provider";
import { secret as registrySecret } from "../cluster/registry";

export function createRendezvousService(serviceConfig: ServiceConfig) {
  const metadata = { name: `rendezvous-${serviceConfig.id}` };
  const appLabels = { run: `rendezvous-${serviceConfig.id}` };

  const deployment = new k8s.apps.v1.Deployment(
    `rendezvous-${serviceConfig.id}-deployment`,
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
                name: "rendezvous-api",
                ports: [{ containerPort: 9000 }],
                image: `registry.digitalocean.com/concurrent-ai/rendezvous-api:latest`,
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
                volumeMounts: [
                  {
                    name: "rendezvous-sockets",
                    mountPath: "/sockets",
                  },
                ],
              },
              {
                name: "rendezvous-collector",
                image: `registry.digitalocean.com/concurrent-ai/rendezvous-collector:latest`,
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
                    name: "ACTIVE_MODEL_ID",
                    value: serviceConfig.models.find((model) => model.live)?.id,
                  },
                  {
                    name: "PULSAR_URL",
                    value: config.pulsar.url,
                  },
                ],
                volumeMounts: [
                  {
                    name: "rendezvous-sockets",
                    mountPath: "/sockets",
                  },
                ],
              },
            ],
            volumes: [
              {
                name: "rendezvous-sockets",
                emptyDir: {},
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

  const service = new k8s.core.v1.Service(
    `rendezvous-${serviceConfig.id}-service`,
    {
      metadata: metadata,
      spec: {
        ports: [{ port: 80, targetPort: 9000 }],
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
