import * as k8s from "@pulumi/kubernetes";

import { configMap } from "./configMap";
import { appLabels, metadata } from "./constants";
import { provider } from "../cluster/provider";

export const deployment = new k8s.apps.v1.Deployment(
  "concurrentai-gateway-deployment",
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
              name: "krakend",
              image: `devopsfaith/krakend`,
              imagePullPolicy: "Always",
              ports: [{ containerPort: 8080 }],
              command: ["/usr/bin/krakend"],
              args: [
                "run",
                "-d",
                "-c",
                "/etc/krakend/krakend.json",
                "-p",
                "8080",
              ],
              volumeMounts: [
                {
                  name: "krakend-config",
                  mountPath: "/etc/krakend/",
                },
              ],
            },
          ],
          volumes: [
            {
              name: "krakend-config",
              configMap: {
                name: configMap.metadata.name,
              },
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
