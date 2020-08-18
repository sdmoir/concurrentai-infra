import * as k8s from "@pulumi/kubernetes";

import config, { ServiceConfig } from "../config";
import { provider } from "../cluster/provider";

export function createRendezvousService(serviceConfig: ServiceConfig) {
  const metadata = { name: `concurrentai-${serviceConfig.id}-rendezvous` };
  const appLabels = { run: `concurrentai-${serviceConfig.id}-rendezvous` };

  const deployment = new k8s.apps.v1.Deployment(
    `concurrentai-${serviceConfig.id}-rendezvous-deployment`,
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
                name: "api",
                ports: [{ containerPort: 9000 }],
                image: `concurrentai/concurrentai-core-rendezvous-api:latest`,
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
                volumeMounts: [
                  {
                    name: "rendezvous-sockets",
                    mountPath: "/sockets",
                  },
                ],
              },
              {
                name: "collector",
                image: `concurrentai/concurrentai-core-rendezvous-collector:latest`,
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
          },
        },
      },
    },
    {
      provider,
    }
  );

  const service = new k8s.core.v1.Service(
    `concurrentai-${serviceConfig.id}-rendezvous-service`,
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
